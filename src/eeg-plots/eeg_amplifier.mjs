import ChannelType from './channel_type.mjs';
import ChannelAmplifier from './channel_amplifier.mjs';
import _ from '../gettext.mjs';

const total_height = 768;
const margin_top = 128;
const margin_bottom = 108;
const allocated_height = total_height - margin_top - margin_bottom;

export default class EEGAmplifier extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const container = document.createElement('div');
	shadow.appendChild (container);
	container.style['margin-top'] = `${margin_top}px`;
	container.style['margin-bottom'] = `${margin_bottom}px`;
	container.style['display'] = 'flex';
	container.style['flex-direction'] = 'column';
	container.style['max-width'] = '256px';
	this._amplifiers = [];
	this._container = container;
    }
    get amplitude () {
	const result = {};
	for (const ampl of this._amplifiers) {
	    const ch = ampl._channel_type;
	    result[ch.id.toString ()] = ampl.amplitude;
	}
	return result;
    }
    get filter () {
	const result = {};
	for (const ampl of this._amplifiers) {
	    const ch = ampl._channel_type;
	    result[ch.id.toString ()] = ampl.filter;
	}
	return result;
    }
    get height () {
	return this._total_height;
    }
    set amplitude (value) {
	for (const ampl of this._amplifiers) {
	    ampl.amplitude = value;
	}
	const update = new CustomEvent ('slam-amplifier-updated');
	this.dispatchEvent (update);
    }
    set filter (value) {
	const updates = [];
	for (const ampl of this._amplifiers) {
	    const ch = ampl._channel_type;
	    ampl.filter = value;
	    const { literal_highpass, literal_lowpass, highpass, lowpass } = ampl.filter;
	    updates.push ({
		'literal_highpass': literal_highpass,
		'literal_lowpass': literal_lowpass,
		'highpass': highpass,
		'lowpass': lowpass,
		'low': highpass,
		'high': lowpass,
		'channel': ch
	    });
	}
	const select = new CustomEvent('slam-select-filter');
	select.updates = updates;
	this.dispatchEvent (select);
	const update = new CustomEvent ('slam-amplifier-updated');
	this.dispatchEvent (update);
    }
    set height (value) {
	this._total_height = value;
	const margin_top = 128;
	const margin_bottom = 108;
	const allocated_height = this._total_height - margin_top - margin_bottom;
	this._container.style['height'] = `${allocated_height}px`;
    }
    set_channels (cht) {
	console.assert (Array.isArray (cht), _ ('the channels must be an array of channel types'), cht);
	this._amplifiers = [];
	this._container.replaceChildren ([]);
	for (const ch of cht) {
	    const amplifier = document.createElement('slam-channel-amplifier');
	    amplifier._channel_type = ch;
	    this._amplifiers.push (amplifier);
	    amplifier.set_channel_name (ch.name);
	    amplifier.addEventListener ('slam-select-amplitude', (ev) => {
		if (ev.manual) {
		    const select = new CustomEvent('slam-select-amplitude');
		    const { literal, low, high } = ev;
		    select.literal = literal;
		    select.low = low;
		    select.high = high;
		    select.channel = ch;
		    this.dispatchEvent (select);
		    const update = new CustomEvent ('slam-amplifier-updated');
		    this.dispatchEvent (update);
		}
	    });
	    amplifier.addEventListener ('slam-select-filter', (ev) => {
		if (ev.manual) {
		    const { literal_highpass, literal_lowpass, highpass, lowpass } = ev;
		    const select = new CustomEvent('slam-select-filter');
		    select.updates = [{
			'literal_highpass': literal_highpass,
			'literal_lowpass': literal_lowpass,
			'low': highpass,
			'high': lowpass,
			'highpass': highpass,
			'lowpass': lowpass,
			'channel': ch
		    }];
		    this.dispatchEvent (select);
		    const update = new CustomEvent ('slam-amplifier-updated');
		    this.dispatchEvent (update);
		}
	    });
	    amplifier.style.display = 'flex';
	    amplifier.style['align-items'] = 'center';
	    amplifier.style['max-height'] = `${100 / cht.length}%`;
	    amplifier.style['flex-grow'] = '1';
	    amplifier.style['flex-wrap'] = 'wrap';
	    amplifier.style['gap'] = '0 .5em';
	    this._container.appendChild (amplifier);
	}
	const update = new CustomEvent('slam-amplifier-updated');
	this.dispatchEvent (update);
    }
}

customElements.define ('slam-eeg-amplifier', EEGAmplifier);

// Local Variables:
// mode: js
// End:
