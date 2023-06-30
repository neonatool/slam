import AdftoolLoader from '../../src/adftool.mjs';
import EEG from '../../src/model/data-task.mjs';

if (typeof atob === 'undefined' || typeof btoa === 'undefined') {
    global.atob = function (str) {
	return Buffer.from (str, 'base64').toString ('binary');
    }
    global.btoa = function (str) {
	return Buffer.from (str, 'binary').toString ('base64');
    }
}

const Adftool = AdftoolLoader ();

Adftool.then (async (A) => {
    const seed = A.with_file (Uint8Array.from ([]), ((f) => {
	console.log('I created a new file.');
	f.eeg_set_data (5, 3, Float64Array.from ([
	    1,    1.2,  0.8,
	    0.5,  0.6,  0.4,
	    0,    0,    0,
	    -0.5, -0.6, -0.4,
	    -1,   -1.2, -0.8
	]));
	console.log('I set the EEG data.');
	A.with_n3 ('<a>', ((a) => {
	    A.with_n3 ('<b>', ((b) => {
		A.with_n3 ('<c>', ((c) => {
		    A.with_statement_init (a, b, c, null, null, (abc) => {
			console.log('I wish to insert a statement.');
			f.insert (abc);
			console.log('I inserted a statement.');
		    });
		}));
	    }));
	}));
	console.log('Now I want the bytes.');
	return f.data ((bytes) => {
	    console.log('I have the bytes, now I want to encode them.');
	    let binary = '';
	    bytes.forEach ((b) => binary += (String.fromCharCode (b)));
	    console.log('I have the bytes as a binary string.');
	    return btoa (binary);
	});
    }));
    console.log('Given the seed, start the test.');
    const responses = [];
    const eeg = new EEG ((msg) => {
	console.log('Got a backend answer:', msg);
	responses.push (msg);
    });
    eeg.onmessage ({
	'data': {
	    'request': 'set-adf-data',
	    'data': seed
	}
    });
    eeg.onmessage ({
	'data': {
	    'request': 'objects',
	    'subject': '<a>',
	    'predicate': 'b'
	}
    });
    eeg.onmessage ({
	'data': {
	    'request': 'subjects',
	    'object': '<c>',
	    'predicate': 'b'
	}
    });
    eeg.onmessage ({
	'data': {
	    'request': 'raw-data',
	    'channel': 1,
	    'start': 1,
	    'stop': 4
	}
    });
    eeg.onmessage ({
	'data': {
	    'request': 'adf-data'
	}
    });
    eeg.onmessage ({
	'data': {
	    'request': 'insert',
	    'subject': '<d>',
	    'predicate': '<e>',
	    'object': '<f>'
	}
    });
    eeg.onmessage ({
	'data': {
	    'request': 'delete',
	    'subject': '<a>',
	    'date': 12345
	}
    });
    eeg.onmessage ({
	'data': {
	    'request': 'objects',
	    'subject': '<a>',
	    'predicate': 'b'
	}
    });
    eeg.onmessage ({
	'data': {
	    'request': 'objects',
	    'subject': '<d>',
	    'predicate': 'e'
	}
    });
    await eeg.ready;
    const expectedResponses = [{
	// Set the file contents:
	'response': 'ok'
    }, {
	// Find objects:
	'response': [ '<c>' ]
    }, {
	// Find subjects:
	'response': [ '<a>' ]
    }, {
	// Get raw data:
	'response': [
	    // This should be the answer:
	    // 0.6, 0, -0.6

	    // Unfortunately, the raw data is encoded to 2 bytes so we
	    // only have an approximation.
	    0.599990844586862,
	    -0.000018310826275902414,
	    -0.5999908445868618
	],
	'n-points': 5,
	'n-channels': 3
    }, {
	// Get ADF bytes:
	'response': seed
    }, {
	// Insert <d> <e> <f> .
	'response': 'ok'
    }, {
	// Delete <a> <b> <c> .
	'response': 'ok'
    }, {
	// <a> <b> ? .
	'response': []
    }, {
	// <d> <e> ? .
	'response': ['<f>']
    }];
    const actual = JSON.stringify (responses);
    const expected = JSON.stringify (expectedResponses);
    if (actual != expected) {
	console.log ('Compare:');
	console.log (responses);
	console.log ('Vs:');
	console.log (expectedResponses);
	throw 'Test failed';
    }
    console.log ('Test OK');
});

// Local Variables:
// mode: js
// End:
