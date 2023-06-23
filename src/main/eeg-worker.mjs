import EEGWorker from '../model/data-task.mjs';

const worker = new EEGWorker ((msg) => {
    return postMessage (msg)
});

onmessage = (msg) => {
    return worker.onmessage (msg);
};

// Local Variables:
// mode: js
// End:
