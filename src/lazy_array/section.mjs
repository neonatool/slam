// The Section is a link in the chain of known sections in the lazy
// array.

export default class Section {
    constructor (start, options) {
	console.assert (typeof start === 'number', start);
	this.start = start;
	if ('data' in options) {
	    this.length = options.data.length;
	    this.data = options.data;
	} else if ('length' in options) {
	    console.assert (typeof options.length === 'number', options.length);
	    this.length = options.length;
	    this.data = null;
	} else {
	    throw new Error('The Section contstructor must have either .data or .length as options');
	}
	if (this.length <= 0) {
	    throw new Error('Cannot create an empty Section.');
	}
	this.before = null;
	this.after = null;
    }
    checkConsistency () {
	if (this.before !== null) {
	    if (this.before.after != this) {
		throw new Error('This link is not after its previous link');
	    }
	    if (this.before.start + this.before.length !== this.start) {
		throw new Error('This link does not refer to indices right after its previous link');
	    }
	}
	if (this.after !== null) {
	    if (this.after.before != this) {
		throw new Error('This link is not before its next link');
	    }
	    if (this.start + this.length !== this.after.start) {
		throw new Error('This link does not refer to indices right before its next link');
	    }
	}
	if (this.data !== null) {
	    if (this.data.length !== this.length) {
		throw new Error(`This link is ${this.length} cells long with ${this.data.length} data elements`);
	    }
	}
	if (this.length <= 0) {
	    throw new Error(`This link has a zero length`);
	}
    }
    toString () {
	this.checkConsistency ();
	if (this.data === null) {
	    return `[empty section from ${this.start} to ${this.start + this.length}]`;
	} else {
	    return `[data section from ${this.start} to ${this.start + this.length}: ${this.data.toString ()}]`;
	}
    }
    find (index) {
	if (index >= this.start && index < this.start + this.length) {
	    return this;
	} else if (index < this.start) {
	    if (this.before !== null) {
		return this.before.find (index);
	    } else {
		return null;
	    }
	} else if (index >= this.start + this.length) {
	    if (this.after !== null) {
		return this.after.find (index);
	    } else {
		return null;
	    }
	}
    }
    cut (index) {
	// Return 2 sections, at least one of which is not null:
	// [left, right], so that if we had this:
	// A <-> this <-> B
	// Then we now have this:
	// A <-> left <-> right <-> B
	// whatever A and B (both may be null).

	// If index falls into this, then both left and right are
	// non-null.

	// If index does not fall into this, propagate the cut to the
	// right section, so "this" stays in the chain and another
	// link is replaced.

	// If index is outside of the whole chain, create an empty
	// padding element and return null and that padding in the
	// correct order.
	if (index == this.start) {
	    return [ this.before, this ];
	} else if (index >= this.start && index < this.start + this.length) {
	    let options_left = {
		'length': index - this.start
	    };
	    let options_right = {
		'length': this.start + this.length - index
	    }
	    if (this.data) {
		options_left.data = this.data.slice (0, index - this.start);
		options_right.data = this.data.slice (index - this.start);
	    }
	    const left = new Section (this.start, options_left);
	    const right = new Section (index, options_right);
	    left.before = this.before;
	    right.after = this.after;
	    left.after = right;
	    right.before = left;
	    if (this.before !== null) {
		this.before.after = left;
	    }
	    if (this.after !== null) {
		this.after.before = right;
	    }
	    return [left, right];
	} else if (index < this.start && this.before === null) {
	    const padding = new Section (index, { 'length': this.start - index });
	    padding.before = null;
	    padding.after = this;
	    this.before = padding;
	    return [null, padding];
	} else if (index >= this.start + this.length && this.after == null) {
	    const padding = new Section (this.start + this.length, { 'length': index - (this.start + this.length) });
	    padding.before = this;
	    padding.after = null;
	    this.after = padding;
	    return [padding, null];
	} else if (index < this.start) {
	    return this.before.cut (index);
	} else if (index >= this.start + this.length) {
	    return this.after.cut (index);
	}
	console.assert (false, 'unreachable');
    }
    absorb () {
	// Return the merged section. If the return value does not
	// have a .before, then the first link of the chain should be
	// updated. If it does not have a .after, then the last link
	// of the chain should be updated.
	const i_have_data = this.data !== null;
	const i_have_before = this.before !== null;
	const i_have_after = this.after !== null;
	const before_has_data = i_have_before && this.before.data !== null;
	const after_has_data = i_have_after && this.after.data !== null;
	if (i_have_before && i_have_after && (i_have_data == before_has_data && i_have_data == after_has_data)) {
	    // can absorb both before and after.
	    const options = {
		'length': this.before.length + this.length + this.after.length
	    };
	    if (i_have_data) {
		const full_data = new Float64Array (options.length);
		full_data.set (this.before.data);
		full_data.set (this.data, this.before.length);
		full_data.set (this.after.data, this.before.length + this.length);
		options.data = full_data;
	    }
	    const merged = new Section (this.before.start, options);
	    merged.before = this.before.before;
	    merged.after = this.after.after;
	    if (merged.before !== null) {
		merged.before.after = merged;
	    }
	    if (merged.after !== null) {
		merged.after.before = merged;
	    }
	    return merged;
	} else if (i_have_before && (i_have_data == before_has_data)) {
	    // I can only absorb before.
	    const options = {
		'length': this.before.length + this.length
	    };
	    if (i_have_data) {
		const full_data = new Float64Array (options.length);
		full_data.set (this.before.data);
		full_data.set (this.data, this.before.length);
		options.data = full_data;
	    }
	    const merged = new Section (this.before.start, options);
	    merged.before = this.before.before;
	    merged.after = this.after;
	    if (merged.before !== null) {
		merged.before.after = merged;
	    }
	    if (merged.after !== null) {
		merged.after.before = merged;
	    }
	    return merged;
	} else if (i_have_after && (i_have_data == after_has_data)) {
	    // I can only absorb after.
	    const options = {
		'length': this.length + this.after.length
	    };
	    if (i_have_data) {
		const full_data = new Float64Array (options.length);
		full_data.set (this.data);
		full_data.set (this.after.data, this.length);
		options.data = full_data;
	    }
	    const merged = new Section (this.start, options);
	    merged.before = this.before;
	    merged.after = this.after.after;
	    if (merged.before !== null) {
		merged.before.after = merged;
	    }
	    if (merged.after !== null) {
		merged.after.before = merged;
	    }
	    return merged;
	} else {
	    return this;
	}
    }
}

// Local Variables:
// mode: js
// End:
