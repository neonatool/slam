import { Filter, MissingRawData } from './filter-proxy.mjs';

export default class Channel {
    constructor (eeg_proxy, start_date, sampling_frequency, id, type, index) {
	this.id = id;
	this.type = type;
	this.index = index;
	this._eeg = eeg_proxy;
	const worker = new Worker ('./filter-worker.js');
	const filter = new Filter ((msg) => worker.postMessage (msg));
	worker.onmessage = (msg) => filter.onmessage (msg);
	this._filter = filter.setMetadata (start_date, sampling_frequency).then (() => {
	    return filter;
	});
    }
    async filter (low, high, start_date, stop_date) {
	const filter = await this._filter;
	try {
	    return await filter.filter (low, high, start_date, stop_date);
	} catch (e) {
	    if (e instanceof MissingRawData) {
		console.assert (e.start >= 0, `the request for missing data starts at ${e.start} < 0`, e.start);
		const result = await this._eeg.eeg_data (this.index, e.start, e.stop);
		let { response } = result;
		const n_points = result['n-points'];
		if (e.stop > n_points) {
		    // Pad with zeros
		    const zeros = new Float64Array (e.stop - n_points).fill (0);
		    response = Float64Array.from ([...Array.from (response), ...Array.from (zeros)]);
		}
		await filter.setData (e.start, response);
		return this.filter (low, high, start_date, stop_date);
	    } else {
		throw e;
	    }
	}
    }
};

// Local Variables:
// mode: js
// End:
