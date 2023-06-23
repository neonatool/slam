export default class TextField extends HTMLElement {
    constructor() {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	const container = document.createElement ('div');
	shadow.appendChild (container);
	this.label = document.createElement ('label');
	this.label.style['margin-right'] = '2em';
	container.appendChild (this.label);
	this.input = document.createElement ('input');
	container.appendChild (this.input);
	this.input.setAttribute ('type', 'text');
	this.input.addEventListener ('change', ((event) => {
	    this.value = this.input.value;
	    const ev = new CustomEvent ('change');
	    ev.value = this.value;
	    this.dispatchEvent (ev);
	}));
    }

    connectedCallback () {
	const id = this.getAttribute ('name');
	const label = this.getAttribute ('label');
	this.label.setAttribute ('for', id);
	this.label.appendChild (document.createTextNode (label));
	this.input.setAttribute ('id', id);
	this.input.setAttribute ('name', id);
    }
}

customElements.define('adf-text-field', TextField);

// Local Variables:
// mode: js
// End:
