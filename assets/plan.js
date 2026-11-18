/* Mesa Dos — how a week is put together.

   There is no fixed menu. Each week is dealt from the dinners in recipes.js, so the same
   dinner does not come round again for about a month, and fish, chicken, beef and
   meatless dinners are spread evenly across the weeks. The deal depends only on the date,
   so both phones always show the same week. core.js does the dealing (weekPlan).

   ROTATION_START  a Monday; weeks are counted from it. Change it to reshuffle everything.
   DAY_KCAL        what one standard day is aiming at. A day that comes out more than
                   150 kcal under it gets a top-up.
   COOK_DOUBLE     the weekdays (Monday = 0) whose dinner is cooked double when the dish
                   keeps, so the next day's lunch is already made.
   TOPUPS          the top-ups; amounts are for one person.
   PREP_DAYS       the evenings for cooking ahead, counted from Monday = 0: the Sunday
                   before (-1) and Wednesday (2).
   BATCHES         what can be cooked ahead and how many days it keeps in the fridge.
   BATCH_OF        the ingredient lines that belong to a batch. A line can also say so
                   itself with b:"eggs", or opt out with b:0. */
const ROTATION_START = "2026-11-16";
const DAY_KCAL = 1550;
const COOK_DOUBLE = [0, 1, 3, 5];

const TOPUPS = [
  { text:"200 g skyr and a boiled egg", kcal:210, protein:29,
    items:[{t:"Skyr", n:200, u:"g", s:1}, {t:"Kananmuna", n:1, u:"kpl", b:"eggs"}] },
  { text:"Rye slice with 30 g cheese and tomato", kcal:200, protein:10,
    items:[{t:"Ruisleipä", n:1, u:"viipale"}, {t:"Juusto (kevyt, esim. Oltermanni)", n:30, u:"g", s:1}, {t:"Tomaatti", n:0.5, u:"kpl"}] },
  { text:"A tub of raejuusto (200 g) with cucumber", kcal:200, protein:25,
    items:[{t:"Raejuusto", n:200, u:"g", s:1}, {t:"Kurkku", n:0.25, u:"kpl"}] },
  { text:"Rye slice with cottage cheese", kcal:200, protein:12,
    items:[{t:"Ruisleipä", n:1, u:"viipale"}, {t:"Raejuusto", n:100, u:"g", s:1}] },
  { text:"Tuna tin with rye bread", kcal:250, protein:25,
    items:[{t:"Tonnikala vedessä", n:1, u:"tlk (150 g)"}, {t:"Ruisleipä", n:1, u:"viipale"}] }
];

const PREP_DAYS = [-1, 2];
const BATCHES = {
  eggs:    { keeps:5 },
  rice:    { keeps:3 },
  chicken: { keeps:3 },
  quinoa:  { keeps:4 },
  lentils: { keeps:4 }
};
const BATCH_OF = {
  "Kananmuna, kovaksi keitetty": "eggs",
  "Täysjyväriisi": "rice",
  "Kanan filee (or leftover roast chicken)": "chicken",
  "Quinoa, keitetty": "quinoa",
  "Linssit, kuivat (or 2 tlk valmiita)": "lentils"
};
