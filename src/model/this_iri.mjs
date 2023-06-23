export default class ThisIri extends HTMLElement {
    constructor() {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	const link = document.createElement('a');
	shadow.appendChild (link);
	link.setAttribute ('href', location.href);
	link.appendChild(document.createTextNode (location.href));
    }
}

customElements.define('adf-demo-this-iri', ThisIri);

// Local Variables:
// mode: js
// End:
