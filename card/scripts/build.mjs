import { build } from "esbuild";
import { haCardBuild } from './ha-card-build.mjs';

await build({
  entryPoints: ["src/niak-weather-card.ts"],
  bundle: true,
  ...haCardBuild,
  target: "es2022",
  minify: true,
  sourcemap: false,
  // Built straight into the integration, which serves the card on every dashboard.
  outfile: "../custom_components/niak_weather/frontend/niak-weather-card.js",
  legalComments: "none",
});
