// This is a "lazy array": an array that is not filled initially, but
// that can be filled little by little, on demand. It is stored in
// memory as an ordered list of sections.

// This is only for Float64 data.

import Chain from './lazy_array/chain.mjs';

export default class LazyArray {
    constructor () {
	this.sections = new Chain ();
    }
    checkConsistency () {
	this.sections.checkConsistency ();
    }
    toString () {
	return this.sections.toString ();
    }
    async slice (start, length, fetcher) {
	// The fetcher function takes a start and a length, fetches
	// the data and returns it as a Float64Array.
	if (length == 0) {
	    return new Float64Array (0);
	}
	const stop = start + length;
	const start_section = this.sections.find (start);
	const stop_section = this.sections.find (start + length - 1);
	if (start_section !== null && stop_section !== null && start_section == stop_section && start_section.data !== null) {
	    const section_start = start_section.start;
	    const section_stop = start_section.start + start_section.length;
	    const discarded_at_beginning = start - section_start;
	    const discarded_at_end = section_stop - stop;
	    return start_section.data.slice (discarded_at_beginning, start_section.length - discarded_at_end);
	} else if (start_section !== null && stop_section !== null) {
	    // Since there is a stop section after the start section,
	    // then there are links between start_section and
	    // stop_sections.
	    console.assert (start_section.after !== null);
	    console.assert (stop_section.before !== null);
	    // There are gaps in the chain. Fill the first one, and
	    // recursively retry.
	    if (start_section.data === null) {
		// The first gap has been found, it was easy.
		const request_start = start;
		let request_stop = start_section.start + start_section.length;
		const early_stop = stop;
		if (early_stop < request_stop) {
		    request_stop = early_stop;
		}
		const request_length = request_stop - request_start;
		const fill = await fetcher (request_start, request_length);
		console.assert (fill.length === request_length);
		this.sections.replace (request_start, fill);
		return this.slice (start, length, fetcher);
	    } else {
		// Since the chain links are merged, then it means
		// that having data is an alternating predicate so the
		// next section does not have data.
		console.assert (start_section.after.data === null);
		// This is our problem.
		const request_start = start_section.after.start;
		let request_stop = stop;
		const early_stop = start_section.after.start + start_section.after.length;
		if (early_stop < request_stop) {
		    request_stop = early_stop;
		}
		const request_length = request_stop - request_start;
		const fill = await fetcher (request_start, request_length);
		console.assert (fill.length === request_length);
		this.sections.replace (request_start, fill);
		return this.slice (start, length, fetcher);
	    }
	} else {
	    if (this.sections.first === null && this.sections.last === null) {
		// I need to get all the data.
		const whole_data = await fetcher (start, length);
		console.assert (whole_data.length === length);
		this.sections.replace (start, whole_data);
		return whole_data;
	    } else {
		console.assert (this.sections.first !== null);
		console.assert (this.sections.last !== null);
		if (start < this.sections.first.start) {
		    // There is a bit of missing data prior to the first section.
		    let missing_stop = this.sections.first.start;
		    if (stop < missing_stop) {
			missing_stop = stop;
		    }
		    const length_missing = missing_stop - start;
		    const beginning = await fetcher (start, length_missing);
		    console.assert (beginning.length === length_missing, `the lazy array callback did not return the expected number of items (starting at ${start}, expected: ${length_missing})`, beginning.length);
		    this.sections.replace (start, beginning);
		}
		if (stop > this.sections.last.start + this.sections.last.length) {
		    // There is a bit of missing data after the last
		    // section.
		    let missing_start = this.sections.last.start + this.sections.last.length;
		    if (start > missing_start) {
			missing_start = start;
		    }
		    const length_missing = stop - missing_start;
		    const end = await fetcher (missing_start, length_missing);
		    console.assert (end.length === length_missing, `the lazy array callback did not return the expected number of items (expected: ${length_missing})`, end.length);
		    this.sections.replace (missing_start, end);
		}
		return this.slice (start, length, fetcher);
	    }
	}
    }
    forget (start, length) {
	this.sections.discard (start, length);
    }
}

// Local Variables:
// mode: js
// End:
