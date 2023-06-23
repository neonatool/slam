import * as esbuild from 'esbuild'

const external_modules = [
  'path', 'String_decoder', 'module', 'stream', 'url', 'string_decoder'
];

const defines = {
  'global': 'self'
};

await Promise.all ([
  // The "model" demo, or how to interact with an ADF file through workers:
  esbuild.build({
    entryPoints: ['src/model.mjs'],
    bundle: true,
    sourcemap: true,
    outfile: 'public/model/index.js',
    external: external_modules,
    define: defines,
    platform: 'browser'
  }),
  esbuild.build({
    entryPoints: ['src/model/eeg-worker.mjs', 'src/model/filter-worker.mjs'],
    bundle: true,
    sourcemap: true,
    outdir: 'public/model',
    external: external_modules,
    define: defines,
    platform: 'browser'
  }),
  // The "plot" demo, to draw a signal with annotations
  esbuild.build({
    entryPoints: ['src/eeg-plots/demo.mjs'],
    bundle: true,
    sourcemap: true,
    outfile: 'public/plot/demo.js',
    external: external_modules,
    define: defines,
    platform: 'browser'
  }),
  // The "labels" demo, to show the annotation form
  esbuild.build({
    entryPoints: ['src/eeg-labels.mjs'],
    bundle: true,
    sourcemap: true,
    outfile: 'public/labels/index.js',
    external: external_modules,
    define: defines,
    platform: 'browser'
  }),
  // The "reports" demo, to show the artifact table
  esbuild.build({
    entryPoints: ['src/eeg-reports.mjs'],
    bundle: true,
    sourcemap: true,
    outfile: 'public/reports/index.js',
    external: external_modules,
    define: defines,
    platform: 'browser'
  }),
  // The "generator" demo, to generate an EEG
  esbuild.build({
    entryPoints: ['src/eeg-generator.mjs'],
    bundle: true,
    sourcemap: true,
    outfile: 'public/generator/index.js',
    external: external_modules,
    define: defines,
    platform: 'browser'
  }),
  // The main application
  esbuild.build({
    entryPoints: ['src/main.mjs'],
    bundle: true,
    sourcemap: true,
    outfile: 'public/index.js',
    external: external_modules,
    define: defines,
    platform: 'browser'
  }),
  // The web workers for the main application
  esbuild.build({
    entryPoints: ['src/main/eeg-worker.mjs', 'src/main/filter-worker.mjs'],
    bundle: true,
    sourcemap: true,
    outdir: 'public/',
    external: external_modules,
    define: defines,
    platform: 'browser'
  }),
]);