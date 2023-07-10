import FilePicker from './file_picker.mjs';
import _ from '../gettext.mjs';

import { Plot, ChannelType as PlotChannelType } from '../eeg-plots.mjs';
import ArtifactTable from '../eeg-reports.mjs';
import AnnotationForm from '../eeg-labels.mjs';

export default class Slam extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const container = document.createElement('div');
	shadow.appendChild (container);
	this._file_picker = document.createElement ('slam-file-picker');
	this._file_picker.style.display = 'block';
	container.appendChild (this._file_picker);
	this._wait = document.createElement ('p');
	this._wait.appendChild (document.createTextNode (_ ('Please wait while the EEG is being loaded…')));
	this._wait.style.display = 'none';
	container.appendChild (this._wait);
	this._plot = document.createElement('adf-plot');
	this._plot.style.display = 'none';
	container.appendChild (this._plot);
	this._form = document.createElement('slam-annotation-form');
	this._form.style.display = 'none';
	container.appendChild (this._form);
	this._table = document.createElement('slam-artifact-table');
	this._table.style.display = 'none';
	container.appendChild (this._table);
	const download_button = document.createElement('a');
	download_button.appendChild (document.createTextNode (_ ('Download the modified file')));
	download_button.setAttribute ('download', 'eeg.adf');
	download_button.style.display = 'none';
	container.appendChild (download_button);
	let refresh_link = () => {};
	this._file_picker.addEventListener ('slam-file-picked', (async (ev) => {
	    const { model, profile } = ev;
	    this._file_picker.style.display = 'none';
	    this._wait.style.display = 'block';
	    const displayed_channels = profile.channels ();
	    const sampling_frequencies = await model.find_object_numbers ('<>', 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#sampling-frequency');
	    console.assert (sampling_frequencies.length > 0, _ ('the EEG does not have a sampling frequency'), sampling_frequencies);
	    const sampling_frequency = sampling_frequencies[0];
	    this._plot.prepare (sampling_frequency, displayed_channels);
	    const start_dates = await model.find_object_dates ('<>', 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#start-date');
	    console.assert (start_dates.length > 0, _ ('the EEG does not have a start date'), start_dates);
	    const start_date = start_dates[0];
	    const existing_channels = await model.channels ();
	    const fetchData = async (displayed_channel, start_index, length, line_id = null) => {
		if (!line_id) {
		    line_id = displayed_channel.id.toString ();
		}
		const start = new Date ((start_date - 0) + (start_index / sampling_frequency) * 1000);
		const stop = new Date ((start - 0) + (length / sampling_frequency) * 1000);
		const { anode, cathode } = displayed_channel;
		if (anode || cathode) {
		    console.assert (anode && cathode, _ ('the channel has only 1 anode or cathode'), displayed_channel);
		    const [anode_data, cathode_data] = await Promise.all ([anode, cathode].map ((electrode) => {
			return fetchData (electrode, start_index, length, line_id);
		    }));
		    const diff = [];
		    console.assert (anode_data.length === cathode_data.length, _ ('the anode and cathode do not have the same data length'), anode_data.length, cathode_data.length);
		    for (let i = 0; i < anode_data.length && i < cathode_data.length; i++) {
			diff.push (anode_data[i] - cathode_data[i]);
		    }
		    return Float64Array.from (diff);
		} else {
		    for (const existing of existing_channels) {
			if (existing.type === `<${displayed_channel.id.value}>`) {
			    console.log(_ ('I have found the channel to display:'), line_id);
			    console.log(_ ('Currently, the filter parameters are:'), this._plot.filter);
			    return existing.filter (this._plot.filter[line_id].low, this._plot.filter[line_id].high, start, stop);
			}
		    }
		    return Float64Array.from ([]);
		}
	    };
	    const updateWindow = async (start_index, length) => {
		const all_set = await Promise.all (displayed_channels.map (async ch => {
		    const data = await fetchData (ch, start_index, length);
		    this._plot.set_series_data (ch, start_index, data);
		}));
		this._plot.replot ();
	    }
	    await updateWindow (0, 20 * sampling_frequency);
	    this._plot.move_to (0);
	    const annotation_ids = await model.find_objects ('<>', 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#has-annotation');
	    for (const annotation_id of annotation_ids) {
		const types = await model.find_objects (annotation_id, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
		let label = null;
		for (const t of types) {
		    const new_label = profile.label_for_annotation_class ($rdf.fromNT (t));
		    if (new_label) {
			label = new_label;
		    }
		}
		if (label) {
		    const ann_start = (await model.find_object_dates (annotation_id, 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#start-date'))[0];
		    const ann_duration = (await model.find_object_numbers (annotation_id, 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#duration'))[0];
		    const ann_location = await model.find_objects (annotation_id, 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#location');
		    this._plot.add_annotation (annotation_id);
		    this._plot.change_annotation_label (annotation_id, label);
		    this._plot.change_annotation_start_index (annotation_id, ((ann_start - start_date) / 1000) * sampling_frequency);
		    this._plot.change_annotation_length (annotation_id, ann_duration * sampling_frequency);
		    for (const loc of ann_location) {
			// We only care about the id.
			this._plot.add_annotation_channel (annotation_id, new PlotChannelType (loc, '???', true));
		    }
		    this._plot.mark_annotation_saved (annotation_id);
		}
	    }
	    const authorized_annotation_classes = profile.authorized_annotation_classes ();
	    for (const ac of authorized_annotation_classes) {
		const label = profile.label_for_annotation_class (ac);
		console.assert (label !== null);
		this._form.add_annotation_class (ac.value, label);
	    }
	    for (const existing of existing_channels) {
		console.assert (existing.type.startsWith ('<'), _ ('the existing channel type is not a named node'), existing.type);
		console.assert (existing.type.endsWith ('>'), _ ('the existing channel type is not a named node'), existing.type);
		const type_id = $rdf.fromNT (existing.type);
		// Only allow annotations on channels that are actually displayed
		let used = false;
		for (const displayed of displayed_channels) {
		    console.assert (displayed.id instanceof $rdf.NamedNode, _ ('the displayed channel type is not a named node'), displayed.id);
		    const { anode, cathode } = displayed;
		    if (type_id.toString () == displayed.id.toString ()
		        || (anode && type_id.toString () == anode.id.toString ())
			|| (cathode && type_id.toString () == cathode.id.toString ())) {
		        used = true;
		    }
		}
		if (used) {
		    this._form.add_channel_type (type_id.value, profile.label_for_channel_type (type_id));
		} else {
		    console.warn (_ ('This existing channel is not displayed:'), type_id);
		}
	    }
	    refresh_link = async () => {
		const bytes = await model.get_bytes ();
		const blob = new Blob ([bytes]);
		const url = URL.createObjectURL (blob);
		download_button.setAttribute ('href', url);
	    }
	    this._form.addEventListener ('slam-save', (async () => {
		const { start, duration, type, location } = this._form.value;
		if (start instanceof Date && typeof duration === 'number' && duration > 0 && typeof type === 'string' && type.startsWith ('http') && Array.isArray (location) && location.length > 0) {
		    const id = `<#annotation-${start - 0}-${duration}>`; // FIXME: bof
		    await model.insert (id, '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>', `<${type}>`);
		    await model.insert (id, '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>', `<https://neonatool.github.io/slam/ontology/lytonepal.en.html#Epoch>`);
		    await model.insert (id, '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>', `<https://neonatool.github.io/slam/ontology/lytonepal.en.html#Annotation>`);
		    await model.insert (id, '<https://neonatool.github.io/slam/ontology/lytonepal.en.html#start-date>', `"${start.toISOString ()}"^^<http://www.w3.org/2001/XMLSchema#dateTime>`);
		    await model.insert (id, '<https://neonatool.github.io/slam/ontology/lytonepal.en.html#duration>', `"${duration}"^^<http://www.w3.org/2001/XMLSchema#double>`);
		    await model.insert (id, '<https://neonatool.github.io/slam/ontology/lytonepal.en.html#occurs-in>', `<>`);
		    await model.insert ('<>', '<https://neonatool.github.io/slam/ontology/lytonepal.en.html#has-annotation>', id);
		    for (const loc of location) {
			await model.insert (id, '<https://neonatool.github.io/slam/ontology/lytonepal.en.html#location>', `<${loc}>`);
		    }
		    this._plot.add_annotation (id);
		    this._plot.change_annotation_label (id, profile.label_for_annotation_class (new $rdf.NamedNode (type)));
		    this._plot.change_annotation_start_index (id, ((start - start_date) / 1000) * sampling_frequency);
		    this._plot.change_annotation_length (id, duration * sampling_frequency);
		    for (const loc of location) {
			this._plot.add_annotation_channel (id, new PlotChannelType (new $rdf.NamedNode (loc), '???', true));
		    }
		    this._form.value = { start: null, duration: null, type: type, location: location };
		    const change = new Event('change');
		    this._form.dispatchEvent (change);
		    this._plot.replot ();
		    refresh_link ();
		}
	    }));
	    this._form.canDelete = false;
	    this._form.canSave = false;
	    this._form.addEventListener ('change', ((e) => {
		const { start, duration, type, location } = this._form.value;
		this._form.canSave = (start instanceof Date && typeof duration === 'number' && duration > 0 && typeof type === 'string' && type.startsWith ('http') && Array.isArray (location) && location.length > 0);
	    }));
	    this._plot.replot ();
	    this._plot.addEventListener ('slam-move-window', ((ev) => {
		updateWindow (ev.start_index, ev.window_length);
	    }));
	    this._plot.addEventListener ('slam-click', ((ev) => {
		const time = new Date ((start_date - 0) + (ev.time / sampling_frequency) * 1000);
		if (this._form.expectDate) {
		    this._form.setDate (time);
		    const change = new Event('change');
		    this._form.dispatchEvent (change);
		}
	    }));
	    this._plot.addEventListener ('slam-select-filter', ev => {
		updateWindow (ev.start_index, ev.window_length);
	    });
	    this._wait.style.display = 'none';
	    this._plot.style.display = 'block';
	    this._form.style.display = 'block';
	    this._table.style.display = 'block';
	    download_button.style.display = 'block';
	    refresh_link ();
	    console.log (_ ('Getting the report IDs…'));
	    const report_ids = await model.find_objects ('<>', 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#has-report');
	    console.log ('Report IDs:', report_ids);
	    const reports = await Promise.all (report_ids.map (async id => {
		const [start] = await model.find_object_dates (id, 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#start-date');
		const [duration] = await model.find_object_numbers (id, 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#duration');
		const [score] = await model.find_object_numbers (id, 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#has-artifact-score');
		const [disagreement] = await model.find_object_numbers (id, 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#has-ensemble-disagreement');
		return {
		    'start': start,
		    'duration': duration,
		    'score': score,
		    'disagreement': disagreement
		};
	    }));
	    console.log (_ ('Reports:'), reports);
	    this._table.data = reports;
	    this._table.addEventListener ('slam-move-window', async (ev) => {
		const start_second = (ev.start - start_date) / 1000;
		const start_index = start_second * sampling_frequency;
		this._plot.move_to (start_index);
		await updateWindow (start_index, this._plot.interval.window_length);
	    });
	}));
    }
}

customElements.define('slam-window', Slam);

// Local Variables:
// mode: js
// End:
