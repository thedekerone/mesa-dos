# Mesa Dos

A two-person meal-planning site for weight loss, built around Peruvian, Asian and European home cooking and Finnish supermarket ingredients.

**Live:** https://meals.white-snakes.com

No framework, no build step, no dependencies, no external fonts or CDNs. Four data files plus one app file. If the files are on disk, the site is deployed.

---

## What it does

- **Two-week dinner rotation** (Week A / Week B), each day showing breakfast, lunch, dinner, snack and an optional *top-up* line for the lighter days.
- **30 recipes**, two servings each: Peruvian (lomo saltado, pollo a la brasa, ceviche, ají de gallina, causa, cod with salsa criolla), Asian (miso salmon, Korean lettuce wraps, green curry, pho, pork meatballs), European (Greek traybake, minestrone, baked feta pasta), plus breakfasts, lunches and snacks.
- **Plate scaler** — Lighter 0.8× / Standard 1.0× / Hearty 1.2× — scales ingredient quantities, kcal and protein everywhere, including open recipe modals. Cooking times are unaffected.
- **Shopping lists** per week, grouped by Finnish store aisle, with indicative prices and a running total. Ticks persist in localStorage.
- **EN / FI toggle** for ingredient and shopping names. When English is selected the Finnish product name is kept as grey secondary text, because you still have to find the thing in Prisma.
- **Pantry list** — the buy-once items that make the weekly shop cheap.

## Files

| File | What it is |
|---|---|
| `index.html» | Page shell, section markup, hero copy, prose for the Basics tab |
| `assets/styles.css» | Everything visual, including print styles |
| `assets/recipes.js» | `RECIPES» array — 30 recipes, the whole content model |
| `assets/plan.js» | `PLAN» (weeks A/B), `TARGET», `PLATE», `WEEK_NOTE» |
| `assets/shopping.js» | `SHOP» (per-week baskets), `PANTRY», `STORES», `AISLE_ORDER» |
| `assets/i18n.js» | `I18N» (Finnish → English), `I18N_WORDS», `SLOTS» (UI labels) |
| `assets/app.js» | Rendering, routing, scaling, modal, shopping checkboxes, language switch |
| `test/*.test.js» | Node-only tests, no dependencies |

### Data shapes

```js
// recipe
{ id:"a1", meal:"dinner"|"breakfast"|"lunch"|"snack", cuisine:"peru"|"asia"|"europe",
  name, short, time:35, kcal:520, protein:41, fibre:6,
  ingredients:[{ t:"Naudan paistisuikale", n:300, u:"g", s:1 }],
  steps:["..."], tip:"...", why:"..." }

// plan day
{ day:"Monday", bf:"bf1", lunch:{id:"ln2"} | {leftover:"a1"}, dinner:"a1", snack:"sn1",
  extra:{ text:"200 g skyr + 1 boiled egg", kcal:250, protein:25 } }

// shopping item
{ id:"A30", n:"Kanan filee", q:"800 g", p:8.49, note:"Greek tray + quinoa salad" }
```

Ingredients: `n» is the number, `u» the unit, `s:1» marks it as scalable. Only bulk units (g / ml / dl / kpl) set `s»; anything without it is left alone at every plate size — deliberate for "1 tbsp" style seasonings. `n:""» with a unit alone means "to taste".

## Hard rules

1. **No build step and no dependencies.** Plain script tags, no modules, no bundler. Served by a static file server.
2. **No external requests.** No Google Fonts, no CDN, no analytics, no remote images. It must render on a bad connection and behind a pi-hole.
3. **Mobile first.** Most reading happens on a phone inside Telegram's in-app browser. Check 390 px before 1280 px. Keep the print stylesheet working — it is how the shopping list gets used.
4. **Honest numbers.** kcal and protein are estimates; never state a claim the data does not support. Tests recompute daily totals — if you change portions, update the copy in `index.html» and `TARGET» in `plan.js» to match the arithmetic.
5. **Keep localStorage keys stable** (`mesa2.week», `mesa2.plate», `mesa2.lang», `mesa2.checks.A|B») so existing users keep their ticks.
6. **Bilingual data.** Any new ingredient or shopping item needs an `I18N» entry. `node test/i18n-coverage.test.js» fails if you forget.
7. **Prices are indicative** (K-Market/Prisma, Nov 2026). Keep them plausible for Finland; do not invent precision.

## Run it locally

```bash
cd meals
python3 -m http.server 8100 --bind 127.0.0.1
# open http://127.0.0.1:8100
npm test     # or: node test/render.test.js && node test/i18n-coverage.test.js
```

The render test runs `app.js» against a small DOM stub in both languages and asserts the page builds: 7 day cards, 30 recipe cards, translated quantities, Finnish secondary names, basket totals. It is the fast feedback loop — run it before and after touching rendering code.

## How it is deployed (do not break this)

```
launchd job com.openclaw.meals
  -> /usr/bin/python3 -m http.server 8101 --bind 127.0.0.1 --directory <this dir>
  -> cloudflared tunnel ingress: meals.white-snakes.com -> localhost:8101
```

Edits are live on the next request. Nothing to build, restart or invalidate. Paths are relative, so it also runs from a subdirectory or GitHub Pages.

## Backlog — where this could be better

Roughly in order of value:

1. **Two plate sizes at once.** The scale is global. The real household need is "one standard, one hearty", with a shopping list that adds both. Requires per-person multipliers in state, per-person kcal in day totals, and ingredient quantities shown as a range.
2. **Generate baskets from the plan.** `SHOP» is curated by hand, so adding a recipe does not change the shopping list. Aggregating ingredients by aisle — merging units, rounding sensibly — would let the plan be edited without breaking the shop.
3. **Week C and a vegetarian track.** `PLAN» supports more keys, but the UI assumes A/B in a few places (`#weekSeg», `WEEK_NOTE», `SHOP»).
4. **A printable one-page fridge sheet** — the week at a glance, large type, no navigation. Print currently formats only the shopping list.
5. **Accessibility pass.** The recipe modal does not trap focus, there is no aria-live on filter results, and the segments should be proper radio groups.
6. **Full Finnish translation** of prose and method steps. Names are done; roughly 2,000 words of steps are not.
7. **Photo support** — one image per recipe would change the feel, but it must stay local (no CDN) and small.
8. **PWA/offline** — service worker + manifest, so it works in a supermarket basement with no signal.
9. **Price freshness** — a per-item "checked on" date, or a small JSON the owner edits seasonally.
10. **More Peruvian coverage** — tacu tacu, arroz con pollo, sopa criolla — and Finnish seasonality (rocket in summer, roots in winter).

## Tone

It speaks like a competent friend who cooks, not a diet app. Short sentences, no exclamation marks, no "superfood", no moralising about food. If a change makes it sound like a wellness brand, it is wrong.

---

Maintained for a two-person household in Helsinki. Not medical advice.
