import { NotInitialized, MissingRawData, Filter } from '../../src/model/filter-proxy.mjs';

// First, check that doing anything in an uninitialized filter
// produces an error.

const f = new Filter ((msg) => {
    throw 'Should not happen';
});

f.filter (2, 3, new Date('2000-01-01T00:00:01'), new Date('2000-01-01T00:00:02')).then (() => {
    throw 'Should not happen';
}).catch ((e) => {
    if (e instanceof NotInitialized) {
	return true;
    } else {
	throw 'Unexpected failure';
    }
});

try {
    f.setData (0, new Float64Array (5).fill (42));
    throw 'Should not happen';
} catch (e) {
    if (e instanceof NotInitialized) {
	// Expected.
    } else {
	throw 'Unexpected failure';
    }
};

class Stub {
    constructor (postMessage, start_date, sfreq, low, high, start, stop, filtered_data, raw_data_start, raw_data) {
	this.start_date = start_date;
	this.sfreq = sfreq;
	this.low = low;
	this.high = high;
	this.start = start;
	this.stop = stop;
	this.filtered_data = filtered_data;
	this.raw_data_start = raw_data_start;
	this.raw_data = raw_data;
	this.has_metadata = false;
	this.has_raw_data = false;
	this.postMessage = postMessage;
    }
    onmessage (event) {
	const data = event.data;
	console.log('Received client message:', data);
	if (!this.has_metadata) {
	    // Expect a set-meta packet
	    if (data.type === 'set-meta') {
		if (data.sfreq != this.sfreq) {
		    throw 'Wrong sfreq';
		}
		if (data.start_date - this.start_date != 0) {
		    throw `Wrong start date: ${data.start_date} != ${this.start_date}`;
		}
	    } else {
		throw 'Wrong client message type';
	    }
	    this.has_metadata = true;
	} else {
	    if (data.type === 'set-raw-data') {
		if (this.has_raw_data) {
		    throw 'We already know the raw data';
		}
		if (data.start != this.raw_data_start) {
		    throw 'Wrong start index of the raw data';
		}
		if (!Array.isArray (data.data) || data.data.length != this.raw_data.length) {
		    throw 'Wrong number of raw data';
		}
		this.has_raw_data = true;
	    } else if (data.type === 'filter') {
		if (data.low != this.low || data.high != this.high) {
		    throw 'Wrong filter parameters';
		}
		if (data.start - this.start != 0 || data.stop - this.stop != 0) {
		    throw 'Wrong filter window';
		}
		if (this.has_raw_data) {
		    this.postMessage ({
			'type': 'response',
			'low': this.low,
			'high': this.high,
			'start': this.start - 0,
			'stop': this.stop - 0,
			'filtered-data': Array.from (this.filtered_data)
		    });
		} else {
		    this.postMessage ({
			'type': 'need-raw-data',
			'start': this.raw_data_start,
			'stop': this.raw_data_start + this.raw_data.length
		    });
		}
	    } else {
		throw 'Wrong message type';
	    }
	}
    }
}

// This is the same test as the back-end.

const start_date = new Date ('2000-01-01T00:00:00');
const sfreq = 10;

const low = 2;
const high = 3;

const start = new Date ('2000-01-01T00:00:01');
const stop = new Date ('2000-01-01T00:00:02');

const filtered_data = new Float64Array (10).fill (0.5);

const raw_data_start = 2;
const raw_data = new Float64Array (27).fill (42);

const [backend, frontend] = (() => {
    let b = null;
    let f = null;
    b = new Stub ((msg) => {
	const asJSON = JSON.stringify (msg);
	const parsed = JSON.parse (asJSON);
	f.onmessage ({ 'data': parsed });
    }, start_date, sfreq, low, high, start, stop, filtered_data, raw_data_start, raw_data);
    f = new Filter ((msg) => {
	const asJSON = JSON.stringify (msg);
	const parsed = JSON.parse (asJSON);
	b.onmessage ({ 'data': parsed });
    });
    return [b, f];
})();

const ready = frontend.setMetadata (start_date, sfreq);

ready.then (async () => {
    try {
	await frontend.filter (low, high, start, stop);
	throw 'Should not reach';
    } catch (e) {
	if (e instanceof MissingRawData) {
	    if (e.start != raw_data_start || e.stop != raw_data_start + raw_data.length) {
		throw 'Incorrect backend request';
	    }
	    frontend.setData (raw_data_start, raw_data);
	    const output = await frontend.filter (low, high, start, stop);
	    if (output.length != filtered_data.length) {
		throw 'Incorrect filter output';
	    }
	    for (let i = 0; i < output.length; i++) {
		if (output[i] != filtered_data[i]) {
		    throw 'Incorrect filter output';
		}
	    }
	    console.log('Test: OK');
	} else {
	    throw `Test failed with error: ${e}`;
	}
    }
});

// Local Variables:
// mode: js
// End:
