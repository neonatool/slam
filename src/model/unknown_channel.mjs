export default class UnknownChannel extends Error {
    constructor(id, channels) {
	this.id = id;
	this.channels = channels;
	super (`unknown channel ${id}`);
    }
}

// Local Variables:
// mode: js
// End:
