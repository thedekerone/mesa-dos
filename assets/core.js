/* Mesa Dos — the arithmetic. Dates, portions, plates, the shopping list.
   Nothing in this file touches the page, so test/core.test.js can run all of it in Node. */
var MESA = (function () {
  "use strict";

  var RID = {};
  RECIPES.forEach(function (r) { RID[r.id] = r; });
  var WEEKS = Object.keys(PLAN);
  var PANTRY_BY = {};
  PANTRY.forEach(function (p) { PANTRY_BY[p.n] = p; });

  /* ---------- dates ----------
     Local dates held at noon, so a daylight-saving change never moves one to the next day. */
  function day(y, m, d) { return new Date(y, m, d, 12); }
  function atNoon(d) { return day(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { return day(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseISO(s) {
    var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(s || "");
    if (!m) return null;
    var d = day(+m[1], m[2] - 1, +m[3]);
    return d.getMonth() === m[2] - 1 && d.getDate() === +m[3] ? d : null;
  }
  function weekdayIndex(d) { return (d.getDay() + 6) % 7; }           /* Monday = 0 */
  function monday(d) { return addDays(d, -weekdayIndex(d)); }
  function daysBetween(a, b) { return Math.round((atNoon(b) - atNoon(a)) / 86400000); }

  /* which rotation week a date falls in */
  function weekOf(d) {
    var n = WEEKS.length;
    var w = Math.floor(daysBetween(parseISO(ROTATION_START), monday(d)) / 7);
    return WEEKS[((w % n) + n) % n];
  }
  function dayAt(d) {
    d = atNoon(d);
    var week = weekOf(d), index = weekdayIndex(d);
    return { date: d, iso: iso(d), week: week, index: index, plan: PLAN[week][index] };
  }

  /* ---------- a day's meals ---------- */
  function meals(pd) {
    return [
      { slot: "breakfast", r: RID[pd.bf], leftover: false },
      { slot: "lunch", r: RID[pd.lunch.leftover || pd.lunch.id], leftover: !!pd.lunch.leftover },
      { slot: "dinner", r: RID[pd.dinner], leftover: false },
      { slot: "snack", r: RID[pd.snack], leftover: false }
    ];
  }
  function dayTotals(pd) {
    var t = { kcal: 0, protein: 0 };
    meals(pd).forEach(function (m) { t.kcal += m.r.kcal; t.protein += m.r.protein; });
    if (pd.extra) { t.kcal += pd.extra.kcal; t.protein += pd.extra.protein; }
    return t;
  }
  /* the plan's average day, for one standard portion of everything */
  var AVG = (function () {
    var k = 0, p = 0, n = 0;
    WEEKS.forEach(function (w) {
      PLAN[w].forEach(function (pd) { var t = dayTotals(pd); k += t.kcal; p += t.protein; n += 1; });
    });
    return { kcal: k / n, protein: p / n };
  })();

  /* ---------- the two of you ----------
     A person's multiplier is their target over the plan's average day: 1.1 means a plate
     ten percent bigger than the recipe's standard portion, at every meal. */
  function mult(person) { return person.kcal / AVG.kcal; }
  function shares(people) {
    var sum = people.reduce(function (s, p) { return s + p.kcal; }, 0);
    return people.map(function (p) { return p.kcal / sum; });
  }
  /* How much to scale the bulk ingredients when cooking for these people. Within a few
     percent of the recipe, cook the recipe as written — nobody weighs 412 g of chicken. */
  function size(people) {
    var m = people.reduce(function (s, p) { return s + mult(p); }, 0) / people.length;
    return people.length > 1 && Math.abs(m - 1) < 0.035 ? 1 : m;
  }

  /* ---------- cooking ---------- */
  /* the dinner a day's lunch is made from, if any */
  function lunchFrom(pd) {
    if (pd.lunch.leftover) return pd.lunch.leftover;
    var r = RID[pd.lunch.id];
    return (r && r.from) || null;
  }
  /* portions tonight's dinner has to make: two plates, and two more when tomorrow's lunch
     is the same pot */
  function dinnerPortions(date) {
    var today = dayAt(date), next = dayAt(addDays(date, 1));
    return lunchFrom(next.plan) === today.plan.dinner ? 4 : 2;
  }

  var FRACTION = { "½": 0.5, "¼": 0.25, "¾": 0.75 };
  function num(n) {
    if (typeof n === "number") return n;
    if (n === "" || n == null) return null;
    if (FRACTION[n] != null) return FRACTION[n];
    var v = parseFloat(String(n).replace(",", "."));
    return isNaN(v) ? null : v;
  }
  var UNIT_ALIAS = { "viipaletta": "viipale" };
  function unitOf(ing) { return UNIT_ALIAS[ing.u] || ing.u || ""; }

  /* An ingredient's amount for `batches` times the recipe. Only bulk items (s:1) follow
     the plate size; "2 cloves" and "1 tbsp" follow the batch count alone. null = to taste. */
  function amount(ing, batches, sz) {
    var n = num(ing.n);
    return n == null ? null : n * batches * (ing.s ? sz : 1);
  }
  function roundAmount(v, u) {
    if (u === "g" || u === "ml") {
      if (v >= 100) return Math.round(v / 10) * 10;
      if (v >= 20) return Math.round(v / 5) * 5;
      return Math.max(1, Math.round(v));
    }
    return Math.max(0.25, Math.round(v * 4) / 4);       /* pieces, spoons, dl: quarters */
  }
  function fmtNumber(v, lang) {
    var whole = Math.floor(v + 1e-9), frac = v - whole;
    var sym = Math.abs(frac - 0.25) < 0.01 ? "¼" : Math.abs(frac - 0.5) < 0.01 ? "½" : Math.abs(frac - 0.75) < 0.01 ? "¾" : "";
    if (sym) return (whole ? whole : "") + sym;
    if (frac < 0.01) return String(whole);
    var s = String(Math.round(v * 10) / 10);
    return lang === "fi" ? s.replace(".", ",") : s;
  }
  function unitText(u, n, lang, bare) {
    var f = UNITS[u];
    if (!f) return lang === "en" ? enOf(u) : u;
    if (lang === "en") return bare && u === "kpl" ? "" : f.en[n <= 1 ? 0 : 1];
    return f.fi[n === 1 ? 0 : 1];
  }
  /* "300 g", "4 cloves", "to taste" */
  function qtyText(ing, batches, sz, lang) {
    var u = unitOf(ing), a = amount(ing, batches, sz);
    if (a == null) return lang === "en" ? enOf(ing.u || "") : (ing.u || "");
    a = roundAmount(a, u);
    if ((u === "g" || u === "ml") && a >= 1000) return weight(a, u, lang);
    var ut = unitText(u, a, lang, true);
    return fmtNumber(a, lang) + (ut ? " " + ut : "");
  }

  /* ---------- names ---------- */
  function enOf(s) {
    if (s == null || s === "") return s;
    if (I18N[s]) return I18N[s];
    var o = String(s);
    for (var i = 0; i < I18N_WORDS.length; i++) o = o.replace(I18N_WORDS[i][0], I18N_WORDS[i][1]);
    return o;
  }

  /* ---------- the shopping list ---------- */
  /* everything that gets cooked in the week starting on `mon`, with how many batches */
  function weekCooking(mon) {
    var out = [];
    for (var i = 0; i < 7; i++) {
      var d = addDays(mon, i), pd = dayAt(d).plan;
      var bf = RID[pd.bf], sn = RID[pd.snack], dn = RID[pd.dinner];
      out.push({ name: bf.name, items: bf.ingredients, batches: 2 / bf.serves });
      if (pd.lunch.id) {
        var ln = RID[pd.lunch.id];
        out.push({ name: ln.name, items: ln.ingredients, batches: 2 / ln.serves });
      }
      out.push({ name: dn.name, items: dn.ingredients, batches: dinnerPortions(d) / dn.serves });
      out.push({ name: sn.name, items: sn.ingredients, batches: 2 / sn.serves });
      if (pd.extra) out.push({ name: pd.extra.text, items: pd.extra.items, batches: 2 });
    }
    return out;
  }

  /* Turn one ingredient line into products. Calls put(name, amountOrNull, unit). Returns
     an error string when the line cannot be resolved — test/core.test.js allows none. */
  function resolve(ing, batches, sz, put) {
    var t = ing.t;
    var target = Object.prototype.hasOwnProperty.call(BUY, t) ? BUY[t] : t;
    if (target === null) return null;
    if (Array.isArray(target)) {
      for (var i = 0; i < target.length; i++) {
        var name = target[i][0];
        if (!PRODUCTS[name] && !PANTRY_BY[name]) return t + ": unknown product " + name;
        put(name, PRODUCTS[name] ? target[i][1] * batches : null, null);
      }
      return null;
    }
    var n = num(ing.n), u = unitOf(ing), k = batches * (ing.s ? sz : 1);
    var prod = PRODUCTS[target];
    if (prod) {
      var per = prod.per || {};
      if (n == null) { if (per[u] == null) return t + ": no amount"; n = 1; }
      if (u !== prod.u && per[u] == null) return t + ": cannot turn " + u + " into " + prod.u;
      put(target, (per[u] != null ? n * per[u] : n) * k, null);
      return null;
    }
    if (PANTRY_BY[target]) { put(target, n == null ? null : n * k, u); return null; }
    return t + ": not a product, not in the pantry, not in BUY";
  }

  function shoppingList(mon, people) {
    var sz = size(people), need = {}, cupboard = {}, errors = [];
    weekCooking(mon).forEach(function (c) {
      c.items.forEach(function (ing) {
        var err = resolve(ing, c.batches, sz, function (name, amt, unit) {
          if (PRODUCTS[name]) {
            var e = need[name] || (need[name] = { amount: 0, uses: [] });
            e.amount += amt;
            if (e.uses.indexOf(c.name) < 0) e.uses.push(c.name);
          } else {
            var p = cupboard[name] || (cupboard[name] = { amounts: {}, uses: [] });
            if (amt != null) p.amounts[unit] = (p.amounts[unit] || 0) + amt;
            if (p.uses.indexOf(c.name) < 0) p.uses.push(c.name);
          }
        });
        if (err) errors.push(c.name + " — " + err);
      });
    });

    var total = 0, count = 0;
    var aisles = AISLE_ORDER.map(function (aisle, ai) {
      var items = [];
      Object.keys(PRODUCTS).forEach(function (name) {
        var prod = PRODUCTS[name], e = need[name];
        if (!e || prod.a !== ai) return;
        var pack = prod.pack || 1;
        /* round up to whole packs, but do not buy a second pack for the last few grams */
        var packs = Math.max(1, Math.ceil((e.amount - 0.08 * pack) / pack));
        var price = packs * prod.p;
        total += price; count += 1;
        items.push({ name: name, prod: prod, need: e.amount, packs: packs, amount: packs * pack, price: price, uses: e.uses });
      });
      return { aisle: aisle, items: items };
    }).filter(function (a) { return a.items.length; });

    var pantry = PANTRY.filter(function (p) { return cupboard[p.n]; }).map(function (p) {
      return { name: p.n, item: p, amounts: cupboard[p.n].amounts, uses: cupboard[p.n].uses };
    });
    return { aisles: aisles, pantry: pantry, total: total, count: count, errors: errors };
  }

  /* "800 g", "2 × 500 g", "3 tins", "9 pcs" */
  function weight(v, u, lang) {
    if (v >= 1000) return fmtNumber(v / 1000, lang) + " " + (u === "g" ? "kg" : "l");
    return v + " " + u;
  }
  function buyText(item, lang) {
    var prod = item.prod;
    if (prod.sold) return item.packs + " " + unitText(prod.sold, item.packs, lang);
    if (prod.u === "g" || prod.u === "ml") {
      if (prod.loose || item.packs === 1) return weight(item.amount, prod.u, lang);
      return item.packs + " × " + weight(prod.pack, prod.u, lang);
    }
    return item.amount + " " + unitText(prod.u, item.amount, lang);
  }
  /* what the week takes out of a cupboard staple: "about 5 dl" */
  function pantryText(p, lang) {
    if (p.item.mix) return "";                /* "spices": several things, no one amount */
    var amounts = {};
    Object.keys(p.amounts).forEach(function (u) { amounts[u] = p.amounts[u]; });
    if (amounts.tl && amounts.rkl) { amounts.rkl += amounts.tl / 3; delete amounts.tl; }
    if (amounts.ml && amounts.l) { amounts.l += amounts.ml / 1000; delete amounts.ml; }
    return Object.keys(amounts).map(function (u) {
      var a = roundAmount(amounts[u], u), ut = unitText(u, a, lang);
      return fmtNumber(a, lang) + (ut ? " " + ut : "");
    }).join(" + ");
  }

  /* ---------- the night before ---------- */
  function prep(date) {
    var today = dayAt(date), next = dayAt(addDays(date, 1)), out = [];
    if (lunchFrom(next.plan) === today.plan.dinner) {
      out.push({ kind: "box", r: RID[today.plan.dinner] });
    }
    meals(next.plan).forEach(function (m) {
      if (!m.leftover && m.r.ahead) out.push({ kind: "ahead", r: m.r, slot: m.slot });
    });
    return out;
  }

  /* ---------- a target from a body ----------
     Mifflin-St Jeor resting energy times an activity factor gives maintenance. The cut
     depends on how much there is to lose: a fifth off from BMI 27.5 up, 15 % from BMI 22,
     nothing below that. Never more than 500 kcal, never under a floor. */
  var ACTIVITY = { low: 1.3, some: 1.45, high: 1.6 };
  function maintenance(b) {
    var rest = 10 * b.kg + 6.25 * b.cm - 5 * b.age + (b.sex === "f" ? -161 : 5);
    return rest * (ACTIVITY[b.activity] || ACTIVITY.low);
  }
  function suggest(b) {
    var m = maintenance(b), bmi = b.kg / Math.pow(b.cm / 100, 2);
    var cut = bmi >= 27.5 ? 0.2 : bmi >= 22 ? 0.15 : 0;
    var target = Math.max(m - Math.min(500, m * cut), b.sex === "f" ? 1200 : 1500);
    return { maintenance: Math.round(m / 10) * 10, target: Math.round(target / 50) * 50, cut: cut };
  }

  return {
    RID: RID, WEEKS: WEEKS, AVG: AVG,
    atNoon: atNoon, addDays: addDays, iso: iso, parseISO: parseISO, monday: monday,
    daysBetween: daysBetween, weekOf: weekOf, dayAt: dayAt,
    meals: meals, dayTotals: dayTotals, mult: mult, shares: shares, size: size,
    lunchFrom: lunchFrom, dinnerPortions: dinnerPortions,
    num: num, amount: amount, qtyText: qtyText, fmtNumber: fmtNumber, unitText: unitText, enOf: enOf,
    weekCooking: weekCooking, shoppingList: shoppingList, buyText: buyText, pantryText: pantryText,
    prep: prep, maintenance: maintenance, suggest: suggest
  };
})();
