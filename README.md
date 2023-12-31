[![Static Badge](https://img.shields.io/badge/demo--gh-slam-blue?link=https%3A%2F%2Fneonatool.github.io%2Fslam%2F)](https://neonatool.github.io/slam/)

# SLAM

This repository is a public mirror of our code hosted on our group:
[](https://plmlab.math.cnrs.fr/neonatool).

All the JavaScript source code can be built with esbuild, so that each
demo and the main application (main page and both web worker types)
are stand-alone browser-friendly JS files.

For convenience, the ontology is provided as a set of Turtle files
under the data directory. Two Python scripts are dedicated to create
an HTML description (document.py) and export it as a static graph
according to rdflib/javascript (with tojs.py).

The adftool module is the emscrpiten compilation of the adftool source
code, plus HDF5.

## Requirements

- Python 3.X 
- rdflib

## Build from source

With rdflib (in Python) installed, type the following commands:


```sh
npm install
npm run build
npm run check

# To run the application locally
npm run serve
```

The first command creates the static data graph for rdflib/javascript, and
bundle all the source code.

The second command will check the interface protocol between
workers. The output is quite verbose, and some HDF5 warnings may still
be present.

The last command will open a local static HTTP server to see the demo. We
recommend visiting the `/generator` page first, to generate a simple example
EEG in the ADF format.
