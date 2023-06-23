import Model from './model.mjs';

export default class FilePicker extends HTMLElement {
    constructor() {
	super ();
	console.log('Constructing the file picker…');
	const shadow = this.attachShadow ({ mode: 'open'});
	this.input = document.createElement('input');
	this.input.type = 'file';
	this.model = null;
	this.input.onchange = async (e) => {
	    console.log('File picker: new file data.');
	    const blob = e.target.files[0];
	    const array = await blob.arrayBuffer ();
	    const data = new Uint8Array (array);
	    console.log('File picker: creating the model…');
	    this.model = new Model (data);
	    console.log('File picker: model created.');
	    const changed = new CustomEvent('adf-file-picked');
	    changed.model = this.model;
	    this.dispatchEvent (changed);
	};
	shadow.appendChild (this.input);
	console.log('Constructing the file picker: done.');
    }
}

customElements.define('adf-file-picker', FilePicker);

// Local Variables:
// mode: js
// End:
