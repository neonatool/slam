import LazyArray from '../src/lazy_array.mjs';

(async function () {
    const a = new LazyArray ();
    a.checkConsistency();
    // A: []
    console.log('Initially:', a.toString ());
    const first_step = await a.slice (1, 2, ((request_start, request_length) => {
	if (request_start != 1 || request_length != 2) {
	    throw new Error('The first request in incorrect');
	}
	return new Float64Array([5, -8]);
    }));
    a.checkConsistency();
    // A: [1->3: [5, -8]]
    console.log('First step:', a.toString ());
    if (first_step.length != 2 || first_step[0] != 5 || first_step[1] != -8) {
	throw new Error('The first slice failed');
    }

    const second_step = await a.slice (5, 2, ((request_start, request_length) => {
	if (request_start != 5 || request_length != 2) {
	    throw new Error('The second request in incorrect');
	}
	return new Float64Array([-2, -1]);
    }));
    a.checkConsistency();
    // A: [1->3: [5, -8], 5->7: [-2, -1]]
    console.log('Second step:', a.toString ());
    if (second_step.length != 2 || second_step[0] != -2 || second_step[1] != -1) {
	throw new Error('The second slice failed');
    }

    const third_step = await a.slice (2, 4, ((request_start, request_length) => {
	// Since we already know indices 2 and 5, we should only be
	// requested from 3 to 5 (excluded).
	if (request_start != 3 || request_length != 2) {
	    throw new Error('The third request in incorrect');
	}
	return new Float64Array([0, 2]);
    }));
    a.checkConsistency();
    // A: [1->7: [5, -8, 0, 2, -2, -1]]
    console.log('Third step:', a.toString ());
    if (third_step.length != 4 || third_step[0] != -8 || third_step[3] != -2) {
	throw new Error('The third slice failed');
    }

    a.forget (2, 4);
    a.checkConsistency();
    // A: [1->2: [5], 6->7: [-1]]
    console.log('Fourth step:', a.toString ());

    const fifth_step = await a.slice (1, 2, ((request_start, request_length) => {
	if (request_start != 2 || request_length != 1) {
	    throw new Error('The fifth request in incorrect');
	}
	return new Float64Array([6]);
    }));
    a.checkConsistency();
    // A: [1->3: [5, 6], 6->7: [-1]]
    console.log('Fifth step:', a.toString ());
    if (fifth_step.length != 2 || fifth_step[0] != 5 || fifth_step[1] != 6) {
	throw new Error('The fifth slice failed');
    }

    a.forget (1, 1);
    a.checkConsistency();
    // A: [2->3: [6], 6->7: [-1]]
    console.log('Sixth step:', a.toString ());

    const seventh_step = await a.slice (0, 1, ((request_start, request_length) => {
	if (request_start != 0 || request_length != 1) {
	    throw new Error('The seventh request in incorrect');
	}
	return new Float64Array([4]);
    }));
    a.checkConsistency();
    // A: [0->1: [4], 2->3: [6], 6->7: [-1]]
    console.log('Seventh step:', a.toString ());
    if (seventh_step.length != 1 || seventh_step[0] != 4) {
	throw new Error('The seventh slice failed');
    }

    const eigth_step = await a.slice (10, 1, ((request_start, request_length) => {
	if (request_start != 10 || request_length != 1) {
	    throw new Error('The eigth request in incorrect');
	}
	return new Float64Array([13]);
    }));
    a.checkConsistency();
    // A: [0->1: [4], 2->3: [6], 6->7: [-1], 10->11: [13]]
    console.log('Eigth step:', a.toString ());
    if (eigth_step.length != 1 || eigth_step[0] != 13) {
	throw new Error('The eigth slice failed');
    }

    const ninth_step = await a.slice (8, 1, ((request_start, request_length) => {
	if (request_start != 8 || request_length != 1) {
	    throw new Error('The ninth request in incorrect');
	}
	return new Float64Array([14]);
    }));
    a.checkConsistency();
    // A: [0->1: [4], 2->3: [6], 6->7: [-1], 8->9: [14], 10->11: [13]]
    console.log('Ninth step:', a.toString ());
    if (ninth_step.length != 1 || ninth_step[0] != 14) {
	throw new Error('The ninth slice failed');
    }

    const tenth_step = await a.slice (2, 7, ((request_start, request_length) => {
	if (request_start === 3 && request_length === 3) {
	    // This is to plug the first hole
	    return new Float64Array([15, 16, 17]);
	} else if (request_start === 7 && request_length === 1) {
	    // This is to plug the second hole
	    return new Float64Array([18]);
	}
	throw new Error('The tenth request in incorrect');
    }));
    a.checkConsistency();
    // A: [0->1: [4], 2->9: [6, 15, 16, 17, -1, 18, 14], 10->11: [13]]
    console.log('Tenth step:', a.toString ());
    if (tenth_step.length != 7 || tenth_step[0] != 6 || tenth_step[1] != 15 || tenth_step[3] != 17 || tenth_step[4] != -1 || tenth_step[5] != 18 || tenth_step[6] != 14) {
	throw new Error('The tenth slice failed');
    }

    const eleventh_step = await a.slice (0, 12, ((request_start, request_length) => {
	if (request_start === 1 && request_length === 1) {
	    // This is to plug the first hole
	    return new Float64Array([19]);
	} else if (request_start === 9 && request_length === 1) {
	    // This is to plug the second hole
	    return new Float64Array([20]);
	} else if (request_start === 11 && request_length === 1) {
	    // This is to plug the third hole
	    return new Float64Array([21]);
	}
	throw new Error('The eleventh request in incorrect');
    }));
    a.checkConsistency();
    // A: [0->12: [4, 19, 6, 15, 16, 17, -1, 18, 14, 20, 13, 21]
    console.log('Eleventh step:', a.toString ());
    if (eleventh_step.length != 12
	|| eleventh_step[0] != 4
	|| eleventh_step[1] != 19
	|| eleventh_step[2] != 6
	|| eleventh_step[8] != 14
	|| eleventh_step[9] != 20
	|| eleventh_step[10] != 13
	|| eleventh_step[11] != 21) {
	throw new Error('The eleventh slice failed');
    }

    a.forget (0, 20);
    a.checkConsistency();
    // A: []
    console.log('Twelfth step:', a.toString ());
    if (a.toString () != '[empty chain]') {
	throw new Error('Failed to forget everything');
    }
})();

// Local Variables:
// mode: js
// End:
