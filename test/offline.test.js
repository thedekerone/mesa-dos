#!/usr/bin/env node
/* Offline support: the service worker's first-visit list must cover everything the page
   loads, and every file it lists must exist. Catches "added a script, forgot sw.js". */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const fails = [];
function check(name, cond, detail) {
  if (!cond) fails.push(name);
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (!cond && detail ? ' — ' + detail : ''));
}

const sw = read('sw.js');
const core = JSON.parse('[' + sw.match(/var CORE = \[([\s\S]*?)\];/)[1] + ']');
const html = read('index.html');
const manifest = JSON.parse(read('manifest.json'));

const fileOf = f => f.split('?')[0];   /* asset URLs carry a ?v= cache-buster */
const missing = core.filter(f => f !== './' && !fs.existsSync(path.join(root, fileOf(f))));
check('every file in CORE exists', missing.length === 0, missing.join(', '));
check('CORE covers the page itself', core.includes('./') && core.includes('index.html'));

const refs = [];
html.replace(/<(?:script|link)\b[^>]*?\b(?:src|href)="([^"]+)"/g, (m, url) => { refs.push(url); });
const local = refs.filter(u => !/^(data:|https?:|\/\/)/.test(u));
const uncached = local.filter(u => !core.includes(u));
check('every local script, stylesheet and icon in index.html is in CORE', uncached.length === 0, uncached.join(', '));

/* hard rule 2: no external requests */
const external = refs.filter(u => /^(https?:|\/\/)/.test(u));
check('index.html loads nothing from another origin', external.length === 0, external.join(', '));

const icons = manifest.icons.map(i => i.src);
const lost = icons.filter(f => !fs.existsSync(path.join(root, f)) || !core.includes(f));
check('manifest icons exist and are in CORE', lost.length === 0, lost.join(', '));
check('manifest paths are relative (works from a subdirectory)',
  [manifest.start_url, manifest.scope].concat(icons).every(u => u[0] !== '/'));
check('app.js registers the worker by relative path', /serviceWorker\.register\("sw\.js"\)/.test(read('assets/app.js')));

console.log('\n' + (fails.length ? fails.length + ' FAILED: ' + fails.join(', ') : 'ALL PASS'));
process.exit(fails.length ? 1 : 0);
