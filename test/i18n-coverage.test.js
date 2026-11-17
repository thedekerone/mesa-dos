#!/usr/bin/env node
/* Fails if a Finnish data string has no English translation.
   Strings that are legitimately identical in both languages are allowlisted. */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets');

const files = ['i18n.js', 'recipes.js', 'plan.js', 'shopping.js']
  .map(f => fs.readFileSync(path.join(dir, f), 'utf8'));
eval(files.join('\n') + '\nglobalThis.__d={I18N,I18N_WORDS,RECIPES,SHOP,PANTRY};');
const { I18N, I18N_WORDS, RECIPES, SHOP, PANTRY } = globalThis.__d;

function enOf(s) {
  if (s == null || s === '') return s;
  if (I18N[s]) return I18N[s];
  let o = String(s);
  for (const [re, to] of I18N_WORDS) o = o.replace(re, to);
  return o;
}

/* words/terms that are the same in Finnish and English */
const ALLOW = new Set([
  'Lime', 'Lime (aji verde)', 'Oregano', 'Parmesan (or Grana Padano)', 'Parmesan / Grana Padano',
  'Bulgur', 'Quinoa', 'Miso', 'Gochujang', 'Green curry paste', 'Aji amarillo paste',
  'Edamame', 'Hummus', 'Skyr', 'Pak choi', 'Chia', 'cm', 'dl', 'g', 'l', 'ml', '—'
]);

const strings = new Map();
RECIPES.forEach(r => r.ingredients.forEach(i => {
  strings.set(i.t, 'ingredient');
  if (i.u) strings.set(i.u, 'unit');
}));
['A', 'B'].forEach(w => SHOP[w].forEach(a => {
  strings.set(a.aisle, 'aisle');
  a.items.forEach(i => { strings.set(i.n, 'shop item'); strings.set(i.q, 'quantity'); });
}));
PANTRY.forEach(p => { strings.set(p.n, 'pantry'); strings.set(p.q, 'quantity'); });

const missing = [];
for (const [s, kind] of strings) {
  if (enOf(s) === s && !ALLOW.has(s) && !/^[\d\s.,×%/½¼¾-]+(kg|g|l|ml|dl|cm)?$/.test(s)) {
    missing.push(kind + ': ' + s);
  }
}

if (missing.length) {
  console.log('MISSING TRANSLATIONS (' + missing.length + '):');
  missing.sort().forEach(m => console.log('  ' + m));
  process.exit(1);
}
console.log('ALL ' + strings.size + ' DATA STRINGS TRANSLATED');
