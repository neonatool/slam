export default class MissingRawData extends Error {
    constructor(start, stop) {
	super ('The filter backend requests raw data, see Filter.setData');
	this.start = start;
	this.stop = stop;
    }
}

// Local Variables:
// mode: js
// End:
