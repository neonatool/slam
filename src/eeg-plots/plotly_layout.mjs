import Series from './series.mjs';
import ChannelType from './channel_type.mjs';
import Annotation from './annotation.mjs';
import PlotlyData from './plotly_data.mjs';
import _ from '../gettext.mjs';

export default class Layout {
    constructor (sampling_frequency, data, annotations, start_index, window_length, amplifier, cursor_index = null) {
	if (sampling_frequency) {
	    sampling_frequency = Math.round (sampling_frequency);
	}
	if (!data) {
	    data = new Data ([]);
	}
	if (!annotations) {
	    annotations = [];
	}
	if (!start_index) {
	    start_index = 0;
	}
	if (sampling_frequency && !window_length) {
	    window_length = 20 * sampling_frequency;
	}
	if (!amplifier) {
	    amplifier = {};
	}
	if (!cursor_index) {
	    cursor_index = null;
	}
	console.assert (data instanceof PlotlyData, _ ('the data object must be a PlotlyData'), data);
	console.assert (Array.isArray (annotations) && annotations.every (ann => {
	    return ann instanceof Annotation;
	}), _ ('the annotations object must be an array of annotations'), annotations);
	console.assert (!sampling_frequency || (typeof sampling_frequency === 'number' && sampling_frequency > 0 && Number.isInteger (sampling_frequency)), _ ('the sampling freqency, if set, must be an integer'), sampling_frequency);
	console.assert (typeof start_index === 'number' && start_index >= 0 && Number.isInteger (start_index), _ ('the start index must be an index'), start_index);
	console.assert (!window_length || (typeof window_length === 'number' && window_length > 0 && Number.isInteger (window_length)), _ ('the window length, if set, must be an integer'), window_length);
	console.assert (!cursor_index || (typeof cursor_index === 'number' && Number.isInteger (cursor_index)), _ ('the cursor index must be an index'));
	const channel_types = data.channel_types ();
	this._sampling_frequency = sampling_frequency;
	this._data = data;
	this._annotations = annotations;
	this._amplifier = amplifier || {};
	this._cursor_index = cursor_index;
	this.xaxis = {
	    'showticklabels': false,
	    'showgrid': true,
	    'gridcolor': '#808080'
	};
	if (sampling_frequency) {
	    this.xaxis.tick0 = 0;
	    this.xaxis.dtick = sampling_frequency;
	    this.xaxis.autotick = false;
	}
	if (window_length) {
	    this.xaxis.range = [start_index, start_index + window_length];
	    this.xaxis.autorange = false;
	}
	this.yaxis = {
	    'domain': [0, 1],
	    'showticklabels': false,
	    'zeroline': false,
	    'showgrid': false,
	    'fixedrange': true,
	    'range': [ -1, 4 ]
	};
	this.shapes = Array.from (annotations).map ((ann) => {
	    return ann.plotly_shapes (channel_types);
	}).flat ();
	if (this._cursor_index) {
	    this.shapes.push ({
		type: 'line',
		x0: this._cursor_index,
		x1: this._cursor_index,
		y0: 0,
		y1: 1,
		xref: 'x',
		yref: 'paper',
		line: {
		    color: 'red',
		    width: '1'
		}
	    });
	}
	this.annotations = []; // In the sense of plotly annotations
	// I used to add the channel name on the left side of the
	// paper, but the absolute positioning is tricky. So I don’t
	// do that anymore.
	for (const ann of annotations) {
	    for (const block of ann.plotly_annotations (channel_types)) {
		this.annotations.push (block);
	    }
	}
	this.showlegend = false;
        this.hovermode = 'x';
	const margin = .05;
	const channelPaperWidth = (1 - 2 * margin) / channel_types.length;
	let y0 = margin;
	let y1 = y0 + channelPaperWidth;
	// y0 corresponds to the minimum tick, y1 corresponds to the
	// maximum tick.
	const datas = data.reorder (channel_types);
	for (let indexp1 = channel_types.length; indexp1 > 0; indexp1--) {
	    const index = indexp1 - 1;
	    const name = `yaxis${index + 2}`;
	    const { minimum, maximum } = datas[index].summary (start_index, window_length);
	    let lower = minimum;
	    let upper = maximum;
	    if (isNaN (lower) || isNaN (upper) || lower >= upper) {
		// This happens when there is no data for a channel
		// (i.e. an array of length 0 in the series).
		lower = -1;
		upper = 1;
	    }
	    const id = channel_types[index].id.toString ();
	    let explicit_values = {};
	    if (amplifier && id in amplifier) {
		explicit_values = amplifier[id] || {};
	    }
	    if (explicit_values.low && explicit_values.high) {
		lower = explicit_values.low;
		upper = explicit_values.high;
	    }
	    // Compute the range of this axis, so that the lower bound
	    // appears at plot fraction y0 and the upper bound appears
	    // at fraction y1.
	    const rangePerSpace = (upper - lower) / (y1 - y0);
	    const offset = upper - y1 * rangePerSpace;
	    const bottom = 0 * rangePerSpace + offset;
	    const top = 1 * rangePerSpace + offset;
	    this[name] = {
		range: [bottom, top],
		showticklabels: false,
		zeroline: false,
		showgrid: false,
		fixedrange: true,
		overlaying: 'y',
		'type': 'linear'
	    };
	    y0 = y1;
	    y1 = y1 + channelPaperWidth;
	}
    }
    change_data (data) {
	const [ start_index, stop_index ] = this.xaxis.range;
	const window_length = stop_index - start_index;
	return new Layout (this._sampling_frequency, data, this._annotations, Math.floor (start_index), Math.ceil (window_length), this._amplifier, this._cursor_index);
    }
    change_annotations (f) {
	const new_annotations = f (this._annotations);
	if (new_annotations == this._annotations) {
	    // Not changed
	    return this;
	}
	const [ start_index, stop_index ] = this.xaxis.range;
	const window_length = stop_index - start_index;
	return new Layout (this._sampling_frequency, this._data, new_annotations, Math.floor (start_index), Math.ceil (window_length), this._amplifier, this._cursor_index);
    }
    change_amplifier (amplifier) {
	const [ start_index, stop_index ] = this.xaxis.range;
	const window_length = stop_index - start_index;
	return new Layout (this._sampling_frequency, this._data, this._annotations, Math.floor (start_index), Math.ceil (window_length), amplifier, this._cursor_index);
    }
    change_cursor_index (cursor_index) {
	const [ start_index, stop_index ] = this.xaxis.range;
	const window_length = stop_index - start_index;
	return new Layout (this._sampling_frequency, this._data, this._annotations, Math.floor (start_index), Math.ceil (window_length), this._amplifier, cursor_index);
    }
    add_annotation (id) {
	return this.change_annotations (existing => {
	    const new_annotation = new Annotation (id);
	    const anns = [];
	    for (const ann of existing) {
		if (ann.id.toString () === id.toString ()) {
		    // Already present.
		    return existing;
		}
		anns.push (ann);
	    }
	    anns.push (new_annotation);
	    return anns;
	});
    }
    remove_annotation (id) {
	return this.change_annotations (existing => {
	    let found = false;
	    const anns = [];
	    for (const ann of existing) {
		if (ann.id.toString () === id.toString ()) {
		    found = true;
		} else {
		    anns.push (ann);
		}
	    }
	    if (found) {
		return anns;
	    } else {
		return existing;
	    }
	});
    }
    change_annotation (id, transform) {
	return this.change_annotations (existing => {
	    const anns = [];
	    let modified = false;
	    for (const ann of existing) {
		if (ann.id.toString () === id.toString ()) {
		    const changed = transform (ann);
		    if (changed != ann) {
			// Different JS object
			modified = true;
		    }
		    anns.push (changed);
		} else {
		    anns.push (ann);
		}
	    }
	    if (modified) {
		return anns
	    }
	    return existing;
	});
    }
    change_annotation_label (id, label) {
	return this.change_annotation (id, ann => ann.change_label (label));
    }
    change_annotation_start_index (id, start) {
	return this.change_annotation (id, ann => ann.change_start_index (start));
    }
    change_annotation_length (id, duration) {
	return this.change_annotation (id, ann => ann.change_length (duration));
    }
    add_annotation_channel (id, channel) {
	return this.change_annotation (id, ann => ann.add_channel (channel));
    }
    remove_annotation_channel (id, channel) {
	return this.change_annotation (id, ann => ann.remove_channel (channel));
    }
    mark_saved (id) {
	if (id) {
	    return this.change_annotation (id, ann => ann.mark_saved ());
	} else {
	    return this.change_annotations (anns => anns.map (ann => ann.mark_saved ()));
	}
    }
}

// Local Variables:
// mode: js
// End:
