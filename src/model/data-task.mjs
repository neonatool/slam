import AdftoolLoader from '../adftool.mjs';

const Adftool = AdftoolLoader ();

// There are 5 kinds of requests:
// 0. Set raw ADF data;
// 1. Enumerate all the objects given a subject and a predicate;
// 2. Enumerate all the subjects given a predicate and object;
// 3. Get EEG raw data;
// 4. Get the resulting ADF bytes;
// 5. Insert a new statement;
// 6. Delete a statement.

// 0 − Set raw ADF data, example:
// Input: { 'request': 'set-adf-data', 'data': "base64 data…" }
// Response: { 'response': 'ok' } or { 'response': 'invalid data' }

// 1 − Find objects:
// Input: { 'request': 'objects', 'subject': '<>', 'predicate': 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#start-date' } // Notice that subject is N3 and predicate is a simple URI
// Response: { 'response': ['"2000-01-01T00:00:00.000"^^xsd:dateTime', …] }

// 2 − Find subjects:
// Input: { 'request': 'subjects', 'object': '<#b>', 'predicate': '#c' }
// Response: { 'response': ['<#a>', …] }

// 3 − Get EEG raw data:
// Input: { 'request': 'raw-data', 'channel': 42, 'start': 512, 'stop': 1024 }
// Response: { 'response': [ 1.23, 4.56, … ], 'n-channels': 256, 'n-points': 1024 }

// 4 − Get the ADF bytes:
// Input: { 'request': 'adf-data' }
// Output: { 'response': "base64 data…" }

// 5 − Insert a new statement:
// Input: { 'request': 'insert', 'subject': '<#a>', 'predicate': '<#b>', 'object': '<#c>' } // Notice that the predicate has <> angle brackets as an N3 term, unlike the 'objects' and 'subjects' requests
// Output: { 'response': 'ok' }

// 6 − Delete a statement:
// Input: { 'request': 'delete', 'subject': '<#a>', 'predicate': '<#b>', 'date': 3417318… } // Notice that this is a pattern, the subject, predicate, and/or object may be missing.
// Output: { 'response': 'ok' }

export default class EEG {
    constructor(postMessage) {
	this.eeg = Adftool.then ((A) => {
	    return new A.File ();
	});
	this.ready = Promise.resolve ();
	this.postMessage = postMessage;
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
	if (data.request === 'set-adf-data') {
	    console.assert (typeof data.data === 'string', 'The ADF bytes are not a string');
	    try {
		const decoded = atob (data.data);
		const bytes = new Uint8Array (decoded.length);
		decoded.split ("").forEach ((ch, i) => {
		    const b = ch.charCodeAt ();
		    bytes[i] = b;
		});
		const e = await this.eeg;
		e.close ();
		e.open (bytes);
		this.postMessage ({ 'response': 'ok' });
	    } catch (e) {
		this.postMessage ({ 'response': 'invalid data', 'error': e.toString () });
	    }
	} else if (data.request === 'objects' || data.request === 'subjects') {
	    try {
		const eeg = await this.eeg;
		const subjectN3 = data.subject || null;
		const objectN3 = data.object || null;
		const predicate = data.predicate;
		const A = await Adftool;
		const e = await this.eeg;
		let results = [];
		if (subjectN3 != null) {
		    results = A.with_n3 (subjectN3, ((subject) => {
			return e.lookup_objects (subject, predicate, ((objects) => {
			    return objects.map (t => t.to_n3 ());
			}));
		    }));
		} else if (objectN3 != null) {
		    results = A.with_n3 (objectN3, ((object) => {
			return e.lookup_subjects (object, predicate, ((subjects) => {
			    return subjects.map (t => t.to_n3 ());
			}));
		    }));
		}
		this.postMessage ({ 'response': results });
	    } catch (e) {
		this.postMessage ({ 'response': [], 'error': e.toString () });
	    }
	} else if (data.request === 'raw-data') {
	    try {
		const channel = data.channel || 0;
		const start = data.start || 0;
		const stop = data.stop || 0;
		console.assert (typeof channel === 'number', 'channel must be a column index', channel);
		console.assert (typeof start === 'number', 'start must be a row index', start);
		console.assert (typeof stop === 'number', 'stop must be a row index', stop);
		console.assert (start <= stop, 'start row must be lower than stop row', start, stop);
		console.assert (channel >= 0, 'channel index must be an index');
		const e = await this.eeg;
		e.eeg_get_data (channel, start, stop - start, ((n_points, n_channels, data) => {
		    this.postMessage ({
			'response': Array.from (data),
			'n-points': n_points,
			'n-channels': n_channels
		    });
		}));
	    } catch (e) {
		this.postMessage ({ 'response': [], 'error': e.toString () });
	    }
	} else if (data.request === 'adf-data') {
	    try {
		const A = await Adftool;
		const e = await this.eeg;
		e.data ((bytes) => {
		    let binary = '';
		    bytes.forEach ((b) => binary += (String.fromCharCode (b)));
		    this.postMessage ({ 'response': btoa (binary) });
		});
	    } catch (e) {
		this.postMessage ({ 'response': "", 'error': e.toString () });
	    }
	} else if (data.request === 'insert') {
	    try {
		const { subject, predicate, object } = data;
		console.assert (typeof subject === 'string', 'the subject is missing', data);
		console.assert (typeof predicate === 'string', 'the predicate is missing', data);
		console.assert (typeof object === 'string', 'the object is missing', data);
		console.assert (subject.startsWith ('_:') || subject.startsWith ('<'), 'the subject is neither a blank node nor an IRI reference', subject);
		console.assert (predicate.startsWith ('<'), 'the predicate is not an IRI reference', predicate);
		console.assert (object.startsWith ('_:') || object.startsWith ('<') || object.startsWith ('"'), 'the object is neither a blank node nor an IRI reference nor a literal', object);
		const A = await Adftool;
		const e = await this.eeg;
		A.with_n3 (subject, ((s) => {
		    A.with_n3 (predicate, ((p) => {
			A.with_n3 (object, ((o) => {
			    A.with_statement_init (s, p, o, null, null, ((statement) => {
				e.insert (statement);
			    }));
			}));
		    }));
		}));
		this.postMessage ({ 'response': 'ok' });
	    } catch (e) {
		this.postMessage ({ 'response': 'error', 'error': e.toString () });
	    }
	} else if (data.request === 'delete') {
	    try {
		const { subject, predicate, object, date } = data;
		if (subject) {
		    console.assert (subject.startsWith ('_:') || subject.startsWith ('<'), 'the subject is neither a blank node nor an IRI reference', subject);
		}
		if (predicate) {
		    console.assert (predicate.startsWith ('<'), 'the predicate is not an IRI reference', predicate);
		}
		if (object) {
		    console.assert (object.startsWith ('_:') || object.startsWith ('<') || object.startsWith ('"'), 'the object is neither a blank node nor an IRI reference nor a literal', object);
		}
		if (date) {
		    console.assert (typeof date === 'number' && date >= 0, 'the date must be a number', date);
		}
		const A = await Adftool;
		const e = await this.eeg;
		const do_insert = ((s, p, o) => {
		    A.with_statement_init (s, p, o, null, null, ((pattern) => {
			let d = new Date (Date.now ());
			if (date) {
			    d = new Date (date);
			}
			e.delete_statement (pattern, d);
		    }));
		});
		const do_insert_o = ((s, p) => {
		    if (object) {
			A.with_n3 (object, ((o) => {
			    do_insert (s, p, o)
			}));
		    } else {
			do_insert (s, p, null);
		    }
		});
		const do_insert_p = ((s) => {
		    if (predicate) {
			A.with_n3 (predicate, ((p) => {
			    do_insert_o (s, p)
			}));
		    } else {
			do_insert_o (s, null);
		    }
		});
		const do_insert_s = (() => {
		    if (subject) {
			A.with_n3 (subject, ((s) => {
			    do_insert_p (s)
			}));
		    } else {
			do_insert_p (null);
		    }
		});
		do_insert_s ();
		this.postMessage ({ 'response': 'ok' });
	    } catch (e) {
		this.postMessage ({ 'response': 'error', 'error': e.toString () });
	    }
	}
    }
}

// Local Variables:
// mode: js
// End:
