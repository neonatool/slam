export default class InvalidEEG extends Error {
    constructor(start_date, sampling_frequency) {
	let problem = 'an unknown problem is detected';
	if (start_date.length == 0 && sampling_frequency.length == 0) {
	    problem = 'the EEG does not have a a start date nor a sampling frequency';
	} else if (start_date.length == 0) {
	    problems = 'the EEG does not have a a start date';
	} else if (sampling_frequency.length == 0) {
	    problems = 'the EEG does not have a sampling frequency';
	}
	super (`the EEG cannot be used: ${problem}`);
    }
}

// Local Variables:
// mode: js
// End:
