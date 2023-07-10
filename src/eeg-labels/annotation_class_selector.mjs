export default class AnnotationClassSelector extends HTMLElement {
    constructor () {
	super ();
	this._setValue = [];
	const shadow = this.attachShadow ({ mode: 'open' });
	const options = document.createElement('fieldset');
	this._options = options;
	const legend = document.createElement('legend');
	legend.appendChild (document.createTextNode('Classe d’annotation :'));
	options.appendChild (legend);
	shadow.appendChild (options);
	this._value = 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#Annotation';
    }
    get value () {
	return this._value;
    }
    set value (selected) {
	this._setValue.forEach (setter => {
	    setter (selected);
	});
	this._value = selected;
    }
    add_annotation_class (id, name) {
	const options = this._options;
	const item = document.createElement ('div');
	const box = document.createElement('input');
	box.type = 'radio';
	box.id = id;
	box.name = 'annotation-class';
	box.addEventListener ('change', e => {
	    if (box.checked) {
		this._value = id;
		const change = new Event('change');
		this.dispatchEvent(change);
	    }
	});
	this._setValue.push ((selected) => {
	    if (selected.toString () == id.toString ()) {
		box.checked = true;
	    }
	});
	const label = document.createElement ('label');
	label.for = box.id;
	const link = document.createElement('a');
	label.appendChild (link);
	link.href = id;
	link.appendChild (document.createTextNode (name));
	item.appendChild (box);
	item.appendChild (label);
	options.appendChild (item);
    }
}

customElements.define('slam-annotation-class-selector', AnnotationClassSelector);

// Local Variables:
// mode: js
// End:
