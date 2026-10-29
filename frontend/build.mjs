import {build} from 'esbuild';
await build({entryPoints:['panel.ts'],bundle:true,format:'esm',target:'es2022',minify:true,
  outfile:'../custom_components/hestia_weather/frontend/panel.js',legalComments:'none',loader:{'.css':'text'}});
// Shared « Hestia » panel (socle), copied from hestia-ecosysteme/socle/ by its copier.sh.
await build({entryPoints:['socle/shell.ts'],bundle:true,format:'esm',target:'es2022',minify:true,
  outfile:'../custom_components/hestia_weather/frontend/hestia-socle.js',legalComments:'none'});
