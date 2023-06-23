import RawPlot from './plot.mjs';
import ChannelType from './channel_type.mjs';
import EEGAmplifier from './eeg_amplifier.mjs';
import EEGToolbar from './eeg_toolbar.mjs';
import _ from '../gettext.mjs';

export default class Plot extends HTMLElement {
    constructor () {
        super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	const container = document.createElement('div');
	container.style.display = 'flex';
	container.style['flex-direction'] = 'row';
	container.style['wrap'] = 'nowrap';
	container.style['align-items'] = 'stretch';
	const amplifier = document.createElement('slam-eeg-amplifier');
	this._amplifier = amplifier;
	const plot = document.createElement('slam-raw-plot');
	this._plot = plot;
	plot.style.display = 'flex';
	plot.style['flex-direction'] = 'row';
	plot.style['flex-grow'] = '1';
	container.appendChild (amplifier);
	container.appendChild (plot);
	amplifier.addEventListener ('slam-amplifier-updated', (ev) => {
	    this.replot ();
	});
	amplifier.addEventListener('slam-select-filter', (ev) => {
	    const select = new CustomEvent ('slam-select-filter');
	    select.updates = ev.updates;
	    const { start_index, window_length } = plot.interval;
	    select.start_index = start_index;
	    select.window_length = window_length;
	    this.dispatchEvent (select);
	});
	const toolbar = document.createElement('slam-eeg-toolbar');
	this._toolbar = toolbar;
	toolbar.style['display'] = 'flex';
	toolbar.style['flex-direction'] = 'row';
	toolbar.style['flex-wrap'] = 'wrap';
	toolbar.style['justify-content'] = 'space-evenly';
	plot.addEventListener ('slam-move-window', (ev) => {
	    const move = new CustomEvent ('slam-move-window');
	    move.start_index = ev.start_index;
	    move.window_length = ev.window_length;
	    this.dispatchEvent (move);
	});
	plot.addEventListener ('slam-click', (ev) => {
	    const click = new CustomEvent ('slam-click');
	    click.time = ev.time;
	    this.dispatchEvent (click);
	});
	toolbar.addEventListener ('slam-reset-amplifier', ev => {
	    amplifier.amplitude = ev.literal;
	});
	toolbar.addEventListener ('slam-reset-time', ev => {
	    const requested_window_length = ev.window_length;
	    const { start_index, window_length } = plot.interval;
	    const middle = start_index + window_length / 2;
	    const requested_start_index = Math.floor (middle - requested_window_length / 2);
	    plot.move_to (requested_start_index, requested_window_length);
	    const move = new CustomEvent ('slam-move-window');
	    move.start_index = requested_start_index;
	    move.window_length = requested_window_length;
	    this.dispatchEvent (move);
	});
	toolbar.addEventListener ('slam-reset-filter', ev => {
	    amplifier.filter = ev;
	});
	shadow.appendChild (toolbar);
	shadow.appendChild (container);
	this.widthForPlot = () => {
	    return container.clientWidth - amplifier.clientWidth;
	};
    }

    prepare (sampling_frequency, channels) {
	console.assert (typeof sampling_frequency === 'number' && sampling_frequency > 0 && Number.isInteger (sampling_frequency), 'the sampling frequency must be a positive integer', sampling_frequency);
	console.assert (Array.isArray (channels) && channels.every (cht => {
	    return (cht instanceof ChannelType);
	}), 'the channels must be an array of channel types', channels);
	this._plot.prepare (sampling_frequency, channels);
	this._amplifier.set_channels (channels);
	this._toolbar.setAttribute ('sampling-frequency', sampling_frequency);
    }

    reorder (channel_order) {
	console.assert (Array.isArray (channel_order) && channel_order.every (cht => {
	    return (cht instanceof ChannelType);
	}), _ ('the channel order must be an array of channel types'), channel_order);
	this._amplifier.set_channels (channel_order);
	this._plot.reorder (channel_order);
    }

    set_series_data (channel, start_index, value) {
	console.assert (channel instanceof ChannelType, _ ('the channel type must be a ChannelType'), channel);
	console.assert (typeof start_index === 'number' && start_index >= 0 && Number.isInteger (start_index), _ ('the start index must be an index'), start_index);
	console.assert (value instanceof Float64Array, _ ('the series value must be a float64 array'), value);
	return this._plot.set_series_data (channel, start_index, value);
    }

    add_annotation (id) {
	return this._plot.add_annotation (id);
    }

    remove_annotation (id) {
	return this._plot.remove_annotation (id);
    }

    change_annotation_label (id, label) {
	console.assert (typeof label === 'string', _ ('the label must be a string'), label);
	return this._plot.change_annotation_label (id, label);
    }

    change_annotation_start_index (id, start_index) {
	start_index = Math.round (start_index);
	console.assert (typeof start_index === 'number' && start_index >= 0 && Number.isInteger (start_index), _ ('the start index must be an index'), start_index);
	return this._plot.change_annotation_start_index (id, start_index);
    }

    change_annotation_length (id, length) {
	length = Math.ceil (length);
	console.assert (typeof length === 'number' && length >= 0 && Number.isInteger (length), _ ('the annotation length must be a positive integer'), length);
	return this._plot.change_annotation_length (id, length);
    }

    add_annotation_channel (id, channel) {
	console.assert (channel instanceof ChannelType, _ ('the channel type must be a ChannelType'), channel);
	return this._plot.add_annotation_channel (id, channel);
    }

    remove_annotation_channel (id, channel) {
	console.assert (channel instanceof ChannelType, _ ('the channel type must be a ChannelType'), channel);
	return this._plot.remove_annotation_channel (id, channel);
    }

    mark_annotation_saved (id) {
	return this._plot.mark_annotation_saved (id);
    }

    replot () {
	this._amplifier.height = window.innerHeight || 1080;
	this._plot.change_amplifier (this._amplifier.amplitude);
	this._plot.replot (this.widthForPlot (), this._amplifier.height);
    }

    move_to (start_index) {
	console.assert (typeof start_index === 'number' && start_index >= 0 && Number.isInteger (start_index), _ ('the start index must be an index'), start_index);
	return this._plot.move_to (start_index, this._toolbar.window_length);
    }

    get interval () {
	return this._plot.interval;
    }

    get amplifier () {
	return this._amplifier.amplitude;
    }

    get filter () {
	return this._amplifier.filter;
    }
}

customElements.define ('adf-plot', Plot);

// Local Variables:
// mode: js
// End:
