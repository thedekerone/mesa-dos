#!/usr/bin/env node
/* Data integrity: every reference resolves and every table has the shape the page reads.
   Run this after touching recipes.js, plan.js, household.js, shopping.js or i18n.js. */
const { load, reporter } = require('./load');
const D = load();
const { RECIPES, PLAN, WEEK_NOTE, ROTATION_START, PEOPLE, AISLE_ORDER, PRODUCTS, PANTRY, BUY, UNITS, SLOTS, MESA } = D;
const { check, done } = reporter();

/* ---- recipes ---- */
const RID = {}, dupes = [];
RECIPES.forEach(r => { if (RID[r.id]) dupes.push(r.id); RID[r.id] = r; });
check('recipe ids are unique', dupes.length === 0, dupes.join(', '));

const MEALS = ['dinner', 'breakfast', 'lunch', 'snack'], CUISINES = ['peru', 'asia', 'europe'];
const badShape = RECIPES.filter(r =>
  !MEALS.includes(r.meal) || !CUISINES.includes(r.cuisine) || !r.name || !r.short ||
  ![r.time, r.kcal, r.protein].every(n => typeof n === 'number' && n > 0) ||
  !(typeof r.fibre === 'number' && r.fibre >= 0) ||          /* eggs and skyr really are 0 g */
  !(Number.isInteger(r.serves) && r.serves >= 1) ||
  !Array.isArray(r.ingredients) || !r.ingredients.length || !Array.isArray(r.steps) || !r.steps.length
).map(r => r.id);
check('recipes have every field the page reads', badShape.length === 0, badShape.join(', '));
check('dinners are written for at least two', RECIPES.filter(r => r.meal === 'dinner' && r.serves < 2).length === 0);

const badScale = [];
RECIPES.forEach(r => r.ingredients.forEach(i => {
  if (i.s && (typeof i.n !== 'number' || !['g', 'ml', 'dl', 'kpl'].includes(i.u))) badScale.push(r.id + ': ' + i.t);
}));
check('only numeric bulk units follow the plate size', badScale.length === 0, badScale.join('; '));

const badFrom = RECIPES.filter(r => r.from && (!RID[r.from] || RID[r.from].meal !== 'dinner')).map(r => r.id);
check('a lunch built on a dinner names a real dinner', badFrom.length === 0, badFrom.join(', '));

/* ---- plan ---- */
const WEEKS = Object.keys(PLAN);
const broken = [], badLeftover = [], badExtra = [], used = new Set();
WEEKS.forEach(w => PLAN[w].forEach((d, n) => {
  [d.bf, d.lunch.id || d.lunch.leftover, d.dinner, d.snack].forEach(id => {
    if (!RID[id]) broken.push(w + ' ' + d.day + ': ' + id); else used.add(id);
  });
  /* the lunch must come from the night before; Monday has no night before on this list */
  const src = d.lunch.leftover || (RID[d.lunch.id] && RID[d.lunch.id].from);
  if (src && (n === 0 || PLAN[w][n - 1].dinner !== src)) badLeftover.push(w + ' ' + d.day);
  if (d.extra && !(d.extra.text && d.extra.kcal > 0 && d.extra.protein >= 0 && Array.isArray(d.extra.items) && d.extra.items.length)) {
    badExtra.push(w + ' ' + d.day);
  }
}));
check('every week has seven days', WEEKS.every(w => PLAN[w].length === 7));
check('every plan entry points at a recipe', broken.length === 0, broken.join('; '));
check('leftover lunches are the previous dinner', badLeftover.length === 0, badLeftover.join('; '));
check('top-ups have text, numbers and ingredients', badExtra.length === 0, badExtra.join('; '));
const unused = RECIPES.filter(r => !used.has(r.id)).map(r => r.id);
check('every recipe is on the plan', unused.length === 0, unused.join(', '));
check('every week has a note', WEEKS.every(w => WEEK_NOTE[w]));
const start = MESA.parseISO(ROTATION_START);
check('ROTATION_START is a Monday', !!start && start.getDay() === 1, ROTATION_START);

/* ---- the two people ---- */
check('there are two people with sane targets',
  PEOPLE.length === 2 && new Set(PEOPLE.map(p => p.id)).size === 2 &&
  PEOPLE.every(p => p.name && p.kcal >= 1200 && p.kcal <= 3500));
check('household.js holds targets only, no body measurements',
  PEOPLE.every(p => Object.keys(p).sort().join() === 'id,kcal,name'));

/* ---- products, pantry, BUY ---- */
const badProduct = Object.keys(PRODUCTS).filter(name => {
  const p = PRODUCTS[name];
  return !(p.a >= 0 && p.a < AISLE_ORDER.length) || !(p.p > 0) || !(p.pack === undefined || p.pack > 0) ||
    !UNITS[p.u] || (p.sold && !UNITS[p.sold]);
});
check('products have an aisle, a price and a known unit', badProduct.length === 0, badProduct.join(', '));
const pantryNames = PANTRY.map(p => p.n);
check('pantry items have a name, size and price', PANTRY.every(p => p.n && p.q && p.p > 0));
check('pantry names are unique and are not also products',
  new Set(pantryNames).size === pantryNames.length && pantryNames.every(n => !PRODUCTS[n]));
const known = n => !!PRODUCTS[n] || pantryNames.includes(n);
const badBuy = Object.keys(BUY).filter(t => {
  const v = BUY[t];
  if (v === null) return false;
  return Array.isArray(v) ? !v.every(x => known(x[0]) && typeof x[1] === 'number') : !known(v);
});
check('every BUY entry points at a product or pantry item', badBuy.length === 0, badBuy.join('; '));
const ingredientNames = new Set();
RECIPES.forEach(r => r.ingredients.forEach(i => ingredientNames.add(i.t)));
WEEKS.forEach(w => PLAN[w].forEach(d => { if (d.extra) d.extra.items.forEach(i => ingredientNames.add(i.t)); }));
const staleBuy = Object.keys(BUY).filter(t => !ingredientNames.has(t));
check('BUY has no entries for ingredients that no longer exist', staleBuy.length === 0, staleBuy.join('; '));

/* ---- interface strings ---- */
const holes = s => (String(s).match(/\{\w+\}/g) || []).sort().join();
const missingFi = Object.keys(SLOTS.en).filter(k => SLOTS.fi[k] == null);
const extraFi = Object.keys(SLOTS.fi).filter(k => SLOTS.en[k] == null);
const badHoles = Object.keys(SLOTS.en).filter(k => SLOTS.fi[k] != null && holes(SLOTS.en[k]) !== holes(SLOTS.fi[k]));
check('every interface string exists in Finnish', missingFi.length === 0, missingFi.join(', '));
check('Finnish has no strings English lacks', extraFi.length === 0, extraFi.join(', '));
check('both languages fill in the same {placeholders}', badHoles.length === 0, badHoles.join(', '));

done();
