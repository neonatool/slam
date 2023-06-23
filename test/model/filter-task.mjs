import Filter from '../../src/model/filter-task.mjs';

class Stub {
    constructor (postMessage, start_date, sfreq, low, high, start, stop, raw_data) {
	this.start_date = start_date;
	this.sfreq = sfreq;
	this.low = low;
	this.high = high;
	this.start = start;
	this.stop = stop;
	this.raw_data = raw_data;
	this.resolve = () => {};
	this.reject = () => {};
	this.remaining_server_messages = 2;
	this.postMessage = postMessage;
    }
    async onmessage (event) {
	const data = event.data;
	console.log('Received server message:', data);
	if (this.remaining_server_messages == 0) {
	    this.reject('Too many server messages');
	    throw 'Too many server messages';
	}
	if (data.type === 'need-raw-data') {
	    const rq_start = data.start;
	    const rq_stop = data.stop;
	    const raw = this.raw_data.slice (rq_start, rq_stop);
	    this.postMessage ({
		'type': 'set-raw-data',
		'start': rq_start,
		'data': Array.from (raw)
	    });
	    this.postMessage ({
		'type': 'filter',
		'low': this.low,
		'high': this.high,
		'start': this.start - 0,
		'stop': this.stop - 0
	    });
	} else if (data.type === 'response') {
	    if (data.low != this.low || data.high != this.high || (data.start - this.start) != 0 || (data.stop - this.stop) != 0) {
		this.reject('Invalid response parameters');
	    }
	    this.resolve (Float64Array.from (data['filtered-data']));
	} else {
	    this.reject('Invalid backend message');
	}
	this.remaining_server_messages = this.remaining_server_messages - 1;
    }
    async run () {
	const myself = this;
	const ret = new Promise ((resolve, reject) => {
	    myself.resolve = resolve;
	    myself.reject = reject;
	});
	this.postMessage ({
	    'type': 'set-meta',
	    'start_date': this.start_date - 0,
	    'sfreq': this.sfreq
	});
	this.postMessage ({
	    'type': 'filter',
	    'low': this.low,
	    'high': this.high,
	    'start': this.start - 0,
	    'stop': this.stop - 0
	});
	return ret.then (data => {
	    if (this.remaining_server_messages != 0) {
		throw 'Too few server messages';
	    }
	    return data;
	});
    }
}

// In this test, the start date is 2000-01-01 00:00:00, the sampling
// frequency is 10 Hz, and the data is a constant series where all
// values are 42. It’s not very useful, because since the data is
// constant, it will be out of the band pass. But we aren’t checking
// the filter correctness anyway, that’s the job of adftool.

const start_date = new Date ('2000-01-01T00:00:00');
const sampling_frequency = 10;

const start = new Date ('2000-01-01T00:00:01');
const stop = new Date ('2000-01-01T00:00:02');

// The Nyquist frequency is 5 Hz.

// The band pass parameters are from 2Hz to 3 Hz, and we want to
// filter from 00:00:01 to 00:00:02, so 10 points, from point 10
// inclusive to point 20 exclusive. Adftool tells us the default
// filter order will be 17, so the margin left and right must be 8
// points. So, we will require the raw data from point 2 inclusive to
// point 29 exclusive. For a total of 27 points.

const low = 2;
const high = 3;

// By setting the ignored first 2 points to 0, we can detect that the
// filter uses it if the filtered data is not constant.
const raw_data = new Float64Array (29).fill (42, 2);

const [backend, frontend] = (() => {
    let b = null;
    let f = null;
    b = new Filter ((msg) => {
	const asJSON = JSON.stringify (msg);
	const parsed = JSON.parse (asJSON);
	f.onmessage ({ 'data': parsed });
    });
    f = new Stub ((msg) => {
	const asJSON = JSON.stringify (msg);
	const parsed = JSON.parse (asJSON);
	b.onmessage ({ 'data': parsed });
    }, start_date, sampling_frequency, low, high, start, stop, raw_data);
    return [b, f];
})();

const filtered = frontend.run ();

filtered.then ((filtered_data) => {
    if (filtered_data.length != 10) {
	throw 'Not 10 points exactly';
    }
    const expected_value = 0.5868718429780332;
    for (const x of filtered_data) {
	if (x > expected_value + 0.0000001 || x < expected_value - 0.0000001) {
	    throw 'Incorrect value';
	}
    }
    console.log('Test OK');
});

// Local Variables:
// mode: js
// End:
