import BackgroundSeries from './background_series.mjs';
import Series from './series.mjs';
import ChannelType from './channel_type.mjs';
import _ from '../gettext.mjs';

export default class Data extends Array {
    constructor (series) {
	super ();
	console.assert (Array.isArray (series) && series.every ((s) => {
	    return (s instanceof Series);
	}), _ ('the series must be an array series'), series);
	for (const s of series) {
	    this.push (s.reorder (this.length));
	}
	this.push (new BackgroundSeries ());
    }
    channel_types () {
	const ret = [];
	for (let i = 0; i < this.length - 1; i++) {
	    ret.push (this[i].channel_type ());
	}
	return ret;
    }
    reorder (channel_order) {
	console.assert (Array.isArray (channel_order), _ ('the order of channels must be an array'));
	const new_series = [];
	const indices = {};
	const by_channel_type = {};
	for (let i = 0; i < this.length - 1; i++) {
	    const s = this[i];
	    by_channel_type[s.channel_type ().id] = s;
	}
	for (const ch of channel_order) {
	    console.assert (ch instanceof ChannelType, _ ('the order of channels must be an array of channel types'), ch);
	    console.assert (ch.id in by_channel_type, _ ('the order of channels must only have channels that are known'), ch.id, Object.keys (by_channel_type));
	    console.assert (! (ch.id in indices), _ ('the order of channels must not be redundant'), ch.id);
	    const s = by_channel_type[ch.id];
	    const i = new_series.length;
	    indices[ch.id] = new_series.length;
	    new_series.push (s.reorder (i));
	}
	console.assert (new_series.length === this.length - 1, _ ('some channels have been forgotten'));
	return new Data (new_series);
    }
    set_data (channel, start_index, value) {
	console.assert (channel instanceof ChannelType, _ ('the series identifier must be a channel type'), channel);
	console.assert (typeof start_index === 'number' && Number.isInteger (start_index) && start_index >= 0, _ ('the start index must be an index'), start_index);
	console.assert (value instanceof Float64Array, _ ('the data must be a float64 array'), value);
	const changed = [];
	let found = false;
	for (let i = 0; i < this.length - 1; i++) {
	    if (this[i].channel_type ().id.toString () === channel.id.toString ()) {
		console.assert (!found, _ ('there are multiple series with this channel type'), channel);
		found = true;
		changed.push (this[i].set_data (start_index, value));
	    } else {
		changed.push (this[i]);
	    }
	}
	return new Data (changed);
    }
}

// Local Variables:
// mode: js
// End:
