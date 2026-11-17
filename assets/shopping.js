/* Mesa Dos — what the shop sells, and how recipe ingredients turn into it.

   The weekly list is not written by hand. It is added up from the plan: every recipe on
   the week, doubled where a dinner is also tomorrow's lunch, sized for the two of you,
   then rounded up to what a Finnish supermarket actually sells.

   Prices are indicative: K-Market / Prisma, November 2026. Keep them plausible. */
const AISLE_ORDER = [
  "Hedelmät ja vihannekset",
  "Kala ja liha",
  "Maito, juusto ja kananmuna",
  "Leipä ja vilja",
  "Säilykkeet ja kuivakaappi",
  "Pakasteet"
];

const STORES = [
  { name:"Prisma / S-market", note:"Base shop. Pirkka and Kotimaista own-brands are the value plays: chicken, quark, rye bread, frozen fish." },
  { name:"Lidl", note:"Cheapest for vegetables, feta, nuts, olive oil, tinned beans and frozen berries. Weekly theme weeks often carry Asian staples." },
  { name:"K-Market", note:"For small packs and top-ups: 300 g of beef, one courgette, a pot of coriander." },
  { name:"Etninen hylly / Vii Voan / Hakaniemi", note:"Aji amarillo paste, gochujang, green curry paste, rice noodles, cheap limes and coriander." }
];

/* PRODUCTS — what goes in the basket every week.
     a      aisle (index into AISLE_ORDER)
     u      the unit amounts are added up in
     pack   how much one purchase holds, in u (default 1)
     p      price of one purchase
     sold   what one purchase is called on the list ("pussi", "tlk") when that reads better
            than the amount
     loose  sold by weight: show the total rather than "2 × 500 g"
     per    how recipe units convert into u — { kynttä: 0.1 } = ten cloves to a bulb */
const PRODUCTS = {
  /* ---- fruit and vegetables ---- */
  "Peruna, jauhoinen":   { a:0, u:"g", pack:1000, p:1.25, loose:1 },
  "Bataatti":            { a:0, u:"g", pack:500, p:1.25, loose:1 },
  "Punasipuli":          { a:0, u:"kpl", p:0.30 },
  "Sipuli":              { a:0, u:"kpl", p:0.20 },
  "Valkosipuli":         { a:0, u:"kpl", p:0.79, per:{ "kynttä":0.1 } },
  "Tomaatti":            { a:0, u:"kpl", p:0.50 },
  "Kirsikkatomaatti":    { a:0, u:"g", pack:250, p:1.99 },
  "Kurkku":              { a:0, u:"kpl", p:1.19 },
  "Paprika":             { a:0, u:"kpl", p:1.49 },
  "Kesäkurpitsa":        { a:0, u:"kpl", p:1.49 },
  "Parsakaali":          { a:0, u:"g", pack:400, p:1.99, sold:"kpl" },
  "Pak choi":            { a:0, u:"kpl", p:1.49, per:{ g:1/150 } },
  "Jäävuorisalaatti":    { a:0, u:"kpl", p:1.79 },
  "Salaattisekoitus":    { a:0, u:"pussi", p:1.99, per:{ "kourallinen":0.25, "iso kourallinen":0.35 } },
  "Pinaatti, tuore":     { a:0, u:"g", pack:100, p:0.99 },
  "Porkkana":            { a:0, u:"kpl", pack:12, p:1.49, sold:"pussi" },
  "Kevätsipuli":         { a:0, u:"kpl", pack:5, p:1.19, sold:"nippu" },
  /* a recipe's "one pot" of herbs is really half of one: a pot does two dishes */
  "Korianteri":          { a:0, u:"ruukku", p:1.99, per:{ "ruukku":0.5, "kourallinen":0.25 } },
  "Minttu":              { a:0, u:"ruukku", p:1.79, per:{ "ruukku":0.5 } },
  "Basilika":            { a:0, u:"ruukku", p:1.79, per:{ "ruukku":0.5 } },
  "Lime":                { a:0, u:"kpl", p:0.50 },
  "Sitruuna":            { a:0, u:"kpl", p:0.65, per:{ rkl:0.25 } },
  "Inkivääri":           { a:0, u:"g", pack:100, p:1.39, sold:"pala", per:{ tl:5, rkl:15, cm:10 } },
  "Chili":               { a:0, u:"kpl", p:0.50 },
  "Avokado":             { a:0, u:"kpl", p:1.49 },
  "Selleri":             { a:0, u:"varsi", p:0.99 },
  "Omena":               { a:0, u:"kpl", p:0.40 },
  "Banaani":             { a:0, u:"kpl", p:0.30 },

  /* ---- fish and meat ---- */
  "Kanan filee":              { a:1, u:"g", pack:400, p:4.29 },
  "Kanan reisikoipi, luuton": { a:1, u:"g", pack:600, p:5.49 },
  "Kanan jauheliha":          { a:1, u:"g", pack:400, p:5.49 },
  "Sian jauheliha 10%":       { a:1, u:"g", pack:400, p:4.29 },
  "Naudan paistisuikale":     { a:1, u:"g", pack:300, p:6.99 },
  "Kirjolohi filee":          { a:1, u:"g", pack:300, p:6.49 },
  "Kalkkunaleike":            { a:1, u:"g", pack:200, p:2.49 },

  /* ---- dairy, cheese and eggs ---- */
  "Maitorahka":            { a:2, u:"g", pack:500, p:2.19 },
  "Skyr":                  { a:2, u:"g", pack:500, p:3.19 },
  "Raejuusto":             { a:2, u:"g", pack:200, p:1.25 },
  "Turkkilainen jogurtti": { a:2, u:"g", pack:400, p:1.89 },
  "Feta, kevyt":           { a:2, u:"g", pack:200, p:2.79 },
  "Juusto, kevyt":         { a:2, u:"g", pack:150, p:2.29 },
  "Maito, kevyt":          { a:2, u:"ml", pack:1000, p:1.19, per:{ dl:100 } },
  "Kananmuna":             { a:2, u:"kpl", pack:10, p:3.19 },
  "Hummus":                { a:2, u:"g", pack:200, p:2.29, per:{ rkl:20 } },

  /* ---- bread and grains ---- */
  "Ruisleipä":          { a:3, u:"viipale", pack:12, p:2.49, sold:"pussi" },
  "Tortilla, täysjyvä": { a:3, u:"kpl", pack:8, p:2.29, sold:"pkt" },

  /* ---- tins ---- */
  "Tomaattimurska":           { a:4, u:"g", pack:400, p:1.29, sold:"tlk" },
  "Kikherneet, säilyke":      { a:4, u:"tlk", p:0.99 },
  "Valkoiset pavut, säilyke": { a:4, u:"tlk", p:1.19 },
  "Kookosmaito, kevyt":       { a:4, u:"ml", pack:400, p:1.99, sold:"tlk" },
  "Tonnikala vedessä":        { a:4, u:"tlk", p:1.29, per:{ "tlk (150 g)":1 } },

  /* ---- frozen ---- */
  "Seiti / pangasius, pakaste": { a:5, u:"g", pack:400, p:4.49 },
  "Pakastemarjat":              { a:5, u:"g", pack:500, p:2.99 },
  "Pakastemaissi":              { a:5, u:"g", pack:450, p:1.49, sold:"pussi" },
  "Edamame":                    { a:5, u:"g", pack:400, p:2.99 }
};

/* PANTRY — bought once, lasts weeks. Not on the weekly list; the shopping page shows which
   of these the week's cooking uses, so the cupboard can be checked before leaving. */
const PANTRY = [
  { n:"Oliiviöljy", q:"500 ml", p:5.49 },
  { n:"Soijakastike", q:"250 ml", p:2.39 },
  { n:"Seesamiöljy", q:"150 ml", p:4.19 },
  { n:"Etikka: punaviini + riisi", q:"2 × 250 ml", p:4.50 },
  { n:"Gochujang", q:"500 g", p:4.99, note:"Korean wraps — keeps a year" },
  { n:"Aji amarillo paste", q:"220 g", p:6.90, note:"ethnic aisle; sub: turmeric + chilli" },
  { n:"Miso", q:"300 g", p:4.49 },
  { n:"Green curry paste", q:"100 g", p:3.49 },
  { n:"Liemi: kana + kasvis", q:"fondi / kuutiot", p:3.50, note:"pho and minestrone" },
  { n:"Hunaja", q:"400 g", p:3.49 },
  { n:"Maapähkinävoi, sokeriton", q:"350 g", p:3.29 },
  { n:"Kaurahiutale", q:"1 kg", p:1.99 },
  { n:"Quinoa", q:"500 g", p:3.99 },
  { n:"Bulgur", q:"500 g", p:2.19 },
  { n:"Täysjyväriisi", q:"1 kg", p:2.49 },
  { n:"Täysjyväpasta", q:"500 g", p:1.69 },
  { n:"Riisinuudeli", q:"250 g", p:1.99 },
  { n:"Linssit, kuivat", q:"500 g", p:2.29 },
  { n:"Chia", q:"200 g", p:3.99 },
  { n:"Seesaminsiemenet", q:"100 g", p:3.49 },
  { n:"Saksanpähkinä", q:"200 g", p:4.49 },
  { n:"Oliivit", q:"1 tlk", p:1.99, note:"ají de gallina" },
  { n:"Parmesan / Grana Padano", q:"150 g", p:3.99, note:"a wedge keeps a month" },
  { n:"Mausteet: jeera, paprikajauhe, oregano, kaneli, chilihiutaleet", q:"—", p:7.50, note:"if starting from zero", mix:1 },
  { n:"Tähtianis + kanelitanko", q:"—", p:4.00, note:"pho", mix:1 }
];

/* BUY — an ingredient line that is not itself the name of a product or pantry item.
     "Name"                  it is that product (or pantry item) under another name
     [["Name", amount], …]   a fixed amount of each, in the product's own unit, for the
                             recipe as written ("salad to serve" has to become something)
     null                    nothing to buy: salt, pepper, last night's soup */
