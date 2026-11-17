/* Mesa Dos — shopping baskets. Prices indicative: K-Market / Prisma, Finland, Nov 2026. */
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
  { name:"K-Market", note:"For small packs and top-ups — 300 g of beef, one courgette, a bunch of coriander." },
  { name:"Etninen hylly / Vii Voan / Hakaniemi", note:"Aji amarillo paste, gochujang, green curry paste, rice noodles, cheap limes and coriander." }
];

const SHOP = {
A: [
  { aisle:"Hedelmät ja vihannekset", items:[
    {id:"A01", n:"Peruna, jauhoinen", q:"2 kg", p:2.49, note:"lomo fries + sides"},
    {id:"A02", n:"Bataatti", q:"1 kg", p:2.49, note:"ceviche"},
    {id:"A03", n:"Punasipuli", q:"500 g", p:1.29},
    {id:"A04", n:"Valkosipuli", q:"2 kpl", p:1.58},
    {id:"A05", n:"Tomaatti", q:"800 g", p:3.99},
    {id:"A06", n:"Kirsikkatomaatti", q:"250 g", p:1.99},
    {id:"A07", n:"Kurkku", q:"2 kpl", p:2.38},
    {id:"A08", n:"Paprika, punainen", q:"3 kpl", p:4.47},
    {id:"A09", n:"Kesäkurpitsa", q:"2 kpl", p:2.98},
    {id:"A10", n:"Parsakaali", q:"2 kpl", p:3.98},
    {id:"A11", n:"Pak choi", q:"2 kpl", p:2.99},
    {id:"A12", n:"Jäävuorisalaatti", q:"1 kpl", p:1.79, note:"wraps + pollo salad"},
    {id:"A13", n:"Salaattisekoitus", q:"2 pussia", p:3.98},
    {id:"A14", n:"Pinaatti, tuore", q:"200 g", p:1.99},
    {id:"A15", n:"Porkkana", q:"1 kg", p:1.49},
    {id:"A16", n:"Kevätsipuli", q:"2 nippua", p:2.38},
    {id:"A17", n:"Korianteri", q:"2 ruukkua", p:3.98},
    {id:"A18", n:"Lime", q:"6 kpl", p:2.99},
    {id:"A19", n:"Sitruuna", q:"2 kpl", p:1.29},
    {id:"A20", n:"Inkivääri", q:"1 pala", p:1.39},
    {id:"A21", n:"Chili, punainen", q:"3 kpl", p:1.50},
    {id:"A22", n:"Omena", q:"6 kpl", p:2.40},
    {id:"A23", n:"Banaani", q:"1 kg", p:1.69}
  ]},
  { aisle:"Kala ja liha", items:[
    {id:"A30", n:"Kanan filee", q:"800 g", p:8.49, note:"Greek tray + quinoa salad"},
    {id:"A31", n:"Kanan reisikoipi, luuton", q:"600 g", p:5.49, note:"pollo a la brasa"},
    {id:"A32", n:"Kanan jauheliha", q:"400 g", p:5.49, note:"Korean wraps"},
    {id:"A33", n:"Naudan paistisuikale", q:"300 g", p:6.99, note:"lomo saltado"},
    {id:"A34", n:"Kirjolohi filee", q:"300 g", p:6.49, note:"miso salmon"},
    {id:"A35", n:"Seiti / pangasius, pakaste", q:"400 g", p:4.49, note:"ceviche + baked cod"},
    {id:"A36", n:"Kananmuna", q:"10 kpl", p:3.19},
    {id:"A37", n:"Tonnikala vedessä", q:"2 tlk", p:2.58}
  ]},
  { aisle:"Maito, juusto ja kananmuna", items:[
    {id:"A40", n:"Maitorahka", q:"2 × 500 g", p:4.38},
    {id:"A41", n:"Turkkilainen jogurtti", q:"500 g", p:1.99, note:"aji verde"},
    {id:"A42", n:"Skyr", q:"500 g", p:3.19},
    {id:"A43", n:"Raejuusto", q:"400 g", p:2.49},
    {id:"A44", n:"Feta, kevyt", q:"200 g", p:2.79},
    {id:"A45", n:"Maito, kevyt", q:"1 l", p:1.19}
  ]},
  { aisle:"Leipä ja vilja", items:[
    {id:"A50", n:"Ruisleipä", q:"500 g", p:2.49},
    {id:"A51", n:"Tortilla, täysjyvä", q:"1 paketti", p:2.29}
  ]},
  { aisle:"Säilykkeet ja kuivakaappi", items:[
    {id:"A60", n:"Tomaattimurska", q:"2 tlk", p:2.58},
    {id:"A61", n:"Kikherneet, säilyke", q:"2 tlk", p:1.98},
    {id:"A62", n:"Valkoiset pavut, säilyke", q:"1 tlk", p:1.19},
    {id:"A63", n:"Hummus", q:"200 g", p:2.29}
  ]},
  { aisle:"Pakasteet", items:[
    {id:"A70", n:"Pakastemarjat", q:"500 g", p:2.99},
    {id:"A71", n:"Pakastemaissi", q:"1 pussi", p:1.49},
    {id:"A72", n:"Edamame", q:"400 g", p:2.99},
    {id:"A73", n:"Pakasteherneet", q:"750 g", p:1.99}
  ]}
],
B: [
  { aisle:"Hedelmät ja vihannekset", items:[
    {id:"B01", n:"Peruna, jauhoinen", q:"2 kg", p:2.49, note:"ají de gallina + causa"},
    {id:"B02", n:"Punasipuli", q:"1 kg", p:2.29},
    {id:"B03", n:"Valkosipuli", q:"2 kpl", p:1.58},
    {id:"B04", n:"Tomaatti", q:"1 kg", p:4.58},
    {id:"B05", n:"Kirsikkatomaatti", q:"400 g", p:2.99, note:"baked feta pasta"},
    {id:"B06", n:"Kurkku", q:"2 kpl", p:2.38},
    {id:"B07", n:"Paprika", q:"2 kpl", p:2.98},
    {id:"B08", n:"Kesäkurpitsa", q:"2 kpl", p:2.98},
    {id:"B09", n:"Parsakaali", q:"2 kpl", p:3.98},
    {id:"B10", n:"Pak choi", q:"2 kpl", p:2.99},
    {id:"B11", n:"Pinaatti, tuore", q:"300 g", p:2.98},
    {id:"B12", n:"Porkkana", q:"1 kg", p:1.49},
    {id:"B13", n:"Kevätsipuli", q:"2 nippua", p:2.38},
    {id:"B14", n:"Korianteri", q:"2 ruukkua", p:3.98},
    {id:"B15", n:"Minttu", q:"1 ruukku", p:1.79, note:"pho"},
    {id:"B16", n:"Lime", q:"8 kpl", p:3.99},
    {id:"B17", n:"Sitruuna", q:"1 kpl", p:0.69},
    {id:"B18", n:"Inkivääri", q:"1 pala", p:1.39},
    {id:"B19", n:"Chili", q:"3 kpl", p:1.50},
    {id:"B20", n:"Avokado", q:"1 kpl", p:1.49, note:"causa"},
    {id:"B21", n:"Salaattisekoitus", q:"2 pussia", p:3.98},
    {id:"B22", n:"Omena", q:"6 kpl", p:2.40},
    {id:"B23", n:"Banaani", q:"1 kg", p:1.69},
    {id:"B24", n:"Selleri", q:"1 varsi", p:0.99, note:"minestrone"}
  ]},
  { aisle:"Kala ja liha", items:[
    {id:"B30", n:"Kanan filee", q:"1,1 kg", p:11.49, note:"ají, curry, pho"},
    {id:"B31", n:"Sian jauheliha 10%", q:"400 g", p:4.29},
    {id:"B32", n:"Kananmuna", q:"10 kpl", p:3.19},
    {id:"B33", n:"Tonnikala vedessä", q:"3 tlk", p:3.87, note:"causa"}
  ]},
  { aisle:"Maito, juusto ja kananmuna", items:[
    {id:"B40", n:"Maitorahka", q:"2 × 500 g", p:4.38},
    {id:"B41", n:"Skyr", q:"500 g", p:3.19},
    {id:"B42", n:"Raejuusto", q:"400 g", p:2.49},
    {id:"B43", n:"Feta, kevyt", q:"200 g", p:2.79},
    {id:"B44", n:"Maito, kevyt", q:"1,5 l", p:1.79},
    {id:"B45", n:"Parmesan / Grana Padano", q:"50 g", p:2.49, note:"minestrone"}
  ]},
  { aisle:"Leipä ja vilja", items:[
    {id:"B50", n:"Ruisleipä", q:"500 g", p:2.49}
  ]},
  { aisle:"Säilykkeet ja kuivakaappi", items:[
    {id:"B60", n:"Tomaattimurska", q:"1 tlk", p:1.29},
    {id:"B61", n:"Kikherneet, säilyke", q:"1 tlk", p:0.99},
    {id:"B62", n:"Valkoiset pavut, säilyke", q:"1 tlk", p:1.19},
    {id:"B63", n:"Kookosmaito, kevyt", q:"1 tlk", p:1.99}
  ]},
  { aisle:"Pakasteet", items:[
    {id:"B70", n:"Pakastemarjat", q:"500 g", p:2.99},
    {id:"B71", n:"Edamame", q:"400 g", p:2.99}
  ]}
]
};

/* Buy once — lasts about a month of this plan */
const PANTRY = [
  { n:"Oliiviöljy", q:"500 ml", p:5.49 },
  { n:"Soijakastike", q:"250 ml", p:2.39 },
  { n:"Seesamiöljy", q:"150 ml", p:4.19 },
  { n:"Gochujang", q:"500 g", p:4.99, note:"Korean wraps — keeps a year" },
  { n:"Aji amarillo paste", q:"220 g", p:6.90, note:"ethnic aisle; sub: kurkuma + chili" },
  { n:"Miso", q:"300 g", p:4.49 },
  { n:"Green curry paste", q:"100 g", p:3.49 },
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
  { n:"Mausteet: jeera, paprikajauhe, oregano, kaneli", q:"—", p:6.00, note:"if starting from zero" },
  { n:"Tähtianis + kanelitanko", q:"—", p:4.00, note:"pho" }
];
