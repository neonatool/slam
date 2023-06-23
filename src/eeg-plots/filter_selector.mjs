import _ from '../gettext.mjs';

export default class FilterSelector extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const highpass_selector = document.createElement('select');
	highpass_selector.style.display = 'inline-block';
	highpass_selector.value = '0.53';
	shadow.appendChild (highpass_selector);
	const lowpass_selector = document.createElement('select');
	lowpass_selector.style.display = 'inline-block';
	lowpass_selector.value = '35';
	shadow.appendChild (lowpass_selector);
	for (const highpass_allowed of [{ 'fc': '0.53', 'τ': '0.3' },
					{ 'fc': '1.59', 'τ': '0.1' }]) {
	    const fc = highpass_allowed['fc'];
	    const tau = highpass_allowed['τ'];
	    const opt = document.createElement('option');
	    opt.setAttribute('value', fc);
	    opt.appendChild (document.createTextNode(`> ${fc} Hz (τ = ${tau} s)`));
	    highpass_selector.appendChild (opt);
	}
	for (const lowpass_allowed of ['35', '70']) {
	    const opt = document.createElement('option');
	    opt.setAttribute('value', lowpass_allowed);
	    opt.appendChild (document.createTextNode(`< ${lowpass_allowed} Hz`));
	    lowpass_selector.appendChild (opt);
	}
	const on_manual_change = () => {
	    const select = new CustomEvent('slam-select-filter');
	    const { literal_lowpass, literal_highpass, lowpass, highpass } = this.value;
	    select.literal_lowpass = literal_lowpass;
	    select.literal_highpass = literal_highpass;
	    if (lowpass && highpass) {
		select.lowpass = lowpass;
		select.highpass = highpass;
		select.low = highpass;
		select.high = lowpass;
	    }
	    select.manual = true;
	    this.dispatchEvent (select);
	};
	highpass_selector.addEventListener('change', () => on_manual_change ());
	lowpass_selector.addEventListener('change', () => on_manual_change ());
	this._highpass_selector = highpass_selector;
	this._lowpass_selector = lowpass_selector;
    }
    get value () {
	const [ lowpass_str, highpass_str ] = [ this._lowpass_selector, this._highpass_selector ].map (selector => selector.value);
	const [ lowpass, highpass ] = [ lowpass_str, highpass_str ].map (str => parseFloat (str));
	return {
	    'literal_lowpass': lowpass_str,
	    'literal_highpass': highpass_str,
	    'highpass': highpass,
	    'lowpass': lowpass,
	    'low': highpass,
	    'high': lowpass
	};
    }
    set value (value) {
	const old_lowpass = this._lowpass_selector.value;
	const old_highpass = this._highpass_selector.value;
	this._lowpass_selector.value = value.literal_lowpass;
	this._highpass_selector.value = value.literal_highpass;
	if (this._lowpass_selector.value !== old_lowpass
	   || this._highpass_selector.value !== old_highpass) {
	    const select = new CustomEvent('slam-select-filter');
	    const { lowpass, highpass } = this.value;
	    select.literal_lowpass = this._lowpass_selector.value;
	    select.literal_highpass = this._highpass_selector.value;
	    select.highpass = highpass;
	    select.lowpass = lowpass;
	    select.low = highpass;
	    select.high = lowpass;
	    select.manual = false;
	    this.dispatchEvent (select);
	}
    }
}

customElements.define ('slam-filter-selector', FilterSelector);

// Local Variables:
// mode: js
// End:
