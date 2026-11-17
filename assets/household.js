/* Mesa Dos — the two people this is cooked for.

   kcal is each person's daily target. Everything else follows from it: the plan's average
   day is scaled to the target, so a person with a higher target gets a bigger share of
   every pot and the shopping list buys for both.

   These are the shared defaults — both phones start from them. A target changed on the
   "Us" page is saved on that phone only; to change it for everyone, change it here.
   Body measurements are deliberately not in this file: the repository is public, the
   targets are all the site needs, and the calculator on the "Us" page keeps what you
   type on the phone. */
const PEOPLE = [
  { id:"p1", name:"Him", kcal:1700 },
  { id:"p2", name:"Her", kcal:1350 }
];
