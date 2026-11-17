#!/usr/bin/env node
/* The arithmetic in core.js: how a week is dealt, how much to cook, who gets how much, and
   what the shop has to sell you. If the numbers on the page look wrong, start here. */
const { load, reporter } = require('./load');
const D = load();
const { MESA: M, PEOPLE, RECIPES, PRODUCTS, ROTATION_START, COOK_DOUBLE } = D;
const { check, done } = reporter();
const d = s => M.parseISO(s);
const near = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-9);
const start = d(ROTATION_START);
const YEARS = 104;                                   /* weeks checked: two years */
const mondays = Array.from({ length: YEARS }, (_, w) => M.addDays(start, w * 7));
const allDays = [];
mondays.forEach(mon => { for (let i = 0; i < 7; i++) allDays.push(M.addDays(mon, i)); });
const findDay = pred => allDays.filter(x => pred(M.dayAt(x), x))[0];

/* ---- dates ---- */
check('ISO week numbers, including the year ends',
  [['2026-11-17', 47], ['2026-12-31', 53], ['2027-01-03', 53], ['2027-01-04', 1], ['2025-12-29', 1], ['2024-12-30', 1]].every(x => M.weekOf(d(x[0])) === x[1]));
check('a daylight-saving change does not move a day', M.daysBetween(d('2027-03-27'), d('2027-03-29')) === 2 && M.dayAt(d('2027-03-28')).index === 6);
check('bad dates are rejected', d('2026-02-30') === null && d('nonsense') === null && d('') === null);

/* ---- dealing a week ---- */
const again = load().MESA;
check('the same date always deals the same week (both phones agree)',
  mondays.slice(0, 12).every(mon => JSON.stringify(M.weekPlan(mon)) === JSON.stringify(again.weekPlan(mon))));
check('any day of a week gives that week', JSON.stringify(M.weekPlan(M.addDays(start, 3))) === JSON.stringify(M.weekPlan(start)));
check('a week is seven different dinners', mondays.every(mon => new Set(M.weekPlan(mon).map(p => p.dinner)).size === 7));
const last = {}, counts = {};
let minGap = 99;
mondays.forEach((mon, w) => M.weekPlan(mon).forEach(pd => {
  if (last[pd.dinner] != null) minGap = Math.min(minGap, w - last[pd.dinner]);
  last[pd.dinner] = w; counts[pd.dinner] = (counts[pd.dinner] || 0) + 1;
}));
const dinners = RECIPES.filter(r => r.meal === 'dinner');
check('no dinner comes back within three weeks', minGap >= 3, 'closest repeat: ' + minGap + ' weeks');
check('every dinner gets cooked, none much more than the others',
  dinners.every(r => counts[r.id]) && Math.max(...Object.values(counts)) <= 1.5 * Math.min(...Object.values(counts)),
  dinners.filter(r => !counts[r.id]).map(r => r.id).join(', ') + ' ' + Math.min(...Object.values(counts)) + '–' + Math.max(...Object.values(counts)));
const kinds = mon => { const k = {}; M.weekPlan(mon).forEach(pd => { const m = M.RID[pd.dinner].main; k[m] = (k[m] || 0) + 1; }); return k; };
check('every week has fish and a meatless dinner, and is not all chicken',
  mondays.every(mon => { const k = kinds(mon); return k.fish >= 1 && k.veg >= 1 && (k.chicken || 0) <= 4; }));
const seenOther = new Set();
mondays.slice(0, 12).forEach(mon => M.weekPlan(mon).forEach(pd => [pd.bf, pd.snack, pd.lunch.id].forEach(x => x && seenOther.add(x))));
const idle = RECIPES.filter(r => r.meal !== 'dinner' && !seenOther.has(r.id)).map(r => r.id);
check('every breakfast, lunch and snack turns up within twelve weeks', idle.length === 0, idle.join(', '));
check('a week uses at most four breakfasts and four snacks, to keep the shop short',
  mondays.every(mon => new Set(M.weekPlan(mon).map(p => p.bf)).size <= 4 && new Set(M.weekPlan(mon).map(p => p.snack)).size <= 4));
check('weeks before the rotation started still deal', M.weekPlan(M.addDays(start, -70)).length === 7);

/* ---- leftovers ---- */
const badLeft = [];
mondays.forEach(mon => M.weekPlan(mon).forEach((pd, i, days) => {
  const src = M.lunchFrom(pd);
  if (!src) return;
  if (i === 0 || days[i - 1].dinner !== src || !M.RID[src].keeps || COOK_DOUBLE.indexOf(i - 1) < 0) badLeft.push(M.iso(mon) + ' day ' + i);
}));
check('a leftover lunch is always last night\'s dinner, and a dish that keeps', badLeft.length === 0, badLeft.slice(0, 3).join('; '));
check('Monday lunch is never a leftover, so a week\'s shopping covers the week', mondays.every(mon => !M.lunchFrom(M.weekPlan(mon)[0])));
const doubled = findDay((x, date) => M.dinnerPortions(date) === 4 && M.RID[x.plan.dinner].serves === 2);
const single = findDay((x, date) => M.dinnerPortions(date) === 2);
check('a dinner that is tomorrow\'s lunch makes four portions, one that is not makes two', !!doubled && !!single);
const pot = findDay(x => x.plan.dinner === 'b5' && COOK_DOUBLE.indexOf(x.index) > -1);
check('the minestrone feeds the next day\'s soup lunch without doubling',
  !!pot && M.dinnerPortions(pot) === 4 && M.dayAt(M.addDays(pot, 1)).plan.lunch.id === 'ln3' && 4 / M.RID.b5.serves === 1);
check('Sunday dinner is never doubled into next week', mondays.every(mon => M.dinnerPortions(M.addDays(mon, 6)) === 2));

/* ---- the two plates ---- */
const sh = M.shares(PEOPLE);
check('shares add up to one', near(sh[0] + sh[1], 1));
check('a higher target is a bigger share', (PEOPLE[0].kcal > PEOPLE[1].kcal) === (sh[0] > sh[1]));
check('the average day scaled by a multiplier lands on the target', PEOPLE.every(p => near(M.AVG.kcal * M.mult(p), p.kcal, 0.001)));
const mean = (M.mult(PEOPLE[0]) + M.mult(PEOPLE[1])) / 2;
check('close to the recipe means cook the recipe as written', Math.abs(mean - 1) >= 0.035 || M.size(PEOPLE) === 1);
check('far from it scales the pot', near(M.size([{ kcal: 2200 }, { kcal: 1700 }]), 1950 / M.AVG.kcal, 0.001));
check('one person alone always gets their own size', near(M.size([PEOPLE[0]]), M.mult(PEOPLE[0])));
const off = allDays.map(x => M.dayTotals(M.dayAt(x).plan).kcal / M.AVG.kcal).filter(r => Math.abs(r - 1) > 0.12);
check('no day in two years strays more than 12% from the average', off.length === 0, off.length + ' days, worst ' + Math.max(...off.map(r => Math.abs(r - 1))).toFixed(2));
check('the long-run average is the average the targets are scaled by',
  near(allDays.reduce((s, x) => s + M.dayTotals(M.dayAt(x).plan).kcal, 0) / allDays.length, M.AVG.kcal, M.AVG.kcal * 0.02));

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
const lists = mondays.map(mon => M.shoppingList(mon, PEOPLE));
const errors = [].concat(...lists.map(l => l.errors));
check('every ingredient of every week in two years turns into something to buy', errors.length === 0, [...new Set(errors)].slice(0, 5).join('; '));
const bigger = M.shoppingList(start, [{ kcal: 2400 }, { kcal: 1900 }]);
check('bigger plates buy more', bigger.errors.length === 0 && bigger.total > lists[0].total);
const item = (l, name) => l.aisles.reduce((f, a) => f || a.items.filter(i => i.name === name)[0], null);
const cooking = M.weekCooking(M.monday(doubled));
const dn = M.RID[M.dayAt(doubled).plan.dinner];
check('a doubled dinner is cooked as two batches', cooking.some(c => c.name === dn.name && c.batches === 2));
check('breakfasts and snacks are bought for both of you', cooking.filter(c => c.name === M.RID[M.weekPlan(doubled)[0].bf].name).every(c => c.batches === 2));
check('leftover lunches are not bought twice', mondays.slice(0, 8).every(mon => M.weekCooking(mon).length === 7 * 3 + M.weekPlan(mon).filter(p => p.lunch.id).length + M.weekPlan(mon).filter(p => p.extra).length));
check('a few grams over does not buy another pack', (function () {
  const over = [{ kcal: M.AVG.kcal * 1.06 }, { kcal: M.AVG.kcal * 1.06 }];
  return mondays.some(mon => { const c = item(M.shoppingList(mon, over), 'Kanan reisikoipi, luuton'); return c && c.need > 600 && c.need < 650 && c.packs === 1; });
})());
check('items come out in aisle order', lists.every(l => l.aisles.every((a, i) => i === 0 || D.AISLE_ORDER.indexOf(a.aisle) > D.AISLE_ORDER.indexOf(l.aisles[i - 1].aisle))));
check('nothing costs nothing', lists.every(l => l.total > 50 && l.aisles.every(a => a.items.every(i => i.price > 0 && i.packs >= 1 && i.uses.length))));
const never = Object.keys(PRODUCTS).filter(n => !lists.slice(0, 16).some(l => item(l, n)));
check('every product is bought in some week', never.length === 0, never.join(', '));
check('the cupboard knows what the week uses', lists.every(l => l.pantry.length > 3 && l.pantry.every(p => p.uses.length)));
const withBeef = lists.filter(l => item(l, 'Naudan paistisuikale'))[0], withHerb = lists.filter(l => item(l, 'Korianteri'))[0], anyList = lists[0];
const fmt = (l, name, lang) => M.buyText(item(l, name), lang);
check('quantities read like a shelf label',
  /^(300 g|\d × 300 g)$/.test(fmt(withBeef, 'Naudan paistisuikale', 'en')) &&
  /^\d+ ruukkua?$/.test(fmt(withHerb, 'Korianteri', 'fi')) && /^\d+ pots?$/.test(fmt(withHerb, 'Korianteri', 'en')) &&
  /^\d+ pcs?$/.test(fmt(anyList, 'Tomaatti', 'en')) && /^\d+ kpl$/.test(fmt(anyList, 'Tomaatti', 'fi')),
  [fmt(withBeef, 'Naudan paistisuikale', 'en'), fmt(withHerb, 'Korianteri', 'fi'), fmt(anyList, 'Tomaatti', 'en')].join(' | '));
const oil = anyList.pantry.filter(p => p.name === 'Oliiviöljy')[0];
check('spoons of the same thing are added together', !!oil && /^\d+[¼½¾]? (tbsp|tsp)$/.test(M.pantryText(oil, 'en')), oil && M.pantryText(oil, 'en'));

/* ---- the night before ---- */
const boxDay = M.addDays(findDay((x, date) => !!x.plan.lunch.leftover), -1);
check('the evening before a leftover lunch says to box it', M.prep(boxDay).some(h => h.kind === 'box' && h.r.id === M.dayAt(boxDay).plan.dinner));
const oatsEve = M.addDays(findDay(x => x.plan.bf === 'bf4' && x.index > 0), -1);
check('the evening before overnight oats says to make them', M.prep(oatsEve).some(h => h.kind === 'ahead' && h.r.id === 'bf4'));
check('an evening before a made lunch does not say to box anything', M.prep(M.addDays(findDay(x => x.index > 0 && !M.lunchFrom(x.plan)), -1)).every(h => h.kind !== 'box'));

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
