export default class ChannelGroupSelector extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const group = document.createElement ('div');
	const box = document.createElement ('input');
	this.box = box;
	box.type = 'checkbox';
	box.id = 'all';
	box.name = 'all';
	box.addEventListener ('change', e => {
	    box.indeterminate = false;
	    const group_change = new CustomEvent ('slam-channel-group-change');
	    group_change.checked = box.checked;
	    this.dispatchEvent (group_change);
	});
	const label = document.createElement ('label');
	this.label = label;
	label.setAttribute ('for', 'all');
	label.appendChild (document.createTextNode ('???'));
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
	    const group_change = new CustomEvent ('slam-channel-group-change');
	    group_change.checked = this.box.checked;
	    this.dispatchEvent (group_change);
	}
    }
    not_all () {
	if (this.box.checked) {
	    this.box.indeterminate = true;
	    this.box.checked = false;
	}
    }
    not_none () {
	if (!this.box.checked) {
	    this.box.indeterminate = true;
	    this.box.checked = false;
	}
    }
    none () {
	this.box.indeterminate = false;
	this.box.checked = false;
    }
    attributeChangedCallback (property, old_value, value) {
	if (property === 'name') {
	    this.box.setAttribute ('id', value);
	    this.box.setAttribute ('name', value);
	    this.label.setAttribute ('for', value);
	} else if (property === 'label') {
	    this.label.replaceChildren ([]);
	    this.label.appendChild (document.createTextNode (value));
	}
    }
}

customElements.define('slam-channel-group-selector', ChannelGroupSelector);

// Local Variables:
// mode: js
// End:
