import { build } from "esbuild";

await build({
  entryPoints: ["src/niak-weather-card.ts"],
  bundle: true,
  format: "esm",
  target: "es2022",
  minify: true,
  sourcemap: false,
  // Built straight into the integration, which serves the card on every dashboard.
  outfile: "../custom_components/niak_weather/frontend/niak-weather-card.js",
  legalComments: "none",
});
