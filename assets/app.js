/* Mesa Dos — UI logic. No dependencies, no build step. */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RID = {};
  RECIPES.forEach(function (r) { RID[r.id] = r; });

  var LS = "mesa2.";
  var state = {
    week: localStorage.getItem(LS + "week") || "A",
    plate: localStorage.getItem(LS + "plate") || "normal",
    lang: localStorage.getItem(LS + "lang") || "en",
    cuisine: "all",
    meal: "all"
  };

  /* ---------- language ---------- */
  var CUIS = { peru: { en: "Peruvian", fi: "Perulainen" }, asia: { en: "Asian", fi: "Aasialainen" }, europe: { en: "European", fi: "Eurooppalainen" } };
  var MEALNAME = { dinner: { en: "Dinner", fi: "Päivällinen" }, breakfast: { en: "Breakfast", fi: "Aamiainen" }, lunch: { en: "Lunch", fi: "Lounas" }, snack: { en: "Snack", fi: "Välipala" } };

  function enOf(s) {
    if (s == null || s === "") return s;
    if (I18N[s]) return I18N[s];
    var o = String(s);
    for (var i = 0; i < I18N_WORDS.length; i++) o = o.replace(I18N_WORDS[i][0], I18N_WORDS[i][1]);
    return o;
  }
  function L() { return state.lang; }
  function P(s) { return L() === "en" ? enOf(s) : s; }
  function ALT(s) { var o = L() === "en" ? s : enOf(s); return o !== P(s) ? o : ""; }
  function S(k) { return SLOTS[L()][k]; }
  function plateLabel() { return L() === "fi" ? PLATE[state.plate].labelFi : PLATE[state.plate].label; }

  function mult() { return PLATE[state.plate].k; }
  function num(n) { return Math.round(n / 10) * 10; }
  function fi(n) { return String(n).replace(".", ","); }
  function kcal(n) { return num(n).toLocaleString("fi-FI"); }
  function euro(n) { return fi(n.toFixed(2)) + " €"; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function qty(ing) {
    var u = ing.u || "";
    if (!ing.s || typeof ing.n !== "number") {
      if (ing.n === "" || ing.n == null) return u;
      return ing.n + (u ? " " + u : "");
    }
    var v = ing.n * mult(), r;
    if (u === "kpl") { r = Math.round(v * 2) / 2; r = r % 1 === 0 ? String(r) : fi(String(r)); }
    else if (v >= 100) { r = String(Math.round(v / 10) * 10); }
    else if (v >= 20) { r = String(Math.round(v / 5) * 5); }
    else { r = fi(String(Math.round(v * 10) / 10)); }
    return r + " " + u;
  }
  function qtyText(s) { return L() === "en" ? enOf(s) : s; }

  /* ---------- tabs ---------- */
  var TABS = ["plan", "recipes", "shop", "basics"];
  function showTab(name) {
    if (TABS.indexOf(name) < 0) name = "plan";
    TABS.forEach(function (t) { $("#panel-" + t).hidden = t !== name; });
    $$(".tab").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-tab") === name); });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  $("#tabs").addEventListener("click", function (e) {
    var b = e.target.closest(".tab");
    if (!b) return;
    var t = b.getAttribute("data-tab");
    if (location.hash !== "#" + t) location.hash = t; else showTab(t);
  });
  window.addEventListener("hashchange", function () { showTab(location.hash.replace("#", "")); });
  $$("[data-goto]").forEach(function (b) {
    b.addEventListener("click", function () { location.hash = b.getAttribute("data-goto"); });
  });

  /* ---------- hero ---------- */
  function shopTotal(week) {
    var t = 0;
    SHOP[week].forEach(function (a) { a.items.forEach(function (i) { t += i.p; }); });
    return t;
  }
  function renderHero() {
    var t = shopTotal("A");
    $("#heroStats").innerHTML = [
      '<div class="stat"><b>' + kcal(TARGET.typical) + '</b><span>kcal a day, each</span></div>',
      '<div class="stat"><b>' + TARGET.protein + ' g</b><span>protein a day</span></div>',
      '<div class="stat"><b>' + euro(t) + '</b><span>one week, two people</span></div>',
      '<div class="stat"><b>' + RECIPES.length + '</b><span>recipes, 2 servings each</span></div>'
    ].join("");
    $("#kcalTargetInline").textContent = kcal(TARGET.typical);
  }

  /* ---------- week plan ---------- */
  function mealInfo(entry) {
    if (entry.leftover) {
      var r = RID[entry.leftover];
      return { r: r, name: r.name, kcal: r.kcal, protein: r.protein, leftover: true };
    }
    var x = RID[entry.id];
    return { r: x, name: x.name, kcal: x.kcal, protein: x.protein, leftover: false };
  }

  function renderPlan() {
    var days = PLAN[state.week];
    $("#days").innerHTML = days.map(function (d) {
      var stack = [
        { slot: "breakfast", entry: { id: d.bf } },
        { slot: "lunch", entry: d.lunch },
        { slot: "dinner", entry: { id: d.dinner } },
        { slot: "snack", entry: { id: d.snack } }
      ].map(function (m) {
        var info = mealInfo(m.entry);
        var prefix = info.leftover ? S("leftover") + " · " : "";
        return '<li><button class="meal" data-recipe="' + info.r.id + '">' +
          '<span class="slot">' + S(m.slot) + '</span>' +
          '<span class="what">' + prefix + esc(info.name) +
            (info.leftover ? '<small>' + S("before") + '</small>' : '<small>' + info.r.time + ' min · ' + esc(CUIS[info.r.cuisine][L()]) + '</small>') +
          '</span>' +
          '<span class="kp">' + kcal(info.kcal * mult()) + '</span>' +
          '</button></li>';
      }).join("");

      if (d.extra) {
        stack += '<li><div class="meal extra"><span class="slot">' + S("topup") + '</span>' +
          '<span class="what">' + esc(d.extra.text) + '<small>' + S("hungry") + '</small></span>' +
          '<span class="kp">' + kcal(d.extra.kcal * mult()) + '</span></div></li>';
      }

      var tot = 0, prot = 0;
      [{ id: d.bf }, d.lunch, { id: d.dinner }, { id: d.snack }].forEach(function (e) {
        var i = mealInfo(e); tot += i.kcal; prot += i.protein;
      });
      if (d.extra) { tot += d.extra.kcal; prot += d.extra.protein; }

      return '<article class="day">' +
        '<div class="day-head"><h3>' + d.day + '</h3><span class="kcal">' + kcal(tot * mult()) + ' kcal · ' + Math.round(prot * mult()) + ' g</span></div>' +
        '<ul class="meals">' + stack + '</ul>' +
        '<div class="day-foot"><span>' + esc(WEEK_NOTE[state.week].split(":")[0]) + '</span><span>' + S("portions2") + '</span></div>' +
        '</article>';
    }).join("");

    $$("#days .meal[data-recipe]").forEach(function (b) {
      b.addEventListener("click", function () { openRecipe(b.getAttribute("data-recipe")); });
    });

    $("#plateHint").textContent = plateLabel() + " — " + (L() === "fi" ? "annokset ja kalorit kertoimella " : "portions and calories at ") +
      (mult() === 1 ? "1×" : fi(String(mult())) + "×") + (L() === "fi" ? ". Kypsennysaika ei muutu." : ". Cooking times don't change.");
  }

  /* ---------- controls ---------- */
  function syncSegs() {
    $$("#weekSeg button,#shopWeekSeg button").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-week") === state.week);
    });
    $$("#plateSeg button").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-plate") === state.plate);
    });
    $$("#langSeg button").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-lang") === state.lang);
    });
  }
  $$("#weekSeg button,#shopWeekSeg button").forEach(function (b) {
    b.addEventListener("click", function () {
      state.week = b.getAttribute("data-week");
      localStorage.setItem(LS + "week", state.week);
      syncSegs(); renderPlan(); renderShop();
    });
  });
  $$("#plateSeg button").forEach(function (b) {
    b.addEventListener("click", function () {
      state.plate = b.getAttribute("data-plate");
      localStorage.setItem(LS + "plate", state.plate);
      syncSegs(); renderPlan(); renderRecipes();
      if (!$("#modal").hidden && $("#modalBody").dataset.rid) openRecipe($("#modalBody").dataset.rid);
    });
  });
  $$("#langSeg button").forEach(function (b) {
    b.addEventListener("click", function () {
      state.lang = b.getAttribute("data-lang");
      localStorage.setItem(LS + "lang", state.lang);
      document.documentElement.lang = state.lang;
      syncSegs(); renderPlan(); renderRecipes(); renderShop();
      if (!$("#modal").hidden && $("#modalBody").dataset.rid) openRecipe($("#modalBody").dataset.rid);
    });
  });

  /* ---------- recipes ---------- */
  var CUISINES = [["all", "All"], ["peru", "Peruvian"], ["asia", "Asian"], ["europe", "European"]];
  var MEALS = [["all", "Everything"], ["dinner", "Dinners"], ["breakfast", "Breakfasts"], ["lunch", "Lunches"], ["snack", "Snacks"]];

  function renderFilters() {
    $("#filters").innerHTML = MEALS.map(function (m) {
      return '<button class="chip' + (state.meal === m[0] ? " on" : "") + '" data-meal="' + m[0] + '">' + m[1] + '</button>';
    }).join("") + '<span style="flex:1 1 12px"></span>' + CUISINES.map(function (c) {
      return '<button class="chip' + (state.cuisine === c[0] ? " on" : "") + '" data-cuisine="' + c[0] + '">' + c[1] + '</button>';
    }).join("");
    $$("#filters [data-meal]").forEach(function (b) {
      b.addEventListener("click", function () { state.meal = b.getAttribute("data-meal"); renderFilters(); renderRecipes(); });
    });
    $$("#filters [data-cuisine]").forEach(function (b) {
      b.addEventListener("click", function () { state.cuisine = b.getAttribute("data-cuisine"); renderFilters(); renderRecipes(); });
    });
  }

  function renderRecipes() {
    var list = RECIPES.filter(function (r) {
      return (state.cuisine === "all" || r.cuisine === state.cuisine) &&
             (state.meal === "all" || r.meal === state.meal);
    });
    var order = { dinner: 0, breakfast: 1, lunch: 2, snack: 3 };
    list.sort(function (a, b) { return order[a.meal] - order[b.meal] || a.name.localeCompare(b.name); });

    if (!list.length) {
      $("#recipeGrid").innerHTML = '<p class="muted">Nothing matches that combination — try another filter.</p>';
      return;
    }
    $("#recipeGrid").innerHTML = list.map(function (r) {
      return '<button class="rcard" data-recipe="' + r.id + '">' +
        '<span class="tag ' + r.cuisine + '">' + MEALNAME[r.meal][L()] + ' · ' + CUIS[r.cuisine][L()] + '</span>' +
        '<h3>' + esc(r.name) + '</h3>' +
        '<p class="desc">' + esc(r.short) + '</p>' +
        '<span class="meta"><span><b>' + kcal(r.kcal * mult()) + '</b> kcal</span>' +
        '<span><b>' + Math.round(r.protein * mult()) + '</b> g</span>' +
        '<span>' + r.time + ' min</span></span>' +
        '</button>';
    }).join("");

    $$("#recipeGrid .rcard").forEach(function (b) {
      b.addEventListener("click", function () { openRecipe(b.getAttribute("data-recipe")); });
    });
  }

  /* ---------- recipe modal ---------- */
  var lastFocus = null;
  function openRecipe(id) {
    var r = RID[id];
    if (!r) return;
    lastFocus = document.activeElement;

    var ings = r.ingredients.map(function (i) {
      var a = ALT(i.t);
      return '<li><span>' + esc(P(i.t)) + (a ? ' <span class="alt">' + esc(a) + '</span>' : '') + '</span>' +
             '<span>' + esc(qtyText(qty(i))) + '</span></li>';
    }).join("");

    var steps = r.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join("");

    $("#modalBody").dataset.rid = r.id;
    $("#modalBody").innerHTML =
      '<p class="m-eyebrow">' + CUIS[r.cuisine][L()] + ' · ' + MEALNAME[r.meal][L()] + ' · ' + S("serves") + '</p>' +
      '<h2 class="m-title" id="modalTitle">' + esc(r.name) + '</h2>' +
      '<p class="m-sub">' + esc(r.short) + '</p>' +
      '<div class="m-stats">' +
        '<div class="m-stat"><b>' + kcal(r.kcal * mult()) + '</b>kcal / ' + S("portion") + '</div>' +
        '<div class="m-stat"><b>' + Math.round(r.protein * mult()) + ' g</b>' + S("protein") + '</div>' +
        '<div class="m-stat"><b>' + Math.round(r.fibre * mult()) + ' g</b>' + S("fibre") + '</div>' +
        '<div class="m-stat"><b>' + r.time + ' min</b>' + S("time") + '</div>' +
        '<div class="m-stat"><b>' + plateLabel() + '</b>' + S("setting") + '</div>' +
      '</div>' +
      '<div class="m-cols">' +
        '<div><h4>' + S("forTwo") + '</h4><ul class="ing">' + ings + '</ul></div>' +
        '<div><h4>' + S("method") + '</h4><ol class="steps">' + steps + '</ol></div>' +
      '</div>' +
      (r.tip ? '<div class="m-tip"><b>' + S("note") + '</b>' + esc(r.tip) + '</div>' : "") +
      (r.why ? '<div class="m-tip"><b>' + S("why") + '</b>' + esc(r.why) + '</div>' : "") +
      '<p class="nutri">' + S("nutri") + plateLabel().toLowerCase() + '.</p>';

    $("#modal").hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { var c = $(".modal-close"); if (c) c.focus(); }, 30);
  }

  function closeModal() {
    $("#modal").hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$("#modal [data-close],.modal-backdrop").forEach(function (el) { el.addEventListener("click", closeModal); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("#modal").hidden) closeModal(); });

  /* ---------- shopping ---------- */
  function checksKey() { return LS + "checks." + state.week; }
  function getChecks() {
    try { return JSON.parse(localStorage.getItem(checksKey()) || "{}"); } catch (e) { return {}; }
  }
  function setChecks(o) { localStorage.setItem(checksKey(), JSON.stringify(o)); }

  function renderShop() {
    var weeks = SHOP[state.week];
    var checks = getChecks();
    var total = 0, done = 0, doneSum = 0, count = 0;

    var html = weeks.map(function (aisle) {
      var rows = aisle.items.map(function (i) {
        total += i.p; count += 1;
        if (checks[i.id]) { done += 1; doneSum += i.p; }
        var a = ALT(i.n);
        return '<li class="shop-item"><label><input type="checkbox" data-id="' + i.id + '"' + (checks[i.id] ? " checked" : "") + '>' +
          '<span class="txt">' + esc(P(i.n)) + (a ? ' <span class="alt">' + esc(a) + '</span>' : '') +
          ' <span class="muted">· ' + esc(qtyText(i.q)) + '</span>' +
          (i.note ? '<small>' + esc(i.note) + '</small>' : "") + '</span></label>' +
          '<span class="price">' + euro(i.p) + '</span></li>';
      }).join("");
      return '<section class="shop-aisle"><h3>' + esc(P(aisle.aisle)) + '</h3><ul class="shop-items">' + rows + '</ul></section>';
    }).join("");

    $("#shopList").innerHTML = html;

    var perPerson = total / 2, perDay = total / 14;
    $("#shopSide").innerHTML =
      '<div class="sumcard">' +
        '<h3>' + (L() === "fi" ? "Viikon " + state.week + " ostoskori" : "Week " + state.week + " basket") + '</h3>' +
        '<div class="sumrow"><span>' + (L() === "fi" ? "Tuotteita" : "Items on the list") + '</span><b>' + count + '</b></div>' +
        '<div class="sumrow"><span>' + (L() === "fi" ? "Valittu" : "Ticked off") + '</span><b>' + done + ' / ' + count + '</b></div>' +
        '<div class="sumrow"><span>' + (L() === "fi" ? "Vielä ostettavaa" : "Still to buy") + '</span><b>' + euro(total - doneSum) + '</b></div>' +
        '<div class="sumtotal"><span>' + (L() === "fi" ? "Arvio yhteensä" : "Estimated total") + '</span><b>' + euro(total) + '</b></div>' +
        '<p>' + euro(perPerson) + (L() === "fi" ? " per henkilö viikossa, " : " per person for the week, ") + euro(perDay) +
          (L() === "fi" ? " per henkilö päivässä. Vain tuoreet tuotteet — kuivakaappi alla." : " per person per day. Fresh items only — pantry stock is listed below and lasts weeks.") + '</p>' +
      '</div>' +
      '<div class="store-note">' +
        '<b>Where to buy.</b><br>' + STORES.map(function (s) { return '<br><b>' + esc(s.name) + '</b> — ' + esc(s.note); }).join("") +
      '</div>';

    $$("#shopList input[type=checkbox]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var c = getChecks();
        if (cb.checked) c[cb.getAttribute("data-id")] = 1; else delete c[cb.getAttribute("data-id")];
        setChecks(c);
        renderShop();
      });
    });

    $("#pantryList").innerHTML = PANTRY.map(function (p) {
      var a = ALT(p.n);
      return '<li><b>' + esc(P(p.n)) + '</b>' + (a ? ' <span class="alt">' + esc(a) + '</span>' : '') +
        ' · ' + esc(qtyText(p.q)) + ' · ' + euro(p.p) + (p.note ? ' <span class="muted">(' + esc(p.note) + ')</span>' : "") + '</li>';
    }).join("");
  }

  $("#printBtn").addEventListener("click", function () { window.print(); });
  $("#clearChecks").addEventListener("click", function () {
    localStorage.removeItem(checksKey());
    renderShop();
  });

  /* ---------- init ---------- */
  document.documentElement.lang = state.lang;
  showTab(location.hash.replace("#", "") || "plan");
  syncSegs();
  renderHero();
  renderPlan();
  renderFilters();
  renderRecipes();
  renderShop();
})();