const SPICES = "Mausteet: jeera, paprikajauhe, oregano, kaneli, chilihiutaleet";
const BUY = {
  "Aji amarillo paste (or 1 tl chili + kurkuma)": "Aji amarillo paste",
  "Aji amarillo paste (or 1 tl kurkuma + 1 tl chili)": "Aji amarillo paste",
  "Chili (aji limo if you can)": "Chili",
  "Jalapeño or vihreä chili (aji verde)": "Chili",
  "Chili flakes": SPICES,
  "Edamame, pakaste": "Edamame",
  "Feta (kevyt)": "Feta, kevyt",
  "Inkivääri, raastettu": "Inkivääri",
  "Jeera jauhettuna": SPICES,
  "Jeera, suola, mustapippuri": SPICES,
  "Juusto (kevyt, esim. Oltermanni)": "Juusto, kevyt",
  "Kanalientä (fondi)": "Liemi: kana + kasvis",
  "Kasvisliemi": "Liemi: kana + kasvis",
  "Kanan filee (or leftover roast chicken)": "Kanan filee",
  "Kanan filee or reisikoipi": "Kanan filee",
  "Kanan reisikoipi, luuton ja nahaton": "Kanan reisikoipi, luuton",
  "Kananmuna, kovaksi keitetty": "Kananmuna",
  "Kaneli": SPICES,
  "Kanelitanko": "Tähtianis + kanelitanko",
  "Tähtianis": "Tähtianis + kanelitanko",
  "Kirjolohi or vaalea kala (pakaste seiti works)": "Seiti / pangasius, pakaste",
  "Seiti, turska or pangasius (pakaste ok)": "Seiti / pangasius, pakaste",
  "Korianteri (aji verde)": "Korianteri",
  "Korianteri or thai basil": "Korianteri",
  "Persilja or korianteri": "Korianteri",
  "Korianteri + minttu": [["Korianteri", 0.5], ["Minttu", 0.5]],
  "Kurkku, tomaatti, punasipuli": [["Kurkku", 0.25], ["Tomaatti", 1], ["Punasipuli", 0.25]],
  "Tomaatti, kurkku, punasipuli": [["Tomaatti", 2], ["Kurkku", 0.5], ["Punasipuli", 0.5]],
  "Lime (aji verde)": "Lime",
  "Linssit, kuivat (or 2 tlk valmiita)": "Linssit, kuivat",
  "Maapähkinävoi": "Maapähkinävoi, sokeriton",
  "Maito": "Maito, kevyt",
  "Maito (kevyt)": "Maito, kevyt",
  "Makeutusaine or ½ tl hunajaa": "Hunaja",
  "Merisuola": null,
  "Minestrone (edelliseltä illalta)": null,
  "Miso (or 1 rkl soijaa + 1 tl hunajaa)": "Miso",
  "Mustapippuri, sitruuna": [["Sitruuna", 0.25]],
  "Sitruuna, mustapippuri": [["Sitruuna", 0.25]],
  "Sitruunamehu": "Sitruuna",
  "Sitruunan kuori": "Sitruuna",
  "Naudan paistisuikale (or sisäfileesuikale)": "Naudan paistisuikale",
  "Oliivi": "Oliivit",
  "Oliiviöljy or voi": "Oliiviöljy",
  "Oliiviöljy, basilika, mustapippuri": [["Basilika", 0.25], ["Oliiviöljy", 0]],
  "Oregano": SPICES,
  "Oregano, kuivattu": SPICES,
  "Paprikajauhe": SPICES,
  "Pak choi or parsakaali": "Pak choi",
  "Pakastemarjat (mustikka, vadelma)": "Pakastemarjat",
  "Paprika (mix colours)": "Paprika",
  "Punainen paprika": "Paprika",
  "Parmesan (or Grana Padano)": "Parmesan / Grana Padano",
  "Peruna": "Peruna, jauhoinen",
  "Pinaatti": "Pinaatti, tuore",
  "Porkkana, raastettu": "Porkkana",
  "Punaviinietikka (or omenaviinietikka)": "Etikka: punaviini + riisi",
  "Riisiviinietikka": "Etikka: punaviini + riisi",
  "Quinoa, keitetty": "Quinoa",
  "Ruisleipä (murennettuna, suurustukseen)": "Ruisleipä",
  "Saksanpähkinä, rouhittu": "Saksanpähkinä",
  "Salaattilehdet": "Salaattisekoitus",
  "Salaattilehdet, lime, suola": [["Salaattisekoitus", 0.5], ["Lime", 1]],
  "Selleri (if you have it)": "Selleri",
  "Suola, mustapippuri": null,
  "Suola, mustapippuri, muskottipähkinä": null,
  "Suola, mustapippuri, tilli": null,
  "Turkkilainen jogurtti (aji verde)": "Turkkilainen jogurtti",
  "Täysjyväpasta (small shape)": "Täysjyväpasta"
};
