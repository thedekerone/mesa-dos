# Mesa Dos

What the two of us are cooking today. A different week every week — Peruvian, Mexican, Indian, Middle Eastern, Asian, European, Nordic — sized for two different plates, with a shopping list for Finnish supermarkets.

**Live:** https://meals.white-snakes.com

No framework, no build step, no dependencies, no external fonts or CDNs. Five data files, two script files, a small service worker. If the files are on disk, the site is deployed.

---

## What it does

- **Today.** Opens on today's date: tonight's dinner, how long it takes, how to split the pan between the two plates, the rest of the day's meals, and what has to happen tonight for tomorrow (stir the overnight oats, move the fish to the fridge, box the lunch portions).
- **A new week every week.** There is no fixed menu. Each week is dealt from the 30 dinners so that nothing comes back within three weeks, every week has fish and a meatless dinner, and dishes that keep land on the cook-double days. The deal depends only on the date, so both phones show the same week without talking to each other.
- **Two plates.** Each person has a daily kcal target. Everything is scaled from those two numbers: a 1 700 / 1 350 pair means one plate gets 56 % of every pot and the other 44 %. Nobody cooks a separate meal.
- **Cook once, eat twice.** Where tomorrow's lunch is tonight's dinner, the day says "cook double", the recipe opens at four portions and the shopping list buys for four.
- **Recipe screen.** Amounts for both of you, for one of you, with or without tomorrow's lunch. Tick ingredients and steps as you go. A switch keeps the screen on.
- **Week.** Seven dinners at a glance, this week, next week or any other. *Print for the fridge* gives one page.
- **Shopping list.** Added up from the plan, not written by hand: every recipe on the week, doubled where it should be, rounded up to what the shop sells, grouped by aisle. Ticks stay on the phone. *Send the list* shares what is left as text, which is how the list gets from one phone to the other. Cupboard staples are listed separately with what the week uses; tick one that is running low and it joins the list.
- **52 recipes** — 30 dinners, 7 breakfasts, 7 lunches, 8 snacks — searchable by name or ingredient, in either language. Everything in them is on the shelf at Prisma or K-Market; where the original ingredient is not (chipotle, mirin, saffron, holy basil), the recipe is written around what is.
- **EN / FI** for labels, ingredients and the shopping list. The other language's name stays as grey secondary text, because you still have to find the thing in Prisma. Recipe steps and prose stay in English.
- **Works offline** after the first visit and can be added to the home screen.

## Changing things

| To change | Edit |
|---|---|
| Names and daily targets | `assets/household.js` |
| Which days are cooked double, when a day gets a top-up | `COOK_DOUBLE`, `DAY_KCAL`, `TOPUPS` in `assets/plan.js` |
| Reshuffle every week from scratch | `ROTATION_START` in `assets/plan.js` (any Monday) |
| What can turn up for dinner | add or remove dinners in `assets/recipes.js` |
| A recipe | `assets/recipes.js` |
| A price, a pack size, an aisle | `PRODUCTS` in `assets/shopping.js` |

Names and targets can also be changed on the **Us** page, but that is saved on that phone only. The file is what both phones share.

`household.js` holds targets, not body measurements. The repository is public and the targets are all the site needs. The calculator on the Us page (Mifflin-St Jeor) keeps what is typed into it on the phone.

## Files

| File | What it is |
|---|---|
| `index.html` | Page shell, navigation, the "How this works" prose |
| `assets/styles.css` | Everything visual, including print styles |
| `assets/recipes.js` | `RECIPES` — the content |
| `assets/plan.js` | The rules a week is dealt by: `ROTATION_START`, `DAY_KCAL`, `COOK_DOUBLE`, `TOPUPS` |
| `assets/household.js` | `PEOPLE` — two names, two targets |
| `assets/shopping.js` | `PRODUCTS` (what the shop sells), `PANTRY` (buy once), `BUY` (ingredient → product), `STORES`, `AISLE_ORDER` |
| `assets/i18n.js` | `I18N` (Finnish → English names), `UNITS` (singular/plural in both languages), `SLOTS` (every interface string) |
| `assets/core.js` | The arithmetic: dealing a week, portions, plate shares, the shopping list. No DOM. |
| `assets/app.js` | The page: routing, six screens, events, what is remembered on the phone |
| `sw.js` | Service worker: network first, cache as the fallback. `CORE` lists what is stored on the first visit |
| `manifest.json`, `assets/*.png` | Home-screen name, colours and icons |
| `test/*.test.js` | Node-only tests, no dependencies |

### Data shapes

