import ArtifactRow from './eeg-reports/artifact_row.mjs';

export default class ArtifactTable extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const tb = document.createElement('table');
	shadow.appendChild(tb);
	const header = document.createElement('tr');
	tb.appendChild (header);
	for (const column of [
	    {
		key: 'start',
		header: 'Début'
	    },
	    {
		key: 'duration',
		header: 'Durée'
	    },
	    {
		key: 'score',
		header: 'Score'
	    },
	    {
		key: 'disagreement',
		header: 'Désaccord'
	    }
	]) {
	    const cell = document.createElement('th');
	    header.appendChild (cell);
	    cell.appendChild (document.createTextNode (column.header));
	    cell.addEventListener ('click', (ev) => {
		if (this.sortKey == column.key) {
		    this.sortDirection = - (this.sortDirection);
		} else {
		    this.sortKey = column.key;
		    this.sortDirection = +1;
		}
		tb.replaceChildren ([]);
		tb.appendChild (header);
		this.rows.sort (ArtifactRow.comparator (this.sortKey, this.sortDirection));
		for (const row of this.rows) {
		    tb.appendChild (row);
		}
	    });
	}
	this._header = header;
	this._table = tb;
	this.rows = [];
	this.sortKey = 'start';
	this.sortDirection = +1;
    }

    set data (d) {
	this.rows = d.map (data => {
	    const r = document.createElement ('slam-artifact-row');
	    r.style = 'display: table-row';
	    r.data = data;
	    r.addEventListener ('slam-move-window', (ev) => {
		const move = new CustomEvent('slam-move-window');
		move.start = ev.start;
		move.duration = ev.duration;
		this.dispatchEvent(move);
	    });
	    return r;
	});
	this.rows.sort (ArtifactRow.comparator (this.sortKey, this.sortDirection));
	this._table.replaceChildren ();
	this._table.appendChild(this._header);
	for (const row of this.rows) {
	    this._table.appendChild (row);
	}
    }
}

customElements.define('slam-artifact-table', ArtifactTable);

// Local Variables:
// mode: js
// End:
