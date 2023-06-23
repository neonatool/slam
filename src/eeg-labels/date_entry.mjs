class InvalidDateFormatError extends Error {
    constructor (textual, message) {
	super (message);
	this.name = 'InvalidDateFormatError';
	this.textual = textual;
    }
}

customElements.define('slam-date-error-message', class extends HTMLElement {
    constructor () {
	super ();
	this.attachShadow ({ mode: 'open' });
    }
    set message(msg) {
	const shadow = this.shadowRoot;
	shadow.replaceChildren([]);
	if (msg) {
	    shadow.appendChild(document.createTextNode(msg));
	    shadow.style = 'visibility:visible';
	} else {
	    shadow.style = 'visibility:hidden';
	}
    }
});

export default class DateEntry extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const label = document.createElement('label');
	const entry = document.createElement('input');
	const errorMessage = document.createElement('slam-date-error-message');
	this._label = label;
	this._errorMessage = errorMessage;
	this._entry = entry;
	const normal = document.createElement('div');
	normal.appendChild (label);
	normal.appendChild (entry);
	const abnormal = document.createElement('div');
	abnormal.appendChild (errorMessage);
	shadow.appendChild (normal);
	shadow.appendChild (abnormal);
	entry.addEventListener ('change', (ev) => {
	    const change = new Event('change');
	    change.value = this.value;
	    return this.dispatchEvent (change);
	});
    }
    set direction (dir) {
	if (dir == 'from') {
	    this._label.replaceChildren([]);
	    this._label.appendChild(document.createTextNode ('Depuis :'));
	} else if (dir == 'to') {
	    this._label.replaceChildren([]);
	    this._label.appendChild(document.createTextNode ('Jusqu’à :'));
	} else {
	    throw new Error('Only from and to directions are supported');
	}
	this._label.for = `new-annotation-${dir}`;
	this._entry.name = this._label.for;
    }
    set error_message (error) {
	this._errorMessage.message = error;
    }
    get value () {
	const raw = this._entry.value;
	if (raw == '') {
	    this.error_message = null;
	    return null;
	}
	const parsed = Date.parse(raw);
	if (isNaN (parsed)) {
	    this.error_message = `Le format de date est invalide`;
	    return null;
	} else {
	    this.error_message = null;
	    return new Date (parsed);
	}
    }
    set value (date) {
	if (date) {
	    this._entry.value = date.toISOString ();
	} else {
	    this._entry.value = '';
	}
    }
}

customElements.define('slam-date-entry', DateEntry);

// Local Variables:
// mode: js
// End:
