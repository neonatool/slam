export default class FilterDemo extends HTMLElement {
    constructor() {
	super ();
	const shadow = this.attachShadow ({ mode: 'open'});
	const link = document.createElement('a');
	shadow.appendChild (link);
	link.appendChild (document.createTextNode ('Download the CSV data!'));
	link.setAttribute ('download', 'filtered-data-demo.csv');
	this.handler = (async (event) => {
	    const model = event.model;
	    const channels = await model.channels ();
	    const start_dates = await model.find_object_dates ('<>', 'https://neonatool.github.io/slam/ontology/lytonepal.en.html#start-date');
	    const start_date = start_dates[0];
	    const stop_date = new Date ((start_date - 0) + 20 * 1000);
	    const low = 0.3;
	    const high = 30;
	    const columns = await Promise.all (channels.map (async (ch) => {
		const header = ch.type;
		const values = await ch.filter (low, high, start_date, stop_date);
		return [ header, ...Array.from (values).map (x => x.toString ()) ];
	    }));
	    const rows = [];
	    if (columns.length != 0) {
		for (let i = 0; i < columns[0].length; i++) {
		    rows.push (columns.map ((c) => {
			return c[i];
		    }).join (';'));
		}
	    }
	    const fileData = rows.join ('\n');
	    const bytes = new TextEncoder ().encode (fileData);
	    const blob = new Blob ([bytes], { type: 'text/csv' });
	    const url = URL.createObjectURL (blob);
	    link.setAttribute ('href', url);
	});
    }

    connectedCallback () {
	const file_picker_id = this.getAttribute ('source');
	if (!file_picker_id) {
	    throw new Error('The filter demo is not connected to a file picker.');
	}
	const new_file_picker = document.getElementById (file_picker_id);
	if (!new_file_picker) {
	    throw new Error(`Cannot find the file picker ${file_picker_id}.`);
	}
	if (this.file_picker) {
	    this.file_picker.removeEventListener('adf-file-picked', this.handler);
	}
	this.file_picker = new_file_picker;
	this.file_picker.addEventListener ('adf-file-picked', this.handler);
    }
}

customElements.define('adf-filter-demo', FilterDemo);

// Local Variables:
// mode: js
// End:
