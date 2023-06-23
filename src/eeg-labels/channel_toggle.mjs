export default class ChannelToggle extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const group = document.createElement ('div');
	const box = document.createElement ('input');
	this.box = box;
	box.type = 'checkbox';
	box.id = '???';
	box.name = '???';
	box.addEventListener ('change', e => {
	    const change = new CustomEvent ('slam-channel-toggled');
	    change.checked = box.checked;
	    this.dispatchEvent (change);
	});
	const label = document.createElement ('label');
	this.label = label;
	label.setAttribute ('for', '???');
	const link = document.createElement ('a');
	this.link = link;
	this.label.appendChild (link);
	link.appendChild (document.createTextNode ('???'));
	group.appendChild (box);
	group.appendChild (label);
	shadow.appendChild (group);
    }
    get value () {
	return this.box.checked;
    }
    set value (selected) {
	if (this.box.checked !== selected) {
	    this.box.checked = !!selected;
	    this.box.indeterminate = false;
	    const change = new CustomEvent ('slam-channel-toggled');
	    change.checked = this.box.checked;
	    this.dispatchEvent (change);
	}
    }
    attributeChangedCallback (property, old_value, value) {
	if (property === 'id') {
	    this.box.setAttribute ('id', value);
	    this.box.setAttribute ('name', value);
	    this.label.setAttribute ('for', value);
	    this.link.setAttribute ('href', value);
	} else if (property === 'name') {
	    this.link.replaceChildren ([]);
	    this.link.appendChild (document.createTextNode (value));
	}
    }
}

customElements.define('slam-channel-toggle', ChannelToggle);

// Local Variables:
// mode: js
// End:
