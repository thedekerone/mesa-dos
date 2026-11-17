#!/usr/bin/env node
/* Data integrity: every reference resolves and every table has the shape the page reads.
   Run this after touching recipes.js, plan.js, household.js, shopping.js or i18n.js. */
const { load, reporter } = require('./load');
const D = load();
const { RECIPES, ROTATION_START, DAY_KCAL, COOK_DOUBLE, TOPUPS, PEOPLE, AISLE_ORDER, PRODUCTS, PANTRY, BUY, UNITS, SLOTS, MESA } = D;
const { check, done } = reporter();

/* ---- recipes ---- */
const RID = {}, dupes = [];
RECIPES.forEach(r => { if (RID[r.id]) dupes.push(r.id); RID[r.id] = r; });
check('recipe ids are unique', dupes.length === 0, dupes.join(', '));

const MEALS = ['dinner', 'breakfast', 'lunch', 'snack'];
const CUISINES = ['peru', 'mexico', 'asia', 'india', 'mideast', 'europe', 'nordic'];   /* the ones app.js can name */
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

const dinners = RECIPES.filter(r => r.meal === 'dinner');
const KINDS = ['chicken', 'fish', 'beef', 'pork', 'veg'];
check('every dinner says what kind it is', dinners.every(r => KINDS.includes(r.main)), dinners.filter(r => !KINDS.includes(r.main)).map(r => r.id).join(', '));
check('there are enough dinners for three different weeks', dinners.length >= 21, String(dinners.length));
check('enough dinners keep for lunch to fill the cook-double days', dinners.filter(r => r.keeps).length >= dinners.length / 2);
check('there are at least four breakfasts, four snacks and three lunches to deal from',
  RECIPES.filter(r => r.meal === 'breakfast').length >= 4 && RECIPES.filter(r => r.meal === 'snack').length >= 4 &&
  RECIPES.filter(r => r.meal === 'lunch' && !r.from).length >= 3);

/* ---- the rules a week is dealt by ---- */
const start = MESA.parseISO(ROTATION_START);
check('ROTATION_START is a Monday', !!start && start.getDay() === 1, ROTATION_START);
check('DAY_KCAL is a plausible day', DAY_KCAL >= 1200 && DAY_KCAL <= 2500);
check('cook-double days are weekdays, and never Sunday (the week\'s list would not cover Monday)',
  COOK_DOUBLE.length > 0 && COOK_DOUBLE.every(d => Number.isInteger(d) && d >= 0 && d <= 5));
check('top-ups have text, numbers and ingredients',
  TOPUPS.length > 0 && TOPUPS.every(x => x.text && x.kcal > 0 && x.protein >= 0 && Array.isArray(x.items) && x.items.length));

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
TOPUPS.forEach(x => x.items.forEach(i => ingredientNames.add(i.t)));
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
