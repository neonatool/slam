import * as $rdf from 'rdflib';
import { LYTO, RDFS, RDF } from './namespaces.mjs';
import staticData from '../ontology.mjs';
import { ChannelType as PlotChannelType } from '../eeg-plots.mjs';
import _ from '../gettext.mjs';

function staticLabel (language, subject) {
    const matches = staticData.each (subject, RDFS('label'), null);
    if (language === null) {
	// Return the first literal
	for (const m of matches) {
	    if (m instanceof $rdf.Literal) {
		return m.value;
	    }
	}
    } else {
	// Return the first literal whose langtag matches
	for (const m of matches) {
	    if (m instanceof $rdf.Literal && m.language.startsWith (language)) {
		return m.value;
	    }
	}
	const generalLanguage = language.split ('-');
	if (generalLanguage.length > 1) {
	    // Search for a non-localized language
	    return staticLabel (generalLanguage[0], subject);
	} else if (language === 'en') {
	    // Find any name
	    return staticLabel (null, subject);
	} else {
	    // Try with english
	    return staticLabel ('en-us', subject);
	}
	return '???';
    }
}

function staticPlotChannelType (language, id) {
    const name = staticLabel (language, id);
    let is_eeg = false;
    const mne_types = staticData.each (id, LYTO('has-mne-type'), null);
    for (const t of mne_types) {
	if (t.value === 'eeg') {
	    is_eeg = true;
	}
    }
    const [anode_id, cathode_id] = [LYTO('cathode'), LYTO('anode')].map ((p) => {
	return staticData.any (id, p, null);
    });
    if (anode_id !== null && cathode_id !== null) {
	const [ anode, cathode ] = [
	    staticPlotChannelType (language, anode_id),
	    staticPlotChannelType (language, cathode_id)
	];
	return new PlotChannelType (id, name, is_eeg, anode, cathode);
    }
    return new PlotChannelType (id, name, is_eeg);
}

function loadChannelOrder (language, id, offset) {
    const next = staticData.any (id, LYTO (`has-channel-order-${offset}`), null);
    if (next) {
	return [ staticPlotChannelType (language, next),
		 ...loadChannelOrder (language, id, offset + 1) ];
    }
    return [];
}

export default class Profile {
    constructor (id, language = (document && document.documentElement && document.documentElement.lang) || 'en') {
	this.id = id;
	this.language = language;
    }
    static list () {
	const ids = staticData.each (null, RDF('type'), LYTO('Profile'));
	console.log(_ ('Profile IDs:'), ids);
	return ids.map ((id) => new Profile (id));
    }
    is_default () {
        return (this.id.toString () === LYTO('lytonepal-profile').toString ());
    }
    channels () {
	return loadChannelOrder (this.language, this.id, 0);
    }
    authorized_annotation_classes () {
	return staticData.each (this.id, LYTO('has-annotation-class'), null);
    }
    findParentAnnotationClass (type) {
        const roots = this.authorized_annotation_classes ();
        for (const root of roots) {
            if (type.toString () == root.toString ()) {
                return root;
    	    }
        }
        // Not found yet, maybe we are looking for a parent?
        const subclasses = staticData.each (type, RDFS('subClassOf'), null);
        for (const subclass of subclasses) {
            const parent = this.findParentAnnotationClass (subclass);
            if (parent) {
    	        return parent;
    	    }
        }
        // Nothing found, this is not an authorized annotation class.
        return null;
    }
    label_for_annotation_class (type) {
        let label = null;
        const parent = this.findParentAnnotationClass (type);
	if (parent) {
	    label = staticLabel (this.language, parent);
	}
	// Otherwise, the annotation must not be displayed.
	return label;
    }
    label_for_channel_type (channel_type) {
	return staticLabel (this.language, channel_type);
    }
    label () {
	return staticLabel (this.language, this.id);
    }
}

// Local Variables:
// mode: js
// End:
