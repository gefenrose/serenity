// Copies the app's source files into www/, which is the web root Capacitor
// expects (see capacitor.config.json). GitHub Pages keeps serving the repo
// root as before; this script just mirrors what it needs into www/ for
// native builds.
//
// Usage: node build.js   (also runs automatically via `npm run build`)

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'www');

const FILES = ['index.html', 'manifest.json', 'sw.js'];
const DIRS = ['icons'];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const file of FILES) {
  fs.copyFileSync(path.join(ROOT, file), path.join(OUT, file));
  console.log('copied', file);
}

for (const dir of DIRS) {
  fs.cpSync(path.join(ROOT, dir), path.join(OUT, dir), { recursive: true });
  console.log('copied', dir + '/');
}

console.log('Build complete -> www/');
