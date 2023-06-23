import PatternField from './pattern_field.mjs';

export default class DeleteDemo extends HTMLElement {
    constructor() {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	const form = document.createElement('form');
	shadow.appendChild (form);
	const inputs = document.createElement('fieldset');
	form.appendChild (inputs);
	const inputsLegend = document.createElement('legend');
	inputs.appendChild (inputsLegend);
	inputsLegend.appendChild (document.createTextNode('Triple to delete (N3 syntax):'));
	const inputsFields = document.createElement ('adf-pattern-field');
	inputsFields.setAttribute ('with-object', 'yes');
	inputs.appendChild (inputsFields);
	const submit = document.createElement('input');
	inputs.appendChild (submit);
	submit.setAttribute ('type', 'button');
	submit.setAttribute ('value', 'Delete');
	submit.style.display = 'block';
	submit.style.width = '100%';
	submit.addEventListener ('click', (event) => {
	    this.update (inputsFields.value);
	});
	this.handler = (event) => {
	    this._model = event.model;
	};
    }

    connectedCallback () {
	const file_picker_id = this.getAttribute ('source');
	if (!file_picker_id) {
	    throw new Error('The delete demo is not connected to a file picker.');
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
	if (this._model) {
	    let { subject, predicate, object } = value;
	    let n_missing = 0;
	    if (subject === '') {
		subject = null;
		n_missing = n_missing + 1;
	    }
	    if (predicate === '') {
		predicate = null;
		n_missing = n_missing + 1;
	    }
	    if (object === '') {
		object = null;
		n_missing = n_missing + 1;
	    }
	    if (n_missing <= 1) {
		await this._model.delete_data (subject, predicate, object, new Date (Date.now ()));
	    }
	    const changed = new CustomEvent('adf-file-picked');
	    changed.model = this.file_picker.model;
	    this.file_picker.dispatchEvent (changed);
	}
    }
}

customElements.define('adf-delete-demo', DeleteDemo);

// Local Variables:
// mode: js
// End:
