export default class ControlButtons extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	this._deleteButton = document.createElement ('input');
	this._deleteButton.type = 'button';
	this._deleteButton.value = 'Supprimer';
	this._deleteButton.style = 'float:left';
	this._saveButton = document.createElement('input');
	this._saveButton.type = 'button';
	this._saveButton.value = 'sauvegarder';
	this._saveButton.style = 'float:right';
	shadow.appendChild (this._saveButton);
	shadow.appendChild (this._deleteButton);
	this._saveButton.addEventListener ('click', (ev) => {
	    const saved = new CustomEvent('slam-save');
	    this.dispatchEvent (saved);
	});
	this._deleteButton.addEventListener ('click', (ev) => {
	    const saved = new CustomEvent('slam-delete');
	    this.dispatchEvent (saved);
	});
    }
    set canDelete (cd) {
	this._deleteButton.disabled = ! cd;
    }
    set canSave (cs) {
	this._saveButton.disabled = ! cs;
    }
}

customElements.define('slam-control-buttons', ControlButtons);

// Local Variables:
// mode: js
// End:
