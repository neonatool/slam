import ChannelGroupSelector from './channel_group_selector.mjs';
import ChannelToggle from './channel_toggle.mjs';

export default class ChannelTypeSelector extends HTMLElement {
    constructor () {
	super ();
	this._value = {};
	this._setValue = {};
	const shadow = this.attachShadow ({ mode: 'open' });
	const options = document.createElement('fieldset');
	this._options = options;
	const legend = document.createElement('legend');
	legend.appendChild (document.createTextNode('Canaux :'));
	options.appendChild (legend);
	this._all = document.createElement ('slam-channel-group-selector');
	options.appendChild (this._all);
	this._all.setAttribute ('name', 'all');
	this._all.setAttribute ('label', 'Tout canal');
	this._all.attributeChangedCallback ('name', null, 'all');
	this._all.attributeChangedCallback ('label', null, 'Tout canal');
	const [odd, even] = [['odd', 'Gauche'], ['even', 'Droite']].map (attr => {
	    const [name, label] = attr;
	    const g = document.createElement ('slam-channel-group-selector');
	    g.setAttribute ('name', name);
	    g.setAttribute ('label', label);
	    g.attributeChangedCallback ('name', null, name);
	    g.attributeChangedCallback ('label', null, label);
	    this._all.addEventListener ('slam-channel-group-change', (ev) => {
		g.value = ev.checked;
	    });
	    g.addEventListener ('slam-channel-group-change', (ev) => {
		if (ev.checked) {
		    this._all.not_none ();
		} else {
		    this._all.not_all ();
		    this.try_uncheck ();
		}
	    });
	    return g;
	});
	this._odd = odd;
	this._even = even;
	this._all.addEventListener ('slam-channel-group-change', (ev) => {
	    odd.value = ev.checked;
	    even.value = ev.checked;
	});
	for (const group of [this._all, this._odd, this._even]) {
	    group.addEventListener ('slam-channel-group-change', (ev) => {
	        const event = new Event('change');
		this.dispatchEvent (event);
	    });
	}
	options.appendChild (odd);
	options.appendChild (even);
	shadow.appendChild (options);
    }
    get value () {
	const selected = [];
	for (const [ id, checked ] of Object.entries (this._value)) {
	    if (checked) {
		selected.push (id);
	    }
	}
	return selected;
    }
    set value (selected) {
	// Unset everything
	this._all.value = false;
	console.assert (selected instanceof Array);
	for (let cht of selected) {
	    this._setValue[cht] (true);
	}
    }
    try_uncheck () {
	let any = false;
	let any_left = false;
	let any_right = false;
	for (const [ id, checked ] of Object.entries (this._value)) {
	    if (checked) {
		any = true;
		for (const odd of [ 1, 3, 5, 7, 9 ]) {
		    if (id.endsWith ('' + odd)) {
			any_left = true;
		    }
		}
		for (const even of [ 2, 4, 6, 8, 0 ]) {
		    if (id.endsWith ('' + even)) {
			any_right = true;
		    }
		}
	    }
	}
	if (!any) {
	    this._all.none ();
	}
	if (!any_left) {
	    this._odd.none ();
	}
	if (!any_right) {
	    this._even.none ();
	}
    }
    add_channel_type (id, name) {
	const options = this._options;
	const item = document.createElement ('slam-channel-toggle');
	item.setAttribute ('id', id);
	item.setAttribute ('name', name);
	item.attributeChangedCallback ('id', null, id);
	item.attributeChangedCallback ('name', null, name);
	const groups = [ this._all ];
	for (const odd of [ 1, 3, 5, 7, 9 ]) {
	    if (id.endsWith ('' + odd)) {
		groups.push (this._odd);
	    }
	}
	for (const even of [ 2, 4, 6, 8, 0 ]) {
	    if (id.endsWith ('' + even)) {
		groups.push (this._even);
	    }
	}
	for (const g of groups) {
	    g.addEventListener ('slam-channel-group-change', ev => {
		item.value = ev.checked;
	    });
	    item.addEventListener ('slam-channel-toggled', ev => {
		if (ev.checked) {
		    g.not_none ();
		} else {
		    g.not_all ();
		}
		this._value[id] = ev.checked;
	    });
	}
	item.addEventListener ('slam-channel-toggled', ev => {
	    if (!ev.checked) {
		this.try_uncheck ();
	    }
	    const event = new Event('change');
	    this.dispatchEvent (event);
	});
	this._setValue[id] = ((checked) => {
	    item.value = checked;
	});
	options.appendChild (item);
    }
}

customElements.define('slam-channel-type-selector', ChannelTypeSelector);

// Local Variables:
// mode: js
// End:
