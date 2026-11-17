/* Mesa Dos — the two-week rotation.

   ROTATION_START is a Monday on which week A begins. The site works out from today's date
   which week and which day it is, so both phones always agree. To shift the rotation,
   change this date to another Monday.

   A day: bf / dinner / snack are recipe ids. lunch is {id} for a lunch you make, or
   {leftover: dinnerId} for the previous night's dinner — that dinner is then cooked double.
   extra is the top-up for the lighter days: the amounts are for one person. */
const ROTATION_START = "2026-11-16";

const PLAN = {
  A: [
    { day:"Monday",    bf:"bf1", lunch:{id:"ln2"}, dinner:"a1", snack:"sn1" },
    { day:"Tuesday",   bf:"bf3", lunch:{leftover:"a1"}, dinner:"a4", snack:"sn2" },
    { day:"Wednesday", bf:"bf4", lunch:{leftover:"a4"}, dinner:"a2", snack:"sn3" },
    { day:"Thursday",  bf:"bf2", lunch:{id:"ln5"}, dinner:"a5", snack:"sn4",
      extra:{ text:"200 g skyr and a boiled egg", kcal:210, protein:29,
              items:[{t:"Skyr", n:200, u:"g", s:1}, {t:"Kananmuna", n:1, u:"kpl"}] } },
    { day:"Friday",    bf:"bf5", lunch:{leftover:"a5"}, dinner:"a3", snack:"sn1",
      extra:{ text:"Rye slice with 30 g cheese and tomato", kcal:200, protein:10,
              items:[{t:"Ruisleipä", n:1, u:"viipale"}, {t:"Juusto (kevyt, esim. Oltermanni)", n:30, u:"g", s:1}, {t:"Tomaatti", n:0.5, u:"kpl"}] } },
    { day:"Saturday",  bf:"bf3", lunch:{id:"ln6"}, dinner:"a6", snack:"sn5",
      extra:{ text:"A tub of raejuusto (200 g) with cucumber", kcal:200, protein:25,
              items:[{t:"Raejuusto", n:200, u:"g", s:1}, {t:"Kurkku", n:0.25, u:"kpl"}] } },
    { day:"Sunday",    bf:"bf4", lunch:{id:"ln4"}, dinner:"a7", snack:"sn6" }
  ],
  B: [
    { day:"Monday",    bf:"bf1", lunch:{id:"ln2"}, dinner:"b1", snack:"sn1" },
    { day:"Tuesday",   bf:"bf3", lunch:{id:"ln6"}, dinner:"b3", snack:"sn4",
      extra:{ text:"Rye slice with cottage cheese", kcal:200, protein:12,
              items:[{t:"Ruisleipä", n:1, u:"viipale"}, {t:"Raejuusto", n:100, u:"g", s:1}] } },
    { day:"Wednesday", bf:"bf2", lunch:{id:"ln5"}, dinner:"b5", snack:"sn2",
      extra:{ text:"200 g skyr and a boiled egg", kcal:210, protein:29,
              items:[{t:"Skyr", n:200, u:"g", s:1}, {t:"Kananmuna", n:1, u:"kpl"}] } },
    { day:"Thursday",  bf:"bf4", lunch:{id:"ln3"}, dinner:"b2", snack:"sn3",
      extra:{ text:"Tuna tin with rye bread", kcal:250, protein:25,
              items:[{t:"Tonnikala vedessä", n:1, u:"tlk (150 g)"}, {t:"Ruisleipä", n:1, u:"viipale"}] } },
    { day:"Friday",    bf:"bf5", lunch:{id:"ln4"}, dinner:"b4", snack:"sn6" },
    { day:"Saturday",  bf:"bf3", lunch:{leftover:"b4"}, dinner:"b6", snack:"sn5" },
    { day:"Sunday",    bf:"bf4", lunch:{leftover:"b6"}, dinner:"b7", snack:"sn1" }
  ]
};

const WEEK_NOTE = {
  A: "Peruvian week with an Asian detour: lomo saltado, salmon, pollo a la brasa, Korean wraps, ceviche, cod, and a Greek tray to finish.",
  B: "Comfort week: ají de gallina, meatballs, a big minestrone, causa, curry, baked feta pasta and pho."
};
