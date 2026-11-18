/* Mesa Dos — the arithmetic. Dates, portions, plates, the shopping list.
   Nothing in this file touches the page, so test/core.test.js can run all of it in Node. */
var MESA = (function () {
  "use strict";

  var RID = {};
  RECIPES.forEach(function (r) { RID[r.id] = r; });
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

  /* ISO week number: the label people use for a week in Finland */
  function weekOf(d) {
    var t = atNoon(d);
    t = addDays(t, 3 - weekdayIndex(t));                     /* Thursday of this week */
    return 1 + Math.round(daysBetween(day(t.getFullYear(), 0, 4), t) / 7 - 0.01 + ((weekdayIndex(day(t.getFullYear(), 0, 4)) - 3) / 7));
  }

  /* ---------- dealing a week ----------
     Everything here depends only on the date, so two phones always deal the same week. */
  function rng(seed) {                                       /* mulberry32 */
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffled(list, rand) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }
  function ofMeal(meal) { return RECIPES.filter(function (r) { return r.meal === meal; }); }
  var DINNERS = ofMeal("dinner");
  var CYCLE = Math.floor(DINNERS.length / 7);                /* weeks before a dinner can repeat */
  function weekIndex(mon) { return Math.floor(daysBetween(parseISO(ROTATION_START), monday(mon)) / 7); }

  /* One cycle: every dinner dealt into CYCLE weeks of seven. Dinners are dealt by kind
     (fish, chicken, beef, meatless…) so each week gets its share of each. */
  var cycles = {};
  function cycleWeeks(c) {
    if (cycles[c]) return cycles[c];
    var rand = rng(7919 * (c + 1000)), groups = {}, order = [];
    DINNERS.forEach(function (r) {
      var k = r.main || "other";
      if (!groups[k]) { groups[k] = []; order.push(k); }
      groups[k].push(r);
    });
    order.sort(function (x, y) { return groups[y].length - groups[x].length || (x < y ? -1 : 1); });
    var weeks = [], n = 0, i;
    for (i = 0; i < CYCLE; i++) weeks.push([]);
    order.forEach(function (k) {
      shuffled(groups[k], rand).forEach(function (r) { weeks[n++ % CYCLE].push(r); });
    });
    /* more dinners than seven a week can hold: leave one out, from whatever kind that week
       has most of, so it is never the same dish that sits a cycle out */
    weeks.forEach(function (w) {
      while (w.length > 7) {
        var count = {}, top = null;
        w.forEach(function (r) { count[r.main] = (count[r.main] || 0) + 1; if (!top || count[r.main] > count[top]) top = r.main; });
        var of = w.filter(function (r) { return r.main === top; });
        w.splice(w.indexOf(of[Math.floor(rand() * of.length)]), 1);
      }
    });
    /* Where one cycle meets the next, a dinner eaten in the last weeks could be dealt
       straight back. Swap those further down the new cycle, so nothing returns within
       three weeks. */
    if (c > 0 && CYCLE > 2) {
      var prev = cycleWeeks(c - 1);
      /* what was eaten less than three weeks before week w of this cycle */
      var recentFor = function (w) {
        var out = [];
        for (var b = CYCLE + w - 2; b < CYCLE; b++) if (b >= 0) out = out.concat(prev[b]);
        return out;
      };
      for (var w = 0; w < 2; w++) {
        var recent = recentFor(w);
        weeks[w].forEach(function (r, at) {
          if (recent.indexOf(r) < 0) return;
          /* first try to swap like for like (fish for fish), then anything */
          for (var pass = 0; pass < 2; pass++) {
            for (var later = CYCLE - 1; later > w; later--) {
              if (recentFor(later).indexOf(r) > -1) continue;
              var cand = weeks[later];
              for (var j = 0; j < cand.length; j++) {
                if (recent.indexOf(cand[j]) > -1 || (pass === 0 && cand[j].main !== r.main)) continue;
                weeks[w][at] = cand[j]; cand[j] = r;
                return;
              }
            }
          }
        });
      }
    }
    return (cycles[c] = weeks);
  }

  /* ---------- rerolls ----------
     A week can be changed from what was dealt: seven digits, one per day, each saying how
     many times that day's dinner has been rerolled. "0000000" is the dealt week. The code
     is all there is to it, so it fits in a link and the other phone can be sent it. */
  var swaps = {};
  function cleanCode(code) {
    code = /^\d{7}$/.test(code || "") ? code : "0000000";
    return code;
  }
  function setSwaps(mon, code) {
    code = cleanCode(code);
    if (code === "0000000") delete swaps[iso(monday(mon))]; else swaps[iso(monday(mon))] = code;
  }
  function getSwaps(mon) { return swaps[iso(monday(mon))] || "0000000"; }
  function dealt(wi) { var c = Math.floor(wi / CYCLE); return cycleWeeks(c)[wi - c * CYCLE]; }
  /* what a day's dinner can be rerolled into: not on this week already, not dealt for the
     week before or after, and — so the lunches around it stay put — a dish that keeps
     only for a dish that keeps */
  function alternatives(wi, i, slots) {
    var near = dealt(wi - 1).concat(dealt(wi + 1));
    var pool = DINNERS.filter(function (r) { return slots.indexOf(r) < 0 && near.indexOf(r) < 0; });
    var same = pool.filter(function (r) { return !r.keeps === !slots[i].keeps; });
    return shuffled(same.length ? same : pool, rng(15485863 * (wi + 5000) + i));
  }
  /* reroll one day (or with i == null, all seven) and return the week's new code */
  function reroll(mon, i) {
    mon = monday(mon);
    var code = getSwaps(mon).split(""), wi = weekIndex(mon);
    for (var d = 0; d < 7; d++) {
      if (i != null && d !== i) continue;
      /* how many alternatives this day has, given the days before it as they stand */
      var base = code.slice(); base[d] = "0";
      setSwaps(mon, base.join(""));
      var n = alternatives(wi, d, weekSlots(mon)).length;
      code[d] = String((Number(code[d]) + 1) % Math.min(10, n + 1));
    }
    setSwaps(mon, code.join(""));
    return getSwaps(mon);
  }

  /* the seven dinners of a week, in day order, rerolls applied */
  function weekSlots(mon) {
    mon = monday(mon);
    var wi = weekIndex(mon), dinners = dealt(wi);
    var byTime = function (x, y) { return y.time - x.time; };

    /* Dishes that keep go on the cook-double days, the longest of them on Saturday.
       The rest take what is left, the longest on Sunday. */
    var slots = [], keepers = dinners.filter(function (r) { return r.keeps; }).sort(byTime);
    var others = dinners.filter(function (r) { return !r.keeps; }).sort(byTime);
    COOK_DOUBLE.slice().sort(function (x, y) { return y - x; }).forEach(function (d) { if (keepers.length) slots[d] = keepers.shift(); });
    others = others.concat(keepers);
    [6, 4, 2, 5, 3, 1, 0].forEach(function (d) { if (!slots[d] && others.length) slots[d] = others.shift(); });

    var code = getSwaps(mon);
    for (var i = 0; i < 7; i++) {
      var k = Number(code.charAt(i));
      if (!k) continue;
      var alt = alternatives(wi, i, slots);
      if (alt.length) slots[i] = alt[(k - 1) % alt.length];
    }
    return slots;
  }

  var plans = {};
  function weekPlan(mon) {
    mon = monday(mon);
    var key = iso(mon) + getSwaps(mon);
    if (plans[key]) return plans[key];
    var wi = weekIndex(mon), slots = weekSlots(mon);
    var rand = rng(104729 * (wi + 5000));

    /* four breakfasts and four snacks a week, repeated, so the shop stays short */
    var bfs = shuffled(ofMeal("breakfast"), rand).slice(0, 4), sns = shuffled(ofMeal("snack"), rand).slice(0, 4);
    var lunches = shuffled(ofMeal("lunch").filter(function (r) { return !r.from; }), rand), li = 0;
    var BF = [0, 1, 2, 0, 3, 1, 2], SN = [0, 1, 2, 3, 0, 1, 2];

    var days = [];
    for (var i = 0; i < 7; i++) {
      var prev = i > 0 && COOK_DOUBLE.indexOf(i - 1) > -1 && slots[i - 1].keeps ? slots[i - 1] : null, lunch;
      if (prev) {
        var built = ofMeal("lunch").filter(function (r) { return r.from === prev.id; })[0];
        lunch = built ? { id: built.id } : { leftover: prev.id };
      } else {
        lunch = { id: lunches[li++ % lunches.length].id };
      }
      var pd = { bf: bfs[BF[i] % bfs.length].id, lunch: lunch, dinner: slots[i].id, snack: sns[SN[i] % sns.length].id };
      /* a light day gets the top-up that best fills the gap */
      var gap = DAY_KCAL - dayTotals(pd).kcal;
      if (gap > 150) {
        var start = (wi * 7 + i) % TOPUPS.length, pick = null;
        for (var t = 0; t < TOPUPS.length; t++) {
          var x = TOPUPS[(start + t + TOPUPS.length * 1000) % TOPUPS.length];
          if (!pick || Math.abs(x.kcal - gap) < Math.abs(pick.kcal - gap)) pick = x;
        }
        pd.extra = pick;
      }
      days.push(pd);
    }
    return (plans[key] = days);
  }
  function dayAt(d) {
    d = atNoon(d);
    var index = weekdayIndex(d);
    return { date: d, iso: iso(d), week: weekOf(d), index: index, plan: weekPlan(d)[index] };
  }
  /* the cuisines a week visits, in the order they are cooked */
  function weekCuisines(mon) {
    var out = [];
    weekPlan(mon).forEach(function (pd) { var c = RID[pd.dinner].cuisine; if (out.indexOf(c) < 0) out.push(c); });
    return out;
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
  /* The average day, for one standard portion of everything: two full cycles of weeks from
     the start of the rotation. Targets are scaled against this. */
  var AVG = (function () {
    var k = 0, p = 0, n = 0, start = parseISO(ROTATION_START);
    for (var w = 0; w < CYCLE * 2; w++) {
      weekPlan(addDays(start, w * 7)).forEach(function (pd) { var t = dayTotals(pd); k += t.kcal; p += t.protein; n += 1; });
    }
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

  /* The method is prose, and prose mentions amounts: "1.5 dl with 3 dl water", "roll 16
     small balls". Cut a step into plain text and the numbers that have to follow the
     batch count, so a doubled recipe reads doubled all the way down. Times, temperatures
     and amounts written as words are left alone. */
  var STEP_AMOUNT = /(\d+(?:[.,]\d+)?|[½¼¾])(\s?)(kg|g|dl|ml|l|rkl|tl|tbsp|tsp)\b|(\d+)(\s)((?:small |short )?(?:balls|sausages|patties))\b/g;
  function scaleStep(text, batches, lang) {
    var out = [], last = 0, m;
    STEP_AMOUNT.lastIndex = 0;
    while ((m = STEP_AMOUNT.exec(text))) {
      var n = num(m[1] != null ? m[1] : m[4]), unit = m[1] != null ? m[3] : "kpl";
      if (n == null || Math.abs(batches - 1) < 0.001) continue;
      var scaled = fmtNumber(roundAmount(n * batches, unit), lang) + (m[1] != null ? m[2] + m[3] : m[5] + m[6]);
      if (m.index > last) out.push({ text: text.slice(last, m.index) });
      out.push({ text: scaled, scaled: true });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ text: text.slice(last) });
    return out;
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
      out.push({ day: i, name: bf.name, items: bf.ingredients, batches: 2 / bf.serves });
      if (pd.lunch.id) {
        var ln = RID[pd.lunch.id];
        out.push({ day: i, name: ln.name, items: ln.ingredients, batches: 2 / ln.serves });
      }
      out.push({ day: i, name: dn.name, items: dn.ingredients, batches: dinnerPortions(d) / dn.serves });
      out.push({ day: i, name: sn.name, items: sn.ingredients, batches: 2 / sn.serves });
      if (pd.extra) out.push({ day: i, name: pd.extra.text, items: pd.extra.items, batches: 2 });
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

  /* ---------- cooking ahead ----------
     Twice a week (PREP_DAYS) there is an evening for the things that keep: boiled eggs,
     rice, poached chicken. Each use during the week is handed to the earliest of those
     evenings that is before it and close enough for the food still to be good. */
  function prepSessions(mon, people) {
    mon = monday(mon);
    var sz = size(people), sessions = PREP_DAYS.slice().sort(function (a, b) { return a - b; }).map(function (s) {
      return { offset: s, date: addDays(mon, s), tasks: [] };
    });
    weekCooking(mon).forEach(function (c) {
      c.items.forEach(function (ing) {
        var key = ing.b != null ? ing.b : BATCH_OF[ing.t];
        var a = key && BATCHES[key] ? amount(ing, c.batches, sz) : null;
        if (a == null) return;
        var s = sessions.filter(function (x) { return x.offset < c.day && c.day - x.offset <= BATCHES[key].keeps; })[0];
        if (!s) return;
        var t = s.tasks.filter(function (x) { return x.key === key; })[0];
        if (!t) s.tasks.push(t = { key: key, amount: 0, unit: unitOf(ing), keeps: BATCHES[key].keeps, days: [] });
        t.amount += a;
        if (t.days.indexOf(c.day) < 0) t.days.push(c.day);
      });
    });
    var order = Object.keys(BATCHES);
    sessions.forEach(function (s) {
      s.tasks.sort(function (x, y) { return order.indexOf(x.key) - order.indexOf(y.key); });
      s.tasks.forEach(function (t) {
        t.days.sort(function (x, y) { return x - y; });
        t.dates = t.days.map(function (d) { return addDays(mon, d); });
      });
    });
    return sessions.filter(function (s) { return s.tasks.length; });
  }
  /* the batch cooking that falls on this evening: Sunday's is for the week ahead */
  function batchTasks(date, people) {
    var key = iso(atNoon(date)), mon = monday(date), out = [];
    prepSessions(mon, people).concat(prepSessions(addDays(mon, 7), people)).forEach(function (s) {
      if (iso(s.date) === key) out = out.concat(s.tasks);
    });
    return out;
  }
  function amountText(a, u, lang) {
    a = roundAmount(a, u);
    var ut = unitText(u, a, lang, true);
    return fmtNumber(a, lang) + (ut ? " " + ut : "");
  }

  /* ---------- the night before ---------- */
  function prep(date) {
    var today = dayAt(date), next = dayAt(addDays(date, 1)), out = [];
    if (lunchFrom(next.plan) === today.plan.dinner) {
      out.push({ kind: "box", r: RID[today.plan.dinner] });
    }
    meals(next.plan).forEach(function (m) {
      if (m.leftover) return;
      if (m.r.ahead) out.push({ kind: "ahead", r: m.r, slot: m.slot });
      if (m.r.early) out.push({ kind: "early", r: m.r, slot: m.slot });
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
    RID: RID, AVG: AVG, CYCLE: CYCLE, weekPlan: weekPlan, setSwaps: setSwaps, getSwaps: getSwaps, reroll: reroll,
    prepSessions: prepSessions, batchTasks: batchTasks, amountText: amountText, weekIndex: weekIndex, weekCuisines: weekCuisines,
    atNoon: atNoon, addDays: addDays, iso: iso, parseISO: parseISO, monday: monday,
    daysBetween: daysBetween, weekOf: weekOf, dayAt: dayAt,
    meals: meals, dayTotals: dayTotals, mult: mult, shares: shares, size: size,
    lunchFrom: lunchFrom, dinnerPortions: dinnerPortions,
    num: num, amount: amount, qtyText: qtyText, scaleStep: scaleStep, fmtNumber: fmtNumber, unitText: unitText, enOf: enOf,
    weekCooking: weekCooking, shoppingList: shoppingList, buyText: buyText, pantryText: pantryText,
    prep: prep, maintenance: maintenance, suggest: suggest
  };
})();
