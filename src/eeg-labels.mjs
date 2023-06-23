import AnnotationClassSelector from './eeg-labels/annotation_class_selector.mjs';
import ChannelTypeSelector from './eeg-labels/channel_type_selector.mjs';
import IntervalEntry from './eeg-labels/interval_entry.mjs';
import ControlButtons from './eeg-labels/control_buttons.mjs';

export default class AnnotationForm extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	this._interval = document.createElement('slam-interval-entry');
	this._annotation_class = document.createElement('slam-annotation-class-selector');
	this._channel_type = document.createElement('slam-channel-type-selector');
	this._buttons = document.createElement('slam-control-buttons');
	this._buttons.style = 'width:100%';
	const container = document.createElement('div');
	container.style = 'display:table';
	const middle = document.createElement('div');
	middle.style = 'display:table;width:100%';
	const middle_row = document.createElement ('div');
	middle_row.style = 'display:table-row';
	for (const field of [this._annotation_class, this._channel_type]) {
	    const cell = document.createElement('div');
	    cell.style = 'display:table-cell';
	    cell.appendChild (field);
	    middle_row.appendChild (cell);
	}
	middle.appendChild (middle_row);
	for (const field of [this._interval, middle, this._buttons]) {
	    const row = document.createElement('div');
	    row.style = 'display:table-row';
	    const cell = document.createElement('div');
	    cell.style = 'display:table-cell';
	    row.appendChild (cell);
	    cell.appendChild (field);
	    container.appendChild (row);
	}
	shadow.appendChild(container);
	this._interval.addEventListener('change', (ev) => {
	    const change = new Event('change');
	    this.dispatchEvent(change);
	});
	this._annotation_class.addEventListener('change', (ev) => {
	    const change = new Event('change');
	    this.dispatchEvent(change);
	});
	this._channel_type.addEventListener('change', (ev) => {
	    const change = new Event('change');
	    this.dispatchEvent(change);
	});
	this._buttons.addEventListener('slam-save', (ev) => {
	    const event = new CustomEvent('slam-save');
	    this.dispatchEvent(event);
	});
	this._buttons.addEventListener('slam-delete', (ev) => {
	    const event = new CustomEvent('slam-delete');
	    this.dispatchEvent(event);
	});
    }
    get value () {
	const { from, to } = this._interval.value;
	let start_date = from;
	let duration = null;
	if (from && to) {
	    duration = (to - from) / 1000;
	}
	console.assert (start_date === null || start_date instanceof Date);
	console.assert (duration === null || typeof duration === 'number');
	console.assert (duration === null || duration >= 0);
	const ac = this._annotation_class.value;
	const loc = this._channel_type.value;
	console.assert (loc instanceof Array);
	return {
	    start: start_date,
	    duration: duration,
	    type: ac,
	    location: loc
	};
    }
    set value (v) {
	console.assert(v);
	const start_date = v.start;
	console.assert (start_date === null || start_date instanceof Date, start_date);
	const duration = v.duration;
	console.assert (duration === null || typeof duration === 'number');
	console.assert (duration === null || duration >= 0);
	let from = start_date;
	let to = null;
	if (start_date && (duration || duration === 0)) {
	    to = new Date ((start_date - 0) + duration * 1000);
	}
	this._interval.from = from;
	this._interval.to = to;
	this._annotation_class.value = v.type;
	console.assert (v.location instanceof Array);
	this._channel_type.value = v.location;
    }
    set canDelete (cd) {
	this._buttons.canDelete = cd;
    }
    set canSave (cs) {
	this._buttons.canSave = cs;
    }
    setDate (date) {
	const newValue = this.value;
	if (newValue.start == null) {
	    newValue.start = date;
	    this.value = newValue;
	} else if (newValue.duration == null) {
	    const duration = (date - newValue.start) / 1000;
	    if (duration < 0) {
		newValue.duration = -duration;
		newValue.start = date;
	    } else {
		newValue.duration = duration;
	    }
	    this.value = newValue;
	}
    }
    get expectDate () {
	const value = this.value;
	return (value.start == null || value.duration == null);
    }
    add_annotation_class (id, name) {
	this._annotation_class.add_annotation_class (id, name);
    }
    add_channel_type (id, name) {
	this._channel_type.add_channel_type (id, name);
    }
}

customElements.define('slam-annotation-form', AnnotationForm);

// Local Variables:
// mode: js
// End:
