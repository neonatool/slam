import { EEG, InvalidData } from '../../src/model/data-proxy.mjs';

if (typeof atob === 'undefined' || typeof btoa === 'undefined') {
    global.atob = function (str) {
	return Buffer.from (str, 'base64').toString ('binary');
    }
    global.btoa = function (str) {
	return Buffer.from (str, 'binary').toString ('base64');
    }
}

const expectedRequests = [{
    'request': 'set-adf-data',
    'data': ''
}, {
    'request': 'set-adf-data',
    'data': 'AA=='
}, {
    'request': 'objects',
    'subject': '<a>',
    'predicate': 'b'
}, {
    'request': 'subjects',
    'object': '<c>',
    'predicate': 'b'
}, {
    'request': 'raw-data',
    'channel': 42,
    'start': 3,
    'stop': 5
}, {
    'request': 'adf-data'
}, {
    'request': 'insert',
    'subject': '<d>',
    'predicate': '<e>',
    'object': '<f>'
}, {
    'request': 'delete',
    'subject': '<a>',
    'date': 12345
}, {
    'request': 'objects',
    'subject': '<a>',
    'predicate': 'b'
}, {
    'request': 'objects',
    'subject': '<d>',
    'predicate': 'e'
}];

const responses = [{
    'response': 'invalid data'
}, {
    'response': 'ok'
}, {
    'response': ['<c>']
}, {
    'response': ['<a>']
}, {
    'response': [42, 69],
    'n-channels': 128,
    'n-points': 512
}, {
    'response': 'BB=='
}, {
    'response': 'ok'
}, {
    'response': 'ok'
}, {
    'response': []
}, {
    'response': ['<f>']
}];

let nextResponse = 0;

const actualRequests = [];

const eeg = new EEG ((msg) => {
    console.log('The front-end posts:', msg);
    actualRequests.push (msg);
    if (nextResponse >= responses.length) {
	throw 'Too many requests';
    }
    const next = responses[nextResponse];
    nextResponse = nextResponse + 1;
    console.log('The back-end responds:', next);
    eeg.onmessage ({
	'data': next
    });
});

const sent =
      eeg.set_data (new Uint8Array ()).catch ((e) => {
	  if (e instanceof InvalidData) {
	      return true;
	  } else {
	      throw 'Not the expected error';
	  }
      }).then (() => {
	  return eeg.set_data (new Uint8Array (1).fill (0));
      }).then (() => {
	  return eeg.find_objects ('<a>', 'b');
      }).then ((cs) => {
	  if (cs.length != 1 || cs[0] != '<c>') {
	      throw 'Incorrect objects';
	  }
	  return eeg.find_subjects ('<c>', 'b');
      }).then ((as) => {
	  if (as.length != 1 || as[0] != '<a>') {
	      throw 'Incorrect subjects';
	  }
	  return eeg.eeg_data (42, 3, 5);
      }).then ((response) => {
	  if (! (response.response instanceof Float64Array)
	      || response.response.length != 2
	      || response.response[0] != 42
	      || response.response[1] != 69
	      || response['n-channels'] != 128
	      || response['n-points'] != 512) {
	      throw 'Incorrect EEG data';
	  }
	  return eeg.get_data ()
      }).then ((bytes) => {
	  if (! (bytes instanceof Uint8Array)
	      || bytes.length != 1
	      || bytes[0] != 4) {
	      throw 'Incorrect ADF data';
	  }
	  return eeg.insert ('<d>', '<e>', '<f>');
      }).then (() => {
	  return eeg.delete_data ('<a>', null, null, 12345);
      }).then (() => {
	  return eeg.find_objects ('<a>', 'b');
      }).then ((cs) => {
	  if (cs.length != 0) {
	      throw 'Should have been deleted';
	  }
	  return eeg.find_objects ('<d>', 'e');
      }).then ((fs) => {
	  if (fs.length != 1 || fs[0] != '<f>') {
	      throw 'Should have been inserted';
	  }
	  return true;
      });

sent.then (() => {
    const actual = JSON.stringify (actualRequests);
    const expected = JSON.stringify (expectedRequests);
    if (actual != expected) {
	console.log ('Expected:', expected);
	console.log ('But had:', actual);
	throw 'Test failed';
    }
    console.log ('Test OK');
});

// Check that the literal conversion works

class Stub extends EEG {
    constructor (override_find_objects) {
	super ((msg) => {
	    throw 'Should not happen';
	});
	this.find_objects = override_find_objects;
    }
}

const s = new Stub (async (subject, predicate) => {
    if (subject === '<>' && predicate === 'https://localhost/lytonepal#start-date') {
	return ['<garbage>', '_:garbage', '"garbage"', '"2000-01-01T00:00:00.12345"^^<http://www.w3.org/2001/XMLSchema#dateTime>', '"256"^^<http://www.w3.org/2001/XMLSchema#integer>', '"256"^^<http://www.w3.org/2001/XMLSchema#double>'];
    } else if (subject === '<>' && predicate === 'https://localhost/lytonepal#sampling-frequency') {
	return ['<garbage>', '_:garbage', '"garbage"', '"2000-01-01T00:00:00"^^<http://www.w3.org/2001/XMLSchema#dateTime>', '"256"^^<http://www.w3.org/2001/XMLSchema#integer>'];
    } else if (subject === '<>' && predicate === 'https://localhost/lytonepal#has-channel') {
	return ['<#channel-0>'];
    } else if (subject === '<#channel-0>' && predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
	return ['<https://localhost/lytonepal#C3-Fp1>'];
    } else if (subject === '<#channel-0>' && predicate === 'https://localhost/lytonepal#column-number') {
	return ['<garbage>', '_:garbage', '"garbage"', '"2000-01-01T00:00:00"^^<http://www.w3.org/2001/XMLSchema#dateTime>', '"42"^^<http://www.w3.org/2001/XMLSchema#integer>'];
    } else {
	throw `Unexpected query: ${subject}, ${predicate}`;
    }
});

Promise.all ([
    s.find_eeg_start_date (),
    s.find_eeg_sampling_frequency (),
    s.find_eeg_channels ()
]).then (results => {
    const [start_date, sfreq, channels] = results;
    // This is another JavaScript moment: How do I add milliseconds to
    // a Date object? Javascript interprets date + 123 as: convert
    // everything to strings and concatenate, but date - 123 as 123
    // milliseconds before the date.
    const expected_date = (new Date ('2000-01-01T00:00:00') - 0) + 123;
    if (start_date.length != 1 || start_date[0] - expected_date != 0) {
	throw 'Invalid start date';
    }
    const expected_sampling_frequency = 256;
    if (sfreq.length != 1 || Number (sfreq[0]) - expected_sampling_frequency != 0) {
	throw 'Invalid sampling frequency';
    }
    if (channels.length != 1 || channels[0] !== '<#channel-0>') {
	throw 'Invalid channels';
    }
    return Promise.all ([
	s.find_channel_type (channels[0]),
	s.find_channel_index (channels[0])
    ])
}).then ((results) => {
    const [tp, index] = results;
	if (tp.length != 1 || tp[0] != '<https://localhost/lytonepal#C3-Fp1>') {
	    throw 'Invalid channel type';
	}
	if (index.length != 1 || index[0] != 42) {
	    throw 'Invalid channel index';
	}
	console.log ('Literal conversion test OK');
});

// Local Variables:
// mode: js
// End:
