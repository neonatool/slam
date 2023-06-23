export default class NotInitialized extends Error {
    constructor() {
	super ('The Filter connection has not been initialized, call Filter.setMetadata first');
    }
}

// Local Variables:
// mode: js
// End:
