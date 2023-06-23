import ChannelType from './channel_type.mjs';
import _ from '../gettext.mjs';

export default class Series {
    constructor (index, channel_type, values) {
	if (!values) {
	    values = new Float64Array (0);
	}
	console.assert (typeof index === 'number', _ ('the index is not a number'), index);
	console.assert (channel_type instanceof ChannelType, _ ('the channel type is not of class ChannelType'), channel_type);
	console.assert (values instanceof Float64Array, _ ('the data should be a Float64 typed array'), values);
	this.y = Array.from (values);
	this.x = this.y.map ((_, i) => i);
	this.line = { 'color': 'black', 'width': 1 };
	this.name = channel_type.name;
	this.yaxis = `y${index + 2}`;
        this.hoverinfo = 'none';
	this._index = index;
	this._channel_type = channel_type;
	this._values = values;
    }
    channel_type () {
	return this._channel_type;
    }
    isEEG () {
	return this._channel_type.isEEG ();
    }
    summary (start_index, window_length) {
	if (!start_index) {
	    start_index = 0;
	}
	if (!window_length) {
	    window_length = this.y.length;
	}
	const relevant = this.y.slice (start_index, start_index + window_length);
	const s = {
	    'minimum': Infinity,
	    'maximum': -Infinity
	};
	relevant.forEach ((y) => {
	    if (y > s.maximum) {
		s.maximum = y;
	    }
	    if (y < s.minimum) {
		s.minimum = y;
	    }
	});
	return s;
    }
    grow () {
	let new_size = this._values.length * 2;
	if (new_size === 0) {
	    new_size = 1;
	}
	const new_array = new Float64Array (new_size).fill (NaN);
	new_array.set (this._values, 0);
	this.y = Array.from (new_array);
	this.x = this.y.map ((_, i) => i);
	this._values = new_array;
    }
    grow_until (size) {
	while (this._values.length < size) {
	    this.grow ();
	}
    }
    set_data (start_index, values) {
	console.assert (typeof start_index === 'number' && Number.isInteger (start_index) && start_index >= 0, _ ('the start index must be an index'), start_index);
	console.assert (values instanceof Float64Array, _ ('the data must be a float64 array'), values);
	this.grow_until (start_index + values.length);
	this._values.set (values, start_index);
	this.y = Array.from (this._values);
	return this;
    }
    reorder (index) {
	return new Series (index, this._channel_type, this._values);
    }
}

// Local Variables:
// mode: js
// End:
