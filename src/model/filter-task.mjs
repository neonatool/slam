import LazyArray from '../lazy_array.mjs';
import AdftoolLoader from '../adftool.mjs';

// Here is how the worker communicates with the calling thread:

// [MAIN THREAD]                             [WORKER THREAD]
//       |                                          |
// [create the worker]                              |
//       |                                          |
//       | --- Set time and sampling frequency----> |
//       |                                          |
// [request to filter data]                         |
//       |                                          |
//       | --- Filter (low, high, start, stop) ---> |
//       |                                          |
//       |                                [raw data cache miss]
//       |                                          |
//       | <-- Need raw data (start, stop) -------- |
//       |                                          |
// [load raw data from file]                        |
//       |                                          |
//       | --- Set raw data (start, data) --------> |
//       | --- Filter (low, high, start, stop) ---> |
//       |                                          |
//       |                                      [compute]
//       |                                          |
//       | <-- Response (low, high, start, stop,--- |
//                       filtered data)             |

const Adftool = AdftoolLoader ();

export default class Filter {
    constructor(postMessage) {
	this.raw_data = new LazyArray ();
	this.low = false;
	this.high = false;
	this.start_date = false;
	this.sfreq = false;
	this.filtered_data = new LazyArray ();
	this.postMessage = postMessage;
	this.ready = Promise.resolve ();
    }
    onmessage (event) {
	let my_turn_now;
	const wait_my_turn = new Promise ((resolve) => {
	    my_turn_now = resolve;
	});
	this.ready.catch (() => true).then (() => {
	    my_turn_now ();
	});
	this.ready = wait_my_turn.then (() => {
	    return this.onmessage_async (event);
	});
    }
    async onmessage_async (event) {
	const data = event.data;
	if (data.type === 'set-meta') {
	    console.assert (this.sfreq === false, 'sfreq is already set', this.sfreq);
	    console.assert (this.start_date === false, 'start_date is already set', this.start_date);
	    console.assert (typeof data.start_date === 'number', 'start_date is not a number', data.start_date, typeof data.start_date);
	    console.assert (data.start_date >= 0, 'start_date is not positive', data.start_date);
	    console.assert (typeof data.sfreq === 'number', 'sfreq is not a number', data.sfreq, typeof data.sfreq);
	    const start_date = new Date (data.start_date);
	    const sfreq = data.sfreq;
	    this.start_date = start_date;
	    this.sfreq = sfreq;
	} else if (data.type === 'filter') {
	    const low = data.low;
	    const high = data.high;
	    const start_date = this.start_date;
	    const sfreq = this.sfreq;
	    console.assert (start_date, 'start_date is not set yet', start_date);
	    console.assert (sfreq, 'sfreq is not set yet', sfreq);
	    console.assert (typeof data.start === 'number', 'the date to start filtering is not a number', data.start);
	    console.assert (typeof data.stop === 'number', 'the date to stop filtering is not a number', data.stop);
	    console.assert (data.start >= 0, 'the start date is not positive', data.start);
	    console.assert (data.stop >= 0, 'the stop date is not positive', data.stop);
	    const start = new Date (data.start);
	    const stop = new Date (data.stop);
	    const time_before_first_observation = (start - start_date) / 1000;
	    const time_before_last_observation = (stop - start_date) / 1000;
	    const start_index = Math.floor (time_before_first_observation * sfreq);
	    const stop_index = Math.floor (time_before_last_observation * sfreq);
	    const A = await Adftool;
	    let requires_more_data = false;
	    let raw_start_required = 0;
	    let raw_stop_required = 0;
	    const margin = A.with_bandpass (sfreq, low, high, (filter) => {
		return Math.floor ((filter.order () - 1) / 2);
	    });
	    try {
		if (low != this.low || high != this.high) {
		    this.low = low;
		    this.high = high;
		    this.filtered_data = new LazyArray ();
		}
		// start_index may be negative, but it would be very
		// bad manners to ask to filter the data. Thus, we
		// will pad with zeros.
		let padding_size = 0 - start_index;
		if (padding_size > stop_index - start_index) {
		    padding_size = stop_index - start_index;
		}
		if (padding_size < 0) {
		    padding_size = 0;
		}
		const true_filtered = await this.filtered_data.slice (start_index + padding_size, stop_index - start_index - padding_size, async (request_start, request_length) => {
		    const request_stop = request_start + request_length;
		    let raw_start = request_start - margin;
		    let raw_stop = request_stop + margin + 1;
		    if (raw_start < 0) {
			raw_start = 0;
		    }
		    const raw_data = await this.raw_data.slice (raw_start, raw_stop - raw_start, async (raw_request_start, raw_request_length) => {
			requires_more_data = true;
			raw_start_required = raw_request_start;
			raw_stop_required = raw_request_start + raw_request_length;
			throw 'Requires more data (A)';
		    });
		    if (requires_more_data) {
			throw 'Requires more data (B)';
		    }
		    const filtered = A.with_bandpassed (sfreq, low, high, raw_data, (output, filter) => {
			const margin_before = request_start - raw_start;
			const out_start = margin_before;
			const out_length = request_length;
			const out_stop = out_start + out_length;
			return output.subarray (out_start, out_stop).slice ();
		    });
		    return filtered;
		});
		if (requires_more_data) {
		    throw 'Requires more data (C)';
		}
		const filtered = new Float64Array (padding_size + true_filtered.length).fill (0);
		filtered.set (true_filtered, padding_size);
		this.postMessage ({
		    'type': 'response',
		    'low': low,
		    'high': high,
		    'start': data.start,
		    'stop': data.stop,
		    'filtered-data': Array.from (filtered)
		});
	    } catch (e) {
		if (requires_more_data) {
		    this.postMessage ({
			'type': 'need-raw-data',
			'start': raw_start_required,
			'stop': raw_stop_required
		    });
		} else {
		    throw e;
		}
	    }
	} else if (data.type === 'set-raw-data') {
	    const start_date = this.start_date;
	    const sfreq = this.sfreq;
	    console.assert (start_date, 'start_date has not been set yet');
	    console.assert (sfreq, 'sfreq has not been set yet');
	    console.assert (typeof data.start === 'number', 'start is not a number', data.start);
	    console.assert (data.start >= 0, 'start is not an index', data.start);
	    console.assert (Array.isArray (data.data), 'data is not an array', data.data);
	    const start = data.start;
	    const replacement_data = Float64Array.from (data.data);
	    await this.raw_data.slice (start, replacement_data.length, async (request_start, request_length) => {
		const request_stop = request_start + request_length;
		const data_stop = start + replacement_data.length;
		if (request_start < start || request_stop > data_stop) {
		    // This is not possible.
		    console.assert (false, 'This is not possible.', request_start, start, request_stop, data_stop);
		}
		return replacement_data.slice (request_start - start, request_length);
	    });
	} else {
	    console.assert (false, 'Unsupported message type', data.type);
	}
    }
}

// Local Variables:
// mode: js
// End:
