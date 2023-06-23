export default class MetadataSummary extends HTMLElement {
    constructor() {
	super ();
	console.log('Constructing the metadata summary…');
	const shadow = this.attachShadow ({ mode: 'open'});
	// There are 3 states:
	// 1. Ask the user to choose a file;
	// 2. Load the file;
	// 3. Display the metadata.
	this.initialPage = document.createElement ('p');
	const initialMessage = document.createTextNode ('No file has been selected yet.');
	this.initialPage.appendChild (initialMessage);
	this.loadingPage = document.createElement ('p');
	const loadingMessage = document.createTextNode('Please wait…');
	this.loadingPage.appendChild (loadingMessage);
	this.loadingPage.style.display = "none";
	this.displayPage = document.createElement ('p');
	this.displayPage.style.display = "none";
	shadow.appendChild (this.initialPage);
	shadow.appendChild (this.loadingPage);
	shadow.appendChild (this.displayPage);
	this.handler = ((event) => {
	    this.changeFile (event);
	});
	console.log('Constructing the metadata summary: done.');
    }

    connectedCallback () {
	console.log('The metadata summary is connected: change our file picker.');
	const file_picker_id = this.getAttribute ('source');
	if (!file_picker_id) {
	    throw new Error('The metadata summary is not connected to a file picker.');
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
	console.log('The metadata summary is connected: done.');
    }

    async changeFile (event) {
	this.initialPage.style.display = "none";
	this.displayPage.style.display = "none";
	this.loadingPage.style.display = "block";
	const model = event.model;
	const [start_dates, sampling_frequencies] = await Promise.all ([
	    model.find_object_dates ('<>', 'https://localhost/lytonepal#start-date'),
	    model.find_object_numbers ('<>', 'https://localhost/lytonepal#sampling-frequency')
	]);
	let message = `This EEG started ${start_dates[0]} and is sampled at ${sampling_frequencies[0]} Hz.`;
	this.displayPage.replaceChildren ([]);
	this.displayPage.appendChild (document.createTextNode (message));
	this.loadingPage.style.display = "none";
	this.displayPage.style.display = "block";
    }
}

customElements.define('adf-metadata-summary', MetadataSummary);

// Local Variables:
// mode: js
// End:
