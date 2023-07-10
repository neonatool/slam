import * as $rdf from 'rdflib';

export default class ExtraProfileData extends HTMLElement {
    // This is a widget bound to local storage, that will let the user
    // extend the ontology.
    constructor () {
        super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const container = document.createElement('div');
	container.style = 'display: flex; flex-direction: column; margin-top: 2ex;';
	const label = document.createElement ('label');
	label.setAttribute('for', 'extra-profile-data-editor');
	this._label = label;
	container.appendChild (label);
	const entry = document.createElement ('textarea');
	entry.setAttribute ('id', 'extra-profile-data-editor');
	entry.setAttribute ('name', 'extra-profile-data-editor');
	entry.setAttribute ('rows', '20');
	entry.setAttribute ('cols', '80');
	this._entry = entry;
	this.reload ();
	container.appendChild (entry);
	shadow.appendChild (container);
	entry.addEventListener ('input', () => {
	    if (localStorage) {
	        localStorage.setItem ('extra-profile-data', entry.value);
	    }
	    const reloadEvent = new CustomEvent ('slam-extra-profile-data');
	    this.dispatchEvent (reloadEvent);
	});
    }
    reload () {
        const existing = localStorage && localStorage.getItem ('extra-profile-data');
	this._label.replaceChildren ([]);
	this._entry.replaceChildren([]);
	if (existing) {
	    this._entry.appendChild (document.createTextNode (existing));
	}
	try {
            const parsed = new $rdf.Store ();
	    $rdf.parse (existing, parsed, 'https://neonatool.github.io/slam/ontology/lytonepal.en.html', 'text/turtle');
	    this._label.appendChild (document.createTextNode ('Extra profile data (Turtle):'));
	} catch (err) {
	    this._label.appendChild (document.createTextNode ('This is not valid Turtle for extra profile data:'));
	}
    }
}

customElements.define('slam-extra-profile-data-editor', ExtraProfileData);