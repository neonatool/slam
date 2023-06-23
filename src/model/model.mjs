import { EEG } from './data-proxy.mjs';
import InvalidEEG from './invalid_eeg.mjs';
import UnknownChannel from './unknown_channel.mjs';
import Channel from './channel.mjs';

export default class Model {
    constructor (bytes) {
	const eeg_worker = new Worker ('./eeg-worker.js');
	const eeg = new EEG ((msg) => eeg_worker.postMessage (msg));
	eeg_worker.onmessage = (msg) => eeg.onmessage (msg);
	this.eeg = eeg;
	this._channels = eeg.set_data (bytes).then (async () => {
	    const [start_date, sampling_frequency, channel_ids] =
		  await Promise.all ([eeg.find_eeg_start_date (),
				      eeg.find_eeg_sampling_frequency (),
				      eeg.find_eeg_channels ()]);
	    if (start_date.length == 0 || sampling_frequency.length == 0) {
		throw new InvalidEEG(start_date, sampling_frequency);
	    }
	    const channels = await Promise.all (channel_ids.map (async (id) => {
		const [type, index] =
		      await Promise.all ([eeg.find_channel_type (id),
					  eeg.find_channel_index (id)]);
		return new Channel (this.eeg, start_date[0], sampling_frequency[0], id, type[0], Number (index[0]));
	    }));
	    return channels;
	});
    }
    find_objects (subject, predicate) {
	return this.eeg.find_objects (subject, predicate);
    }
    find_subjects (object, predicate) {
	return this.eeg.find_subjects (object, predicate);
    }
    find_object_numbers (subject, predicate) {
	return this.eeg.find_object_numbers (subject, predicate);
    }
    find_object_dates (subject, predicate) {
	return this.eeg.find_object_dates (subject, predicate);
    }
    get_bytes () {
	return this.eeg.get_data ();
    }
    insert (subject, predicate, object) {
	return this.eeg.insert (subject, predicate, object);
    }
    delete_data (subject, predicate, object, date) {
	return this.eeg.delete_data (subject, predicate, object, date);
    }
    async filtered_data (channel_id, low, high, start_date, stop_date) {
	for (const ch of await this._channels) {
	    if (ch.id === channel_id) {
		return ch.filter (low, high, start_date, stop_date);
	    }
	}
	throw new UnknownChannel (channel_id, await this._channels);
    }
    async channels () {
	return this._channels;
    }
};

// Local Variables:
// mode: js
// End:
