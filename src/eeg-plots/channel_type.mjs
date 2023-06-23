import _ from '../gettext.mjs';

export default class ChannelType {
    constructor (id, name, isEEG, anode = null, cathode = null) {
	console.assert (typeof name === 'string', _ ('the channel type name must be a string'), name);
	console.assert (anode === null || anode instanceof ChannelType, _ ('the anode (if set) must be another ChannelType'), anode);
	console.assert (cathode === null || cathode instanceof ChannelType, _ ('the cathode (if set) must be another ChannelType'), cathode);
	this.id = id;
	this.name = name;
	this.isEEG = isEEG;
	this.anode = anode;
	this.cathode = cathode;
    }
}

// Local Variables:
// mode: js
// End:
