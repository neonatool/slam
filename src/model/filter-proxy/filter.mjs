import NotInitialized from './not_initialized.mjs';
import MissingRawData from './missing_raw_data.mjs';

export default class Filter {
    constructor (postMessage) {
	this.postMessage = postMessage;
	this.resolve = () => {};
	this.reject = () => {};
	this.ready = Promise.resolve ();
	this.initialized = false;
    }
    async setMetadata (start_date, sampling_frequency) {
	console.assert (start_date instanceof Date, 'start_date is not a Date', start_date);
	console.assert (typeof sampling_frequency === 'number', 'sampling_frequency is not a number', sampling_frequency);
	console.assert (sampling_frequency > 0, 'sampling_frequency is not a frequency', sampling_frequency);
	await this.ready.catch (() => {});
	this.postMessage ({
	    'type': 'set-meta',
	    'sfreq': sampling_frequency,
	    'start_date': start_date - 0
	});
	this.initialized = true;
    }
    filter (low, high, start, stop) {
	console.assert (typeof low === 'number', 'the low frequency is not a number', low);
	console.assert (low > 0, 'the low frequency is not a frequency', low);
	console.assert (typeof high === 'number', 'the high frequency is not a number', high);
	console.assert (high > 0, 'the high frequency is not a frequency', high);
	console.assert (start instanceof Date, 'start is not a Date', start);
	console.assert (stop instanceof Date, 'stop is not a Date', stop);
	console.assert (low <= high, 'the low cut is greater than the high cut', low, high);
	console.assert (start <= stop, 'the start date is after the stop date', start, stop);
	let my_turn_now;
	const wait_my_turn = new Promise ((resolve) => {
	    my_turn_now = resolve;
	});
	this.ready.catch (() => true).then (() => {
	    my_turn_now ();
	});
	const done = wait_my_turn.then (() => {
	    if (this.initialized) {
		const finished = new Promise ((resolve, reject) => {
		    this.resolve = resolve;
		    this.reject = reject;
		});
		this.postMessage ({
		    'type': 'filter',
		    'low': low,
		    'high': high,
		    'start': start - 0,
		    'stop': stop - 0
		});
		return finished;
	    } else {
		throw new NotInitialized ();
	    }
	});
	this.ready = done;
	return done;
    }
    setData (start, data) {
	console.assert (typeof start === 'number', 'the start index is not a number', start);
	console.assert (start >= 0, 'the start index is not an index', start);
	console.assert (data instanceof Float64Array, 'the data is not a float64 array', data);
	console.assert (data.length > 0, 'the data is empty', data);
	if (!this.initialized) {
	    throw new NotInitialized ();
	}
	this.postMessage ({
	    'type': 'set-raw-data',
	    'start': start,
	    'data': Array.from (data)
	});
    }
    onmessage (event) {
	const data = event.data;
	if (data.type === 'need-raw-data') {
	    const start = data.start;
	    const stop = data.stop;
	    console.assert (typeof start === 'number', 'the backend requests raw data with an invalid start index', start);
	    console.assert (typeof stop === 'number', 'the backend requests raw data with an invalid stop index', stop);
	    console.assert (start < stop, 'the backend requests empty raw data', start, stop);
	    this.reject (new MissingRawData (start, stop));
	} else if (data.type === 'response') {
	    const d = data['filtered-data'];
	    console.assert (Array.isArray (d), 'response data is not an array', d);
	    const f = Float64Array.from (d);
	    this.resolve (f);
	}
    }
}

// Local Variables:
// mode: js
// End:
