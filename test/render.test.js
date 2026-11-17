#!/usr/bin/env node
/* Headless render test: runs app.js against a tiny DOM stub, in EN and FI, and
   asserts that the page actually builds. No dependencies. */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets');

function loadData() {
  const files = ['i18n.js', 'recipes.js', 'plan.js', 'shopping.js']
    .map(f => fs.readFileSync(path.join(dir, f), 'utf8'));
  eval(files.join('\n') +
    '\nglobalThis.__d={I18N,I18N_WORDS,SLOTS,RECIPES,PLAN,TARGET,PLATE,WEEK_NOTE,SHOP,PANTRY,AISLE_ORDER,STORES};');
  return globalThis.__d;
}

const D = loadData();
const appSrc = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');

function el(sel) {
  return {
    sel, innerHTML: '', textContent: '', hidden: false, dataset: {}, style: {},
    addEventListener() {}, classList: { toggle() {}, add() {}, remove() {} },
    getAttribute() { return null; }, setAttribute() {}, focus() {},
    closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }
  };
}

function run(lang) {
  const cache = {};
  const doc = {
    querySelector(s) { return cache[s] || (cache[s] = el(s)); },
    querySelectorAll() { return []; },
    addEventListener() {},
    documentElement: { lang: '' },
    body: { style: {} }
  };
  const store = {
    _d: { 'mesa2.lang': lang },
    getItem(k) { return this._d[k] || null; },
    setItem(k, v) { this._d[k] = v; },
    removeItem(k) { delete this._d[k]; }
  };
  const win = { scrollTo() {}, addEventListener() {}, location: { hash: '' } };
  const fn = new Function('document', 'window', 'localStorage', 'location', 'setTimeout',
    'RECIPES', 'I18N', 'I18N_WORDS', 'SLOTS', 'PLAN', 'TARGET', 'PLATE', 'WEEK_NOTE',
    'SHOP', 'PANTRY', 'AISLE_ORDER', 'STORES', appSrc);
  fn(doc, win, store, { hash: '' }, function (f) { f(); },
    D.RECIPES, D.I18N, D.I18N_WORDS, D.SLOTS, D.PLAN, D.TARGET, D.PLATE, D.WEEK_NOTE,
    D.SHOP, D.PANTRY, D.AISLE_ORDER, D.STORES);
  return cache;
}

const fails = [];
function check(name, cond) {
  if (!cond) fails.push(name);
  console.log((cond ? 'PASS ' : 'FAIL ') + name);
}
function count(hay, needle) { return (hay.match(new RegExp(needle, 'g')) || []).length; }

const en = run('en');
check('hero is built', /1\s?550/.test(en['#heroStats'].innerHTML));
check('seven day cards', count(en['#days'].innerHTML, 'class="day"') === 7);
check('English slot labels', en['#days'].innerHTML.indexOf('Breakfast') > -1);
check('day totals render', /\d+\s?kcal · \d+ g/.test(en['#days'].innerHTML));
check('top-up row renders', en['#days'].innerHTML.indexOf('Top-up') > -1);
check('all 30 recipes render', count(en['#recipeGrid'].innerHTML, 'class="rcard"') === 30);
check('English shopping item', en['#shopList'].innerHTML.indexOf('Chicken breast') > -1);
check('Finnish name kept as secondary', en['#shopList'].innerHTML.indexOf('Kanan filee') > -1);
check('English aisle heading', en['#shopList'].innerHTML.indexOf('Fruit and vegetables') > -1);
check('basket total renders', en['#shopSide'].innerHTML.indexOf('€') > -1);
check('quantities translated', /(\d+ pcs?|tbsp|tsp)/.test(en['#shopList'].innerHTML));
check('no untranslated kpl', en['#shopList'].innerHTML.indexOf(' kpl') === -1);
check('English pantry', en['#pantryList'].innerHTML.indexOf('Olive oil') > -1);

const fi = run('fi');
check('Finnish slot labels', fi['#days'].innerHTML.indexOf('Aamiainen') > -1);
check('Finnish shopping item', fi['#shopList'].innerHTML.indexOf('Kanan filee') > -1);
check('Finnish aisle heading', fi['#shopList'].innerHTML.indexOf('Hedelmät ja vihannekset') > -1);
check('Finnish pantry', fi['#pantryList'].innerHTML.indexOf('Oliiviöljy') > -1);
check('English secondary in FI mode', fi['#shopList'].innerHTML.indexOf('Chicken breast') > -1);

console.log('\n' + (fails.length ? fails.length + ' FAILED: ' + fails.join(', ') : 'ALL PASS'));
process.exit(fails.length ? 1 : 0);
