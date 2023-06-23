import ChannelType from './channel_type.mjs';
import channel_blocks from './channel_blocks.mjs';
import _ from '../gettext.mjs';

export default class Annotation {
    constructor (id, label, start_index, length, location, color = 'orange') {
	if (!label) {
	    label = _ ("New annotation");
	}
	if (!start_index) {
	    start_index = 0;
	}
	if (!length) {
	    length = 0;
	}
	if (!location) {
	    location = [];
	}
	start_index = Math.round (start_index);
	length = Math.ceil (length);
	console.assert (typeof id === 'string', _ ('the annotation ID must be a string'), id);
	console.assert (typeof label === 'string', _ ('the annotation label must be a string'), label);
	console.assert (typeof start_index === 'number' && start_index >= 0 && Number.isInteger (start_index), _ ('the start index must be an index'), start_index);
	console.assert (typeof length === 'number' && length >= 0 && Number.isInteger (length), _ ('the annotation length must be an integer'), length);
	console.assert (Array.isArray (location) && location.every (cht => {
	    return (cht instanceof ChannelType);
	}), 'the location must be an array of channel types', location);
	this.id = id;
	this.label = label;
	this.start_index = start_index;
	this.length = length;
	this.location = location;
	this.color = color;
    }
    change_label (label) {
	console.assert (typeof label === 'string', _ ('the annotation label must be a string'), label);
	return new Annotation (this.id, label, this.start_index, this.length, this.location, 'blue');
    }
    change_start_index (start_index) {
	console.assert (typeof start_index === 'number' && start_index >= 0 && Number.isInteger (start_index), _ ('the start index must be an index'), start_index);
	return new Annotation (this.id, this.label, start_index, this.length, this.location, 'blue');
    }
    change_length (length) {
	console.assert (typeof length === 'number' && length >= 0 && Number.isInteger (length), _ ('the annotation length must be an integer'), length);
	return new Annotation (this.id, this.label, this.start_index, length, this.location, 'blue');
    }
    add_channel (channel) {
	console.assert (channel instanceof ChannelType, _ ('the channel must be a ChannelType'), channel);
	const channels = [];
	for (const ch of this.location) {
	    if (ch.id.toString () !== channel.id.toString ()) {
		channels.push (ch);
	    } else {
		// The annotation is unchanged
		return this;
	    }
	}
	channels.push (channel);
	return new Annotation (this.id, this.label, this.start_index, this.length, channels, 'blue');
    }
    remove_channel (channel) {
	console.assert (channel instanceof ChannelType, _ ('the channel must be a ChannelType'), channel);
	const channels = [];
	let modified = false;
	for (const ch of this.location) {
	    if (ch.id.toString () !== channel.id.toString ()) {
		channels.push (ch);
	    } else {
		modified = true;
	    }
	}
	if (modified) {
	    return new Annotation (this.id, this.label, this.start_index, this.length, channels, 'blue');
	} else {
	    return this;
	}
    }
    mark_saved () {
	return new Annotation (this.id, this.label, this.start_index, this.length, this.location, 'orange');
    }
    located_in (channel) {
	console.assert (channel instanceof ChannelType, _ ('the channel test must be a channel type'), channel);
	for (const loc of this.location) {
	    if (loc.id.toString () === channel.id.toString ()) {
		return true;
	    }
	    if (channel.anode && this.located_in (channel.anode)) {
		return true;
	    }
	    if (channel.cathode && this.located_in (channel.cathode)) {
		return true;
	    }
	}
	return false;
    }
    locations_from (channel_order) {
	// Return the subset of channel types from channel_order for
	// which the annotation is located in the channel itself, or
	// in its anode or cathode.
	console.assert (Array.isArray (channel_order), _ ('the channel order must be an array'), channel_order);
	const present = [];
	for (const loc of channel_order) {
	    console.assert (loc instanceof ChannelType, _ ('the channel order element must be a channel type'), loc);
	    if (this.located_in (loc)) {
		present.push (loc);
	    }
	}
	return present;
    }
    plotly_shapes (channel_order) {
	const present = this.locations_from (channel_order).map (x => x.id);
	const blocks = channel_blocks (present, channel_order.map (x => x.id).reverse ());
	return blocks.map ((block) => {
	    return {
		type: 'rect',
		xref: 'x',
		yref: 'paper',
		x0: this.start_index,
		x1: this.start_index + this.length,
		y0: block.yStart,
		y1: block.yEnd,
		fillcolor: this.color,
		opacity: 0.2
	    };
	});
    }
    plotly_annotations (channel_order) {
	const present = this.locations_from (channel_order).map (x => x.id);
	const blocks = channel_blocks (present, channel_order.map (x => x.id).reverse ());
	return blocks.map ((block) => {
	    return {
		x: this.start_index,
		y: block.yEnd,
		xref: 'x',
		yref: 'paper',
		text: this.label,
		bgcolor: 'rgba(255, 255, 255, 0.8)',
		borderpad: 3
	    };
	});
    }
}

// Local Variables:
// mode: js
// End:
