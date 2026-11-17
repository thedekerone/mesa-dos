#!/usr/bin/env node
/* The arithmetic in core.js: which day it is, how much to cook, who gets how much, and
   what the shop has to sell you. If the numbers on the page look wrong, start here. */
const { load, reporter } = require('./load');
const D = load();
const { MESA: M, PEOPLE, PLAN, RECIPES, PRODUCTS, ROTATION_START } = D;
const { check, done } = reporter();
const d = s => M.parseISO(s);
const near = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-9);

/* ---- dates and the rotation ---- */
const start = d(ROTATION_START);
check('the rotation starts on week A', M.weekOf(start) === 'A' && M.weekOf(M.addDays(start, 6)) === 'A');
check('the week after is B, the one after that A again',
  M.weekOf(M.addDays(start, 7)) === 'B' && M.weekOf(M.addDays(start, 14)) === 'A');
check('weeks before the start still alternate', M.weekOf(M.addDays(start, -1)) === 'B' && M.weekOf(M.addDays(start, -8)) === 'A');
check('a date knows its weekday and plan day',
  M.dayAt(M.addDays(start, 1)).index === 1 && M.dayAt(M.addDays(start, 1)).plan === PLAN.A[1]);
check('the rotation survives a daylight-saving change',
  M.weekOf(d('2027-03-28')) !== M.weekOf(d('2027-03-29')) && M.daysBetween(d('2027-03-27'), d('2027-03-29')) === 2);
check('bad dates are rejected', d('2026-02-30') === null && d('nonsense') === null && d('') === null);

/* ---- how much to cook ---- */
check('a dinner that is tomorrow\'s lunch makes four portions', M.dinnerPortions(start) === 4);
check('a dinner that is not makes two', M.dinnerPortions(M.addDays(start, 2)) === 2);
const minestrone = M.addDays(start, 9);          /* week B Wednesday */
check('the minestrone feeds the next day\'s soup lunch',
  M.dayAt(minestrone).plan.dinner === 'b5' && M.dinnerPortions(minestrone) === 4 && 4 / M.RID.b5.serves === 1);
check('Sunday looks across into next week\'s Monday', M.dinnerPortions(M.addDays(start, 6)) === 2);

/* ---- the two plates ---- */
const sh = M.shares(PEOPLE);
check('shares add up to one', near(sh[0] + sh[1], 1));
check('a higher target is a bigger share', (PEOPLE[0].kcal > PEOPLE[1].kcal) === (sh[0] > sh[1]));
const mean = (M.mult(PEOPLE[0]) + M.mult(PEOPLE[1])) / 2;
check('the average day scaled by a multiplier lands on the target',
  PEOPLE.every(p => near(M.AVG.kcal * M.mult(p), p.kcal, 0.001)));
check('close to the recipe means cook the recipe as written', Math.abs(mean - 1) >= 0.035 || M.size(PEOPLE) === 1);
check('far from it scales the pot', near(M.size([{ kcal: 2200 }, { kcal: 1700 }]), 1950 / M.AVG.kcal, 0.001));
check('one person alone always gets their own size', near(M.size([PEOPLE[0]]), M.mult(PEOPLE[0])));
const off = [];
Object.keys(PLAN).forEach(w => PLAN[w].forEach(pd => {
  const k = M.dayTotals(pd).kcal;
  if (Math.abs(k / M.AVG.kcal - 1) > 0.08) off.push(w + ' ' + pd.day + ' ' + k);
}));
check('no day strays more than 8% from the average', off.length === 0, off.join('; '));

/* ---- amounts on the recipe screen ---- */
const q = (ing, b, s, lang) => M.qtyText(ing, b, s, lang);
check('bulk amounts double', q({ t: 'x', n: 300, u: 'g', s: 1 }, 2, 1, 'en') === '600 g');
check('bulk amounts follow the plate size', q({ t: 'x', n: 250, u: 'g', s: 1 }, 1, 1.1, 'en') === '280 g');
check('counts double but ignore the plate size', q({ t: 'x', n: 2, u: 'kynttä' }, 2, 1.2, 'en') === '4 cloves');
check('one clove is singular', q({ t: 'x', n: 2, u: 'kynttä' }, 0.5, 1, 'en') === '1 clove');
check('Finnish takes the partitive', q({ t: 'x', n: 1, u: 'ruukku' }, 2, 1, 'fi') === '2 ruukkua' && q({ t: 'x', n: 1, u: 'ruukku' }, 1, 1, 'fi') === '1 ruukku');
check('fractions are read and written', q({ t: 'x', n: '½', u: 'kpl' }, 0.5, 1, 'en') === '¼' && q({ t: 'x', n: 1.5, u: 'dl' }, 1, 1, 'fi') === '1½ dl');
check('English leaves "pieces" unsaid, Finnish does not', q({ t: 'x', n: 3, u: 'kpl' }, 2, 1, 'en') === '6' && q({ t: 'x', n: 3, u: 'kpl' }, 2, 1, 'fi') === '6 kpl');
check('a kilo is a kilo', q({ t: 'x', n: 500, u: 'g', s: 1 }, 2, 1, 'en') === '1 kg' && q({ t: 'x', n: 600, u: 'g', s: 1 }, 2, 1, 'fi') === '1,2 kg');
check('"to taste" stays words', q({ t: 'x', n: '', u: 'maun mukaan' }, 2, 1, 'en') === 'to taste' && q({ t: 'x', n: '', u: 'maun mukaan' }, 2, 1, 'fi') === 'maun mukaan');
check('slices have one unit however the recipe spells it', q({ t: 'x', n: 2, u: 'viipaletta' }, 1, 1, 'en') === '2 slices' && q({ t: 'x', n: 1, u: 'viipale' }, 1, 1, 'fi') === '1 viipale');

/* ---- the shopping list ---- */
const lists = [M.shoppingList(start, PEOPLE), M.shoppingList(M.addDays(start, 7), PEOPLE)];
check('every ingredient on the plan turns into something to buy',
  lists.every(l => l.errors.length === 0), lists.map(l => l.errors.join('; ')).join(' | '));
const bigger = M.shoppingList(start, [{ kcal: 2400 }, { kcal: 1900 }]);
check('…at other plate sizes too', bigger.errors.length === 0, bigger.errors.join('; '));
check('bigger plates buy more', bigger.total > lists[0].total);

const item = (l, name) => l.aisles.reduce((f, a) => f || a.items.filter(i => i.name === name)[0], null);
const beef = item(lists[0], 'Naudan paistisuikale');
check('a doubled dinner buys double', !!beef && beef.packs === 2 && beef.amount === 600, beef && JSON.stringify([beef.need, beef.packs]));
const eggsNeed = item(lists[0], 'Kananmuna');
check('breakfasts and snacks are bought for both of you', !!eggsNeed && eggsNeed.need >= 20 && eggsNeed.amount % 10 === 0);
check('a few grams over does not buy another pack',
  (function () { const l = M.shoppingList(start, [{ kcal: M.AVG.kcal * 1.06 }, { kcal: M.AVG.kcal * 1.06 }]); const c = item(l, 'Kanan reisikoipi, luuton'); return c.need > 600 && c.packs === 1; })());
check('items come out in aisle order', lists.every(l => l.aisles.every((a, i) => i === 0 || D.AISLE_ORDER.indexOf(a.aisle) > D.AISLE_ORDER.indexOf(l.aisles[i - 1].aisle))));
check('nothing costs nothing', lists.every(l => l.total > 50 && l.aisles.every(a => a.items.every(i => i.price > 0 && i.packs >= 1 && i.uses.length))));
check('the minestrone week buys its tins', !!item(lists[1], 'Tomaattimurska') && !item(lists[0], 'Tomaattimurska'));
check('last night\'s soup is not bought again', !lists[1].errors.length && !item(lists[1], 'Minestrone (edelliseltä illalta)'));
check('the cupboard knows what the week uses',
  lists[0].pantry.some(p => p.name === 'Oliiviöljy') && lists[1].pantry.some(p => p.name === 'Riisinuudeli') && !lists[0].pantry.some(p => p.name === 'Riisinuudeli'));
const fmt = (l, name, lang) => M.buyText(item(l, name), lang);
check('quantities read like a shelf label',
  fmt(lists[0], 'Naudan paistisuikale', 'en') === '2 × 300 g' && fmt(lists[0], 'Peruna, jauhoinen', 'fi') === '1 kg' &&
  /^\d+ ruukkua$/.test(fmt(lists[0], 'Korianteri', 'fi')) && /^\d+ pots$/.test(fmt(lists[0], 'Korianteri', 'en')) &&
  /^\d+ pcs$/.test(fmt(lists[0], 'Tomaatti', 'en')) && /^\d+ kpl$/.test(fmt(lists[0], 'Tomaatti', 'fi')),
  [fmt(lists[0], 'Naudan paistisuikale', 'en'), fmt(lists[0], 'Peruna, jauhoinen', 'fi'), fmt(lists[0], 'Korianteri', 'fi'), fmt(lists[0], 'Tomaatti', 'en')].join(' | '));
const oil = lists[0].pantry.filter(p => p.name === 'Oliiviöljy')[0];
check('spoons of the same thing are added together', /^\d+[¼½¾]? tbsp$/.test(M.pantryText(oil, 'en')), M.pantryText(oil, 'en'));
check('every product is bought in some week', Object.keys(PRODUCTS).every(n => item(lists[0], n) || item(lists[1], n)),
  Object.keys(PRODUCTS).filter(n => !item(lists[0], n) && !item(lists[1], n)).join(', '));

/* ---- the night before ---- */
const tue = M.addDays(start, 1), hints = M.prep(tue);
check('the evening before lists what tomorrow needs',
  hints.some(h => h.kind === 'box' && h.r.id === 'a4') && hints.some(h => h.kind === 'ahead' && h.r.id === 'bf4'),
  hints.map(h => h.kind + ':' + h.r.id).join(', '));
check('an evening with nothing to do says nothing', M.prep(M.addDays(start, 2)).every(h => h.kind !== 'box'));

/* ---- a target from a body ---- */
const big = M.suggest({ sex: 'm', kg: 90, cm: 180, age: 40, activity: 'low' });
check('a fifth comes off when there is plenty to lose', big.cut === 0.2 && big.target === 1900 && big.maintenance === 2380, JSON.stringify(big));
const mid = M.suggest({ sex: 'f', kg: 68, cm: 165, age: 35, activity: 'some' });
check('less comes off when there is less to lose', mid.cut === 0.15 && mid.target < mid.maintenance);
const slim = M.suggest({ sex: 'f', kg: 50, cm: 155, age: 60, activity: 'low' });
check('nothing comes off a low BMI', slim.cut === 0 && Math.abs(slim.target - slim.maintenance) <= 25, JSON.stringify(slim));
check('the target never goes under the floor',
  M.suggest({ sex: 'f', kg: 60, cm: 150, age: 70, activity: 'low' }).target === 1200 &&
  M.suggest({ sex: 'm', kg: 62, cm: 150, age: 80, activity: 'low' }).target === 1500);
check('more activity means more food', M.suggest({ sex: 'm', kg: 90, cm: 180, age: 40, activity: 'high' }).target > big.target);

done();
