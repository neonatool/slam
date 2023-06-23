export default class Download extends HTMLElement {
    constructor() {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	const link = document.createElement('a');
	shadow.appendChild (link);
	link.appendChild (document.createTextNode ('Download the modified file!'));
	link.setAttribute ('download', 'eeg.adf');
	this.handler = (async (event) => {
	    const model = event.model;
	    const bytes = await model.get_bytes ();
	    const blob = new Blob ([bytes]);
	    const url = URL.createObjectURL (blob);
	    link.setAttribute ('href', url);
	});
    }

    connectedCallback () {
	const file_picker_id = this.getAttribute ('source');
	if (!file_picker_id) {
	    throw new Error('The download link is not connected to a file picker.');
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
}

customElements.define('adf-download', Download);

// Local Variables:
// mode: js
// End:
