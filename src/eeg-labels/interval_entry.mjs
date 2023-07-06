import DateEntry from './date_entry.mjs';

export default class IntervalEntry extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const from = document.createElement('slam-date-entry');
	const to = document.createElement('slam-date-entry');
	const reset = document.createElement('input');
	this._from = from;
	this._to = to;
	this._reset = reset;
	from.direction = 'from';
	to.direction = 'to';
	reset.type = 'button';
	reset.value = 'Reset';
	const container = document.createElement('div');
	container.style = 'display:table; width:100%';
	const row = document.createElement('div');
	row.style = 'display:table-row';
	const [cfrom, carrow, cto, creset] = [from, document.createTextNode('=>'), to, reset].map (element => {
	    const cell = document.createElement('div');
	    cell.style = 'display: table-cell';
	    cell.appendChild(element);
	    return cell;
	});
	cto.style += '; text-align: left';
	row.appendChild (cfrom);
	row.appendChild (carrow);
	row.appendChild (cto);
	row.appendChild (creset);
	container.appendChild(row);
	shadow.appendChild (container);
	from.addEventListener ('change', (ev) => {
	    const change = new Event('change');
	    return this.dispatchEvent (change);
	});
	to.addEventListener ('change', (ev) => {
	    const change = new Event('change');
	    return this.dispatchEvent (change);
	});
	reset.addEventListener('click', (ev) => {
	    from.value = null;
	    to.value = null;
	    const change = new Event('change');
	    return this.dispatchEvent (change);
	});
    }
    get value () {
	return {
	    from: this.from,
	    to: this.to
	};
    }
    set value (ft) {
	this.from = ft.from;
	this.to = ft.to;
    }
    get from () {
	return this._from.value;
    }
    set from (v) {
	this._from.value = v;
    }
    get to () {
	return this._to.value;
    }
    set to (v) {
	this._to.value = v;
    }
}

customElements.define('slam-interval-entry', IntervalEntry);

// Local Variables:
// mode: js
// End:
