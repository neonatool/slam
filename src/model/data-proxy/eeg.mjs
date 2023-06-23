import InvalidData from './invalid_data.mjs';

export default class EEG {
    constructor (postMessage) {
	this.postMessage = postMessage;
	this.resolve = () => {};
	this.reject = () => {};
	this.ready = Promise.resolve ();
    }
    wait_my_turn (msg) {
	let my_turn_now;
	const wait_my_turn = new Promise ((resolve) => {
	    my_turn_now = resolve;
	});
	this.ready.catch (() => true).then (() => {
	    my_turn_now ();
	});
	this.ready = wait_my_turn.then (() => {
	    const ret = new Promise ((resolve, reject) => {
		this.resolve = resolve;
		this.reject = reject;
	    });
	    this.postMessage (msg);
	    return ret;
	});
	return this.ready;
    }
    async onmessage (event) {
	const data = event.data;
	if (data.response === 'ok') {
	    this.resolve ();
	} else if (data.response === 'invalid data') {
	    this.reject (new InvalidData);
	} else {
	    this.resolve (data);
	}
    }
    set_data (bytes) {
	console.assert (bytes instanceof Uint8Array, 'the ADF bytes must be an uint8 array', typeof bytes);
	let binary = '';
	bytes.forEach ((b) => binary += String.fromCharCode (b));
	const b64 = btoa (binary);
	return this.wait_my_turn ({
	    'request': 'set-adf-data', 'data': b64
	});
    }
    find_objects_or_subjects (subject, object, predicate) {
	const request = {};
	if (subject != null) {
	    request.request = 'objects';
	    request.subject = subject;
	}
	if (object != null) {
	    request.request = 'subjects';
	    request.object = object;
	}
	request.predicate = predicate;
	return this.wait_my_turn (request).then ((response) => {
	    return response.response;
	});
    }
    find_objects (subject, predicate) {
	return this.find_objects_or_subjects (subject, null, predicate);
    }
    find_subjects (object, predicate) {
	return this.find_objects_or_subjects (null, object, predicate);
    }
    eeg_data (channel, start, stop) {
	return this.wait_my_turn ({
		'request': 'raw-data',
		'channel': channel,
		'start': start,
		'stop': stop
	}).then ((response) => {
	    return {
		'response': Float64Array.from (response.response),
		'n-channels': response['n-channels'],
		'n-points': response['n-points'],
	    };
	});
    }
    get_data () {
	return this.wait_my_turn ({
	    'request': 'adf-data'
	}).then ((response) => {
	    const decoded = atob (response.response);
	    const bytes = new Uint8Array (decoded.length);
	    decoded.split ("").forEach ((ch, i) => {
		const b = ch.charCodeAt ();
		bytes[i] = b;
	    });
	    return bytes;
	});
    }
    insert (subject, predicate, object) {
	return this.wait_my_turn ({
	    'request': 'insert',
	    'subject': subject,
	    'predicate': predicate,
	    'object': object
	}).then ((response) => {
	    if (response && 'error' in response) {
		throw `Back-end error: ${response.error}`;
	    }
	});
    }
    delete_data (subject, predicate, object, date) {
	const request = {
	    'request': 'delete'
	};
	if (subject) {
	    request['subject'] = subject;
	}
	if (predicate) {
	    request['predicate'] = predicate;
	}
	if (object) {
	    request['object'] = object;
	}
	if (date) {
	    request['date'] = date - 0;
	}
	return this.wait_my_turn (request).then ((response) => {
	    if (response && 'error' in response) {
		throw `Back-end error: ${response.error}`;
	    }
	});
    }
    async find_object_literals (subject, predicate, types) {
	return await this.find_objects (subject, predicate).then ((objects) => {
	    const results = [];
	    for (const o of objects) {
		const prefix = '"';
		types.forEach ((type) => {
		    const suffix = `"^^<${type}>`;
		    if (o.startsWith (prefix) && o.endsWith (suffix)) {
			results.push ({
			    'value': o.substring (prefix.length, o.length - suffix.length),
			    'type': type
			});
		    }
		});
	    }
	    return results;
	});
    }
    async find_object_dates (subject, predicate) {
	return await this.find_object_literals (subject, predicate, ['http://www.w3.org/2001/XMLSchema#dateTime']).then ((objects) => {
	    const results = [];
	    console.assert (Array.isArray (objects), 'the results is not an array', objects);
	    for (const o of objects) {
		const parsed = new Date (o.value);
		if (parsed >= 0) {
		    results.push (parsed);
		}
	    }
	    return results;
	});
    }
    async find_object_numbers (subject, predicate) {
	return await this.find_object_literals (subject, predicate, [
	    'http://www.w3.org/2001/XMLSchema#integer',
	    'http://www.w3.org/2001/XMLSchema#decimal',
	    'http://www.w3.org/2001/XMLSchema#double'
	]).then ((objects) => {
	    const results = [];
	    for (const o of objects) {
		if (o.type === 'http://www.w3.org/2001/XMLSchema#integer') {
		    try {
			results.push (BigInt (o.value));
		    } catch (e) {
		    }
		} else {
		    const parsed = parseFloat (o.value);
		    if (! (isNaN (parsed))) {
			results.push (parsed);
		    }
		}
	    }
	    return results;
	});
    }
    find_eeg_start_date () {
	return this.find_object_dates ('<>', 'https://localhost/lytonepal#start-date');
    }
    find_eeg_sampling_frequency () {
	return this.find_object_numbers ('<>', 'https://localhost/lytonepal#sampling-frequency');
    }
    find_eeg_channels () {
	return this.find_objects ('<>', 'https://localhost/lytonepal#has-channel');
    }
    find_channel_type (channel) {
	return this.find_objects (channel, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    }
    find_channel_index (channel) {
	return this.find_object_numbers (channel, 'https://localhost/lytonepal#column-number');
    }
}

// Local Variables:
// mode: js
// End:
