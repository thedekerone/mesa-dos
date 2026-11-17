/* Mesa Dos — the two-week rotation. Base days average ~1,450 kcal; top-ups close the gap on light days. */
const TARGET = { kcal:1650, typical:1550, protein:130, fibre:30 };
const PLATE = {
  light:{k:0.8, label:"Lighter plate",  labelFi:"Kevyempi annos"},
  normal:{k:1,  label:"Standard plate", labelFi:"Normaali annos"},
  hearty:{k:1.2,label:"Hearty plate",   labelFi:"Reilu annos"}
};

const PLAN = {
  A: [
    { day:"Monday",    bf:"bf1", lunch:{id:"ln2"}, dinner:"a1", snack:"sn1" },
    { day:"Tuesday",   bf:"bf3", lunch:{leftover:"a1"}, dinner:"a4", snack:"sn2" },
    { day:"Wednesday", bf:"bf4", lunch:{leftover:"a4"}, dinner:"a2", snack:"sn3" },
    { day:"Thursday",  bf:"bf2", lunch:{id:"ln5"}, dinner:"a5", snack:"sn4",
      extra:{ text:"200 g skyr + 1 boiled egg", kcal:250, protein:25 } },
    { day:"Friday",    bf:"bf5", lunch:{leftover:"a5"}, dinner:"a3", snack:"sn1",
      extra:{ text:"Rye slice with 30 g cheese and tomato", kcal:200, protein:10 } },
    { day:"Saturday",  bf:"bf3", lunch:{id:"ln6"}, dinner:"a6", snack:"sn5",
      extra:{ text:"150 g raejuusto with cucumber", kcal:250, protein:25 } },
    { day:"Sunday",    bf:"bf4", lunch:{id:"ln4"}, dinner:"a7", snack:"sn6" }
  ],
  B: [
    { day:"Monday",    bf:"bf1", lunch:{id:"ln2"}, dinner:"b1", snack:"sn1" },
    { day:"Tuesday",   bf:"bf3", lunch:{id:"ln6"}, dinner:"b3", snack:"sn4",
      extra:{ text:"Rye slice with cottage cheese", kcal:200, protein:12 } },
    { day:"Wednesday", bf:"bf2", lunch:{id:"ln5"}, dinner:"b5", snack:"sn2",
      extra:{ text:"200 g skyr + 1 boiled egg", kcal:270, protein:31 } },
    { day:"Thursday",  bf:"bf4", lunch:{id:"ln3"}, dinner:"b2", snack:"sn3",
      extra:{ text:"Tuna tin with rye bread", kcal:250, protein:25 } },
    { day:"Friday",    bf:"bf5", lunch:{id:"ln4"}, dinner:"b4", snack:"sn6" },
    { day:"Saturday",  bf:"bf3", lunch:{leftover:"b4"}, dinner:"b6", snack:"sn5" },
    { day:"Sunday",    bf:"bf4", lunch:{leftover:"b6"}, dinner:"b7", snack:"sn1" }
  ]
};

const WEEK_NOTE = {
  A: "Peruvian week with an Asian detour: lomo saltado, pollo a la brasa, ceviche, salmon, Korean wraps, cod, and a Greek tray to finish.",
  B: "Comfort week: ají de gallina, meatballs, a big minestrone, causa, curry, baked feta pasta and pho."
};
