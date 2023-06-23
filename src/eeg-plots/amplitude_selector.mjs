export default class AmplitudeSelector extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const selector = document.createElement('select');
	selector.style.display = 'inline-block';
	shadow.appendChild (selector);
	const default_value = '110';
	for (const allowed of ['20', '50', '110', '200', '500']) {
	    const opt = document.createElement ('option');
	    opt.setAttribute ('value', allowed);
	    opt.appendChild (document.createTextNode(`± ${allowed} μV`));
	    selector.appendChild (opt);
	}
	selector.value = default_value;
	selector.addEventListener('change', (ev) => {
	    const select = new CustomEvent('slam-select-amplitude');
	    const { literal, low, high } = this.value;
	    select.literal = literal;
	    select.low = low;
	    select.high = high;
	    select.manual = true;
	    this.dispatchEvent (select);
	});
	this._selector = selector;
    }
    get value () {
	const str = this._selector.value;
	const parsed = parseFloat (str);
	const microvolt = 0.000001;
	return {
	    'literal': str,
	    'low': -parsed * microvolt,
	    'high': parsed * microvolt
	};
    }
    set value (value) {
	const old_value = this._selector.value;
	this._selector.value = value;
	if (this._selector.value !== old_value) {
	    const select = new CustomEvent('slam-select-amplitude');
	    const { literal, low, high } = this.value;
	    select.literal = literal;
	    select.low = low;
	    select.high = high;
	    select.manual = false;
	    this.dispatchEvent (select);
	}
    }
}

customElements.define ('slam-amplitude-selector', AmplitudeSelector);

// Local Variables:
// mode: js
// End:
