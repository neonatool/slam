import { Model } from '../model.mjs';
import ProfileChooser from './profile_chooser.mjs';
import _ from '../gettext.mjs';

export default class FilePicker extends HTMLElement {
    constructor() {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	const container = document.createElement ('div');
	this.input = document.createElement('input');
	this.input.type = 'file';
	this.model = null;
	this.file = null;
	this.input.onchange = async (e) => {
	    this.file = e.target.files[0];
	};
	container.appendChild (this.input);
	const profile_chooser = document.createElement ('slam-profile-chooser');
	container.appendChild (profile_chooser);
	const submit = document.createElement ('input');
	submit.setAttribute ('type', 'button');
	submit.setAttribute ('value', _ ('Open'));
	submit.addEventListener ('click', async () => {
	    const blob = this.file;
	    const profile = profile_chooser.value;
	    if (blob && profile) {
		const array = await blob.arrayBuffer ();
		const data = new Uint8Array (array);
		this.model = new Model (data);
		const changed = new CustomEvent('slam-file-picked');
		changed.model = this.model;
		changed.profile = profile;
		this.dispatchEvent (changed);
	    }
	});
	container.appendChild (submit);
	shadow.appendChild (container);
    }
}

customElements.define('slam-file-picker', FilePicker);

// Local Variables:
// mode: js
// End:
