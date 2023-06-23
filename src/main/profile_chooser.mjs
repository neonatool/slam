import Profile from './profile.mjs';

export default class ProfileChooser extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const container = document.createElement('div');
	const label = document.createElement ('label');
	label.setAttribute ('for', 'profile-chooser');
	container.appendChild (label);
	const selector = document.createElement ('select');
	selector.setAttribute ('id', 'profile-chooser');
	container.appendChild (selector);
	shadow.appendChild (container);
	this.value = null;
	for (const p of Profile.list ()) {
	    const option = document.createElement ('option');
	    const text = document.createTextNode (p.label ());
	    option.appendChild (text);
	    if (p.is_default ()) {
	        option.selected = true;
		this.value = p;
	    }
	    selector.addEventListener ('change', () => {
                if (option.selected) {
		    this.value = p;
		}
	    });
	    selector.appendChild (option);
	}
    }
}

customElements.define ('slam-profile-chooser', ProfileChooser);

// Local Variables:
// mode: js
// End:
