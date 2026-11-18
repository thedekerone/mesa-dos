/* Mesa Dos — the page. Reads the data files and core.js, draws five views and a recipe
   screen, and remembers a few things on the phone. No dependencies, no build step. */
(function () {
  "use strict";

  var M = MESA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- storage ----------
     localStorage throws in some in-app browsers and private modes. Everything goes through
     here so the page still works; what is ticked then lasts for the visit only. */
  var LS = "mesa2.";
  var mem = {};
  var store = {
    get: function (k) {
      try { var v = localStorage.getItem(LS + k); if (v !== null) return v; } catch (e) { /* blocked */ }
      return k in mem ? mem[k] : null;
    },
    set: function (k, v) { mem[k] = v; try { localStorage.setItem(LS + k, v); } catch (e) { /* blocked */ } },
    del: function (k) { delete mem[k]; try { localStorage.removeItem(LS + k); } catch (e) { /* blocked */ } },
    json: function (k) { try { return JSON.parse(store.get(k) || "{}") || {}; } catch (e) { return {}; } }
  };
  /* ticks are kept per date; drop the ones from weeks that are over */
  function prune(today) {
    try {
      var cutoff = M.iso(M.addDays(today, -21));
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var m = /^mesa2\.(?:checks|need|prep|swap)\.(\d{4}-\d\d-\d\d)$/.exec(localStorage.key(i) || "");
        if (m && m[1] < cutoff) localStorage.removeItem(localStorage.key(i));
      }
    } catch (e) { /* blocked */ }
  }

  /* A rerolled week is remembered as seven digits per Monday (see core.js). They are read
     once at the start; after that core.js holds them and this only writes changes down. */
  function loadSwaps() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var m = /^mesa2\.swap\.(\d{4}-\d\d-\d\d)$/.exec(localStorage.key(i) || "");
        var d = m && M.parseISO(m[1]);
        if (d) M.setSwaps(d, localStorage.getItem(localStorage.key(i)));
      }
    } catch (e) { /* blocked */ }
  }
  function saveSwaps(mon) {
    var code = M.getSwaps(mon);
    if (code === "0000000") store.del("swap." + M.iso(mon)); else store.set("swap." + M.iso(mon), code);
  }

  /* ---------- state ---------- */
  function now() {
    return (typeof window.MESA_NOW === "string" && M.parseISO(window.MESA_NOW)) || M.atNoon(new Date());
  }
  var today = now();
  var state = {
    lang: store.get("lang") === "fi" ? "fi" : "en",
    people: loadPeople(),
    route: { view: "today" },
    who: "both", plus: false,          /* recipe screen: who it is for, and tomorrow's lunch */
    meal: "all", cuisine: "all", q: "" /* recipe list filters */
  };
  var cooked = {};                     /* ticks on the recipe screen, for this visit */
  var DINNER_AVG = (function () {
    var d = RECIPES.filter(function (r) { return r.meal === "dinner"; });
    return d.reduce(function (s, r) { return s + r.kcal; }, 0) / d.length;
  })();

  function loadPeople() {
    var saved = store.json("people");
    return PEOPLE.map(function (p) {
      var s = saved[p.id] || {}, k = Number(s.kcal);
      return {
        id: p.id,
        name: typeof s.name === "string" && s.name.trim() ? s.name.trim().slice(0, 16) : p.name,
        kcal: k >= 1000 && k <= 3500 ? k : p.kcal
      };
    });
  }
  function savePeople() {
    var o = {};
    state.people.forEach(function (p) { o[p.id] = { name: p.name, kcal: p.kcal }; });
    store.set("people", JSON.stringify(o));
  }

  /* ---------- words and numbers ---------- */
  var CUIS = {
    peru: { en: "Peruvian", fi: "Perulainen" }, mexico: { en: "Mexican", fi: "Meksikolainen" },
    asia: { en: "Asian", fi: "Aasialainen" }, india: { en: "Indian", fi: "Intialainen" },
    mideast: { en: "Middle Eastern", fi: "Lähi-idän" }, europe: { en: "European", fi: "Eurooppalainen" },
    nordic: { en: "Nordic", fi: "Pohjoismainen" }
  };
  function L() { return state.lang; }
  function S(k, vars) {
    var v = SLOTS[L()][k];
    if (v == null) v = SLOTS.en[k];
    if (v == null) return k;
    return vars ? v.replace(/\{(\w+)\}/g, function (m, n) { return vars[n] != null ? vars[n] : m; }) : v;
  }
  function P(s) { return L() === "en" ? M.enOf(s) : s; }
  function ALT(s) { var o = L() === "en" ? s : M.enOf(s); return o !== P(s) ? o : ""; }
  /* the secondary name is always in the other language — say so for screen readers */
  function altSpan(a) { return a ? ' <span class="alt" lang="' + (L() === "en" ? "fi" : "en") + '">' + esc(a) + '</span>' : ""; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function kcal(n) { return (Math.round(n / 10) * 10).toLocaleString("fi-FI"); }
  function euro(n) { return n.toFixed(2).replace(".", ",") + " €"; }
  function euros(n) { return Math.round(n) + " €"; }       /* totals: no false precision */
  function locale() { return L() === "fi" ? "fi-FI" : "en-GB"; }
  function dateLong(d) { return d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" }); }
  function dateShort(d) { return d.toLocaleDateString(locale(), { day: "numeric", month: "short" }); }
  function weekdayShort(d) { return d.toLocaleDateString(locale(), { weekday: "short" }); }
  function weekdayLong(d) { return d.toLocaleDateString(locale(), { weekday: "long" }); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* one number per person, always in the same colour: yellow, then lilac */
  function chips(base) {
    return '<span class="ks">' + state.people.map(function (p, i) {
      return '<span class="k k' + (i + 1) + '"><span class="vh">' + esc(p.name) + ' </span>' + kcal(base * M.mult(p)) + '</span>';
    }).join("") + '</span>';
  }
  /* how to split the pan: two segments as wide as each share */
  function split(baseKcal, baseProtein) {
    var sh = M.shares(state.people);
    return '<div class="split">' + state.people.map(function (p, i) {
      return '<div class="seg-plate p' + (i + 1) + '" style="flex-basis:' + (sh[i] * 100).toFixed(1) + '%">' +
        '<b>' + esc(p.name) + '</b>' +
        '<span class="num">' + kcal(baseKcal * M.mult(p)) + ' kcal</span>' +
        '<span class="sub">' + Math.round(baseProtein * M.mult(p)) + ' g ' + S("protein") + '</span>' +
        '</div>';
    }).join("") + '</div>';
  }
  function recipeHref(r, portions) { return "#/recipe/" + r.id + (portions ? "/" + portions : ""); }

  /* ---------- routes ----------
     #/            today            #/day/2026-11-18   another day
     #/week        this week        #/week/2026-11-23  the week starting that Monday
     #/shop        the list         #/shop/2026-11-23
     #/recipes     all recipes      #/recipe/a1/4      one recipe, cooked for 4 portions
     #/us          the two of you */
  var VIEWS = ["today", "week", "shop", "recipes", "recipe", "us"];
  var LEGACY = { plan: "today", basics: "us" };
  function parseRoute(hash) {
    var parts = String(hash || "").replace(/^#\/?/, "").split("/");
    var view = LEGACY[parts[0]] || parts[0] || "today";
    if (view === "day") {
      var d = M.parseISO(parts[1]);
      return { view: "today", date: d || today };
    }
    if (VIEWS.indexOf(view) < 0) view = "today";
    if (view === "today") return { view: "today", date: today };
    if (view === "week" || view === "shop") {
      var mon = M.parseISO(parts[1]);
      return { view: view, monday: mon ? M.monday(mon) : null, code: mon && /^\d{7}$/.test(parts[2] || "") ? parts[2] : null };
    }
    if (view === "recipe") {
      if (!M.RID[parts[1]]) return { view: "recipes" };
      return { view: "recipe", id: parts[1], portions: parts[2] === "4" ? 4 : 2 };
    }
    return { view: view };
  }
  function routeKey(r) {
    return r.view + (r.date ? M.iso(r.date) : "") + (r.monday ? M.iso(r.monday) : "") + (r.id || "");
  }

  var trail = [];        /* where we have been, to tell "back" from "forward" */
  var scrolls = {};
  function go(first) {
    var prev = state.route;
    var next = parseRoute(location.hash);
    /* a link from the other phone: take its week, then drop the code from the address */
    if (next.code) {
      M.setSwaps(next.monday, next.code);
      saveSwaps(next.monday);
      toast(S("weekApplied"));
      next.code = null;
      try { history.replaceState(null, "", "#/" + next.view + "/" + M.iso(next.monday)); } catch (e) { /* fine */ }
    }
    var key = routeKey(next), back = false;
    if (!first) {
      scrolls[routeKey(prev)] = window.pageYOffset || 0;
      if (trail.length > 1 && trail[trail.length - 2] === key) { trail.pop(); back = true; }
      else if (trail[trail.length - 1] !== key) trail.push(key);
    } else {
      trail.push(key);
    }
    if (prev.view === "recipe" && next.view !== "recipe") releaseWake();
    if (next.view === "recipe" && (prev.view !== "recipe" || prev.id !== next.id)) {
      state.who = "both";
      state.plus = next.portions === 4;
    }
    state.route = next;
    render();
    window.scrollTo(0, back ? (scrolls[key] || 0) : 0);
    if (!first) { var main = $("#main"); if (main && main.focus) main.focus({ preventScroll: true }); }
  }

  var TITLES = { today: "navToday", week: "navWeek", shop: "navShop", recipes: "navRecipes", us: "navUs" };
  function render() {
    var v = state.route.view;
    VIEWS.forEach(function (name) { $("#view-" + name).hidden = name !== v; });
    $$(".nav a").forEach(function (a) {
      var on = a.getAttribute("data-nav") === (v === "recipe" ? "recipes" : v);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    ({ today: renderToday, week: renderWeek, shop: renderShop, recipes: renderRecipes, recipe: renderRecipe, us: renderUs })[v]();
    document.title = (v === "recipe" ? M.RID[state.route.id].name : S(TITLES[v])) + " · Mesa Dos";
  }

  /* Static labels in index.html carry data-i18n; the English there is the no-script fallback. */
  function applyChrome() {
    document.documentElement.lang = L();
    $$("[data-i18n]").forEach(function (el) { el.textContent = S(el.getAttribute("data-i18n")); });
    $$("#langSeg button").forEach(function (b) {
      var on = b.getAttribute("data-lang") === L();
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
  }

  /* ---------- today ---------- */
  function relative(d) {
    var n = M.daysBetween(today, d);
    return n === 0 ? S("today") : n === 1 ? S("tomorrow") : n === -1 ? S("yesterday") : "";
  }
  function strip(date) {
    var mon = M.monday(date), cells = "";
    for (var i = 0; i < 7; i++) {
      var d = M.addDays(mon, i), on = M.iso(d) === M.iso(date), isToday = M.iso(d) === M.iso(today);
      cells += '<li><a href="#/day/' + M.iso(d) + '" class="' + (on ? "on" : "") + (isToday ? " now" : "") + '"' +
        (on ? ' aria-current="date"' : "") + ' aria-label="' + esc(dateLong(d)) + '">' +
        '<span>' + esc(weekdayShort(d)) + '</span><b>' + d.getDate() + '</b></a></li>';
    }
    return '<nav class="strip" aria-label="' + esc(S("pickDay")) + '">' +
      '<a class="strip-nav" href="#/day/' + M.iso(M.addDays(date, -7)) + '" aria-label="' + esc(S("prevWeek")) + '">‹</a>' +
      '<ol>' + cells + '</ol>' +
      '<a class="strip-nav" href="#/day/' + M.iso(M.addDays(date, 7)) + '" aria-label="' + esc(S("nextWeek")) + '">›</a></nav>';
  }

  function renderToday() {
    var date = state.route.date, info = M.dayAt(date), pd = info.plan;
    var meals = M.meals(pd), dinner = meals[2].r;
    var portions = M.dinnerPortions(date);
    var rel = relative(date), isToday = M.iso(date) === M.iso(today);

    var tape = "";
    if (portions === 4) {
      tape = '<p class="tape">' + S(portions / dinner.serves > 1 ? "double" : "makesFour") + '</p>';
    }

    var rows = meals.filter(function (m) { return m.slot !== "dinner"; }).map(function (m) {
      var small = m.leftover ? S("leftoverFrom") : m.r.from ? S("fromPot") : m.r.time + " min";
      return '<li><a class="line" href="' + recipeHref(m.r) + '">' +
        '<span class="line-slot">' + S(m.slot) + '</span>' +
        '<span class="line-what">' + esc(m.r.name) + '<small>' + small + '</small></span>' +
        chips(m.r.kcal) + '</a></li>';
    }).join("");
    if (pd.extra) {
      rows += '<li><div class="line line-extra">' +
        '<span class="line-slot">' + S("topup") + '</span>' +
        '<span class="line-what">' + esc(pd.extra.text) + '<small>' + S("hungry") + '</small></span>' +
        chips(pd.extra.kcal) + '</div></li>';
    }

    var done = store.json("prep." + info.iso);
    var prep = M.prep(date).map(function (h, i) {
      var text = h.kind === "box" ? S("prepBox", { dish: h.r.name }) : h.kind === "early" ? h.r.early : h.r.ahead;
      var small = h.kind === "box" ? "" : '<small>' + esc(S(h.kind === "early" ? "prepEarly" : "prepFor", { dish: h.r.name })) + '</small>';
      return '<li><label class="check"><input type="checkbox" data-prep="' + i + '"' + (done[i] ? " checked" : "") + '>' +
        '<span class="check-text"' + (h.kind === "box" ? "" : ' lang="en"') + '>' + esc(text) + small + '</span></label></li>';
    }).join("");
    prep += M.batchTasks(date, state.people).map(function (t, i) {
      return '<li><label class="check"><input type="checkbox" data-prep="b' + i + '"' + (done["b" + i] ? " checked" : "") + '>' +
        '<span class="check-text">' + batchLine(t) + '</span></label></li>';
    }).join("");
    var wd = (date.getDay() + 6) % 7;
    if (wd >= 5) {
      var nextMon = M.addDays(M.monday(date), 7);
      prep += '<li><a class="check check-link" href="#/shop/' + M.iso(nextMon) + '">' +
        '<span class="check-text">' + S("prepShop", { week: M.weekOf(nextMon) }) + '</span></a></li>';
    }

    var tot = M.dayTotals(pd);
    var totals = state.people.map(function (p, i) {
      var k = tot.kcal * M.mult(p);
      return '<div class="total total' + (i + 1) + '">' +
        '<span class="total-name">' + esc(p.name) + '</span>' +
        '<span class="total-num"><b>' + kcal(k) + '</b> kcal</span>' +
        '<span class="total-sub">' + Math.round(tot.protein * M.mult(p)) + ' g ' + S("protein") + '</span>' +
        '<span class="total-sub">' + S("target", { target: kcal(p.kcal) }) + '</span>' +
        '</div>';
    }).join("");

    $("#view-today").innerHTML =
      strip(date) +
      '<p class="when">' + (rel ? '<b>' + rel + '</b> ' : "") + esc(cap(dateLong(date))) +
        ' <span class="weektag">' + S("week") + ' ' + esc(info.week) + '</span>' +
        (isToday ? "" : ' <a class="jump" href="#/">' + S("backToday") + '</a>') + '</p>' +
      '<article class="ticket ' + dinner.cuisine + '">' +
        '<p class="ticket-slot">' + (isToday ? S("tonight") : S("dinner")) + '</p>' +
        '<h1 class="dish" lang="en"><a href="' + recipeHref(dinner, portions) + '">' + esc(dinner.name) + '</a></h1>' +
        '<p class="dish-sub" lang="en">' + esc(dinner.short) + '</p>' +
        '<ul class="facts"><li>' + dinner.time + ' min</li><li>' + CUIS[dinner.cuisine][L()] + '</li></ul>' +
        tape +
        split(dinner.kcal, dinner.protein) +
        '<a class="btn btn-go" href="' + recipeHref(dinner, portions) + '">' + S("startCooking") + '</a>' +
        '<button class="swap" data-reroll="' + info.index + '" data-monday="' + M.iso(M.monday(date)) + '">' + S("reroll") + '</button>' +
      '</article>' + swapNotice(M.monday(date)) +
      '<section class="block"><h2>' + S("restOfDay") + '</h2><ul class="lines">' + rows + '</ul></section>' +
      (prep ? '<section class="block"><h2>' + S(isToday ? "beforeBed" : "nightBefore") + '</h2><ul class="checks">' + prep + '</ul></section>' : "") +
      '<section class="block"><h2>' + S("dayTotal") + '</h2><div class="totals">' + totals + '</div>' +
        '<p class="fine">' + S("estimates") + '</p></section>';
  }

  /* "Boil 8 eggs. In their shells they keep 5 days. For Tue and Thu." */
  function batchLine(t) {
    return esc(S("batch_" + t.key, { n: M.amountText(t.amount, t.unit, L()), keeps: t.keeps })) +
      '<small>' + esc(S("batchFor", { days: t.dates.map(function (d) { return cap(weekdayShort(d)); }).join(", ") })) + '</small>';
  }
  /* shown wherever a week differs from what was dealt */
  function swapNotice(mon) {
    if (M.getSwaps(mon) === "0000000") return "";
    return '<p class="swapped">' + S("swapped") + ' <button class="linkish" data-send="' + M.iso(mon) + '">' + S("sendWeek") + '</button>' +
      ' <button class="linkish" data-unswap="' + M.iso(mon) + '">' + S("resetWeek") + '</button></p>';
  }

  /* ---------- week ---------- */
  function weekSeg(view, mon) {
    var thisMon = M.monday(today), nextMon = M.addDays(thisMon, 7), cur = M.iso(mon);
    function link(m, label) {
      var on = M.iso(m) === cur;
      return '<a href="#/' + view + '/' + M.iso(m) + '"' + (on ? ' aria-current="true"' : "") + '>' + label +
        ' <span class="seg-sub">' + S("week") + ' ' + M.weekOf(m) + '</span></a>';
    }
    return '<nav class="seg" aria-label="' + esc(S("pickWeek")) + '">' + link(thisMon, S("thisWeek")) + link(nextMon, S("nextWeek2")) + '</nav>';
  }
  function range(mon) { return dateShort(mon) + " – " + dateShort(M.addDays(mon, 6)); }

  function renderWeek() {
    var mon = state.route.monday || M.monday(today), wk = M.weekOf(mon);
    var rows = "", fridge = "";
    for (var i = 0; i < 7; i++) {
      var d = M.addDays(mon, i), pd = M.dayAt(d).plan, ms = M.meals(pd), dn = ms[2].r;
      var isToday = M.iso(d) === M.iso(today), portions = M.dinnerPortions(d);
      var lunch = ms[1].leftover ? S("leftover").toLowerCase() : ms[1].r.name;
      /* four portions is "cook double" for most dinners; the minestrone makes four anyway */
      var more = portions !== 4 ? "" : S(portions / dn.serves > 1 ? "x2" : "x4");
      rows += '<li class="wrow"><a class="wday' + (isToday ? " now" : "") + '" href="#/day/' + M.iso(d) + '">' +
        '<span class="wday-date"><b>' + esc(cap(weekdayShort(d))) + '</b>' + d.getDate() + '</span>' +
        '<span class="wday-what"><span class="wday-dinner" lang="en">' + esc(dn.name) + '</span>' +
          '<small>' + esc(ms[0].r.name) + ' / ' + esc(lunch) + ' / ' + esc(ms[3].r.name) + '</small></span>' +
        '<span class="wday-meta">' + dn.time + ' min' + (more ? '<em>' + more + '</em>' : "") + '</span>' +
        '</a><button class="reroll" data-reroll="' + i + '" data-monday="' + M.iso(mon) + '" aria-label="' + esc(S("rerollDay", { day: weekdayLong(d) })) + '" title="' + esc(S("reroll")) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15"/></svg></button></li>';

      fridge += '<tr><th scope="row">' + esc(cap(weekdayLong(d))) + '<small>' + d.getDate() + '.' + (d.getMonth() + 1) + '.</small></th>' +
        '<td>' + esc(ms[0].r.name) + '</td>' +
        '<td>' + (ms[1].leftover ? '<em>' + S("leftover") + '</em> ' : "") + esc(ms[1].r.name) + '</td>' +
        '<td>' + esc(dn.name) + (more ? '<small>' + more + '</small>' : "") + '</td>' +
        '<td>' + esc(ms[3].r.name) + (pd.extra ? '<small>' + S("topup") + ': ' + esc(pd.extra.text) + '</small>' : "") + '</td></tr>';
    }

    $("#view-week").innerHTML =
      '<div class="screen-only">' +
        '<header class="head"><h1>' + S("navWeek") + '</h1><p class="head-sub">' + esc(range(mon)) + '</p></header>' +
        weekSeg("week", mon) +
        '<p class="note">' + S("weekVisits", { list: M.weekCuisines(mon).map(function (c) { return CUIS[c][L()]; }).join(", ") }) + '</p>' +
        swapNotice(mon) +
        '<ol class="wdays">' + rows + '</ol>' +
        ahead(mon) +
        '<div class="actions"><a class="btn" href="#/shop/' + M.iso(mon) + '">' + S("openList") + '</a>' +
          '<button class="btn btn-quiet" data-print>' + S("printWeek") + '</button>' +
          '<button class="btn btn-quiet" data-reroll="all" data-monday="' + M.iso(mon) + '">' + S("rerollWeek") + '</button></div>' +
        '<p class="pager"><a href="#/week/' + M.iso(M.addDays(mon, -7)) + '">‹ ' + S("week") + ' ' + M.weekOf(M.addDays(mon, -7)) + '</a>' +
          '<a href="#/week/' + M.iso(M.addDays(mon, 7)) + '">' + S("week") + ' ' + M.weekOf(M.addDays(mon, 7)) + ' ›</a></p>' +
      '</div>' +
      /* the same week as one table; only the print stylesheet shows it */
      '<div class="fridge"><div class="fridge-head"><h2>Mesa Dos, ' + S("week") + ' ' + esc(wk) + '</h2><p>' + esc(range(mon)) + '</p></div>' +
        '<table><thead><tr><th scope="col">' + S("fridgeDay") + '</th><th scope="col">' + S("breakfast") + '</th>' +
        '<th scope="col">' + S("lunch") + '</th><th scope="col">' + S("dinner") + '</th><th scope="col">' + S("snack") + '</th></tr></thead>' +
        '<tbody>' + fridge + '</tbody></table>' +
        '<p class="fridge-foot">' + S("fridgeFoot") + '</p></div>';
  }

  /* the week's cook-ahead evenings */
  function ahead(mon) {
    var sessions = M.prepSessions(mon, state.people);
    if (!sessions.length) return "";
    return '<section class="block"><h2>' + S("getAhead") + '</h2><p class="note">' + S("getAheadNote") + '</p>' + sessions.map(function (s) {
      return '<h3 class="session"><a href="#/day/' + M.iso(s.date) + '">' + esc(S("evening", { day: cap(weekdayLong(s.date)) })) + '</a></h3>' +
        '<ul class="plain">' + s.tasks.map(function (t) { return '<li>' + batchLine(t) + '</li>'; }).join("") + '</ul>';
    }).join("") + '</section>';
  }

  /* ---------- shopping ---------- */
  function shopMonday() {
    if (state.route.monday) return state.route.monday;
    /* at the weekend the list that matters is next week's */
    var mon = M.monday(today);
    return (today.getDay() + 6) % 7 >= 5 ? M.addDays(mon, 7) : mon;
  }
  function shopState(mon) {
    var list = M.shoppingList(mon, state.people);
    var checks = store.json("checks." + M.iso(mon)), need = store.json("need." + M.iso(mon));
    var total = 0, left = 0, count = 0, done = 0;
    list.aisles.forEach(function (a) {
      a.items.forEach(function (it) {
        total += it.price; count += 1;
        if (checks[it.name]) done += 1; else left += it.price;
      });
    });
    list.pantry.forEach(function (p) {
      if (!need[p.name]) return;
      total += p.item.p; count += 1;
      if (checks[p.name]) done += 1; else left += p.item.p;
    });
    return { list: list, checks: checks, need: need, total: total, left: left, count: count, done: done };
  }
  function shopSummary(st) {
    var pct = st.count ? Math.round(st.done / st.count * 100) : 0;
    return '<p class="sum-main">' + (st.done === st.count && st.count ? S("allDone") :
        S("leftToBuy", { n: st.count - st.done, eur: euros(st.left) })) + '</p>' +
      '<span class="meter" role="img" aria-label="' + esc(S("ticked", { done: st.done, count: st.count })) + '"><i style="width:' + pct + '%"></i></span>' +
      '<p class="sum-sub">' + S("basket", { eur: euros(st.total), each: euros(st.total / 14) }) + '</p>';
  }
  function renderShop() {
    var mon = shopMonday(), st = shopState(mon);
    var aisles = st.list.aisles.map(function (a) {
      return '<section class="aisle"><h2>' + esc(P(a.aisle)) + '</h2><ul class="items">' + a.items.map(function (it) {
        return itemRow(it.name, M.buyText(it, L()), it.price, st.checks[it.name], it.uses);
      }).join("") + '</ul></section>';
    }).join("");

    var wanted = st.list.pantry.filter(function (p) { return st.need[p.name]; });
    if (wanted.length) {
      aisles += '<section class="aisle"><h2>' + S("fromCupboard") + '</h2><ul class="items">' + wanted.map(function (p) {
        return itemRow(p.name, P(p.item.q), p.item.p, st.checks[p.name], p.uses);
      }).join("") + '</ul></section>';
    }

    var pantry = st.list.pantry.map(function (p) {
      var amt = M.pantryText(p, L());
      return '<li><label class="check"><input type="checkbox" data-need="' + esc(p.name) + '"' + (st.need[p.name] ? " checked" : "") + '>' +
        '<span class="check-text">' + esc(P(p.name)) + altSpan(ALT(p.name)) +
        '<small>' + (amt ? S("weekUses", { amount: amt }) : S("weekUsesSome")) + '</small></span></label></li>';
    }).join("");

    $("#view-shop").innerHTML =
      '<header class="head"><h1>' + S("shopTitle") + '</h1><p class="head-sub">' + S("week") + ' ' + M.weekOf(mon) + ', ' + esc(range(mon)) + '</p></header>' +
      '<div class="screen-only">' + swapNotice(mon) + '</div>' +
      '<div class="screen-only">' + weekSeg("shop", mon) + '</div>' +
      '<div class="sum" id="shopSum">' + shopSummary(st) + '</div>' +
      '<div class="actions screen-only">' +
        '<button class="btn" data-share>' + S("share") + '</button>' +
        '<button class="btn btn-quiet" data-print>' + S("print") + '</button>' +
        '<button class="btn btn-quiet" data-clear>' + S("clearTicks") + '</button></div>' +
      '<div id="shopList" data-monday="' + M.iso(mon) + '">' + aisles + '</div>' +
      '<section class="block screen-only"><h2>' + S("cupboard") + '</h2><p class="note">' + S("cupboardNote") + '</p>' +
        '<ul class="checks" id="pantryList" data-monday="' + M.iso(mon) + '">' + pantry + '</ul></section>' +
      '<section class="block screen-only stores"><h2>' + S("stores") + '</h2><dl lang="en">' + STORES.map(function (s) {
        return '<dt>' + esc(s.name) + '</dt><dd>' + esc(s.note) + '</dd>';
      }).join("") + '</dl><p class="fine">' + S("priceNote") + '</p></section>';
  }
  function itemRow(name, qty, price, checked, uses) {
    return '<li class="item"><label><input type="checkbox" data-id="' + esc(name) + '"' + (checked ? " checked" : "") + '>' +
      '<span class="item-name">' + esc(P(name)) + altSpan(ALT(name)) +
      (uses && uses.length ? '<small lang="en">' + esc(uses.slice(0, 2).join(", ")) + (uses.length > 2 ? " +" + (uses.length - 2) : "") + '</small>' : "") + '</span></label>' +
      '<span class="item-qty">' + esc(qty) + '</span><span class="item-price">' + euro(price) + '</span></li>';
  }
  function shareText(mon) {
    var st = shopState(mon), lines = [S("shopTitle") + " — " + S("week") + " " + M.weekOf(mon) + ", " + range(mon), ""];
    st.list.aisles.forEach(function (a) {
      var open = a.items.filter(function (it) { return !st.checks[it.name]; });
      if (!open.length) return;
      lines.push(P(a.aisle).toUpperCase());
      open.forEach(function (it) { lines.push("☐ " + P(it.name) + (ALT(it.name) ? " (" + ALT(it.name) + ")" : "") + " — " + M.buyText(it, L())); });
      lines.push("");
    });
    var wanted = st.list.pantry.filter(function (p) { return st.need[p.name] && !st.checks[p.name]; });
    if (wanted.length) {
      lines.push(S("fromCupboard").toUpperCase());
      wanted.forEach(function (p) { lines.push("☐ " + P(p.name) + (ALT(p.name) ? " (" + ALT(p.name) + ")" : "")); });
      lines.push("");
    }
    lines.push(S("basketShort", { eur: euros(st.left) }));
    return lines.join("\n");
  }
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------- recipes ---------- */
  var MEALS = ["all", "dinner", "breakfast", "lunch", "snack"];
  var CUISINES = ["all", "peru", "mexico", "asia", "india", "mideast", "europe", "nordic"];
  var MEAL_KEY = { all: "mealAll", dinner: "mealDinner", breakfast: "mealBreakfast", lunch: "mealLunch", snack: "mealSnack" };

  function chip(attr, value, label, on) {
    return '<button class="chip" ' + attr + '="' + value + '" aria-pressed="' + (on ? "true" : "false") + '">' + esc(label) + '</button>';
  }
  function renderRecipes() {
    $("#view-recipes").innerHTML =
      '<header class="head"><h1>' + S("navRecipes") + '</h1><p class="head-sub">' + S("recipesSub") + '</p></header>' +
      '<label class="search"><span class="vh">' + S("search") + '</span>' +
        '<input type="search" id="q" placeholder="' + esc(S("search")) + '" value="' + esc(state.q) + '" autocomplete="off"></label>' +
      '<div class="filters" id="filters">' +
        '<div class="chipset" role="group" aria-label="' + esc(S("filterMeal")) + '">' + MEALS.map(function (m) {
          return chip("data-meal", m, S(MEAL_KEY[m]), state.meal === m);
        }).join("") + '</div>' +
        '<div class="chipset" role="group" aria-label="' + esc(S("filterCuisine")) + '">' + CUISINES.map(function (c) {
          return chip("data-cuisine", c, c === "all" ? S("cuisineAll") : CUIS[c][L()], state.cuisine === c);
        }).join("") + '</div></div>' +
      '<p class="count" id="recipeCount" role="status"></p>' +
      '<div id="recipeList"></div>';
    renderRecipeList();
  }
  /* The list is separate from the controls, so typing in the search box and pressing a
     chip never rebuild the thing that has focus. */
  function renderRecipeList() {
    var q = state.q.trim().toLowerCase();
    var list = RECIPES.filter(function (r) {
      if (state.cuisine !== "all" && r.cuisine !== state.cuisine) return false;
      if (state.meal !== "all" && r.meal !== state.meal) return false;
      if (!q) return true;
      var hay = (r.name + " " + r.short + " " + r.ingredients.map(function (i) { return i.t + " " + M.enOf(i.t); }).join(" ")).toLowerCase();
      return hay.indexOf(q) > -1;
    });
    $("#recipeCount").textContent = list.length + " " + S(list.length === 1 ? "recipeOne" : "recipeMany");
    if (!list.length) {
      $("#recipeList").innerHTML = '<p class="empty">' + S("noMatch") + '</p>';
      return;
    }
    var html = "";
    ["dinner", "breakfast", "lunch", "snack"].forEach(function (meal) {
      var group = list.filter(function (r) { return r.meal === meal; });
      if (!group.length) return;
      group.sort(function (a, b) { return a.name.localeCompare(b.name); });
      html += '<section class="rgroup"><h2>' + S(MEAL_KEY[meal]) + '</h2><ul class="rlist">' + group.map(function (r) {
        return '<li><a class="rrow ' + r.cuisine + '" href="' + recipeHref(r) + '">' +
          '<span class="rrow-what"><span class="rrow-name" lang="en">' + esc(r.name) + '</span>' +
          '<small>' + CUIS[r.cuisine][L()] + ', ' + r.time + ' min</small></span>' +
          chips(r.kcal) + '</a></li>';
      }).join("") + '</ul></section>';
    });
    $("#recipeList").innerHTML = html;
  }
  function syncFilters() {
    $$("#filters .chip").forEach(function (b) {
      var on = b.hasAttribute("data-meal") ? b.getAttribute("data-meal") === state.meal
                                           : b.getAttribute("data-cuisine") === state.cuisine;
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* ---------- one recipe ---------- */
  function cookFor(r) {
    var solo = state.who === "both" ? null : state.people.filter(function (p) { return p.id === state.who; })[0];
    var eaters = solo ? [solo] : state.people;
    var canPlus = r.meal === "dinner";
    var portions = eaters.length * (canPlus && state.plus ? 2 : 1);
    return { eaters: eaters, solo: solo, canPlus: canPlus, portions: portions, batches: portions / r.serves, size: M.size(eaters) };
  }
  function renderRecipe() {
    var r = M.RID[state.route.id], c = cookFor(r);
    var ticks = cooked[r.id] || (cooked[r.id] = { ing: {}, step: {} });

    var who = '<div class="seg seg-buttons" role="radiogroup" aria-label="' + esc(S("cookingFor")) + '">' +
      [["both", S("both")]].concat(state.people.map(function (p) { return [p.id, p.name]; })).map(function (o) {
        var on = state.who === o[0];
        return '<button role="radio" aria-checked="' + (on ? "true" : "false") + '" tabindex="' + (on ? 0 : -1) + '" data-who="' + o[0] + '">' + esc(o[1]) + '</button>';
      }).join("") + '</div>';
    var plus = c.canPlus ? '<label class="switch"><input type="checkbox" data-plus' + (state.plus ? " checked" : "") + '><span>' + S("plusLunch") + '</span></label>' : "";

    var makes = S(c.portions === 1 ? "makesOne" : "makesN", { n: M.fmtNumber(c.portions, L()) });
    var asWritten = Math.abs(c.batches * c.size - 1) < 0.01;

    var ings = r.ingredients.map(function (ing, i) {
      return '<li><label class="check"><input type="checkbox" data-ing="' + i + '"' + (ticks.ing[i] ? " checked" : "") + '>' +
        '<span class="check-text">' + esc(P(ing.t)) + altSpan(ALT(ing.t)) + '</span>' +
        '<span class="ing-qty">' + esc(M.qtyText(ing, c.batches, c.size, L())) + '</span></label></li>';
    }).join("");
    var steps = r.steps.map(function (s, i) {
      return '<li><label class="check"><input type="checkbox" data-step="' + i + '"' + (ticks.step[i] ? " checked" : "") + '>' +
        '<span class="check-text">' + esc(s) + '</span></label></li>';
    }).join("");

    var plate = c.solo
      ? '<p class="solo"><b>' + esc(c.solo.name) + '</b> ' + kcal(r.kcal * M.mult(c.solo)) + ' kcal, ' + Math.round(r.protein * M.mult(c.solo)) + ' g ' + S("protein") + '</p>'
      : '<p class="split-label">' + S("splitLabel") + '</p>' + split(r.kcal, r.protein);

    $("#view-recipe").innerHTML =
      '<a class="back" href="#/recipes" data-back>‹ ' + S("back") + '</a>' +
      '<header class="rhead ' + r.cuisine + '">' +
        '<h1 class="dish" lang="en">' + esc(r.name) + '</h1>' +
        '<p class="dish-sub" lang="en">' + esc(r.short) + '</p>' +
        '<ul class="facts"><li>' + r.time + ' min</li><li>' + CUIS[r.cuisine][L()] + '</li><li>' + S(r.meal) + '</li><li>' + r.fibre + ' g ' + S("fibre") + '</li></ul>' +
      '</header>' +
      (r.ahead ? '<p class="tape" lang="en">' + esc(r.ahead) + '</p>' : "") +
      '<section class="forwho"><h2>' + S("cookingFor") + '</h2>' + who + plus +
        '<p class="makes">' + makes + (asWritten ? " " + S("asWritten") : "") + '</p>' + plate + '</section>' +
      '<section class="block"><h2>' + S("ingredients") + '</h2><ul class="checks ing">' + ings + '</ul></section>' +
      '<section class="block"><h2>' + S("method") + '</h2>' +
        (asWritten ? "" : '<p class="note">' + S("methodNote", { n: r.serves }) + '</p>') +
        '<ol class="checks steps" lang="en">' + steps + '</ol></section>' +
      (r.tip ? '<aside class="tip"><h2>' + S("note") + '</h2><p lang="en">' + esc(r.tip) + '</p></aside>' : "") +
      (r.why ? '<aside class="tip"><h2>' + S("why") + '</h2><p lang="en">' + esc(r.why) + '</p></aside>' : "") +
      (wakeSupported() ? '<label class="switch wake"><input type="checkbox" data-wake' + (wake ? " checked" : "") + '><span>' + S("keepOn") + '</span></label>' : "") +
      '<p class="fine">' + S("estimates") + '</p>';
  }

  /* keep the screen on while cooking, where the browser can */
  var wake = null;
  function wakeSupported() { return typeof navigator !== "undefined" && "wakeLock" in navigator; }
  function requestWake() {
    navigator.wakeLock.request("screen").then(function (w) {
      wake = w;
      /* the browser lets go of it when the page is hidden; ask again on the way back */
      w.addEventListener("release", function () { wake = null; });
    }, function () {
      wake = null;
      var box = $("[data-wake]"); if (box) box.checked = false;
    });
  }
  function releaseWake() { if (wake && wake.release) wake.release(); wake = null; }

  /* ---------- the two of you ---------- */
  function derived(p) {
    var i = state.people.indexOf(p), sh = M.shares(state.people)[i];
    return S("personLine", {
      pct: Math.round(sh * 100),
      protein: Math.round(M.AVG.protein * M.mult(p)),
      dinner: kcal(DINNER_AVG * M.mult(p))
    });
  }
  function calcResult(pid) {
    var c = store.json("calc")[pid] || {};
    var b = { sex: c.sex === "f" || c.sex === "m" ? c.sex : (pid === "p2" ? "f" : "m"), kg: Number(c.kg), cm: Number(c.cm), age: Number(c.age), activity: c.activity || "low" };
    if (!(b.kg >= 35 && b.kg <= 250 && b.cm >= 120 && b.cm <= 220 && b.age >= 18 && b.age <= 95)) {
      return '<p class="note">' + S("calcEmpty") + '</p>';
    }
    var s = M.suggest(b);
    return '<p class="calc-out">' + S(s.cut ? "calcResult" : "calcResultNoCut", { maint: kcal(s.maintenance), target: kcal(s.target) }) + '</p>' +
      '<button class="btn" data-use="' + pid + '" data-kcal-value="' + s.target + '">' + S("calcUse", { target: kcal(s.target) }) + '</button>';
  }
  function renderUs() {
    var calc = store.json("calc");
    var cards = state.people.map(function (p, i) {
      var c = calc[p.id] || {}, sex = c.sex === "f" || c.sex === "m" ? c.sex : (p.id === "p2" ? "f" : "m");
      function field(key, label, min, max) {
        return '<label class="field"><span>' + label + '</span><input type="number" inputmode="decimal" min="' + min + '" max="' + max + '" data-calc="' + p.id + '" data-key="' + key + '" value="' + esc(c[key] || "") + '"></label>';
      }
      return '<section class="person person' + (i + 1) + '">' +
        '<label class="field field-name"><span>' + S("name") + '</span><input type="text" maxlength="16" data-name="' + p.id + '" value="' + esc(p.name) + '"></label>' +
        '<div class="stepper"><button data-kcal="' + p.id + '" data-step="-50" aria-label="' + esc(S("less")) + '">−</button>' +
          '<output id="kcal-' + p.id + '"><b>' + kcal(p.kcal) + '</b> ' + S("kcalDay") + '</output>' +
          '<button data-kcal="' + p.id + '" data-step="50" aria-label="' + esc(S("more")) + '">+</button></div>' +
        '<p class="person-line" id="line-' + p.id + '">' + derived(p) + '</p>' +
        '<details class="calc"><summary>' + S("calcTitle") + '</summary>' +
          '<div class="calc-grid">' +
            '<label class="field"><span>' + S("calcSex") + '</span><select data-calc="' + p.id + '" data-key="sex">' +
              '<option value="m"' + (sex === "m" ? " selected" : "") + '>' + S("calcMale") + '</option>' +
              '<option value="f"' + (sex === "f" ? " selected" : "") + '>' + S("calcFemale") + '</option></select></label>' +
            field("age", S("calcAge"), 18, 95) + field("cm", S("calcHeight"), 120, 220) + field("kg", S("calcWeight"), 35, 250) +
            '<label class="field field-wide"><span>' + S("calcActivity") + '</span><select data-calc="' + p.id + '" data-key="activity">' +
              ["low", "some", "high"].map(function (a) {
                return '<option value="' + a + '"' + ((c.activity || "low") === a ? " selected" : "") + '>' + S("act_" + a) + '</option>';
              }).join("") + '</select></label>' +
          '</div><div id="calc-' + p.id + '">' + calcResult(p.id) + '</div>' +
          '<p class="fine">' + S("calcNote") + '</p></details>' +
        '</section>';
    }).join("");

    $("#usSettings").innerHTML =
      '<header class="head"><h1>' + S("usTitle") + '</h1><p class="head-sub">' + S("usSub") + '</p></header>' +
      '<div class="people">' + cards + '</div>' +
      '<p class="note">' + S("usNote", { avg: kcal(M.AVG.kcal) }) + ' <button class="linkish" data-reset>' + S("usReset") + '</button></p>';
  }
  function refreshPerson(p) {
    $("#kcal-" + p.id).innerHTML = '<b>' + kcal(p.kcal) + '</b> ' + S("kcalDay");
    state.people.forEach(function (x) { $("#line-" + x.id).textContent = derived(x); });
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-back],[data-print],[data-share],[data-clear],[data-who],[data-kcal],[data-use],[data-reset],[data-lang],[data-reroll],[data-unswap],[data-send],.chip") : null;
    if (!t) return;
    if (t.hasAttribute("data-reroll") || t.hasAttribute("data-unswap")) {
      var wk = M.parseISO(t.getAttribute("data-monday") || t.getAttribute("data-unswap")), which = t.getAttribute("data-reroll");
      if (t.hasAttribute("data-unswap")) M.setSwaps(wk, "0000000");
      else M.reroll(wk, which === "all" ? null : Number(which));
      saveSwaps(wk);
      render();
      /* the button was redrawn: put focus back on its replacement */
      var same = which == null ? null : $$('[data-reroll="' + which + '"]').filter(function (b) { return b.offsetParent !== null; })[0];
      if (same) same.focus(); else if ($("#main").focus) $("#main").focus({ preventScroll: true });
      return;
    }
    if (t.hasAttribute("data-send")) {
      var m = M.parseISO(t.getAttribute("data-send"));
      var url = location.href.split("#")[0] + "#/week/" + M.iso(m) + "/" + M.getSwaps(m);
      if (navigator.share) navigator.share({ title: "Mesa Dos", text: S("sendWeekText", { week: M.weekOf(m) }), url: url }).catch(function () {});
      else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast(S("linkCopied")); }, function () { toast(S("copyFailed")); });
      else toast(S("copyFailed"));
      return;
    }
    if (t.hasAttribute("data-back")) {
      if (trail.length > 1) { e.preventDefault(); history.back(); }
    } else if (t.hasAttribute("data-print")) {
      window.print();
    } else if (t.hasAttribute("data-share")) {
      var text = shareText(shopMonday());
      if (navigator.share) navigator.share({ title: "Mesa Dos", text: text }).catch(function () {});
      else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast(S("copied")); }, function () { toast(S("copyFailed")); });
      else toast(S("copyFailed"));
    } else if (t.hasAttribute("data-clear")) {
      store.del("checks." + M.iso(shopMonday()));
      renderShop();
    } else if (t.hasAttribute("data-who")) {
      state.who = t.getAttribute("data-who");
      renderRecipe();
      var again = $('[data-who="' + state.who + '"]'); if (again) again.focus();
    } else if (t.hasAttribute("data-kcal") || t.hasAttribute("data-use")) {
      var pid = t.getAttribute("data-kcal") || t.getAttribute("data-use");
      var p = state.people.filter(function (x) { return x.id === pid; })[0];
      p.kcal = t.hasAttribute("data-use") ? Number(t.getAttribute("data-kcal-value"))
                                          : Math.max(1000, Math.min(3500, p.kcal + Number(t.getAttribute("data-step"))));
      savePeople(); refreshPerson(p);
      if (t.hasAttribute("data-use")) toast(S("saved"));
    } else if (t.hasAttribute("data-reset")) {
      store.del("people"); state.people = loadPeople(); renderUs();
    } else if (t.hasAttribute("data-lang")) {
      setLang(t.getAttribute("data-lang"));
    } else if (t.classList.contains("chip")) {
      if (t.hasAttribute("data-meal")) state.meal = t.getAttribute("data-meal");
      else state.cuisine = t.getAttribute("data-cuisine");
      syncFilters(); renderRecipeList();
    }
  });

  document.addEventListener("change", function (e) {
    var t = e.target, a = function (n) { return t.getAttribute && t.getAttribute(n); };
    if (!t || !t.getAttribute) return;
    var o, key;
    if (a("data-id") != null || a("data-need") != null) {
      var mon = shopMonday();
      key = (a("data-id") != null ? "checks." : "need.") + M.iso(mon);
      o = store.json(key);
      var id = a("data-id") != null ? a("data-id") : a("data-need");
      if (t.checked) o[id] = 1; else delete o[id];
      store.set(key, JSON.stringify(o));
      /* a tick only changes the totals; rebuilding the list would drop keyboard focus.
         Adding a cupboard item does change the list, so that one is redrawn. */
      if (a("data-need") != null) {
        renderShop();
        var box = $$("#pantryList input").filter(function (x) { return x.getAttribute("data-need") === id; })[0];
        if (box) box.focus();
      } else {
        $("#shopSum").innerHTML = shopSummary(shopState(mon));
      }
    } else if (a("data-prep") != null) {
      key = "prep." + M.iso(state.route.date);
      o = store.json(key);
      if (t.checked) o[a("data-prep")] = 1; else delete o[a("data-prep")];
      store.set(key, JSON.stringify(o));
    } else if (a("data-ing") != null || a("data-step") != null) {
      var ticks = cooked[state.route.id];
      if (a("data-ing") != null) ticks.ing[a("data-ing")] = t.checked; else ticks.step[a("data-step")] = t.checked;
    } else if (t.hasAttribute("data-plus")) {
      state.plus = t.checked;
      renderRecipe();
      var sw = $("[data-plus]"); if (sw) sw.focus();
    } else if (t.hasAttribute("data-wake")) {
      if (t.checked) requestWake(); else releaseWake();
    } else if (a("data-name") != null) {
      var who = state.people.filter(function (x) { return x.id === a("data-name"); })[0];
      who.name = t.value.trim().slice(0, 16) || PEOPLE.filter(function (x) { return x.id === who.id; })[0].name;
      t.value = who.name;
      savePeople();
    } else if (a("data-calc") != null) {
      o = store.json("calc");
      (o[a("data-calc")] || (o[a("data-calc")] = {}))[a("data-key")] = t.value;
      store.set("calc", JSON.stringify(o));
      $("#calc-" + a("data-calc")).innerHTML = calcResult(a("data-calc"));
    }
  });

  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "q") { state.q = e.target.value; renderRecipeList(); }
  });

  /* radio groups: one tab stop, arrow keys move and select */
  document.addEventListener("keydown", function (e) {
    var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    var b = e.target;
    if (!step || !b || !b.getAttribute || b.getAttribute("role") !== "radio") return;
    var group = b.closest('[role="radiogroup"]');
    if (!group) return;
    var btns = $$('[role="radio"]', group), i = btns.indexOf(b);
    e.preventDefault();
    var next = btns[(i + step + btns.length) % btns.length];
    var sel = next.hasAttribute("data-lang") ? '[data-lang="' + next.getAttribute("data-lang") + '"]' : '[data-who="' + next.getAttribute("data-who") + '"]';
    next.click();
    var again = $(sel); if (again) again.focus();
  });

  function setLang(l) {
    if (!SLOTS[l] || l === state.lang) return;
    state.lang = l;
    store.set("lang", l);
    applyChrome();
    render();
  }

  window.addEventListener("hashchange", function () { go(false); });
  /* a phone left open overnight should not still say it is yesterday */
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") return;
    if (wake === null && $("[data-wake]") && $("[data-wake]").checked) requestWake();
    var t = now();
    if (M.iso(t) !== M.iso(today)) { today = t; state.route = parseRoute(location.hash); render(); }
  });

  /* ---------- start ---------- */
  prune(today);
  loadSwaps();
  applyChrome();
  go(true);

  /* ---------- offline ----------
     sw.js is network-first, so an edit on disk is still live on the next request. Where
     service workers are unavailable (some in-app browsers) this is skipped. */
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline support is optional */ });
    });
  }
})();
