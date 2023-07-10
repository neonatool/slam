import { ChannelType } from '../eeg-plots.mjs';

import C3_Fp1_data from './c3_fp1_data.mjs';
import O1_C3_data from './o1_c3_data.mjs';
import O1_T3_data from './o1_t3_data.mjs';
import T3_Fp1_data from './t3_fp1_data.mjs';
import Cz_Fz_data from './cz_fz_data.mjs';
import Pz_Cz_data from './pz_cz_data.mjs';
import C4_Fp2_data from './c4_fp2_data.mjs';
import O2_C4_data from './o2_c4_data.mjs';
import O2_T4_data from './o2_t4_data.mjs';
import T4_Fp2_data from './t4_fp2_data.mjs';

const [ Fp1, C3, O1, T3, Fz, Cz, Pz, Fp2, C4, O2, T4 ] = [
    'Fp1', 'C3', 'O1', 'T3', 'Fz', 'Cz', 'Pz', 'Fp2', 'C4', 'O2', 'T4'
].map ((name) => {
    const id = `https://neonatool.github.io/slam/ontology/lytonepal.en.html#${name}`;
    return new ChannelType (id, name, true);
});

const [ C3_Fp1, O1_C3, O1_T3, T3_Fp1, Cz_Fz, Pz_Cz, C4_Fp2, O2_C4, O2_T4, T4_Fp2 ] = [
    [ C3, Fp1 ], [ O1, C3 ], [ O1, T3 ], [ T3, Fp1 ],
    [ Cz, Fz ], [ Pz, Cz ],
    [ C4, Fp2 ], [ O2, C4 ], [ O2, T4 ], [ T4, Fp2 ]
].map ((components) => {
    const [ anode, cathode ] = components;
    const name = `${anode.name}-${cathode.name}`;
    const id = `https://neonatool.github.io/slam/ontology/lytonepal.en.html#${name}`;
    return new ChannelType (id, name, true, anode, cathode);
});

const sampling_frequency = 256;

class AnnotationDemo extends HTMLElement {
    constructor () {
	super ();
    }

    connectedCallback () {
	const id = this.getAttribute ("source");
	if (!id) {
	    throw new Error('source attribute required');
	}
	const plot = document.getElementById (id);
	if (!plot) {
	    throw new Error(`Could not find plot with id ${id}`);
	}
	plot.prepare (sampling_frequency, [
	    C3_Fp1, O1_C3, O1_T3, T3_Fp1,
	    Cz_Fz, Pz_Cz,
	    C4_Fp2, O2_C4, O2_T4, T4_Fp2
	]);
	new Promise ((accept) => {
	    const steps = [
		() => {
		    plot.prepare (sampling_frequency, [
			C3_Fp1, O1_C3, O1_T3, T3_Fp1,
			Cz_Fz, Pz_Cz,
			C4_Fp2, O2_C4, O2_T4, T4_Fp2
		    ]);
		},
		() => {
		    plot.set_series_data (C3_Fp1, 0, C3_Fp1_data);
		    plot.set_series_data (O1_C3, 0, O1_C3_data);
		    plot.set_series_data (O1_T3, 0, O1_T3_data);
		    plot.set_series_data (T3_Fp1, 0, T3_Fp1_data);
		    plot.set_series_data (Cz_Fz, 0, Cz_Fz_data);
		    plot.set_series_data (Pz_Cz, 0, Pz_Cz_data);
		    plot.set_series_data (C4_Fp2, 0, C4_Fp2_data);
		    plot.set_series_data (O2_C4, 0, O2_C4_data);
		    plot.set_series_data (O2_T4, 0, O2_T4_data);
		    plot.set_series_data (T4_Fp2, 0, T4_Fp2_data);
		},
		() => {
		    plot.add_annotation ('<#artefact-mouvement>');
		    plot.change_annotation_start_index ('<#artefact-mouvement>', 10 * sampling_frequency);
		    plot.change_annotation_length ('<#artefact-mouvement>', 5 * sampling_frequency);
		    for (const ch of [
			Fp1, C3, O1, T3, Fz, Cz, Pz, Fp2, C4, O2, T4
		    ]) {
			plot.add_annotation_channel ('<#artefact-mouvement>', ch);
		    }
		},
		() => {
		    plot.change_annotation_label ('<#artefact-mouvement>', 'Artéfact Mouvement');
		},
		() => {
		    plot.mark_annotation_saved ('<#artefact-mouvement>');
		},
		() => {
		    [2, 3, 16].forEach (start => {
			const id = `<#pointe-o2-${start}>`;
			plot.add_annotation (id);
			plot.change_annotation_start_index (id, (start - 0.05) * sampling_frequency);
			plot.change_annotation_length (id, 0.1 * sampling_frequency);
			plot.change_annotation_label (id, "Pointe");
			plot.add_annotation_channel (id, O2);
		    });
		},
		() => {
		    [7].forEach (start => {
			const id = `<#pointe-o1-${start}>`;
			plot.add_annotation (id);
			plot.change_annotation_start_index (id, (start - 0.05) * sampling_frequency);
			plot.change_annotation_length (id, 0.1 * sampling_frequency);
			plot.change_annotation_label (id, "Pointe");
			plot.add_annotation_channel (id, O1);
		    });
		},
		() => {
		    [4, 5].forEach (start => {
			const id = `<#pointe-fp1-${start}>`;
			plot.add_annotation (id);
			plot.change_annotation_start_index (id, (start - 0.2) * sampling_frequency);
			plot.change_annotation_length (id, 0.4 * sampling_frequency);
			plot.change_annotation_label (id, "Encoche");
			plot.add_annotation_channel (id, Fp1);
		    });
		},
		() => {
		    [18].forEach (start => {
			const id = `<#pointe-fp2-${start}>`;
			plot.add_annotation (id);
			plot.change_annotation_start_index (id, (start - 0.2) * sampling_frequency);
			plot.change_annotation_length (id, 0.4 * sampling_frequency);
			plot.change_annotation_label (id, "Encoche");
			plot.add_annotation_channel (id, Fp2);
		    });
		},
		() => {
		    plot.mark_annotation_saved ();
		}
	    ];
	    let current_step = 0;
	    const next_step = () => {
		if (current_step < steps.length) {
		    current_step += 1;
		    if (current_step < steps.length) {
			steps[current_step] ();
			plot.replot ();
		    }
		}
	    };
	    setInterval (next_step, 2000);
	});
    }
}

customElements.define ('adf-annotation-demo', AnnotationDemo);
// Local Variables:
// mode: js
// End:
