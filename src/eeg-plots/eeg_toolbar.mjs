import AmplitudeSelector from './amplitude_selector.mjs';
import FilterSelector from './filter_selector.mjs';
import _ from '../gettext.mjs';

export default class EEGToolbar extends HTMLElement {
    constructor () {
	super ();
	const shadow = this.attachShadow ({ mode: 'open' });
	const amplitude_related = document.createElement('div');
	const time_related = document.createElement('div');
	const frequency_related = document.createElement('div');
	for (const group of [ amplitude_related, time_related, frequency_related]) {
	    group.style['display'] = 'flex';
	    group.style['flex-direction'] = 'row';
	    group.style['align-items'] = 'stretch';
	    group.style['margin'] = '.5ex';
	    shadow.appendChild (group);
	}
	const amplitude_selector = document.createElement('slam-amplitude-selector');
	const reset_amplitude = document.createElement('button');
	const time_window = document.createElement ('select');
	const reset_time = document.createElement('button');
	amplitude_selector.style['display'] = 'flex';
	reset_amplitude.appendChild (document.createTextNode (_ ('Reset amplitude')));
	reset_amplitude.addEventListener ('click', () => {
	    const { literal, low, high } = amplitude_selector.value;
	    const reset = new CustomEvent('slam-reset-amplifier');
	    reset.literal = literal;
	    reset.low = low;
	    reset.high = high;
	    this.dispatchEvent (reset);
	});
	for (const allowed of [15, 20, 30]) {
	    const opt = document.createElement ('option');
	    opt.setAttribute ('value', '' + allowed);
	    opt.appendChild (document.createTextNode(`${allowed} s`));
	    time_window.appendChild (opt);
	}
	time_window.value = '20';
	this.duration = 20;
	reset_time.appendChild (document.createTextNode (_ ('Reset window')));
	reset_time.addEventListener ('click', () => {
	    const reset = new CustomEvent('slam-reset-time');
	    reset.duration = parseFloat (time_window.value);
	    this.duration = reset.duration;
	    reset.window_length = this.window_length;
	    this.dispatchEvent (reset);
	});
	const filter_choice = document.createElement ('slam-filter-selector');
	filter_choice.style['display'] = 'flex';
	const reset_filter = document.createElement ('button');
	reset_filter.appendChild (document.createTextNode (_ ('Reset filter')));
	this.filter = filter_choice.value;
	reset_filter.addEventListener ('click', () => {
	    const value = filter_choice.value;
	    const { literal_highpass, literal_lowpass, highpass, lowpass } = value;
	    this.filter = value;
	    const reset = new CustomEvent ('slam-reset-filter');
	    reset.literal_highpass = literal_highpass;
	    reset.literal_lowpass = literal_lowpass;
	    reset.highpass = highpass;
	    reset.lowpass = lowpass;
	    reset.low = highpass;
	    reset.high = lowpass;
	    this.dispatchEvent (reset);
	});
	amplitude_related.appendChild (amplitude_selector);
	amplitude_related.appendChild (reset_amplitude);
	time_related.appendChild (time_window);
	time_related.appendChild (reset_time);
	frequency_related.appendChild (filter_choice);
	frequency_related.appendChild (reset_filter);
    }

    get window_length () {
	let sfreq = this.getAttribute ('sampling-frequency');
	if (sfreq && typeof sfreq === 'string') {
	    sfreq = parseFloat (sfreq);
	}
	return (sfreq && (this.duration * sfreq)) || false;
    }
}

customElements.define ('slam-eeg-toolbar', EEGToolbar);

// Local Variables:
// mode: js
// End:
