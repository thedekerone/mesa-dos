#!/usr/bin/env node
/* Fails if a Finnish data string has no English translation.
   Strings that are legitimately identical in both languages are allowlisted. */
const { load } = require('./load');
const { I18N, UNITS, RECIPES, PLAN, PRODUCTS, PANTRY, AISLE_ORDER, MESA } = load();

/* words/terms that are the same in Finnish and English */
const ALLOW = new Set([
  'Lime', 'Lime (aji verde)', 'Oregano', 'Parmesan (or Grana Padano)', 'Parmesan / Grana Padano',
  'Bulgur', 'Quinoa', 'Miso', 'Gochujang', 'Green curry paste', 'Aji amarillo paste',
  'Edamame', 'Hummus', 'Skyr', 'Pak choi', 'Chia', 'Chili flakes', '—'
]);

const strings = new Map();
const ingredient = i => {
  strings.set(i.t, 'ingredient');
  /* a unit either has number forms in UNITS or is a phrase ("to taste") in I18N */
  if (i.u && !UNITS[i.u] && i.u !== 'viipaletta') strings.set(i.u, 'unit phrase');
};
RECIPES.forEach(r => r.ingredients.forEach(ingredient));
Object.keys(PLAN).forEach(w => PLAN[w].forEach(d => { if (d.extra) d.extra.items.forEach(ingredient); }));
AISLE_ORDER.forEach(a => strings.set(a, 'aisle'));
Object.keys(PRODUCTS).forEach(n => strings.set(n, 'product'));
PANTRY.forEach(p => { strings.set(p.n, 'pantry'); strings.set(p.q, 'pantry size'); });

const missing = [];
for (const [s, kind] of strings) {
  if (MESA.enOf(s) === s && !ALLOW.has(s) && !/^[\d\s.,×%/½¼¾-]+(kg|g|l|ml|dl|cm)?$/.test(s)) {
    missing.push(kind + ': ' + s);
  }
}

if (missing.length) {
  console.log('MISSING TRANSLATIONS (' + missing.length + '):');
  missing.sort().forEach(m => console.log('  ' + m));
  process.exit(1);
}
console.log('ALL ' + strings.size + ' DATA STRINGS TRANSLATED');