```js
// recipe — kcal / protein / fibre are per portion; the ingredient list makes `serves` portions
{ id:"a1", meal:"dinner"|"breakfast"|"lunch"|"snack", serves:2,
  cuisine:"peru"|"mexico"|"asia"|"india"|"mideast"|"europe"|"nordic",
  main:"chicken"|"fish"|"beef"|"pork"|"veg",   // dinners: what kind, so weeks stay mixed
  keeps:1,                                     // dinners: good as tomorrow's lunch
  name, short, time:35, kcal:520, protein:41, fibre:6,
  ingredients:[{ t:"Naudan paistisuikale", n:300, u:"g", s:1 }],
  steps:["..."], tip:"...", why:"...",
  ahead:"...",   // optional: has to happen the night before; shown on the previous day
  from:"b5" }    // optional: a lunch built on that dinner, which then makes extra

// a dealt day (core.js weekPlan) — nobody writes these by hand
{ bf:"bf1", lunch:{id:"ln2"} | {leftover:"a1"}, dinner:"a1", snack:"sn1", extra: <one of TOPUPS> | undefined }

// product — amounts add up in `u`, one purchase holds `pack` of it and costs `p`
"Valkosipuli": { a:0, u:"kpl", p:0.79, per:{ "kynttä":0.1 } }
```

Dinners are written for two (`serves:2`; the minestrone makes four). Breakfasts, snacks and most lunches are written for one, and the page doubles them.

Ingredients: `n` is the number, `u` the unit, `s:1` marks a bulk amount that follows the plate size. Counts and spoons ("2 cloves", "1 tbsp") have no `s`: they follow the number of portions but not the plate size. `n:""` with a unit alone means "to taste".

### How a week is dealt

1. Weeks are counted from `ROTATION_START`. The dinners are dealt in **cycles** of `floor(dinners / 7)` weeks (four, with 30 dinners). Within a cycle each dinner appears at most once.
2. Dinners are dealt by `main`, so fish, chicken, beef and meatless dinners are spread evenly across the cycle's weeks. Where two cycles meet, anything eaten in the last weeks is swapped further down, like for like, so the closest a dinner can repeat is three weeks.
3. Within the week, dishes with `keeps` go on the `COOK_DOUBLE` days (Mon, Tue, Thu, Sat) and become the next day's lunch; the longest cooks land on Saturday and Sunday. Sunday is never doubled, so a week's shopping covers exactly that week.
4. Four breakfasts and four snacks are drawn for the week and repeated, which keeps the shopping list short. Lunches that are not leftovers are drawn from the lunch recipes.
5. A day that comes out more than 150 kcal under `DAY_KCAL` gets the top-up that best fills the gap.

All of it is seeded by the week number, so it is the same on every device and the same tomorrow. Adding or removing a dinner, or moving `ROTATION_START`, reshuffles every week — including the current one.

### How the numbers work

1. The **average day** — one standard portion of everything, over two full cycles — is worked out from the dealt weeks (about 1 520 kcal).
2. A person's **multiplier** is their target over that average. Their plate, at every meal, is the standard portion times the multiplier.
3. A person's **share** of a pot is their target over the sum of both targets.
4. A dinner is cooked for 2 portions, or 4 when the next day's lunch is the same pot. If the two multipliers average within 3.5 % of 1, the recipe is cooked as written and only the split differs; otherwise the bulk amounts are scaled.
5. The **shopping list** runs every recipe on the week through steps 2–4, turns each ingredient line into a product via `BUY` and `per`, adds up, and rounds up to whole packs (a few grams over does not buy a second pack).

## Hard rules

1. **No build step and no dependencies.** Plain script tags, no modules, no bundler. Served by a static file server.
2. **No external requests.** No Google Fonts, no CDN, no analytics, no remote images. It must render on a bad connection and behind a pi-hole. The display type is whatever condensed sans the device already has.
3. **Mobile first.** Most reading happens on a phone, often inside Telegram's in-app browser. Check 390 px before 1280 px. Keep the print styles working: the fridge sheet and the shopping list each fit one page.
4. **Honest numbers.** kcal and protein are estimates; never state a claim the data does not support. Nothing on the page is a hand-typed total: averages, shares and baskets are all computed. Basket totals are rounded to whole euros on purpose.
5. **Both phones must agree.** Anything that decides what is cooked or bought lives in a data file. localStorage is only for ticks, the language, and per-phone overrides, and every key starts with `mesa2.`. All access goes through `store` in `app.js`, which survives browsers that block storage.
6. **Bilingual data.** Any new ingredient, product or pantry item needs an `I18N` entry, and any new interface string needs both languages in `SLOTS`. The tests fail if you forget.
7. **Every ingredient must be buyable.** A new ingredient line has to be a product name, a pantry name, or have a `BUY` entry (`null` for salt and pepper). `test/core.test.js` fails otherwise.
8. **Prices are indicative** (K-Market/Prisma, Nov 2026). Keep them plausible for Finland; do not invent precision.

### Adding a recipe

1. Add it to `RECIPES` with `serves`; a dinner also needs `main`, and `keeps:1` if it is good the next day. A new cuisine key needs a name in `CUIS` in `app.js`.
2. That is all the planning there is: it will be dealt into the weeks. (Every week reshuffles when the number of dinners changes.)
3. Run `npm test`. It will name every ingredient that has no translation and every one that cannot be bought. Fix those in `i18n.js` and `shopping.js`.

## Run it locally

```bash
python3 -m http.server 8100 --bind 127.0.0.1
# open http://127.0.0.1:8100
npm test     # five files in test/, about a second
```

| Test | What it catches |
|---|---|
| `data.test.js` | Broken recipe ids, a leftover lunch that is not the previous dinner, a product without a price or a known unit, a `BUY` entry pointing nowhere, an interface string missing in Finnish. |
| `core.test.js` | Two years of dealt weeks: same on every load, no dinner back within three weeks, fish and a meatless dinner every week, leftovers that really are last night's dinner, a shopping list that resolves every week. Plus plate shares, scaled amounts in both languages and the target calculator. |
| `render.test.js` | Runs `app.js` against a small DOM stub: every screen, eight weeks of days and every recipe, in both languages, plus a phone with storage blocked and one with junk in it. It asks `core.js` what a date should show rather than hard-coding dishes. |
| `offline.test.js` | A script, stylesheet or icon that `index.html` loads but `sw.js` does not store; anything loaded from another origin. |
| `i18n-coverage.test.js` | A Finnish data string with no English translation. |

To see a particular day without waiting for it, set `window.MESA_NOW = "2026-11-21"` before the scripts load, or open `#/day/2026-11-21`.

The DOM stub has no real elements, so it cannot see events. Keyboard use, focus, printing and offline behaviour need a look in a browser.

## How it is deployed (do not break this)

```
launchd job com.openclaw.meals
  -> /usr/bin/python3 -m http.server 8101 --bind 127.0.0.1 --directory <this dir>
  -> cloudflared tunnel ingress: meals.white-snakes.com -> localhost:8101
```

Edits are live on the next request. Nothing to build, restart or invalidate. Paths are relative, so it also runs from a subdirectory or GitHub Pages.

The service worker does not change this. It asks the server first, every time, and revalidates rather than trusting the browser's HTTP cache; the stored copy is used only when the server cannot be reached, or has not answered within three seconds. There is no cache version to bump. Two things to know: a new asset file has to be added to `CORE` in `sw.js` (the offline test says so), and service workers need HTTPS or localhost — the tunnel provides that.

Routes are in the hash (`#/`, `#/day/2026-11-18`, `#/week`, `#/shop`, `#/recipes`, `#/recipe/a1/4`, `#/us`), so any static server works and a recipe can be sent as a link.

## Backlog — where this could be better

Roughly in order of value:

1. **Ticks do not travel between phones.** There is no server, so a shopping tick on one phone is unknown to the other. *Send the list* is the workaround. Anything better needs somewhere to keep shared state.
2. **Swap or skip a dinner** from the phone. The week is dealt from the date so both phones agree; a swap made on one phone would not reach the other (see 1). A shareable "this week, but with X" link is the likely way.
3. **Amounts inside the steps are not scaled.** "1.5 dl rice with 3 dl water" stays as written when the pot is doubled; the page says to go by the ingredient list.
4. **The cupboard is not tracked.** The list shows what a week takes out of each staple, not what is left.
5. **Full Finnish translation** of prose and method steps. Names, labels and controls are done; roughly 2,000 words of steps are not. English blocks are marked `lang="en"`.
6. **Photos** — one image per recipe would change the feel, but it must stay local (no CDN) and small.
7. **Price freshness** — a per-item "checked on" date.
8. **More dinners.** Every seven added is another week before anything repeats. Peruvian is thin against the rest now (tacu tacu, arroz con pollo, sopa criolla), there is one pork dish, and nothing follows the Finnish seasons yet.
9. **Timers** on steps that say "25–30 min".
10. **Screen-reader check.** Built with labels, roles and focus handling and tested with a keyboard, not yet with VoiceOver or TalkBack.

## Tone

It speaks like a competent friend who cooks, not a diet app. Short sentences, no exclamation marks, no "superfood", no moralising about food. If a change makes it sound like a wellness brand, it is wrong.

---

Maintained for a two-person household in Helsinki. Not medical advice.
