export default class ArtifactRow extends HTMLElement {
    constructor() {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	this.cellStart = document.createElement('td');
	this.cellDuration = document.createElement('td');
	this.cellScore = document.createElement('td');
	this.cellDisagreement = document.createElement('td');
	for (const cell of [ this.cellStart, this.cellDuration,
			     this.cellScore, this.cellDisagreement ]) {
	    shadow.appendChild (cell);
	    cell.appendChild (document.createTextNode('…'));
	}
	shadow.addEventListener('click', (ev) => {
	    if (this._data) {
		const set_view = new CustomEvent('slam-move-window');
		set_view.start = this._data.start;
		set_view.duration = this._data.duration;
		console.log('The cell wants to move to:', set_view);
		// Don’t set the duration, because it might not be the
		// good scale for viewing.
		this.dispatchEvent(set_view);
	    }
	});
    }
    set data (d) {
	this.cellStart.replaceChildren([]);
	this.cellStart.appendChild(document.createTextNode(d.start.toISOString ()));
	this.cellDuration.replaceChildren([]);
	this.cellDuration.appendChild(document.createTextNode(d.duration.toString ()));
	this.cellScore.replaceChildren([]);
	this.cellScore.appendChild(document.createTextNode(d.score.toString ()));
	this.cellDisagreement.replaceChildren([]);
	this.cellDisagreement.appendChild(document.createTextNode(d.disagreement.toString ()));
	this._data = d;
    }
    compareTo (otherRow, key, direction) {
	if (key == 'start') {
	    return (direction * (this._data.start - otherRow._data.start));
	} else if (key == 'duration') {
	    return (direction * (this._data.duration - otherRow._data.duration));
	} else if (key == 'score') {
	    return (direction * (this._data.score - otherRow._data.score));
	} else if (key == 'disagreement') {
	    return (direction * (this._data.disagreement - otherRow._data.disagreement));
	} else {
	    throw new Error('Unknown sort key ' + key.toString ());
	}
    }
    static comparator (key, direction) {
	return (a, b) => {
	    return a.compareTo (b, key, direction);
	};
    }
}

customElements.define('slam-artifact-row', ArtifactRow);

// Local Variables:
// mode: js
// End:
