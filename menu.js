/* Emily Pizza · datos del menú y utilidades compartidas (tienda y panel). */
/* =================== CONFIGURACIÓN =================== */
const CONFIG = {
  whatsapp: "573105840621",
  address: "Carrera 32 # 63 Sur-44, Candelaria La Nueva, Ciudad Bolívar, Bogotá",
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3997.850683682487!2d-74.14986309999999!3d4.569473299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9f152454192f%3A0x442eb374c17244cc!2zQ3JhLiAzMiAjIDYzIFNVUi00NCwgQ2RhZC4gQm9sw612YXIsIEJvZ290w6EsIEQuQy4sIEJvZ290w6EsIEJvZ290w6EsIEQuQy4!5e1!3m2!1ses-419!2sco!4v1791177531391!5m2!1ses-419!2sco",
  mapLink: "https://www.google.com/maps/search/?api=1&query=4.5694733,-74.1498631",
  qrNequi: "",            // ej.: "img/qr-nequi.png"
  qrBreb: "",             // ej.: "img/qr-breb.png"
  combo: { price: 8500, label: "Arma tu combo", desc: "1 porción de papa + 1 gaseosa 350 ml" },
  vegetales: ["Lechuga","Tomate"],   // qué trae "vegetales" (las hamburguesas no llevan cebolla)
  mostrarPagos: false,   // cambiar a true cuando estén los QR de Nequi y Bre-B
  hours: { 0:[12,23], 1:[15,23], 2:[15,23], 3:[15,23], 4:[15,23], 5:[15,23], 6:[12,23] }, // 0=domingo, hora de Bogotá
  // Carrusel del inicio: [categoría, título, texto, imagen]
  destacados: [
    ["pizzas","Pizza artesanal","Horneada al momento con queso tipo pera","hero-pizza"],
    ["hamburguesas","Hamburguesas","Carne artesanal 100% res","hero-burger"],
    ["salchipapas","Salchipapas","Papa 100% natural y salchicha Zenú","salchipapas"],
    ["combos","Combos para compartir","Desde $28.000","combo4"]
  ],
  // Favoritos: id del producto (categoría-posición). Cámbialos por los que más venden.
  favoritos: ["hamburguesas-2","salchipapas-4","mazorcadas-9","combos-3"]
};
const DAYS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

/* =================== MENÚ =================== */
const PIZZA_SIZES = [
  { id:"personal", name:"Personal", info:"1 sabor · 22 cm", price:14000, flavors:1, r:9 },
  { id:"mediana",  name:"Mediana",  info:"2 sabores · 35 cm", price:35000, flavors:2, r:12 },
  { id:"familiar", name:"Familiar", info:"2 sabores · 50 cm", price:65000, flavors:2, r:15 }
];
const PIZZA_FLAVORS = [
  ["Tres carnes","Jamón, cábano, pollo desmechado y queso"],
  ["Criolla","Carne desmechada, jamón, maíz y queso"],
  ["Mexicana","Carne desmechada, jamón, ají casero y queso"],
  ["Pollo con champiñones","Pollo desmechado, champiñones y queso"],
  ["Napolitana","Tomate, champiñones, orégano y queso"],
  ["Pollo con tocineta","Pollo desmechado, tocineta y queso"],
  ["Campesina","Pollo desmechado, maíz, jamón y queso"],
  ["Hawaiana","Piña, jamón y queso"],
  ["Chocoreo","Chocolate derretido, galleta Oreo y queso"],
  ["Choco banano","Chocolate, banano y queso"]
];
const flavorDesc = n => (PIZZA_FLAVORS.find(f=>f[0]===n)||[])[1] || "";

const MENU = [
  { id:"pizzas", name:"Pizzas", short:"Pizzas", img:"pizzas", lead:"Pizza artesanal horneada al momento, con queso tipo pera.", type:"pizza", noCombo:true,
    items: PIZZA_FLAVORS.map(([n,d])=>({ name:n, desc:d })) },
  { id:"exclusivas", name:"Pizzas exclusivas", short:"Exclusivas", img:"exclusivas", lead:"Solo en tamaño personal · 1 sabor · 22 cm.", badge:"Exclusivos", noCombo:true,
    items:[
      { name:"Pizza Hamburguesa", desc:"Pollo desmechado, carne desmechada, tocineta, huevos fritos y carne de hamburguesa", price:30000 },
      { name:"Pizza Estofada", desc:"Pollo desmechado, carne desmechada, maíz, cábano y salchicha americana", price:30000 },
      { name:"Pizza Doríloca", desc:"Pollo desmechado, carne desmechada, maíz, tocineta, salsa guacamole, Doritos y pico de gallo", price:30000 }
    ]},
  { id:"hamburguesas", name:"Hamburguesas", short:"Hamburguesas", single:"Hamburguesa", img:"hamburguesas", lead:"Artesanales, preparadas al momento.", badge:"Carne artesanal 100% res",
    items:[
      { name:"Sencilla", desc:"Una carne, vegetales, salsas, queso y papas chips", price:11000 },
      { name:"Hawaiana", desc:"Una carne, vegetales, salsas, jamón, piña, queso y papas chips", price:14000 },
      { name:"Colombiana", desc:"Una carne, vegetales, salsas, tocineta, huevo frito, queso y papas chips", price:18000 },
      { name:"Doble carne", desc:"Dos carnes, vegetales, salsas, queso y papas chips", price:18000 },
      { name:"Ranchera", desc:"Una carne, salchicha, vegetales, salsa, queso y papas chips", price:18000 },
      { name:"Criolla", desc:"Una carne, pollo desmechado, carne desmechada, maíz, vegetales, salsas, queso y papas chips", price:20000 },
      { name:"Mixta", desc:"Una carne, pollo desmechado, carne desmechada, vegetales, salsa, queso y papas chips", price:20000 },
      { name:"Colombo ranchera", desc:"Una carne, vegetales, salsa, tocineta, salchicha, huevo frito, queso y papas chips", price:20000 },
      { name:"Tripleta", desc:"3 carnes de hamburguesa", price:20000 },
      { name:"Dejavú", desc:"2 carnes de hamburguesa, huevo frito, tocineta, salsa y guacamole", price:22000 },
      { name:"Extrema", desc:"Una carne, vegetales, salchicha, salsas, carne desmechada, pollo desmechado, queso, huevo frito, tocineta y papas chips", price:23000 },
      { name:"Extrema criolla", desc:"Una carne, vegetales, salsa, queso, salchicha, tocineta, maíz, carne desmechada, pollo desmechado, huevo frito y papas chips", price:24000 },
      { name:"Parrillera", desc:"1 carne de hamburguesa, cerdo, pollo a la plancha, huevo frito, tocineta y tajadas", price:28000 }
    ]},
  { id:"perros", name:"Perros", short:"Perros", single:"Perro", img:"perros", lead:"Artesanales, preparados al momento.", badge:"Salchicha americana Zenú",
    items:[
      { name:"Sencillo", desc:"Salchicha, salsas, queso, papas chips y tres huevos de codorniz", price:11000 },
      { name:"Hawaiano", desc:"Salchicha, salsas, piña, jamón, queso, papas chips y tres huevos de codorniz", price:15000 },
      { name:"Especial", desc:"Salchicha, carne desmechada, pollo desmechado, salsas, queso, papas chips y tres huevos de codorniz", price:18000 },
      { name:"Criollo", desc:"Salchicha, carne desmechada, pollo desmechado, maíz, salsas, queso, papas chips y tres huevos de codorniz", price:20000 },
      { name:"Súper especial", desc:"Salchicha, carne desmechada, pollo desmechado, salsas, queso, papas chips, tres huevos de codorniz y tocineta", price:22000 }
    ]},
  { id:"salchipapas", name:"Salchipapas", short:"Salchipapas", single:"Salchipapa", img:"salchipapas", lead:"Papas naturales, preparadas al momento.", badge:"Papa 100% natural",
    items:[
      { name:"Sencilla", desc:"1 salchicha, huevo de codorniz y salsas", price:11000 },
      { name:"Especial", desc:"Doble salchicha, huevo de codorniz y salsas", price:15000 },
      { name:"Súper", desc:"1 salchicha, carne desmechada, pollo desmechado, huevo de codorniz y salsas", price:18000 },
      { name:"Salchi Emily", noPrefix:true, desc:"1 salchicha, tocineta, papa chips, queso rallado y salsas", price:18000 },
      { name:"Salchi Madurita", noPrefix:true, desc:"Pollo desmechado, carne desmechada, tocineta, doble salchicha, queso fundido, francesa de maduro y salsas", price:40000 },
      { name:"Porción de papa", price:7000, noCombo:true, noPrefix:true },
      { name:"Salchicha adicional", price:5000, noCombo:true, noPrefix:true }
    ]},
  { id:"arepas", name:"Arepas rellenas", short:"Arepas", single:"Arepa", img:"arepas",
    items:[
      { name:"Mixta", desc:"Carne desmechada, pollo desmechado, queso, papa chips y huevo de codorniz", price:13000 },
      { name:"Solo pollo", desc:"Pollo desmechado, queso, papa chips y huevo de codorniz", price:13000 },
      { name:"Solo carne", desc:"Carne desmechada, queso, papa chips y huevo de codorniz", price:14000 },
      { name:"Hawaiana", desc:"Carne desmechada, jamón, piña, queso, papa chips y huevo de codorniz", price:13000 },
      { name:"Criolla", desc:"Carne desmechada, pollo desmechado, maíz, papa chips y huevo de codorniz", price:15000 },
      { name:"Ranchera", desc:"Carne desmechada, pollo desmechado, papa chips, huevo de codorniz y salchicha", price:17000 },
      { name:"Criolla solo pollo", desc:"Pollo desmechado, maíz, papa chips y huevo de codorniz", price:15000 },
      { name:"Criolla solo carne", desc:"Carne desmechada, maíz, papa chips y huevo de codorniz", price:17000 },
      { name:"Ranchera solo pollo", desc:"Pollo desmechado, papa chips, huevo de codorniz y salchicha", price:17000 },
      { name:"Ranchera solo carne", desc:"Carne desmechada, papa chips, huevo de codorniz y salchicha", price:19000 }
    ]},
  { id:"patacones", name:"Patacones", short:"Patacones", single:"Patacón", img:"patacones",
    items:[
      { name:"Mixto", desc:"Carne desmechada, pollo desmechado, queso y huevo de codorniz", price:21000 },
      { name:"Solo pollo", desc:"Pollo desmechado, queso y huevo de codorniz", price:21000 },
      { name:"Solo carne", desc:"Carne desmechada, queso y huevo de codorniz", price:22000 },
      { name:"Criollo", desc:"Carne desmechada, pollo desmechado, maíz, queso y huevo de codorniz", price:21000 },
      { name:"Ranchero", desc:"Carne desmechada, pollo desmechado, queso, huevos de codorniz y salchicha", price:23000 },
      { name:"Ranchero solo pollo", desc:"Pollo desmechado, queso, huevos de codorniz y salchicha", price:23000 },
      { name:"Ranchero solo carne", desc:"Carne desmechada, queso, huevos de codorniz y salchicha", price:25000 },
      { name:"Criollo solo pollo", desc:"Pollo desmechado, maíz, queso y huevo de codorniz", price:21000 },
      { name:"Criollo solo carne", desc:"Carne desmechada, maíz, queso y huevo de codorniz", price:23000 }
    ]},
  { id:"mazorcadas", name:"Mazorcadas", short:"Mazorcadas", single:"Mazorcada", img:"mazorcadas",
    items:[
      { name:"Sencilla", desc:"Carne desmechada, pollo desmechado, maíz, salsas, queso, papas chips y dos huevos de codorniz", price:21000 },
      { name:"Solo pollo", desc:"Pollo desmechado, maíz, salsas, queso, papas chips y dos huevos de codorniz", price:21000 },
      { name:"Solo carne", desc:"Carne desmechada, maíz, salsas, queso, papas chips y dos huevos de codorniz", price:23000 },
      { name:"Ranchera", desc:"Carne desmechada, pollo desmechado, salchicha, maíz, salsas, queso, papa chips y huevos de codorniz", price:23000 },
      { name:"Ranchera solo pollo", desc:"Pollo desmechado, salchicha, maíz, salsas, queso, papa chips y huevos de codorniz", price:23000 },
      { name:"Ranchera solo carne", desc:"Carne desmechada, salchicha, maíz, salsas, queso, papa chips y huevos de codorniz", price:25000 },
      { name:"Madurita", desc:"Carne desmechada, pollo desmechado, tocineta, maduro, maíz, salsa, queso, papas chips y huevos de codorniz", price:26000 },
      { name:"Madurita solo pollo", desc:"Pollo desmechado, tocineta, maduro, maíz, salsa, queso, papas chips y huevos de codorniz", price:26000 },
      { name:"Madurita solo carne", desc:"Carne desmechada, tocineta, maduro, maíz, salsa, queso, papas chips y huevos de codorniz", price:28000 },
      { name:"Emily", desc:"Papa a la francesa, carne desmechada, pollo desmechado, tocineta, salchicha, maduro, maíz, salsas, queso, papas chips y huevo de codorniz", price:36000 }
    ]},
  { id:"burritos", name:"Burritos", short:"Burritos", single:"Burrito", img:"burritos", lead:"Con el sabor tradicional.",
    items:[
      { name:"Sabanero", desc:"Cerdo, pollo desmechado, queso, maíz y papa a la francesa", price:22000 },
      { name:"Burrito Solitario", desc:"Cerdo, pollo desmechado, queso y papa a la francesa", price:22000 },
      { name:"Burrito Montañero", desc:"Cerdo, pollo desmechado, queso, tocineta y papa a la francesa", price:22000 },
      { name:"Burrito al Potrero", desc:"Cerdo, pollo desmechado, queso, piña en trozos, tocineta y papa a la francesa", price:22000 },
      { name:"Burrito Condorito", desc:"Cerdo, pollo desmechado, queso, Doritos, ají casero y papa a la francesa", price:23000 },
      { name:"Burrito Mexicano", desc:"Cerdo, pollo desmechado, queso, salchicha, tocineta, ají casero y papa a la francesa", price:25000 }
    ]},
  { id:"quesadillas", name:"Quesadillas", short:"Quesadillas", single:"Quesadilla", img:"quesadillas",
    items:[
      { name:"Hawaiana", desc:"Piña, tocineta y queso", price:20000 },
      { name:"Tentación", desc:"Chocolate, banano y queso", price:20000 },
      { name:"Pollo", desc:"Pollo desmechado y queso", price:20000 },
      { name:"Carne", desc:"Carne desmechada y queso", price:20000 },
      { name:"Mixta", desc:"Carne desmechada, pollo desmechado y queso", price:21000 },
      { name:"Ranchera", desc:"Carne desmechada, pollo desmechado, salchicha y queso", price:23000 }
    ]},
  { id:"lasana", name:"Lasaña", short:"Lasaña", img:"lasana", lead:"Artesanal, acompañada con 2 tajadas de pan.", sides:["2 tajadas de pan"], noCombo:true,
    items:[ { name:"Lasaña mixta", desc:"Pollo desmechado, carne desmechada y champiñón", price:20000 } ]},
  { id:"carta", name:"Platos a la carta", short:"Platos", img:"carta", lead:"Acompañados con papa a la francesa, ensalada y patacón.", sides:["Papa a la francesa","Ensalada","Patacón"], noCombo:true,
    items:[
      { name:"Churrasco", price:30000 },
      { name:"Costillas BBQ", price:25000 },
      { name:"Pechuga sencilla", price:25000 },
      { name:"Pechuga gratinada", price:30000 },
      { name:"Pechuga queso champiñón", price:35000 },
      { name:"Pechuga criolla", desc:"Queso y maíz", price:35000 },
      { name:"Pechuga ranchera", desc:"Queso y tocineta", price:35000 }
    ]},
  { id:"jugos", name:"Jugos naturales", short:"Bebidas", img:"jugos", lead:"100% fruta, 100% natural.", type:"drink", noCombo:true, note:"Ej.: bajito de azúcar, sin hielo…",
    flavors:["Mora","Fresa","Mango","Feijoa","Maracuyá","Guanábana","Lulo","Frutos rojos","Uva"],
    items:[
      { name:"Jugo en agua", price:7000, pickFlavor:true },
      { name:"Jugo en leche", price:8000, pickFlavor:true },
      { name:"Limonada natural", price:6000 },
      { name:"Limonada de coco", price:10000 }
    ]},
  { id:"combos", name:"Combos", short:"Combos", img:"combo4", lead:"Promociones para compartir.", type:"combo", noCombo:true,
    items:[
      { name:"Combo 1", img:"combo1", price:28000, parts:["2 hamburguesas sencillas o 2 perros americanos sencillos","1 porción de papas","1 gaseosa 1 L"],
        choice:{ label:"Elige", options:[ {label:"2 hamburguesas sencillas", ref:["hamburguesas","Sencilla"], n:2, unit:"Hamburguesa"}, {label:"2 perros americanos sencillos", ref:["perros","Sencillo"], n:2, unit:"Perro"} ] } },
      { name:"Combo 2", img:"combo2", price:36000, parts:["2 hamburguesas: Colombianas, Rancheras o Doble carne","1 porción de papa"],
        choice:{ label:"Hamburguesas", options:[ {label:"Colombianas", ref:["hamburguesas","Colombiana"], n:2, unit:"Hamburguesa"}, {label:"Rancheras", ref:["hamburguesas","Ranchera"], n:2, unit:"Hamburguesa"}, {label:"Doble carne", ref:["hamburguesas","Doble carne"], n:2, unit:"Hamburguesa"} ] } },
      { name:"Combo 3", img:"combo3", price:40000, parts:["2 hamburguesas: Criollas, Mixtas o Colombo rancheras, o 2 perros criollos","1 porción de papa"],
        choice:{ label:"Elige", options:[ {label:"2 hamburguesas criollas", ref:["hamburguesas","Criolla"], n:2, unit:"Hamburguesa"}, {label:"2 hamburguesas mixtas", ref:["hamburguesas","Mixta"], n:2, unit:"Hamburguesa"}, {label:"2 hamburguesas colombo rancheras", ref:["hamburguesas","Colombo ranchera"], n:2, unit:"Hamburguesa"}, {label:"2 perros criollos", ref:["perros","Criollo"], n:2, unit:"Perro"} ] } },
      { name:"Combo 4", img:"combo4", price:66000, parts:["3 hamburguesas: Doble carne, Ranchera o Colombiana","2 porciones de papa","1 gaseosa 1,5 L"],
        choice:{ label:"Hamburguesas", options:[ {label:"Doble carne", ref:["hamburguesas","Doble carne"], n:3, unit:"Hamburguesa"}, {label:"Ranchera", ref:["hamburguesas","Ranchera"], n:3, unit:"Hamburguesa"}, {label:"Colombiana", ref:["hamburguesas","Colombiana"], n:3, unit:"Hamburguesa"} ] } },
      { name:"Combo 5", img:"combo5", price:72000, parts:["3 hamburguesas: Mixta, Criolla o Colombo ranchera","2 porciones de papa","1 gaseosa 1,5 L"],
        choice:{ label:"Hamburguesas", options:[ {label:"Mixta", ref:["hamburguesas","Mixta"], n:3, unit:"Hamburguesa"}, {label:"Criolla", ref:["hamburguesas","Criolla"], n:3, unit:"Hamburguesa"}, {label:"Colombo ranchera", ref:["hamburguesas","Colombo ranchera"], n:3, unit:"Hamburguesa"} ] } },
      { name:"Combo 6", img:"combo6", price:60000, parts:["2 hamburguesas con pollo desmechado, carne desmechada, maíz, baño de queso y tocineta","1 porción de papa","1 pizza personal (sabor a elección)","1 gaseosa 1,5 L"],
        fixedUnits:{ n:2, unit:"Hamburguesa", desc:"Pollo desmechado, carne desmechada, maíz, baño de queso y tocineta" }, pizzaPick:true }
    ]}
];

/* =================== UTILIDADES =================== */
const $ = s => document.querySelector(s);
const fmt = n => "$" + Math.round(n).toLocaleString("es-CO");
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const imgSrc = k => `img/${k}.webp`;
function splitIngs(desc){
  if(!desc) return [];
  const out = [];
  desc.replace(/\s+y\s+/g, ", ").split(",").map(s=>s.trim()).filter(Boolean).forEach(s=>{
    if(/^vegetales$/i.test(s)) CONFIG.vegetales.forEach(v=>out.push(v)); else out.push(cap(s));
  });
  return [...new Set(out)];
}
MENU.forEach(c => c.items.forEach((it,i) => { it.id = c.id + "-" + i; it.cat = c; }));
const findItem = id => { for(const c of MENU){ const it = c.items.find(i=>i.id===id); if(it) return it; } };
const refItem = ([cid,name]) => MENU.find(c=>c.id===cid).items.find(i=>i.name===name);

/* =================== INVENTARIO (agotados) =================== */
// Lo que llega del panel: { ing:{clave:"agota"|"sin"}, prod:{id:true}, cat:{id:true}, aviso:"" }
//   "agota" = todo lo que lleve ese ingrediente sale como agotado
//   "sin"   = el producto se vende igual, pero sin ese ingrediente
let STOCK = { ing:{}, prod:{}, cat:{}, aviso:"", avisoFecha:"", dia:"", cerradoFecha:"", programados:[] };
const ING_ALIAS = {
  "carne":"carne desmechada",   // en la carta "carne" junto a "pollo desmechado" es la misma carne desmechada
  "una carne":"carne de hamburguesa", "dos carnes":"carne de hamburguesa", "1 carne de hamburguesa":"carne de hamburguesa",
  "2 carnes de hamburguesa":"carne de hamburguesa", "3 carnes de hamburguesa":"carne de hamburguesa",
  "huevos de codorniz":"huevo de codorniz", "tres huevos de codorniz":"huevo de codorniz", "dos huevos de codorniz":"huevo de codorniz",
  "papas chips":"papa chips", "salsas":"salsa", "huevos fritos":"huevo frito",
  "1 salchicha":"salchicha", "doble salchicha":"salchicha", "salchicha americana":"salchicha",
  "champinones":"champinon", "pina en trozos":"pina", "chocolate derretido":"chocolate",
  "queso rallado":"queso", "queso fundido":"queso", "bano de queso":"queso", "francesa de maduro":"maduro",
  "salsa guacamole":"guacamole", "pollo":"pollo desmechado"
};
const ING_LABEL = { "carne de hamburguesa":"Carne de hamburguesa", "carne desmechada":"Carne desmechada", "huevo de codorniz":"Huevo de codorniz", "papa chips":"Papa chips",
  "salsa":"Salsas", "champinon":"Champiñón", "pina":"Piña", "huevo frito":"Huevo frito", "maduro":"Maduro", "salchicha":"Salchicha",
  "queso":"Queso", "chocolate":"Chocolate", "guacamole":"Guacamole", "pollo":"Pollo" };
const stockKey = label => { const k = norm(label); return ING_ALIAS[k] || k; };
const ingState = label => STOCK.ing[stockKey(label)] || "";

function itemIngs(it){
  const c = it.cat;
  if(c.type==="combo") return it.fixedUnits ? splitIngs(it.fixedUnits.desc) : [];
  return [...splitIngs(it.desc), ...(c.sides||[])];
}
function availableFlavors(list){ return list.filter(f => ingState(f)!=="agota"); }
const pizzaFlavorOut = name => itemStatus(MENU[0].items.find(i=>i.name===name)).out;
function comboOptionsOk(it){ return it.choice ? it.choice.options.filter(o => !itemStatus(refItem(o.ref)).out) : []; }

// ¿Se puede pedir hoy? -> { out:boolean, reason:string }
function itemStatus(it){
  const c = it.cat;
  if(STOCK.cat[c.id]) return { out:true, reason:`Hoy no hay ${c.name.toLowerCase()}` };
  if(STOCK.prod[it.id]) return { out:true, reason:"Agotado por hoy" };
  if(c.type==="combo"){
    if(it.choice && !comboOptionsOk(it).length) return { out:true, reason:"Agotado por hoy" };
    if(it.pizzaPick && !PIZZA_FLAVORS.some(f=>!pizzaFlavorOut(f[0]))) return { out:true, reason:"Hoy no hay pizza personal" };
  }
  if(it.pickFlavor && !availableFlavors(c.flavors).length) return { out:true, reason:"Hoy no hay fruta para jugos" };
  const miss = itemIngs(it).find(g => ingState(g)==="agota");
  if(miss) return { out:true, reason:`Hoy no hay ${miss.toLowerCase()}` };
  return { out:false, reason:"" };
}
// Índices de ingredientes que hoy van "sin" (se quitan solos)
const lockedIdx = list => new Set(list.map((g,i)=>ingState(g)==="sin"?i:-1).filter(i=>i>=0));

// Catálogo de ingredientes para el panel: clave -> { label, productos }
function ingredientCatalog(){
  const map = new Map();
  const add = (label, it) => { const k = stockKey(label); if(!map.has(k)) map.set(k, { key:k, label: ING_LABEL[k] || cap(label.replace(/^(una|un|dos|tres|1|2|3|doble)\s+/i,"")), items:new Set() }); if(it) map.get(k).items.add(it.id); };
  const fruits = new Set();
  MENU.forEach(c => c.items.forEach(it => { itemIngs(it).forEach(g => add(g, it)); if(it.pickFlavor) c.flavors.forEach(f => { add(f, it); fruits.add(stockKey(f)); }); }));
  return [...map.values()].map(g => ({ ...g, group: fruits.has(g.key) ? "jugos" : "comida" })).sort((a,b)=>a.label.localeCompare(b.label,"es"));
}
if(typeof module!=="undefined") module.exports = { MENU, CONFIG, PIZZA_FLAVORS, itemStatus, ingredientCatalog, stockKey, lockedIdx, setStock:s=>{ STOCK=s; } };
