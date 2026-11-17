/* Mesa Dos — recipe data.
   serves: how many standard portions the ingredient list makes. Dinners are written for the
   two of you (the minestrone makes four: two dinners, two lunches); breakfasts, snacks and
   most lunches are written for one. kcal / protein / fibre are per portion, estimated.
   ahead: something that has to happen the night before. from: a lunch built on a dinner. */
const RECIPES = [
/* ============================ DINNERS ============================ */
{
  id:"a1", meal:"dinner", serves:2, cuisine:"peru", name:"Lomo saltado, light",
  short:"Peru's stir-fried beef and chips, with oven fries instead of the deep fryer.",
  time:35, kcal:520, protein:41, fibre:6,
  ingredients:[
    {t:"Naudan paistisuikale (or sisäfileesuikale)", n:300, u:"g", s:1},
    {t:"Peruna, jauhoinen", n:500, u:"g", s:1},
    {t:"Punasipuli", n:1, u:"kpl"},
    {t:"Tomaatti", n:2, u:"kpl"},
    {t:"Punainen paprika", n:1, u:"kpl"},
    {t:"Valkosipuli", n:2, u:"kynttä"},
    {t:"Soijakastike", n:2, u:"rkl"},
    {t:"Punaviinietikka (or omenaviinietikka)", n:1, u:"rkl"},
    {t:"Oliiviöljy", n:1, u:"rkl"},
    {t:"Korianteri", n:1, u:"kourallinen"},
    {t:"Chili", n:"½", u:"kpl"},
    {t:"Jeera, suola, mustapippuri", n:"", u:"maun mukaan"}
  ],
  steps:[
    "Heat the oven to 220 °C. Cut the potatoes into wedges, toss with half the oil and salt, spread on a tray and roast 25–30 min, turning once.",
    "Slice the beef into strips, pat dry and season. Get a wide pan or wok very hot with the rest of the oil and sear the beef 1–2 minutes in one layer. Move it to a plate — do not crowd the pan.",
    "In the same pan: red onion in wedges for 2 min, then paprika 2 min, then garlic and chili 30 s. Add the tomato and cook 2 min so it just collapses.",
    "Splash in soy and vinegar, let it hiss, return the beef with its juices, toss 30 s. Off the heat, fold through coriander.",
    "Serve over the oven fries. The sauce is the point — spoon it over everything."
  ],
  tip:"The classic is fried chips and a lot of oil. Oven wedges plus a screaming-hot pan keeps the char and drops roughly 200 kcal a plate. Use sisäfilee only if it's on offer — paistisuikale is cheaper and works.",
  why:"41 g protein and a big volume of vegetables for 520 kcal. Beef once a week is fine; it keeps the plan from feeling like chicken prison."
},
{
  id:"a2", meal:"dinner", serves:2, cuisine:"peru", name:"Pollo a la brasa with aji verde",
  short:"Peru's rotisserie chicken, oven-roasted, with a yoghurt-green-chilli sauce.",
  time:45, kcal:470, protein:44, fibre:7,
  ingredients:[
    {t:"Kanan reisikoipi, luuton ja nahaton", n:600, u:"g", s:1},
    {t:"Soijakastike", n:2, u:"rkl"},
    {t:"Inkivääri, raastettu", n:1, u:"tl"},
    {t:"Valkosipuli", n:3, u:"kynttä"},
    {t:"Jeera jauhettuna", n:1, u:"tl"},
    {t:"Paprikajauhe", n:1, u:"tl"},
    {t:"Oregano", n:1, u:"tl"},
    {t:"Sitruunamehu", n:1, u:"rkl"},
    {t:"Turkkilainen jogurtti (aji verde)", n:150, u:"g", s:1},
    {t:"Korianteri (aji verde)", n:1, u:"ruukku"},
    {t:"Jalapeño or vihreä chili (aji verde)", n:1, u:"kpl"},
    {t:"Lime (aji verde)", n:1, u:"kpl"},
    {t:"Jäävuorisalaatti", n:1, u:"kpl"},
    {t:"Tomaatti, kurkku, punasipuli", n:"", u:"salaattiin"}
  ],
  steps:[
    "Oven 200 °C. Rub the chicken thighs with soy, ginger, crushed garlic, cumin, paprika, oregano, lemon and a little oil. Marinate 10 min if you have it, roast 30–35 min until the skin side is deep brown.",
    "Aji verde: blend yoghurt, coriander (stalks too), chili, garlic clove, lime juice and salt. It should be pourable — loosen with a spoon of water.",
    "Chop the salad: iceberg in ribbons, tomato, cucumber, thin red onion. Dress with lime and salt only.",
    "Rest the chicken 5 min, then slice. Serve with the salad and a generous spoon of aji verde."
  ],
  tip:"Yoghurt instead of mayonnaise in aji verde is the whole hack — same colour, same punch, a third of the calories. If you only find whole legs, roast 40 min and pull the skin off before eating.",
  why:"Chicken thighs stay juicy at high heat, so you eat less sauce to fix dryness. 44 g protein."
},
{
  id:"a3", meal:"dinner", serves:2, ahead:"Move the frozen fish to the fridge tonight. It has to thaw slowly, never on the counter.", cuisine:"peru", name:"Ceviche with sweet potato and corn",
  short:"Lime-cured fish, red onion, chilli — Peru's national dish, no cooking required.",
  time:25, kcal:420, protein:33, fibre:7,
  ingredients:[
    {t:"Kirjolohi or vaalea kala (pakaste seiti works)", n:350, u:"g", s:1},
    {t:"Lime", n:4, u:"kpl"},
    {t:"Punasipuli", n:1, u:"kpl"},
    {t:"Chili (aji limo if you can)", n:"½", u:"kpl"},
    {t:"Korianteri", n:1, u:"ruukku"},
    {t:"Bataatti", n:400, u:"g", s:1},
    {t:"Pakastemaissi", n:100, u:"g", s:1},
    {t:"Salaattilehdet", n:1, u:"pussi"},
    {t:"Suola, mustapippuri", n:"", u:"maun mukaan"}
  ],
  steps:[
    "Boil or steam the sweet potato in thick slices until just tender, 15–20 min. Cool completely — warm sweet potato collapses into the ceviche.",
    "Cut the fish into 1.5 cm cubes. If you bought it fresh, freeze it 24 h first then thaw in the fridge; that's the food-safety step for raw fish.",
    "Soak the sliced red onion in cold water 10 min, drain well — it takes the raw bite out without losing crunch.",
    "Toss fish with salt, then lime juice (enough to sit around it), chilli and half the coriander. Cure 8–10 min, no longer, or the texture goes chalky.",
    "Plate lettuce, fish with its leche de tigre, onion, corn, sweet potato, the rest of the coriander. Black pepper on top."
  ],
  tip:"Buy frozen fish for this — in Finland it's cheaper, safer and already frozen. Pangasius or seiti is fine; salmon is the treat version.",
  why:"Lean protein with almost no fat, and the sweet potato makes it a full meal instead of a starter."
},
{
  id:"a4", meal:"dinner", serves:2, cuisine:"asia", name:"Miso-glazed salmon with pak choi",
  short:"Sticky-sweet salmon under the grill, greens in the same pan, rice underneath.",
  time:25, kcal:540, protein:36, fibre:5,
  ingredients:[
    {t:"Kirjolohi filee", n:300, u:"g", s:1},
    {t:"Miso (or 1 rkl soijaa + 1 tl hunajaa)", n:1, u:"rkl"},
    {t:"Hunaja", n:1, u:"tl"},
    {t:"Soijakastike", n:1, u:"rkl"},
    {t:"Riisiviinietikka", n:1, u:"tl"},
    {t:"Inkivääri, raastettu", n:1, u:"tl"},
    {t:"Täysjyväriisi", n:1.5, u:"dl"},
    {t:"Pak choi", n:2, u:"kpl"},
    {t:"Valkosipuli", n:2, u:"kynttä"},
    {t:"Seesamiöljy", n:1, u:"tl"},
    {t:"Seesaminsiemenet", n:"", u:"viimeistelyyn"}
  ],
  steps:[
    "Rice on first: 1.5 dl with 3 dl water, lid on, 12 min, then rest 10 min off the heat.",
    "Mix miso, honey, soy, vinegar and ginger into a paste. Pat the salmon dry, put it skin-down on a lined tray and spread the paste on top.",
    "Grill/broil at 250 °C for 8–10 min until the glaze blisters. Watch it — miso burns in seconds near the end.",
    "Halve the pak choi, sear cut-side down in sesame oil with garlic for 3 min, then add a splash of water and lid it for 2 min.",
    "Serve salmon on rice with the greens, spoon the tray juices over, scatter sesame seeds."
  ],
  tip:"Miso keeps for months in the fridge and instantly makes fish, soup and aubergine taste like a restaurant. One tub pays for itself in a fortnight.",
  why:"Fatty fish twice a week is the one thing most weight-loss plans get right. Rice portion is measured, not guessed."
},
{
  id:"a5", meal:"dinner", serves:2, cuisine:"asia", name:"Korean chicken lettuce wraps",
  short:"Gochujang chicken mince, crunchy vegetables, iceberg as the wrap.",
  time:20, kcal:430, protein:42, fibre:5,
  ingredients:[
    {t:"Kanan jauheliha", n:400, u:"g", s:1},
    {t:"Gochujang", n:1, u:"rkl"},
    {t:"Soijakastike", n:1, u:"rkl"},
    {t:"Hunaja", n:1, u:"tl"},
    {t:"Seesamiöljy", n:1, u:"tl"},
    {t:"Valkosipuli", n:2, u:"kynttä"},
    {t:"Inkivääri, raastettu", n:1, u:"tl"},
    {t:"Jäävuorisalaatti", n:1, u:"kpl"},
    {t:"Porkkana", n:2, u:"kpl"},
    {t:"Kurkku", n:1, u:"kpl"},
    {t:"Kevätsipuli", n:2, u:"kpl"},
    {t:"Seesaminsiemenet", n:1, u:"rkl"}
  ],
  steps:[
    "Separate the iceberg into whole cup-shaped leaves, rinse and keep cold — cold leaves stay crisp.",
    "Heat a dry pan, add the chicken mince and fry hard until the water cooks off and it starts to brown, 6–8 min. Don't stir constantly.",
    "Push it aside, add garlic, ginger and gochujang in the fat, 30 s, then stir everything with soy, honey and sesame oil. Taste for salt.",
    "Julienne carrot and cucumber into matchsticks, slice spring onion.",
    "Build at the table: leaf, chicken, vegetables, sesame seeds. Two or three wraps per person, plus a small bowl of rice if you're hungry."
  ],
  tip:"Gochujang is the one bottle worth hunting down — Prisma's ethnic aisle or Vii Voan. Sriracha plus a teaspoon of miso is the stand-in if not.",
  why:"42 g protein for 430 kcal, and lettuce replaces the rice so you get volume instead of density. Add 1 dl rice each if you trained that day."
},
{
  id:"a6", meal:"dinner", serves:2, ahead:"Move the frozen fish to the fridge tonight so it is thawed for dinner.", cuisine:"peru", name:"Baked cod with salsa criolla",
  short:"White fish, quinoa, and a sharp red-onion salsa that does all the flavouring.",
  time:30, kcal:430, protein:38, fibre:7,
  ingredients:[
    {t:"Seiti, turska or pangasius (pakaste ok)", n:400, u:"g", s:1},
    {t:"Quinoa", n:1.5, u:"dl"},
    {t:"Punasipuli", n:1, u:"kpl"},
    {t:"Tomaatti", n:2, u:"kpl"},
    {t:"Lime", n:1, u:"kpl"},
    {t:"Korianteri", n:1, u:"ruukku"},
    {t:"Chili", n:"½", u:"kpl"},
    {t:"Parsakaali", n:300, u:"g", s:1},
    {t:"Oliiviöljy", n:1, u:"rkl"},
    {t:"Suola, mustapippuri", n:"", u:"maun mukaan"}
  ],
  steps:[
    "Oven 200 °C. Rinse the quinoa well, simmer 1.5 dl in 3 dl salted water 13 min, lid on, then rest 5 min and fork through.",
    "Put the fish on a lined tray, rub with a little oil, salt and pepper, bake 12–15 min depending on thickness. It's done when it flakes but still looks glossy.",
    "Salsa criolla: slice onion paper-thin, soak 5 min in cold water, drain. Toss with diced tomato, lime juice, chilli, chopped coriander, salt and a teaspoon of oil.",
    "Steam or roast the broccoli 5–6 min — keep it bright, not army-green.",
    "Plate quinoa, fish, broccoli, and a heap of salsa on top of the fish."
  ],
  tip:"Frozen seiti is the cheapest animal protein in a Finnish supermarket — around 5 € for 500 g. Thaw overnight in the fridge, never on the counter.",
  why:"Very lean protein, and quinoa gives you fibre and a slow carbohydrate so you're not hunting the cupboard at 21:00."
},
{
  id:"a7", meal:"dinner", serves:2, cuisine:"europe", name:"Greek chicken traybake",
  short:"One tray, one oven, lemon-oregano chicken with bulgur and feta.",
  time:35, kcal:500, protein:46, fibre:8,
  ingredients:[
    {t:"Kanan filee", n:400, u:"g", s:1},
    {t:"Kesäkurpitsa", n:1, u:"kpl"},
    {t:"Paprika (mix colours)", n:2, u:"kpl"},
    {t:"Punasipuli", n:1, u:"kpl"},
    {t:"Kirsikkatomaatti", n:250, u:"g", s:1},
    {t:"Oliiviöljy", n:1, u:"rkl"},
    {t:"Sitruuna", n:1, u:"kpl"},
    {t:"Valkosipuli", n:3, u:"kynttä"},
    {t:"Oregano, kuivattu", n:2, u:"tl"},
    {t:"Feta (kevyt)", n:50, u:"g", s:1},
    {t:"Bulgur", n:1.5, u:"dl"}
  ],
  steps:[
    "Oven 210 °C. Cut courgette, peppers and onion into big chunks, halve the tomatoes. Toss on a tray with oil, oregano, sliced garlic, salt and pepper.",
    "Nestle the chicken among the vegetables, squeeze over half the lemon, and roast 25 min.",
    "Bulgur: pour 3 dl boiling water over 1.5 dl bulgur, cover, 12 min, then fluff with salt and lemon.",
    "Crumble feta over the tray for the last 5 min so it softens but doesn't melt away.",
    "Serve on the bulgur with the rest of the lemon."
  ],
  tip:"Cut vegetables bigger than you think — they shrink and caramelise instead of turning to mush. This tray is also the best leftover lunch of the week.",
  why:"46 g protein, and the tray gives you about 400 g of vegetables per person without a salad bowl in sight."
},

/* ---------------- week B ---------------- */
{
  id:"b1", meal:"dinner", serves:2, cuisine:"peru", name:"Ají de gallina, lighter",
  short:"Peru's creamy shredded-chicken stew, built on quark instead of evaporated milk.",
  time:40, kcal:510, protein:40, fibre:5,
  ingredients:[
    {t:"Kanan filee", n:400, u:"g", s:1},
    {t:"Maitorahka", n:200, u:"g", s:1},
    {t:"Maito (kevyt)", n:1, u:"dl"},
    {t:"Aji amarillo paste (or 1 tl kurkuma + 1 tl chili)", n:1, u:"rkl"},
    {t:"Sipuli", n:"½", u:"kpl"},
    {t:"Valkosipuli", n:2, u:"kynttä"},
    {t:"Ruisleipä (murennettuna, suurustukseen)", n:1, u:"viipale"},
    {t:"Saksanpähkinä, rouhittu", n:15, u:"g", s:1},
    {t:"Peruna", n:400, u:"g", s:1},
    {t:"Täysjyväriisi", n:1, u:"dl"},
    {t:"Kananmuna, kovaksi keitetty", n:1, u:"kpl"},
    {t:"Oliivi", n:6, u:"kpl"}
  ],
  steps:[
    "Poach the chicken in salted water with a piece of onion for 15 min. Keep the broth. Shred the meat with two forks.",
    "Soften onion and garlic in a little oil, 6 min. Add aji amarillo (or turmeric + chilli) and fry 1 min until it smells sweet.",
    "Stir in the crumbled rye bread, then ladle in ~3 dl of the chicken broth while whisking — it thickens into a sauce.",
    "Off the heat, fold in the quark and milk. Do not boil after this or it splits. Return the chicken, season, warm through gently.",
    "Boil potatoes and rice. Serve the stew over potatoes with rice, topped with walnuts, egg wedges and olives."
  ],
  tip:"Quark curdles if it boils — pull the pan off the heat first, then stir it in. The bread is what gives the body that cream would normally provide.",
  why:"Classic aji de gallina is cream, bread and oil. This version keeps the colour and silkiness at 510 kcal with 40 g protein."
},
{
  id:"b2", meal:"dinner", serves:2, cuisine:"peru", name:"Causa limeña with tuna",
  short:"Cold lime-and-chilli potato cake layered with tuna and avocado.",
  time:35, kcal:450, protein:32, fibre:7,
  ingredients:[
    {t:"Peruna, jauhoinen", n:600, u:"g", s:1},
    {t:"Lime", n:4, u:"kpl"},
    {t:"Aji amarillo paste (or 1 tl chili + kurkuma)", n:1, u:"tl"},
    {t:"Oliiviöljy", n:1, u:"rkl"},
    {t:"Tonnikala vedessä", n:2, u:"tlk (150 g)"},
    {t:"Raejuusto", n:100, u:"g", s:1},
    {t:"Avokado", n:1, u:"kpl"},
    {t:"Tomaatti", n:1, u:"kpl"},
    {t:"Salaattilehdet, lime, suola", n:"", u:"tarjoiluun"}
  ],
  steps:[
    "Boil peeled potatoes until soft, 20 min. Mash while hot with lime juice, aji paste, oil and plenty of salt. It should taste sharp and a bit too salty — the cold dulls it.",
    "Cool completely, ideally 30 min in the fridge. Warm mash will not hold a shape.",
    "Mix tuna with raejuusto, lime and pepper. Slice avocado and tomato.",
    "Build in a ring or a lined loaf tin: half the potato, press flat, tuna, avocado, remaining potato, press. Or simply spoon mounds onto plates and layer.",
    "Chill 10 min, then serve with salad leaves and extra lime."
  ],
  tip:"Causa is normally a cold starter; with a bigger portion and salad it's a full dinner. Make it in the morning if your evening is busy — it only improves.",
  why:"Potato gets a bad name, but boiled and cooled it's filling for 450 kcal, and the tuna-quark layer does the protein."
},
{
  id:"b3", meal:"dinner", serves:2, cuisine:"asia", name:"Asian pork meatballs with noodles",
  short:"Ginger-soy meatballs, rice noodles and a pile of crunchy vegetables.",
  time:30, kcal:540, protein:36, fibre:6,
  ingredients:[
    {t:"Sian jauheliha 10%", n:400, u:"g", s:1},
    {t:"Valkosipuli", n:2, u:"kynttä"},
    {t:"Inkivääri, raastettu", n:1, u:"rkl"},
    {t:"Soijakastike", n:2, u:"rkl"},
    {t:"Seesamiöljy", n:1, u:"tl"},
    {t:"Kevätsipuli", n:2, u:"kpl"},
    {t:"Korianteri", n:1, u:"ruukku"},
    {t:"Riisinuudeli", n:150, u:"g", s:1},
    {t:"Parsakaali", n:300, u:"g", s:1},
    {t:"Porkkana", n:2, u:"kpl"},
    {t:"Paprika", n:1, u:"kpl"},
    {t:"Lime", n:1, u:"kpl"}
  ],
  steps:[
    "Mix mince with half the garlic and ginger, 1 rkl soy, chopped spring onion and coriander. Roll 16 small balls with wet hands.",
    "Brown them in a hot dry non-stick pan, 6–8 min, turning. They don't need to cook through yet.",
    "Add the rest of the garlic and ginger, the vegetables in bite-size pieces, and 1 dl water with the remaining soy. Lid on, 5 min.",
    "Soak rice noodles in boiling water per the packet, 4–5 min, drain.",
    "Toss noodles with the pan contents, squeeze lime over, finish with coriander and a drop of sesame oil."
  ],
  tip:"10% pork mince is the sweet spot — 5% is dry, 23% is a calorie bomb. If you can only find 23%, mix half pork half chicken mince.",
  why:"540 kcal is a big dinner by this plan's standards, which is exactly why it's here — one satisfying bowl beats three small snacks."
},
{
  id:"b4", meal:"dinner", serves:2, cuisine:"asia", name:"Green curry with chicken",
  short:"Light coconut milk, curry paste, chicken and whatever vegetables are in the drawer.",
  time:30, kcal:520, protein:38, fibre:6,
  ingredients:[
    {t:"Kanan filee", n:400, u:"g", s:1},
    {t:"Green curry paste", n:2, u:"rkl"},
    {t:"Kookosmaito, kevyt", n:400, u:"ml", s:1},
    {t:"Kesäkurpitsa", n:1, u:"kpl"},
    {t:"Paprika", n:1, u:"kpl"},
    {t:"Pak choi or parsakaali", n:200, u:"g", s:1},
    {t:"Täysjyväriisi", n:1.5, u:"dl"},
    {t:"Lime", n:1, u:"kpl"},
    {t:"Korianteri or thai basil", n:1, u:"ruukku"},
    {t:"Soijakastike", n:1, u:"rkl"}
  ],
  steps:[
    "Rice on: 1.5 dl + 3 dl water, 12 min, rest 10.",
    "Fry the curry paste in a dry-ish pan for 1 min until fragrant — this is the step people skip and then wonder why it tastes flat.",
    "Add the thick top of the coconut milk, stir to combine, then the chicken in strips. 5 min.",
    "Add the rest of the coconut milk, the vegetables and soy. Simmer 8 min, no lid needed.",
    "Finish with lime juice and herbs. Serve over rice."
  ],
  tip:"Light coconut milk is roughly half the fat and behaves the same in a curry. Don't add sugar — the paste already has it.",
  why:"38 g protein and a genuinely satisfying bowl. Curry paste is a flavour shortcut that costs nothing in calories."
},
{
  id:"b5", meal:"dinner", serves:4, cuisine:"europe", name:"Minestrone with white beans",
  short:"A big pot of Italian vegetable soup — dinner tonight, lunch tomorrow.",
  time:35, kcal:380, protein:20, fibre:12,
  ingredients:[
    {t:"Sipuli", n:1, u:"kpl"},
    {t:"Porkkana", n:2, u:"kpl"},
    {t:"Valkosipuli", n:3, u:"kynttä"},
    {t:"Selleri (if you have it)", n:1, u:"varsi"},
    {t:"Tomaattimurska", n:400, u:"g", s:1},
    {t:"Valkoiset pavut, säilyke", n:1, u:"tlk"},
    {t:"Kikherneet, säilyke", n:1, u:"tlk"},
    {t:"Täysjyväpasta (small shape)", n:100, u:"g", s:1},
    {t:"Kesäkurpitsa", n:1, u:"kpl"},
    {t:"Pinaatti", n:100, u:"g", s:1},
    {t:"Kasvisliemi", n:800, u:"ml", s:1},
    {t:"Parmesan (or Grana Padano)", n:30, u:"g", s:1},
    {t:"Oliiviöljy, basilika, mustapippuri", n:"", u:"maun mukaan"}
  ],
  steps:[
    "Soften onion, carrot, celery and garlic in olive oil with a pinch of salt, 8 min — this base is the difference between soup and water.",
    "Add tomato, stock and the parmesan rind if you have one. Simmer 10 min.",
    "Add pasta, courgette and drained beans. Cook until the pasta is just done, 8–10 min.",
    "Stir in spinach at the end so it keeps its colour. Grate parmesan over each bowl, black pepper, a thread of olive oil.",
    "Serve with rye bread. Refrigerate the rest — it thickens overnight, loosen with water."
  ],
  tip:"Freeze the parmesan rind and drop it in soups — it's free umami. This recipe makes about four portions: two dinners, two lunches.",
  why:"380 kcal for a bowl this big, 12 g fibre. The beans are what stop it being a sad vegetable broth."
},
{
  id:"b6", meal:"dinner", serves:2, cuisine:"europe", name:"Baked feta and tomato pasta",
  short:"The viral one, done with wholewheat pasta and half the feta.",
  time:30, kcal:520, protein:24, fibre:9,
  ingredients:[
    {t:"Täysjyväpasta", n:200, u:"g", s:1},
    {t:"Kirsikkatomaatti", n:400, u:"g", s:1},
    {t:"Feta (kevyt)", n:150, u:"g", s:1},
    {t:"Valkosipuli", n:4, u:"kynttä"},
    {t:"Oliiviöljy", n:1, u:"rkl"},
    {t:"Chili flakes", n:"½", u:"tl"},
    {t:"Pinaatti", n:100, u:"g", s:1},
    {t:"Basilika", n:1, u:"ruukku"},
    {t:"Sitruunan kuori", n:"½", u:"kpl"}
  ],
  steps:[
    "Oven 200 °C. Put the whole cherry tomatoes and unpeeled garlic in a baking dish, add the block of feta in the middle, drizzle oil, chili flakes, pepper.",
    "Bake 20–22 min until the tomatoes burst and the feta is soft and golden at the edges.",
    "Boil the pasta in well-salted water, keep a cup of the water.",
    "Squeeze the garlic out of its skins, mash everything in the dish with a fork, then loosen with pasta water to a sauce.",
    "Fold through the pasta and raw spinach so the spinach wilts in the residual heat. Basil, lemon zest, black pepper."
  ],
  tip:"Half a block of feta is enough when the tomatoes are sweet and there's pasta water to stretch it. The full block adds about 150 kcal and no extra flavour.",
  why:"24 g protein, 9 g fibre, and it's the meal that makes a diet feel like normal life. Add a boiled egg on the side if you need more protein."
},
{
  id:"b7", meal:"dinner", serves:2, cuisine:"asia", name:"Quick chicken pho",
  short:"A 35-minute broth with star anise and charred ginger — Vietnam in a bowl.",
  time:35, kcal:430, protein:38, fibre:4,
  ingredients:[
    {t:"Kanan filee or reisikoipi", n:300, u:"g", s:1},
    {t:"Kanalientä (fondi)", n:1, u:"l"},
    {t:"Inkivääri", n:3, u:"cm"},
    {t:"Sipuli", n:1, u:"kpl"},
    {t:"Tähtianis", n:2, u:"kpl"},
    {t:"Kanelitanko", n:1, u:"kpl"},
    {t:"Riisinuudeli", n:120, u:"g", s:1},
    {t:"Pak choi", n:2, u:"kpl"},
    {t:"Kevätsipuli", n:2, u:"kpl"},
    {t:"Korianteri + minttu", n:1, u:"ruukku"},
    {t:"Lime", n:2, u:"kpl"},
    {t:"Chili", n:1, u:"kpl"},
    {t:"Soijakastike", n:2, u:"rkl"}
  ],
  steps:[
    "Halve the onion and ginger and char them cut-side down in a dry pan until black in spots, 6 min. This is the entire trick.",
    "Add stock, star anise and cinnamon, simmer 15 min. Drop in the chicken for the last 8 min, then take it out and slice.",
    "Strain the broth, season with soy and a squeeze of lime.",
    "Soak the noodles 4–5 min in boiling water, drain. Blanch the pak choi in the broth 1 min.",
    "Bowls: noodles, pak choi, chicken, boiling broth poured over. Herbs, spring onion, chili and lime at the table — everyone adds their own."
  ],
  tip:"Real pho simmers for hours. This one cheats with fondi and charred aromatics and lands 80% of the way there on a Tuesday.",
  why:"430 kcal, 38 g protein, and a litre of broth is filling in a way solid food isn't."
},

/* ============================ BREAKFASTS ============================ */
{
  id:"bf1", meal:"breakfast", serves:1, cuisine:"europe", name:"Quark bowl with berries",
  short:"The default breakfast: 30 seconds of assembly, 32 g protein.",
  time:3, kcal:380, protein:32, fibre:7,
  ingredients:[
    {t:"Maitorahka", n:250, u:"g", s:1},
    {t:"Pakastemarjat (mustikka, vadelma)", n:100, u:"g", s:1},
    {t:"Kaurahiutale", n:30, u:"g", s:1},
    {t:"Chia", n:1, u:"tl"},
    {t:"Hunaja", n:1, u:"tl"},
    {t:"Kaneli", n:"", u:"ripaus"}
  ],
  steps:[
    "Spoon the quark into a bowl. Frozen berries on top — they thaw in the quark in about five minutes and make their own sauce.",
    "Add oats, chia, honey and cinnamon. Stir once, not twice."
  ],
  tip:"Maitorahka is the quiet hero of the Finnish dairy aisle: 11 g protein per 100 g, around 2 € a tub. Buy two a week.",
  why:"32 g protein first thing kills the 10:30 biscuit urge better than any cereal."
},
{
  id:"bf2", meal:"breakfast", serves:1, cuisine:"europe", name:"Rye bread, cottage cheese and egg",
  short:"Open sandwiches, Finnish-style, with enough protein to hold you.",
  time:8, kcal:340, protein:26, fibre:8,
  ingredients:[
    {t:"Ruisleipä", n:2, u:"viipaletta"},
    {t:"Raejuusto", n:100, u:"g", s:1},
    {t:"Kananmuna", n:2, u:"kpl"},
    {t:"Kurkku", n:"½", u:"kpl"},
    {t:"Tomaatti", n:1, u:"kpl"},
    {t:"Suola, mustapippuri, tilli", n:"", u:"maun mukaan"}
  ],
  steps:[
    "Boil the eggs 8 min for a jammy yolk, cool in cold water.",
    "Spread rye slices with cottage cheese, salt and pepper.",
    "Cucumber and tomato on top, halved eggs alongside, dill if it's in the fridge."
  ],
  tip:"Rye bread is the most Finnish thing you can eat and it's genuinely good for you — 6 g fibre a slice, slow release.",
  why:"Real bread, real cheese, 26 g protein, and it takes eight minutes."
},
{
  id:"bf3", meal:"breakfast", serves:1, cuisine:"europe", name:"Spinach scramble",
  short:"Three eggs, a bag of spinach, one slice of rye.",
  time:8, kcal:380, protein:28, fibre:5,
  ingredients:[
    {t:"Kananmuna", n:3, u:"kpl"},
    {t:"Pinaatti", n:80, u:"g", s:1},
    {t:"Oliiviöljy or voi", n:1, u:"tl"},
    {t:"Ruisleipä", n:1, u:"viipale"},
    {t:"Suola, mustapippuri, muskottipähkinä", n:"", u:"maun mukaan"}
  ],
  steps:[
    "Wilt the spinach in a dry pan, 1 min, then squeeze out any water — wet spinach makes grey eggs.",
    "Lower the heat, add the oil, pour in beaten eggs with salt and pepper.",
    "Stir slowly with a spatula, pulling from the edges. Take it off while still slightly glossy.",
    "On rye toast, grated nutmeg on top."
  ],
  tip:"Low heat and slow stirring is the whole technique. High heat makes rubber.",
  why:"Eggs are the cheapest complete protein in Finland. 28 g for under a euro."
},
{
  id:"bf4", meal:"breakfast", serves:1, ahead:"Stir the oats, skyr and milk together tonight. They need a night in the fridge.", cuisine:"europe", name:"Overnight oats with skyr and apple",
  short:"Made the night before, eaten standing up, no cooking.",
  time:5, kcal:400, protein:28, fibre:8,
  ingredients:[
    {t:"Kaurahiutale", n:60, u:"g", s:1},
    {t:"Skyr", n:150, u:"g", s:1},
    {t:"Maito", n:1, u:"dl", s:1},
    {t:"Omena", n:1, u:"kpl"},
    {t:"Saksanpähkinä", n:10, u:"g", s:1},
    {t:"Kaneli", n:"½", u:"tl"},
    {t:"Hunaja", n:1, u:"tl"}
  ],
  steps:[
    "The night before: stir oats, skyr, milk and cinnamon in a jar. Lid on, fridge.",
    "In the morning: grate the apple over the top (skin on), add walnuts and honey."
  ],
  tip:"Grated apple rather than chopped — it releases juice and sweetens the whole jar without sugar.",
  why:"28 g protein, 8 g fibre, and it's already made when you're late."
},
{
  id:"bf5", meal:"breakfast", serves:1, cuisine:"europe", name:"Skyr, banana and peanut butter",
  short:"Two minutes, no bowl skills required.",
  time:2, kcal:350, protein:30, fibre:4,
  ingredients:[
    {t:"Skyr", n:200, u:"g", s:1},
    {t:"Banaani", n:1, u:"kpl"},
    {t:"Maapähkinävoi", n:1, u:"rkl"},
    {t:"Kaneli", n:"", u:"ripaus"}
  ],
  steps:[
    "Skyr in a bowl, banana sliced over it, peanut butter in a thin drizzle (warm the spoon if it's stiff), cinnamon."
  ],
  tip:"One tablespoon of peanut butter, not three. Weigh it once and you'll never guess again.",
  why:"Fast protein for mornings when the alternative is skipping breakfast and eating too much at lunch."
},

/* ============================ LUNCHES ============================ */
{
  id:"ln2", meal:"lunch", serves:1, cuisine:"europe", name:"Tuna rye plate",
  short:"Tinned tuna, rye bread, cottage cheese, raw vegetables.",
  time:5, kcal:400, protein:32, fibre:9,
  ingredients:[
    {t:"Tonnikala vedessä", n:1, u:"tlk (150 g)"},
    {t:"Ruisleipä", n:2, u:"viipaletta"},
    {t:"Raejuusto", n:100, u:"g", s:1},
    {t:"Kurkku, tomaatti, punasipuli", n:"", u:"niin paljon kuin maistuu"},
    {t:"Sitruuna, mustapippuri", n:"", u:"maun mukaan"}
  ],
  steps:[
    "Drain the tuna, fork it with lemon, pepper and a little finely chopped onion.",
    "Rye bread, cottage cheese, tuna, and a pile of chopped vegetables on the side."
  ],
  tip:"Tuna in water, never in oil — you save ~100 kcal and can add your own good oil if you want it.",
  why:"A 5-minute lunch with 32 g protein that doesn't need a microwave."
},
{
  id:"ln3", meal:"lunch", serves:1, from:"b5", cuisine:"europe", name:"Soup, rye and cheese",
  short:"Yesterday's minestrone, one slice of rye, 20 g of cheese.",
  time:5, kcal:350, protein:18, fibre:10,
  ingredients:[
    {t:"Minestrone (edelliseltä illalta)", n:400, u:"ml", s:1},
    {t:"Ruisleipä", n:1, u:"viipale"},
    {t:"Juusto (kevyt, esim. Oltermanni)", n:20, u:"g", s:1}
  ],
  steps:[
    "Reheat the soup. If it's thick, add a splash of water — it should be soupy, not stew.",
    "Rye bread with a thin slice of cheese. That's lunch."
  ],
  tip:"Soup is the most filling thing per calorie in this whole plan. Keep a portion in the fridge at all times.",
  why:"350 kcal with 10 g fibre, and it leaves room for a real dinner."
},
{
  id:"ln4", meal:"lunch", serves:1, cuisine:"europe", name:"Chicken quinoa salad",
  short:"Cold chicken, quinoa, feta and a lemon dressing.",
  time:15, kcal:450, protein:38, fibre:7,
  ingredients:[
    {t:"Kanan filee (or leftover roast chicken)", n:150, u:"g", s:1},
    {t:"Quinoa, keitetty", n:1, u:"dl"},
    {t:"Salaattilehdet", n:"", u:"iso kourallinen"},
    {t:"Kirsikkatomaatti", n:100, u:"g", s:1},
    {t:"Kurkku", n:"½", u:"kpl"},
    {t:"Feta (kevyt)", n:30, u:"g", s:1},
    {t:"Sitruuna", n:"½", u:"kpl"},
    {t:"Oliiviöljy", n:1, u:"tl"}
  ],
  steps:[
    "Cook the chicken if you don't have leftovers: salted water 12 min, rest, slice.",
    "Toss quinoa with lemon, oil, salt and pepper while still warm — it absorbs the dressing.",
    "Layer leaves, quinoa, chicken, vegetables, crumbled feta."
  ],
  tip:"Cook extra quinoa whenever you make it. It keeps 4 days in the fridge and turns any leftovers into lunch.",
  why:"38 g protein, and cold quinoa has a lower glycaemic response than hot — a small bonus for a filling lunch."
},
{
  id:"ln5", meal:"lunch", serves:2, cuisine:"europe", name:"Lentil and feta salad",
  short:"The vegetarian lunch that actually keeps you full.",
  time:20, kcal:420, protein:22, fibre:14,
  ingredients:[
    {t:"Linssit, kuivat (or 2 tlk valmiita)", n:150, u:"g", s:1},
    {t:"Feta (kevyt)", n:50, u:"g", s:1},
    {t:"Tomaatti", n:2, u:"kpl"},
    {t:"Punasipuli", n:"½", u:"kpl"},
    {t:"Kurkku", n:"½", u:"kpl"},
    {t:"Persilja or korianteri", n:1, u:"kourallinen"},
    {t:"Sitruuna", n:1, u:"kpl"},
    {t:"Oliiviöljy", n:1, u:"rkl"},
    {t:"Jeera, suola, mustapippuri", n:"", u:"maun mukaan"}
  ],
  steps:[
    "Rinse lentils, simmer 20 min in plenty of water with a bay leaf, until tender but not mushy. Drain and cool slightly.",
    "Dress warm lentils with lemon, oil, cumin, salt and pepper — they drink it up.",
    "Fold in diced tomato, cucumber, thin onion, chopped herbs. Crumble feta over."
  ],
  tip:"Green or beluga lentils hold their shape; red ones turn to dal. Both are fine, but this salad wants the firm ones.",
  why:"14 g fibre — the highest in the plan. Fibre is the most underrated weight-loss tool there is."
},
{
  id:"ln6", meal:"lunch", serves:1, cuisine:"europe", name:"Turkey and hummus wrap",
  short:"Five minutes, hand-held, no plate needed.",
  time:5, kcal:400, protein:28, fibre:8,
  ingredients:[
    {t:"Tortilla, täysjyvä", n:1, u:"kpl"},
    {t:"Kalkkunaleike", n:100, u:"g", s:1},
    {t:"Hummus", n:2, u:"rkl"},
    {t:"Salaattilehdet", n:"", u:"kourallinen"},
    {t:"Porkkana, raastettu", n:1, u:"kpl"},
    {t:"Kurkku", n:"½", u:"kpl"},
    {t:"Mustapippuri, sitruuna", n:"", u:"maun mukaan"}
  ],
  steps:[
    "Warm the tortilla 20 s in a dry pan so it folds instead of cracking.",
    "Spread hummus over most of it, layer turkey, leaves, grated carrot, cucumber batons.",
    "Roll tight, tuck the bottom, cut in half."
  ],
  tip:"Read the label on kalkkunaleike — some are 60% water and starch. Look for 20 g+ protein per 100 g.",
  why:"A portable lunch for days when you're not at home, at 400 kcal."
},

/* ============================ SNACKS ============================ */
{id:"sn1", meal:"snack", serves:1, cuisine:"europe", name:"Quark and berries", short:"150 g quark, a handful of frozen berries.", time:2, kcal:150, protein:15, fibre:3,
 ingredients:[{t:"Maitorahka", n:150, u:"g", s:1},{t:"Pakastemarjat", n:60, u:"g", s:1}],
 steps:["Combine. Eat."],
 tip:"The cheapest 15 g protein in the house.", why:"Keeps the afternoon from turning into a bread expedition."},
{id:"sn2", meal:"snack", serves:1, cuisine:"europe", name:"Apple and peanut butter", short:"One apple, one level tablespoon.", time:2, kcal:200, protein:6, fibre:5,
 ingredients:[{t:"Omena", n:1, u:"kpl"},{t:"Maapähkinävoi", n:1, u:"rkl"}],
 steps:["Slice the apple, dip."],
 tip:"Peanut butter is a calorie-dense food pretending to be a health food. One spoon, weighed.", why:"Sweet, crunchy, and done in two minutes."},
{id:"sn3", meal:"snack", serves:1, ahead:"Boil the eggs tonight, or a batch of six on Sunday. They keep a week in the fridge.", cuisine:"europe", name:"Two boiled eggs", short:"Boil a batch on Sunday.", time:9, kcal:150, protein:13, fibre:0,
 ingredients:[{t:"Kananmuna", n:2, u:"kpl"},{t:"Suola, mustapippuri", n:"", u:"maun mukaan"}],
 steps:["8 minutes from boiling, cold water, peel."],
 tip:"Boil six on Sunday; they keep a week in the fridge.", why:"Zero-decision protein."},
{id:"sn4", meal:"snack", serves:1, cuisine:"asia", name:"Edamame with sea salt", short:"Frozen pods, four minutes, salt.", time:5, kcal:120, protein:11, fibre:5,
 ingredients:[{t:"Edamame, pakaste", n:100, u:"g", s:1},{t:"Merisuola", n:"", u:"ripaus"}],
 steps:["Boil or steam from frozen 4 min. Salt. Eat from the pod."],
 tip:"In the freezer aisle of any Prisma. Keep a bag.", why:"11 g protein and something to do with your hands."},
{id:"sn5", meal:"snack", serves:1, cuisine:"europe", name:"Carrots and hummus", short:"Crunch, dip, repeat.", time:2, kcal:150, protein:5, fibre:5,
 ingredients:[{t:"Porkkana", n:2, u:"kpl"},{t:"Hummus", n:2, u:"rkl"}],
 steps:["Cut carrots into sticks. Dip."],
 tip:"Cut them when you get home from the shop, not when you're hungry.", why:"Volume and fibre for very little."},
{id:"sn6", meal:"snack", serves:1, cuisine:"europe", name:"Skyr with cinnamon", short:"Cold, thick, slightly dessert-like.", time:2, kcal:120, protein:18, fibre:0,
 ingredients:[{t:"Skyr", n:150, u:"g", s:1},{t:"Kaneli", n:"1", u:"tl"},{t:"Makeutusaine or ½ tl hunajaa", n:"", u:"halutessa"}],
 steps:["Stir cinnamon through the skyr."],
 tip:"Whip it with a fork for 30 s and it turns mousse-like.", why:"18 g protein for 120 kcal — the best ratio in the plan."}
];
