import TextField from './text_field.mjs';

export default class PatternField extends HTMLElement {
    constructor(fields) {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	this.container = document.createElement ('div');
	shadow.appendChild (this.container);
	this.value = {};
    }

    connectedCallback () {
	const editObject = (this.getAttribute ('with-object') === 'yes');
	const fields = [['Subject:', 'subject'], ['Predicate:', 'predicate']];
	if (editObject) {
	    fields.push (['Object:', 'object']);
	}
	for (const [label, id] of fields) {
	    this.value[id] = '';
	    const f = document.createElement ('adf-text-field');
	    f.setAttribute ('name', id);
	    f.setAttribute ('label', label);
	    f.addEventListener ('change', ((event) => {
		this.value[id] = event.value;
		const ev = new CustomEvent ('change');
		ev.value = this.value;
		this.dispatchEvent (ev);
	    }));
	    this.container.appendChild (f);
	}
    }
}

customElements.define('adf-pattern-field', PatternField);

// Local Variables:
// mode: js
// End:
