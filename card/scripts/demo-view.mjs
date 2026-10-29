// The integration's view of a demonstration scenario, computed by the integration's own engine (scripts/view_cli.py):
// the test bench shows what Home Assistant would show. The card lives in the integration's repository (card/), or HESTIA_INTEGRATION names another copy.
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scenarioData } from '../demo/demo-hass.js';

const integration = process.env.HESTIA_INTEGRATION ?? fileURLToPath(new URL('../../', import.meta.url));
const cli = join(integration, 'scripts', 'view_cli.py');

/** The view message (`{ version, view }`) of a scenario at a given moment. */
export function demoView(scenario, now, language = 'fr') {
  if (!existsSync(cli)) return Promise.reject(new Error(`Moteur de l’intégration introuvable : ${cli}. La carte doit rester dans le dossier card/ de l’intégration, ou HESTIA_INTEGRATION doit l’indiquer.`));
  return new Promise((resolve, reject) => {
    const child = execFile('python3', [cli], { maxBuffer: 16e6 }, (error, stdout, stderr) => error ? reject(new Error(stderr || error.message)) : resolve(stdout));
    child.stdin.end(JSON.stringify({ ...scenarioData(scenario, new Date(now)), language }));
  });
}

/** Answers the demonstration pages' POST /demo/view { scenario, now }. */
export async function serveDemoView(req, res) {
  let body = '';
  for await (const chunk of req) body += chunk;
  try {
    const { scenario, now, language } = JSON.parse(body);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(await demoView(scenario, now, language));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(String(error?.message ?? error));
  }
}
