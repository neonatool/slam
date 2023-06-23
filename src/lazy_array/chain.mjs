// The chain is a bounded linked list of sections.

import Section from './section.mjs';

export default class Chain {
    constructor () {
	this.first = null;
	this.last = null;
    }
    find (index) {
	if (this.first === null) {
	    return null;
	}
	return this.first.find (index);
    }
    checkConsistency () {
	if ((this.first === null) !== (this.last === null)) {
	    throw new Error('The chain first and last elements are not simultaneously null');
	}
	if (this.first !== null) {
	    if (this.first.before !== null) {
		throw new Error('The first chain element reports a previous link');
	    }
	    if (this.last.after !== null) {
		throw new Error('The last chain element reports a next link');
	    }
	    let expectData = true;
	    for (let link = this.first; link !== null; link = link.after) {
		link.checkConsistency ();
		if ((link.data !== null) != expectData) {
		    throw new Error('Error in link data alternance');
		}
		expectData = !expectData;
	    }
	    if (this.last.data === null) {
		throw new Error('Last chain element does not have data');
	    }
	}
    }
    toString () {
	this.checkConsistency ();
	if (this.first === null) {
	    return '[empty chain]';
	} else {
	    let elements = [];
	    for (let link = this.first; link !== null; link = link.after) {
		elements.push (link.toString ());
	    }
	    return `[chain with ${elements.length} links: ${elements.join(', ')}]`;
	}
    }
    _cut (index) {
	if (this.last !== null && index == this.last.start + this.last.length) {
	    return [ this.last, null ];
	}
	let [left, right] = this.first.cut (index);
	if (left !== null && left.before === null) {
	    // Update the first node.
	    this.first = left;
	} else if (right !== null && right.before === null) {
	    // If we are cutting before the first node, right will be
	    // the padding and left will be null. In this cases, the
	    // first section of the chain is the padding.
	    this.first = right;
	}
	if (right !== null && right.after === null) {
	    this.last = right;
	} else if (left !== null && left.after === null) {
	    this.last = left;
	}
	return [left, right];
    }
    _cut2 (index_1, index_2) {
	this._cut (index_1);
	this._cut (index_2);
	// Now that the cuts are made, cutting again will not alter
	// the cut sections, so we won’t invalidate l1 or r1 by
	// cutting at index_2.
	const [l1, r1] = this._cut (index_1);
	const [l2, r2] = this._cut (index_2);
	return [l1, r1, l2, r2];
    }
    _replace (start, length, data) {
	const options = { 'length': length };
	if (data !== null) {
	    options.data = data;
	}
	const replacement = new Section (start, options);
	if (this.first === null && this.last === null) {
	    this.first = replacement;
	    this.last = replacement;
	} else {
	    // As soon as first or last is set, both are set.
	    console.assert (this.first !== null);
	    console.assert (this.last !== null);
	    const [before_start, after_start, before_stop, after_stop] =
		  this._cut2 (start, start + length);
	    replacement.before = before_start;
	    replacement.after = after_stop;
	    if (before_start === null) {
		this.first = replacement;
	    } else {
		before_start.after = replacement;
		if (before_start.before === null) {
		    this.first = before_start;
		}
	    }
	    if (after_stop === null) {
		this.last = replacement;
	    } else {
		after_stop.before = replacement;
		if (after_stop.after === null) {
		    this.last = after_stop;
		}
	    }
	    const merged_replacement = replacement.absorb ();
	    if (merged_replacement.before === null) {
		this.first = merged_replacement;
	    }
	    if (merged_replacement.after === null) {
		this.last = merged_replacement;
	    }
	    if (this.first.data === null) {
		this.first = this.first.after;
		if (this.first !== null) {
		    this.first.before = null;
		}
	    }
	    if (this.last.data === null) {
		this.last = this.last.before;
		if (this.last !== null) {
		    this.last.after = null;
		}
	    }
	    console.assert ((this.first === null) === (this.last === null));
	}
    }
    discard (start, length) {
	this._replace (start, length, null);
    }
    replace (start, data) {
	this._replace (start, data.length, data);
    }
}

// Local Variables:
// mode: js
// End:
