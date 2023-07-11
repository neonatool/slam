import * as $rdf from 'rdflib';
import _ from '../gettext.mjs';

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
	const ls = localStorage;
	if (!ls) {
	    throw new Error(_ ('Local storage is not available'));
	}
        const existing = localStorage.getItem ('extra-profile-data');
	entry.replaceChildren([]);
	if (existing) {
	    entry.appendChild (document.createTextNode (existing));
	}
	container.appendChild (entry);
	shadow.appendChild (container);
	this.dispatch = () => {
	    localStorage.setItem ('extra-profile-data', entry.value);
	    const reloadEvent = new CustomEvent ('slam-extra-profile-data');
	    reloadEvent.data = entry.value;
	    this.dispatchEvent (reloadEvent);
	};
	entry.addEventListener ('input', () => this.dispatch ());
	this.mark_valid ();
	this.dispatch ();
    }
    warn_invalid () {
        this._label.replaceChildren([]);
	this._label.appendChild (document.createTextNode(_ ('Extra profile data in the Turtle format (INVALID yet):')));
    }
    mark_valid () {
        this._label.replaceChildren([]);
	this._label.appendChild (document.createTextNode(_ ('Extra profile data in the Turtle format:')));
    }
}

customElements.define('slam-extra-profile-data-editor', ExtraProfileData);