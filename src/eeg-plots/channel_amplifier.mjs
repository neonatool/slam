import AmplitudeSelector from './amplitude_selector.mjs';
import FilterSelector from './filter_selector.mjs';
import _ from '../gettext.mjs';

export default class ChannelAmplifier extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const filter = document.createElement('slam-filter-selector');
	const amplitude = document.createElement('slam-amplitude-selector');
	filter.style.display = 'inline-block';
	amplitude.style.display = 'inline-block';
	shadow.appendChild (filter);
	shadow.appendChild (amplitude);
	this._label = document.createElement('span');
	this._label.style.display = 'flex';
	this._label.style['min-width'] = '4em';
	this._label.style['text-align'] = 'right';
	this._label.appendChild (document.createTextNode ('???'));
	shadow.appendChild (this._label);
	this._filter = filter;
	this._amplitude = amplitude;
	amplitude.addEventListener ('slam-select-amplitude', (ev) => {
	    const select = new CustomEvent('slam-select-amplitude');
	    const { literal, low, high } = ev;
	    select.literal = literal;
	    select.low = low;
	    select.high = high;
	    select.manual = ev.manual;
	    this.dispatchEvent (select);
	});
	filter.addEventListener ('slam-select-filter', (ev) => {
	    const select = new CustomEvent('slam-select-filter');
	    const { literal_highpass, literal_lowpass, highpass, lowpass } = ev;
	    select.literal_highpass = literal_highpass;
	    select.literal_lowpass = literal_lowpass;
	    select.highpass = highpass;
	    select.lowpass = lowpass;
	    select.low = highpass;
	    select.high = lowpass;
	    select.manual = ev.manual;
	    this.dispatchEvent (select);
	});
    }
    get amplitude () {
	return this._amplitude.value;
    }
    get filter () {
	return this._filter.value
    }
    set amplitude (value) {
	this._amplitude.value = value;
	const update = new CustomEvent ('slam-amplifier-updated');
	this.dispatchEvent (update);
    }
    set filter (value) {
	this._filter.value = value;
	const update = new CustomEvent ('slam-amplifier-updated');
	this.dispatchEvent (update);
    }
    set_channel_name (name) {
	this._label.replaceChildren ([]);
	this._label.appendChild (document.createTextNode (name));
    }
    attributeChangedCallback (name, old_value, new_value) {
	if (name === 'name') {
	    this.set_channel_name (new_value);
	}
    }
}

customElements.define ('slam-channel-amplifier', ChannelAmplifier);

// Local Variables:
// mode: js
// End:
