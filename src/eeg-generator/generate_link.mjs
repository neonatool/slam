import EEG from './eeg.mjs';

export default class Generate extends HTMLElement {
    constructor() {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	const link = document.createElement('a');
	shadow.appendChild (link);
	link.appendChild (document.createTextNode ('Please wait while the EEG is being generated…'));
	link.setAttribute ('download', 'generated.adf');
        const eeg = new EEG ();
        eeg.blob.then ((blob) => {
            link.replaceChildren ([]);
	link.appendChild (document.createTextNode ('Download the generated EEG.'));
	    const url = URL.createObjectURL (blob);
	    link.setAttribute ('href', url);
        });
    }
}

customElements.define('adf-generate', Generate);

// Local Variables:
// mode: js
// End:
