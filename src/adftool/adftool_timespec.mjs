import Adftool from './adftool_binding.mjs'
import { with_pointer_array } from './adftool_pointer_array.mjs';

const adftool_timespec_alloc = Adftool.cwrap (
    'adftool_timespec_alloc',
    '*',
    []);

const adftool_timespec_free = Adftool.cwrap (
    'adftool_timespec_free',
    null,
    ['*']);

const adftool_timespec_set_js = Adftool.cwrap (
    'adftool_timespec_set_js',
    '*',
    ['*', 'number']);

const adftool_timespec_get_js = Adftool.cwrap (
    'adftool_timespec_get_js',
    'number',
    ['*']);

export class Timespec {
    constructor () {
	this._ptr = adftool_timespec_alloc ();
    }
    set (date) {
	adftool_timespec_set_js (this._ptr, date - new Date (0));
    }
    get () {
	return new Date (adftool_timespec_get_js (this._ptr));
    }
    _destroy () {
	adftool_timespec_free (this._ptr);
    }
}

export function with_timespec (f) {
    const ts = new Timespec ();
    try {
	return f (ts);
    } finally {
	ts._destroy ();
    }
}

export function with_n_timespec (n, f) {
    return with_pointer_array (n, (pa) => {
	const objects = [];
	try {
	    for (let i = 0; i < n; i++) {
		const ts = new Timespec ();
		objects.push (ts);
		pa.set (i, ts._ptr);
	    }
	    return f (objects, pa);
	} finally {
	    objects.forEach ((ts) => ts._destroy ());
	}
    });
}

// Local Variables:
// mode: js
// End:
