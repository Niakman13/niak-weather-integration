// Regression for HA frontend#53890, using HA's actual scoped registry polyfill.
// npm run test:loading [-- /absolute/path/to/another/niak-card.js]
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import { chromium, firefox } from 'playwright';

const bundles = process.argv.slice(2);
if (!bundles.length) {
  const { name } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const domain = name.replace(/-card$/, '').replaceAll('-', '_');
  bundles.push(`../custom_components/${domain}/frontend/${name}.js`);
}
const polyfill = readFileSync(new URL('../node_modules/@webcomponents/scoped-custom-element-registry/scoped-custom-element-registry.min.js', import.meta.url));
const server = createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/') { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><title>Niak loading regression</title><home-assistant></home-assistant>'); }
  else if (path === '/polyfill.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(polyfill); }
  else if (path === '/card.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(readFileSync(currentBundle)); }
  else { res.writeHead(404); res.end(); }
});
server.listen(0, '127.0.0.1'); await once(server, 'listening');
const origin = `http://127.0.0.1:${server.address().port}`;
let currentBundle = bundles[0];
const engines = process.env.NIAK_TEST_FIREFOX ? [chromium, firefox] : [chromium];
try {
  for (const engine of engines) {
    const browser = await engine.launch();
    try {
      for (const bundle of [...bundles]) {
        currentBundle = bundle;
        const tag = bundle.includes('weather') ? 'niak-weather-card' : 'niak-comfort-card';
        const context = await browser.newContext();
        const page = await context.newPage();
        const errors = []; page.on('pageerror', e => errors.push(e.message));
        for (const early of [true, true, false]) {
          await page.goto(origin);
          if (early) {
            // Start as an extra module, before HA replaces customElements.
            const response = page.waitForResponse(r => r.url().includes('/card.js'));
            await page.evaluate(() => { window.cardImport = import('/card.js?v=test'); });
            await response;
            assert.deepEqual(await page.evaluate(() => ({ tags: customElements.get('niak-weather-card') || customElements.get('niak-comfort-card'), lit: window.litElementVersions })), { tags: undefined, lit: undefined }, 'Neither Lit nor the card executes early');
          }
          await page.addScriptTag({ url: `${origin}/polyfill.js` });
          await page.evaluate(() => customElements.define('home-assistant', class extends HTMLElement {}));
          if (!early) await page.evaluate(() => { window.cardImport = import('/card.js?v=test'); });
          await page.evaluate(() => window.cardImport);
          await page.evaluate(async tag => {
            const ctor = customElements.get(tag);
            if (!ctor) throw new Error(`${tag} disappeared after registry replacement`);
            // A leftover manual resource runs the bundle again, without replacing existing elements.
            await import('/card.js?v=manual-workaround');
            if (customElements.get(tag) !== ctor) throw new Error('Duplicate resource replaced the card');
            const card = document.createElement(tag);
            card.setConfig({ type: `custom:${tag}` });
            document.body.append(card);
            await card.updateComplete;
            if (!card.shadowRoot?.childElementCount) throw new Error('Card has no rendered content');
          }, tag);
          assert.deepEqual(errors, [], 'No browser errors');
        }
        console.log(`${engine.name()}: ${tag}: early load, reload, dashboard load, duplicate and render OK`);
        await context.close();
      }
    } finally { await browser.close(); }
  }
} finally { server.close(); }
