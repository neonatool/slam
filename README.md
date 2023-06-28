# SLAM - Core

# How to build

All the JavaScript source code can be built with esbuild, so that each
demo and the main application (main page and both web worker types)
are stand-alone browser-friendly JS files.

For convenience, the ontology is provided as a set of Turtle files
under the data directory. Two Python scripts are dedicated to create
an HTML description (document.py) and export it as a static graph
according to rdflib/javascript (with tojs.py).

The adftool module is the emscrpiten compilation of the adftool source
code, plus HDF5.

With rdflib (in Python) installed, the command `npm run build` will
create the static data graph for rdflib/javascript, and bundle all the
source code.

The command `npm run check` will check the interface protocol between
workers.

The command `npm run serve` will open a local static HTTP server to
see the demo. We recommend visiting the `/generator` page first, to
generate a simple example EEG in the ADF format.