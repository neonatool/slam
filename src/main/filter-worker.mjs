import FilterWorker from '../model/filter-task.mjs';

const worker = new FilterWorker ((msg) => {
    postMessage (msg);
});

onmessage = (msg) => {
    return worker.onmessage (msg);
};

// Local Variables:
// mode: js
// End:
