import PatternField from './pattern_field.mjs';

export default class Explorer extends HTMLElement {
    constructor() {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	const form = document.createElement('form');
	shadow.appendChild (form);
	const inputs = document.createElement('fieldset');
	form.appendChild (inputs);
	const inputsLegend = document.createElement('legend');
	inputs.appendChild (inputsLegend);
	inputsLegend.appendChild (document.createTextNode('Simple pattern to search:'));
	const pattern = document.createElement('adf-pattern-field');
	pattern.addEventListener ('change', ((event) => {
	    this.update (pattern.value);
	}));
	pattern.setAttribute ('with-object', 'no');
	inputs.appendChild (pattern);
	// Now, the outputs:
	const outputs = document.createElement('fieldset');
	form.appendChild (outputs);
	const outputsLegend = document.createElement ('legend');
	outputs.appendChild (outputsLegend);
	outputsLegend.appendChild (document.createTextNode ('Objects:'));
	const resultsList = document.createElement ('ul');
	this._resultsList = resultsList;
	outputs.appendChild (resultsList);
	this.handler = ((event) => {
	    this._model = event.model;
	    this.update (pattern.value);
	});
    }

    connectedCallback () {
	const file_picker_id = this.getAttribute ('source');
	if (!file_picker_id) {
	    throw new Error('The explorer is not connected to a file picker.');
	}
	const new_file_picker = document.getElementById (file_picker_id);
	if (!new_file_picker) {
	    throw new Error(`Cannot find the file picker ${file_picker_id}.`);
	}
	if (this.file_picker) {
	    this.file_picker.removeEventListener('adf-file-picked', this.handler);
	}
	this.file_picker = new_file_picker;
	this.file_picker.addEventListener ('adf-file-picked', this.handler);
    }

    async update (value) {
	this._resultsList.replaceChildren ([]);
	if (this._model) {
	    const { subject, predicate } = value;
	    const objects = await this._model.find_objects (subject, predicate);
	    for (const o of objects) {
		const text = document.createTextNode (o);
		const li = document.createElement('li');
		li.appendChild (text);
		this._resultsList.appendChild (li);
	    }
	}
    }
}

customElements.define('adf-explorer', Explorer);

// Local Variables:
// mode: js
// End:
