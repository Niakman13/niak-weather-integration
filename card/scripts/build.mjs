import { build } from "esbuild";
import { haCardBuild } from './ha-card-build.mjs';

await build({
  entryPoints: ["src/hestia-weather-card.ts"],
  bundle: true,
  ...haCardBuild,
  target: "es2022",
  minify: true,
  sourcemap: false,
  // Built straight into the integration, which serves the card on every dashboard.
  outfile: "../custom_components/hestia_weather/frontend/hestia-weather-card.js",
  legalComments: "none",
});
