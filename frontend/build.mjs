import {build} from 'esbuild';
await build({entryPoints:['panel.ts'],bundle:true,format:'esm',target:'es2022',minify:true,
  outfile:'../custom_components/niak_weather/frontend/panel.js',legalComments:'none',loader:{'.css':'text'}});
// Shared « Hestia » panel (socle), copied from niak-ecosysteme/socle/ by its copier.sh.
await build({entryPoints:['socle/shell.ts'],bundle:true,format:'esm',target:'es2022',minify:true,
  outfile:'../custom_components/niak_weather/frontend/niak-socle.js',legalComments:'none'});
