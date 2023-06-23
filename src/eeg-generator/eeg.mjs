import AdftoolLoader from '@neonatool/adftool';

export default class EEG {
    constructor () {
        this.blob = AdftoolLoader ().then (async Adftool => {
            return Adftool.with_generated_file ((file => {
                return file.data ((bytes) => {
                    return new Blob([bytes]);
                });
            }));
        });
    }
}

// Local Variables:
// mode: js
// End:
