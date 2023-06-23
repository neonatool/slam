export default class UsesIri extends HTMLElement {
    constructor() {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	const link = document.createElement('a');
	shadow.appendChild (link);
	const uses = new URL('#uses', location.href);
	link.setAttribute ('href', uses);
	link.appendChild(document.createTextNode (uses));
    }
}

customElements.define('adf-demo-uses-iri', UsesIri);

// Local Variables:
// mode: js
// End:
