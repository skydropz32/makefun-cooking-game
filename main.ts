// Dapur Kilat's hand-in (Node 22, standard library only): the game is this directory's game/
// folder, plain static files a desktop browser loads offline (game/index.html and its ES
// modules, no library and no network request), and this program hands it in. It copies game/
// and screenshots/ from beside this file to /output and writes /output/dossier.json, the
// summary the judge reads, with the vendored make.fun library. Before writing it checks the
// hand-in is whole — the game entrypoint is there and every screenshot is inside the
// scorer's caps — so a run never silently hands in a broken set.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const MAX_SCREENSHOTS = 4;
const MAX_SCREENSHOT_BYTES = 262144;

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message) {
  throw new Error(`main.ts: ${message}`);
}

const gameIndex = join(here, 'game', 'index.html');
if (!existsSync(gameIndex) || !statSync(gameIndex).isFile()) fail('game/index.html is missing');
const shotsDir = join(here, 'screenshots');
if (!existsSync(shotsDir)) fail('screenshots/ is missing');
const shots = readdirSync(shotsDir)
  .filter((name) => !name.startsWith('.'))
  .sort();
if (shots.length < 3 || shots.length > MAX_SCREENSHOTS) {
  fail(`screenshots/ holds ${shots.length} images, need 3 or 4`);
}
for (const name of shots) {
  const file = join(shotsDir, name);
  if (!statSync(file).isFile()) fail(`screenshots/${name} is not a file`);
  if (!/^[A-Za-z0-9._-]+$/.test(name)) fail(`screenshots/${name} has an illegal name`);
  if (statSync(file).size > MAX_SCREENSHOT_BYTES) {
    fail(`screenshots/${name} is over ${MAX_SCREENSHOT_BYTES} bytes`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one over 256 KiB; more
// than 993 files in game/ or 48 MiB of game files, in all, or a path under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: MAX_SCREENSHOTS, max_bytes: MAX_SCREENSHOT_BYTES },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`handed in ${shots.length} screenshots (${shots.join(', ')}) to ${out}`);
