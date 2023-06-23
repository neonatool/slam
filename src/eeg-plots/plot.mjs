import Plotly from 'plotly.js-dist-min'
import PlotlyData from './plotly_data.mjs';
import PlotlyLayout from './plotly_layout.mjs';
import plotly_style_hack from './plotly_style_hack.mjs';
import ChannelType from './channel_type.mjs';
import Series from './series.mjs';
import _ from '../gettext.mjs';

function addTime (date, duration) {
    const msec = date - 0;
    const end_msec = msec + duration * 1000;
    return new Date (end_msec);
}

export default class Plot extends HTMLElement {
    constructor () {
        super ();
	const shadow = this.attachShadow ({ mode: 'open'});
        const style = document.createElement('style');
        shadow.appendChild (style);
        style.appendChild (document.createTextNode (plotly_style_hack));
        this.container = document.createElement('div');
        shadow.appendChild (this.container);
        this.initialized = false;
	const dispatchMove = (direction) => {
	    const { start_index, window_length } = this.interval;
	    if (start_index === null || window_length === null) {
		throw new Error(_ ('Impossible, the plot is ready so it has data, so it has a layout.'));
	    }
	    const half_length = window_length / 2;
	    const new_start_index = Math.round (start_index + direction * half_length);
	    const move = new CustomEvent('slam-move-window');
	    move.start_index = new_start_index;
	    move.window_length = window_length;
	    this.move_to (new_start_index, window_length);
	    this.dispatchEvent (move);
	};
	window.addEventListener ('keydown', (e) => {
	    if (!e.repeat) {
		if (e.key == 'ArrowLeft') {
		    dispatchMove (-1);
		} else if (e.key == 'ArrowRight') {
		    dispatchMove (+1);
		}
	    }
	});
	this.data = new PlotlyData ([]);
	this.layout = new PlotlyLayout (null, this.data, []);
    }

    prepare (sampling_frequency, channels) {
	console.assert (typeof sampling_frequency === 'number' && sampling_frequency > 0 && Number.isInteger (sampling_frequency), _ ('the sampling frequency must be a positive integer'), sampling_frequency);
	console.assert (Array.isArray (channels), _ ('the channels must be an array of channel types'), channels);
	const series = [];
	for (const cht of channels) {
	    console.assert (cht instanceof ChannelType, _ ('each channel type must be a ChannelType'), cht);
	    const s = new Series (series.length, cht, new Float64Array (0));
	    series.push (s);
	}
	this.data = new PlotlyData (series);
	this.layout = new PlotlyLayout (sampling_frequency, this.data, []);
    }

    reorder (channel_order) {
	console.assert (Array.isArray (channel_order), _ ('the channel order must be an array of channel types'), channel_order);
	this.data = this.data.reorder (channel_order);
	this.layout = this.layout.change_data (this.data);
    }

    set_series_data (channel, start_index, value) {
	console.assert (channel instanceof ChannelType, _ ('the channel type must be a ChannelType'), channel);
	console.assert (typeof start_index === 'number' && Number.isInteger (start_index) && start_index >= 0, _ ('the start index must be an index'), start_index);
	console.assert (value instanceof Float64Array, _ ('the series value must be a float64 array'), value);
	this.data = this.data.set_data (channel, start_index, value);
	this.layout = this.layout.change_data (this.data);
    }

    add_annotation (id) {
	this.layout = this.layout.add_annotation (id);
    }

    remove_annotation (id) {
	this.layout = this.layout.add_annotation (id);
    }

    change_annotation_label (id, label) {
	this.layout = this.layout.change_annotation_label (id, label);
    }

    change_annotation_start_index (id, start_index) {
	this.layout = this.layout.change_annotation_start_index (id, start_index);
    }

    change_annotation_length (id, length) {
	this.layout = this.layout.change_annotation_length (id, length);
    }

    add_annotation_channel (id, channel) {
	this.layout = this.layout.add_annotation_channel (id, channel);
    }

    remove_annotation_channel (id, channel) {
	this.layout = this.layout.remove_annotation_channel (id, channel);
    }

    mark_annotation_saved (id) {
	this.layout = this.layout.mark_saved (id);
    }

    replot (width, height) {
	const data = this.data;
	const layout = this.layout;
        console.assert (Array.isArray (data), _ ('the plotly data is not an array'), data);
        console.assert (!!layout, _ ('the plotly layout is missing'), layout);
        const container = this.container;
	layout.width = width;
	layout.height = height;
        if (!this.initialized) {
	    Plotly.newPlot (this.container, data, layout);
	    let hover_index = null;
            let can_hover = false;
	    this.addEventListener ('mousemove', (e) => {
		// Allow the next plotly hover event.
		can_hover = true;
	    });
	    this.container.on('plotly_hover', data => {
		if (can_hover) {
		    can_hover = false;
		    hover_index = Math.round (data.points[0].x);
		    this.layout = this.layout.change_cursor_index (hover_index);
		    Plotly.react (this.container, this.data, this.layout);
		} else {
                    // Otherwise, this is most likely a plotly artifact
                    // that should be ignored.
		}
	    });
	    // Do not rely on plotly_click, it is not precise enough
	    // (there is a click drift).
	    this.container.addEventListener ('click', data => {
                console.log ('Click!', data);
		const click = new CustomEvent('slam-click');
		click.time = hover_index;
		this.dispatchEvent (click);
	    });
	    this.container.on('plotly_relayout', data => {
		const { start_index, window_length } = this.interval;
		const relayout = new CustomEvent('slam-move-window');
		relayout.start_index = start_index;
		relayout.window_length = window_length;
		this.dispatchEvent (relayout);
	    });
	    this.initialized = true;
	    const init = new CustomEvent('slam-plot-ready');
	    this.dispatchEvent(init);
	} else {
	    Plotly.react (this.container, data, layout);
	}
    }

    move_to (start_index, window_length) {
	console.assert (typeof start_index === 'number' && Number.isInteger (start_index), _ ('the start index must be an index'), start_index);
	console.assert (typeof window_length === 'number' && Number.isInteger (window_length) && window_length > 0, _ ('length of the window must be a positive integer'), window_length);
	this.container.layout.xaxis.range[0] = start_index;
	this.container.layout.xaxis.range[1] = start_index + window_length;
	Plotly.react (this.container, this.container.data, this.container.layout);
    }

    get interval () {
	const plot = this.container;
	const ret = { 'start_index': 0, 'window_length': 1 };
	if (plot.layout && plot.layout.xaxis && plot.layout.xaxis.range) {
	    let [ xmin, xmax ] = plot.layout.xaxis.range;
	    ret.start_index = Math.floor (xmin);
	    ret.window_length = Math.ceil (xmax - xmin);
	}
	return ret;
    }

    change_amplifier (value) {
	this.layout = this.layout.change_amplifier (value);
    }
}

customElements.define ('slam-raw-plot', Plot);

// Local Variables:
// mode: js
// End:
