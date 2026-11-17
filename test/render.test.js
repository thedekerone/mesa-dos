#!/usr/bin/env node
/* Headless render test: runs app.js against a tiny DOM stub — every screen, both
   languages — and asserts that the page actually builds. No dependencies.

   The stub has no real elements, so it cannot see events: keyboard, focus, offline and
   print need a look in a browser. */
const { load, read, reporter, GLOBALS } = require('./load');
const D = load();
const appSrc = read('assets/app.js');
const { check, done } = reporter();

function el() {
  return {
    innerHTML: '', textContent: '', hidden: false, dataset: {}, style: {}, value: '',
    addEventListener() {}, classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    getAttribute() { return null; }, setAttribute() {}, removeAttribute() {}, hasAttribute() { return false; },
    focus() {}, contains() { return false; }, click() {},
    closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; }
  };
}

/* build the page at `hash`, on the date `now`, and hand back what each container holds */
function run(hash, opts) {
  opts = opts || {};
  const cache = {};
  const doc = {
    querySelector(s) { return cache[s] || (cache[s] = el()); },
    querySelectorAll() { return []; },
    addEventListener() {},
    documentElement: { lang: '' }, body: { style: {} }, title: '', visibilityState: 'visible'
  };
  const store = opts.blocked ? {
    /* what some in-app browsers and private modes do */
    get length() { throw new Error('SecurityError'); },
    key() { throw new Error('SecurityError'); },
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('SecurityError'); },
    removeItem() { throw new Error('SecurityError'); }
  } : {
    _d: Object.assign({ 'mesa2.lang': opts.lang || 'en' }, opts.stored),
    get length() { return Object.keys(this._d).length; },
    key(i) { return Object.keys(this._d)[i]; },
    getItem(k) { return k in this._d ? this._d[k] : null; },
    setItem(k, v) { this._d[k] = v; },
    removeItem(k) { delete this._d[k]; }
  };
  const win = { MESA_NOW: opts.now || '2026-11-17', scrollTo() {}, addEventListener() {}, pageYOffset: 0, print() {} };
  const names = ['document', 'window', 'localStorage', 'location', 'history', 'navigator', 'setTimeout', 'clearTimeout'].concat(GLOBALS);
  const args = [doc, win, store, { hash: hash }, { back() {} }, {}, f => f(), () => {}].concat(GLOBALS.map(g => D[g]));
  new Function(names.join(','), appSrc).apply(null, args);
  cache.title = doc.title;
  cache.lang = doc.documentElement.lang;
  cache.store = store;
  return cache;
}
const count = (hay, needle) => hay.split(needle).length - 1;
const html = (page, id) => page['#view-' + id].innerHTML;

/* ---- today (Tuesday of week A: salmon, cooked double) ---- */
const today = run('#/');
const t = html(today, 'today');
check('today shows tonight\'s dinner', t.indexOf('Miso-glazed salmon with pak choi') > -1 && t.indexOf('Tonight') > -1);
check('today knows the date and the week', t.indexOf('Tuesday 17 November') > -1 && t.indexOf('Week A') > -1);
check('the week strip has seven days and marks today', count(t, 'href="#/day/2026-11-') >= 7 && count(t, 'aria-current="date"') === 1);
check('a doubled dinner says so and links to four portions', t.indexOf('Cook double') > -1 && t.indexOf('#/recipe/a4/4') > -1);
check('the pan is split between two plates', count(t, 'class="seg-plate') === 2 && t.indexOf('Him') > -1 && t.indexOf('Her') > -1);
check('the bigger target gets the bigger share', /p1" style="flex-basis:5\d\.\d%/.test(t));
check('the rest of the day is listed', t.indexOf('Spinach scramble') > -1 && t.indexOf('Leftovers from last night') > -1 && t.indexOf('Apple and peanut butter') > -1);
check('tomorrow\'s prep is listed', t.indexOf('Box two portions') > -1 && t.indexOf('night in the fridge') > -1);
check('the day adds up per person', count(t, 'class="total total') === 2 && /target 1[\s ]700/.test(t));
check('the title names the screen', today.title === 'Today · Mesa Dos');

const thu = html(run('#/day/2026-11-19'), 'today');
check('another day can be opened', thu.indexOf('Korean chicken lettuce wraps') > -1 && thu.indexOf('Back to today') > -1);
check('a top-up day shows the top-up', thu.indexOf('Top-up') > -1 && thu.indexOf('skyr and a boiled egg') > -1);
const sat = html(run('#/day/2026-11-21'), 'today');
check('the weekend points at next week\'s shopping', sat.indexOf('#/shop/2026-11-23') > -1 && sat.indexOf('week B') > -1);
const soup = html(run('#/day/2026-11-25'), 'today');
check('the minestrone makes four without doubling', soup.indexOf('Makes four portions') > -1 && soup.indexOf('Cook double') === -1);
check('a nonsense date falls back to today', html(run('#/day/2026-13-45'), 'today').indexOf('Miso-glazed salmon') > -1);
check('old links still land somewhere', html(run('#plan'), 'today').indexOf('Miso-glazed salmon') > -1 && html(run('#shop'), 'shop').indexOf('Shopping list') > -1);

/* ---- week ---- */
const week = html(run('#/week'), 'week');
check('the week lists seven dinners', count(week, '<a class="wday') === 7 && week.indexOf('Greek chicken traybake') > -1);
check('the week marks today and the doubled dinners', count(week, 'wday now') === 1 && count(week, '<em>cook double</em>') === 3);
check('the fridge sheet has seven rows', count(week, '<tr><th scope="row">') === 7 && week.indexOf('Mesa Dos, Week A') > -1);
const weekB = html(run('#/week/2026-11-23'), 'week');
check('next week is the other rotation', weekB.indexOf('Ají de gallina') > -1);
check('the minestrone is "makes four", not "cook double"', count(weekB, '<em>makes four</em>') === 1 && count(weekB, '<em>cook double</em>') === 2);

/* ---- shopping ---- */
const shop = html(run('#/shop'), 'shop');
check('the list is grouped by aisle', count(shop, 'class="aisle"') === 6 && shop.indexOf('Fruit and vegetables') > -1 && shop.indexOf('Frozen') > -1);
check('items carry a name, the Finnish name, an amount and a price',
  shop.indexOf('Chicken breast') > -1 && shop.indexOf('<span class="alt" lang="fi">Kanan filee</span>') > -1 &&
  shop.indexOf('2 × 300 g') > -1 && /\d,\d\d €/.test(shop));
check('items say what they are for', shop.indexOf('<small lang="en">Lomo saltado, light</small>') > -1);
check('the cupboard check lists staples with this week\'s use', shop.indexOf('Check the cupboard') > -1 && /Olive oil[\s\S]{0,120}this week: \d+ tbsp/.test(shop));
check('the basket has a total', /\d+ left to buy, about \d+ €/.test(shop));
check('a weekday opens this week, the weekend opens next week',
  shop.indexOf('Week A, 16 Nov') > -1 && html(run('#/shop', { now: '2026-11-21' }), 'shop').indexOf('Week B, 23 Nov') > -1);
const ticked = html(run('#/shop', { stored: { 'mesa2.checks.2026-11-16': '{"Tomaatti":1}', 'mesa2.need.2026-11-16': '{"Oliiviöljy":1}' } }), 'shop');
check('ticks and cupboard picks are restored', /data-id="Tomaatti" checked/.test(ticked) && ticked.indexOf('Cupboard, running low') > -1 && /data-need="Oliiviöljy" checked/.test(ticked));

/* ---- recipes ---- */
const recipes = run('#/recipes');
check('all 30 recipes are listed', count(recipes['#recipeList'].innerHTML, '<a class="rrow ') === 30 && recipes['#recipeCount'].textContent === '30 recipes');
check('each row shows both plates', count(recipes['#recipeList'].innerHTML, 'class="k k1"') === 30 && count(recipes['#recipeList'].innerHTML, 'class="k k2"') === 30);
check('filter chips carry pressed state', count(html(recipes, 'recipes'), 'aria-pressed="true"') === 2);

/* ---- one recipe ---- */
const salmon = html(run('#/recipe/a4/4'), 'recipe');
check('a recipe opened for four doubles the pot', salmon.indexOf('Makes 4 portions') > -1 && salmon.indexOf('>600 g<') > -1 && salmon.indexOf('>4 cloves<') > -1 && salmon.indexOf('>3 dl<') > -1);
check('…and warns that the steps were written for two', salmon.indexOf('written for 2') > -1);
const salmon2 = html(run('#/recipe/a4'), 'recipe');
check('opened plainly it is the recipe as written', salmon2.indexOf('Makes 2 portions') > -1 && salmon2.indexOf('recipe as written') > -1 && salmon2.indexOf('>300 g<') > -1 && salmon2.indexOf('written for 2') === -1);
check('ingredients and steps can be ticked', count(salmon, 'data-ing="') === 11 && count(salmon, 'data-step="') === 5);
const eggs = html(run('#/recipe/bf3'), 'recipe');
check('a breakfast written for one is made for both', eggs.indexOf('Makes 2 portions') > -1 && eggs.indexOf('>6<') > -1 && eggs.indexOf('Plus tomorrow') === -1);
check('a night-before note is shown on the recipe', html(run('#/recipe/bf4'), 'recipe').indexOf('night in the fridge') > -1);
check('an unknown recipe falls back to the list', run('#/recipe/zzz')['#recipeCount'].textContent === '30 recipes');

/* ---- us ---- */
const us = run('#/us')['#usSettings'].innerHTML;
check('both people have a target and a share', count(us, 'class="person person') === 2 && /1[\s ]700/.test(us) && /1[\s ]350/.test(us) && us.indexOf('56% of every pot') > -1);
const custom = run('#/us', { stored: { 'mesa2.people': '{"p1":{"name":"Marco","kcal":1900},"p2":{"name":"","kcal":99999}}' } })['#usSettings'].innerHTML;
check('a saved name and target are used, nonsense is ignored', custom.indexOf('value="Marco"') > -1 && /1[\s ]900/.test(custom) && custom.indexOf('value="Her"') > -1 && /1[\s ]350/.test(custom));
const calc = run('#/us', { stored: { 'mesa2.calc': '{"p1":{"sex":"m","age":"40","cm":"180","kg":"90"}}' } })['#usSettings'].innerHTML;
check('the calculator suggests a target', /about 2[\s ]380 kcal/.test(calc) && /Use 1[\s ]900 kcal/.test(calc));

/* ---- Finnish ---- */
const fiToday = html(run('#/', { lang: 'fi' }), 'today');
check('Finnish labels and dates', fiToday.indexOf('Tänä iltana') > -1 && /[Tt]iistai 17\. marraskuuta/.test(fiToday) && fiToday.indexOf('Viikko A') > -1 && fiToday.indexOf('Aamiainen') > -1);
const fiShop = html(run('#/shop', { lang: 'fi' }), 'shop');
check('Finnish shopping list, English name second', fiShop.indexOf('Hedelmät ja vihannekset') > -1 && fiShop.indexOf('Kanan filee <span class="alt" lang="en">Chicken breast</span>') > -1 && /\d+ ruukkua/.test(fiShop));
const fiRecipe = html(run('#/recipe/a4/4', { lang: 'fi' }), 'recipe');
check('Finnish recipe amounts', fiRecipe.indexOf('>4 kynttä<') > -1 && fiRecipe.indexOf('Tästä tulee 4 annosta') > -1 && fiRecipe.indexOf('Kirjolohi filee') > -1);
check('the page language follows the setting', run('#/', { lang: 'fi' }).lang === 'fi' && today.lang === 'en');

/* ---- nothing half-rendered, anywhere ---- */
const routes = ['#/week', '#/week/2026-11-23', '#/shop', '#/shop/2026-11-23', '#/recipes', '#/us'];
for (let i = 0; i < 14; i++) routes.push('#/day/' + D.MESA.iso(D.MESA.addDays(D.MESA.parseISO('2026-11-16'), i)));
D.RECIPES.forEach(r => { routes.push('#/recipe/' + r.id, '#/recipe/' + r.id + '/4'); });
const bad = [];
['en', 'fi'].forEach(lang => routes.forEach(hash => {
  try {
    const page = run(hash, { lang: lang });
    Object.keys(page).forEach(k => {
      const h = page[k] && page[k].innerHTML;
      if (h && /undefined|NaN|\[object|\{\w+\}/.test(h)) bad.push(lang + ' ' + hash + ' ' + k + ': ' + h.match(/.{0,30}(undefined|NaN|\[object|\{\w+\}).{0,20}/)[0]);
    });
  } catch (e) { bad.push(lang + ' ' + hash + ' threw ' + e.message); }
}));
check('all ' + routes.length + ' screens build cleanly in both languages', bad.length === 0, bad.slice(0, 4).join(' || '));

/* ---- a phone that cannot store anything, or has junk stored ---- */
let blocked = null;
try { blocked = run('#/shop', { blocked: true }); } catch (e) { console.log('  ' + e.message); }
check('renders with localStorage blocked', !!blocked && count(html(blocked, 'shop'), 'class="aisle"') === 6);
let junk = null;
try { junk = run('#/shop', { lang: 'xx', stored: { 'mesa2.people': '{not json', 'mesa2.checks.2026-11-16': '[1,2', 'mesa2.calc': 'null' } }); } catch (e) { console.log('  ' + e.message); }
check('renders with junk in localStorage', !!junk && html(junk, 'shop').indexOf('Shopping list') > -1);
const old = run('#/', { stored: { 'mesa2.checks.2026-09-07': '{}', 'mesa2.prep.2026-11-16': '{}', 'mesa2.week': 'A' } });
check('ticks from weeks long gone are cleared, the rest is left alone',
  old.store.getItem('mesa2.checks.2026-09-07') === null && old.store.getItem('mesa2.prep.2026-11-16') === '{}' && old.store.getItem('mesa2.week') === 'A');

done();
