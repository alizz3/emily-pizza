/* Emily Pizza · lógica de la página (menú, carrito, pedido por WhatsApp). */
const store = { get(k,d){ try{ const v = localStorage.getItem(k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } }, set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} } };
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove("show"),1800); }
async function copyText(text, ok){ try{ await navigator.clipboard.writeText(text); toast(ok); }catch(e){ toast("No se pudo copiar, selecciónalo manualmente"); } }
const waLink = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

/* =================== TEMA =================== */
function currentTheme(){
  const t = document.documentElement.dataset.theme;
  if(t==="light"||t==="dark") return t;
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
(function(){ const saved = store.get("emily-theme", null); if(saved) document.documentElement.dataset.theme = saved; })();
function toggleTheme(){
  const next = currentTheme()==="dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next; store.set("emily-theme", next);
  paintChalk(); syncThemeBtn();
}

/* =================== PIZARRA: tiza, borrones y dibujos de comida =================== */
const chalkCache = {};
function makeChalk(theme){
  const S = 560, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d");
  let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
  const ink = theme==="dark" ? "255,250,240" : "40,30,20";
  const k = theme==="dark" ? 1 : .7;
  const smudges = theme!=="dark"; // en oscuro la textura real ya trae los borrones
  // borrones de tiza
  for(let i=0; smudges && i<14;i++){
    const x=rnd()*S, y=rnd()*S, r=60+rnd()*140;
    const gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,`rgba(${ink},${(.025+rnd()*.03)*k})`); gr.addColorStop(1,`rgba(${ink},0)`);
    g.fillStyle=gr; g.beginPath(); g.ellipse(x,y,r,r*(.4+rnd()*.5),rnd()*Math.PI,0,Math.PI*2); g.fill();
  }
  // pasadas de borrador
  for(let i=0; smudges && i<6;i++){
    g.save(); g.translate(rnd()*S, rnd()*S); g.rotate(-.3+rnd()*.6);
    for(let j=0;j<10;j++){ g.fillStyle=`rgba(${ink},${.012*k})`; g.fillRect(-90, j*3 + rnd()*2, 180+rnd()*40, 2); }
    g.restore();
  }
  // trazo de tiza: cada línea se repite con leve temblor
  const lineCol = theme==="dark" ? "191,161,115" : "120,90,45"; // dorado del logo
  const stroke = draw => { g.save(); g.strokeStyle=`rgba(${lineCol},${theme==="dark"?.07:.08})`; g.lineWidth=1.6; g.lineCap="round"; g.lineJoin="round"; g.beginPath(); draw(); g.stroke(); g.restore(); };
  const doodles = {
    pizza(){ stroke(()=>{ g.moveTo(0,-30); g.lineTo(26,22); g.quadraticCurveTo(0,32,-26,22); g.closePath(); g.moveTo(-22,16); g.quadraticCurveTo(0,24,22,16); });
             [[0,-6],[-8,8],[9,10]].forEach(([x,y])=>stroke(()=>{ g.arc(x,y,4,0,Math.PI*2); })); },
    burger(){ stroke(()=>{ g.moveTo(-30,-2); g.quadraticCurveTo(-30,-28,0,-28); g.quadraticCurveTo(30,-28,30,-2); g.closePath(); });
              stroke(()=>{ g.moveTo(-32,6); for(let x=-32;x<=32;x+=8) g.lineTo(x+4, x%16?10:4); });
              stroke(()=>{ g.rect(-30,12,60,7); }); stroke(()=>{ g.moveTo(-30,24); g.lineTo(30,24); g.quadraticCurveTo(30,34,0,34); g.quadraticCurveTo(-30,34,-30,24); });
              [[-12,-18],[2,-21],[14,-15]].forEach(([x,y])=>stroke(()=>{ g.ellipse(x,y,2,1,0.4,0,Math.PI*2); })); },
    hotdog(){ stroke(()=>{ g.ellipse(0,0,36,12,0,0,Math.PI*2); }); stroke(()=>{ g.ellipse(0,-3,40,7,0,0,Math.PI*2); });
              stroke(()=>{ g.moveTo(-30,-4); for(let x=-30;x<=30;x+=6) g.quadraticCurveTo(x+3,(x/6)%2?-10:2,x+6,-4); }); },
    fries(){ stroke(()=>{ g.moveTo(-20,-4); g.lineTo(-14,30); g.lineTo(14,30); g.lineTo(20,-4); g.quadraticCurveTo(0,6,-20,-4); });
             [-14,-7,0,7,14].forEach((x,i)=>stroke(()=>{ g.rect(x-2.5,-28+(i%2)*6,5,26); })); },
    cup(){ stroke(()=>{ g.moveTo(-18,-20); g.lineTo(-13,30); g.lineTo(13,30); g.lineTo(18,-20); g.closePath(); g.moveTo(-20,-20); g.lineTo(20,-20); g.moveTo(-16,-4); g.lineTo(16,-4); });
           stroke(()=>{ g.moveTo(4,-20); g.lineTo(10,-40); g.lineTo(20,-42); }); },
    star(){ stroke(()=>{ for(let i=0;i<4;i++){ const a=i*Math.PI/4; g.moveTo(Math.cos(a)*-8,Math.sin(a)*-8); g.lineTo(Math.cos(a)*8,Math.sin(a)*8);} }); },
    swirl(){ stroke(()=>{ g.moveTo(-40,0); g.bezierCurveTo(-20,-16,0,16,20,0); g.bezierCurveTo(30,-8,36,-4,40,0); }); }
  };
  const names = ["pizza","burger","hotdog","fries","cup","pizza","burger","fries","star","star","star","swirl","swirl"];
  const placed = [];
  names.forEach(n=>{
    let x,y,t=0; do { x=50+rnd()*(S-100); y=50+rnd()*(S-100); t++; } while(t<40 && placed.some(([a,b])=>Math.hypot(a-x,b-y)<120));
    placed.push([x,y]);
    g.save(); g.translate(x,y); g.rotate(-.5+rnd()); const sc = n==="star"?.7+rnd()*.5 : .9+rnd()*.5; g.scale(sc,sc); doodles[n](); g.restore();
  });
  return c.toDataURL("image/png");
}
// El logo claro u oscuro sigue al tema elegido a mano (si no, lo decide el celular)
function syncLogo(){ const t=document.documentElement.dataset.theme; document.querySelectorAll(".brand-logo source").forEach(src=>{ src.media = t==="light" ? "all" : t==="dark" ? "not all" : "(prefers-color-scheme: light)"; }); }
function syncThemeBtn(){ syncLogo(); const d = currentTheme()==="dark"; const b=$("#themeBtn"); if(!b) return; b.setAttribute("aria-checked", d); b.setAttribute("aria-label", d ? "Modo oscuro activado. Cambiar a claro" : "Modo claro activado. Cambiar a oscuro"); }
function paintChalk(){
  const t = currentTheme(); const el = $("#chalk"); if(!el) return;
  try { chalkCache[t] = chalkCache[t] || makeChalk(t); el.style.backgroundImage = t==="dark" ? `url(${chalkCache[t]}), linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url(img/pizarra.webp)` : `url(${chalkCache[t]})`; } catch(e){}
}
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", paintChalk);

/* =================== HORARIO =================== */
function bogotaNow(){
  const parts = new Intl.DateTimeFormat("en-US",{timeZone:"America/Bogota",weekday:"short",hour:"numeric",hourCycle:"h23"}).formatToParts(new Date());
  const get = t => parts.find(p=>p.type===t).value;
  return { day:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(get("weekday")), h:(+get("hour"))%24 };
}
const hourLabel = h => h===12 ? "12 m." : (h>12 ? (h-12)+" p. m." : h+" a. m.");
const range = d => `${hourLabel(CONFIG.hours[d][0])} – ${hourLabel(CONFIG.hours[d][1])}`;
function isOpen(){ const n=bogotaNow(); const [o,c]=CONFIG.hours[n.day]; return n.h>=o && n.h<c; }
function renderStatus(){
  const n=bogotaNow(); const [o,c]=CONFIG.hours[n.day];
  const el=$("#status"), tx=$("#statusText");
  if(n.h>=o && n.h<c){ el.className="status open"; tx.innerHTML=`<b>Abierto</b> · hasta las ${hourLabel(c)}`; }
  else { el.className="status closed"; tx.innerHTML = n.h<o ? `<b>Cerrado</b> · abre hoy ${hourLabel(o)}` : `<b>Cerrado</b> · abre mañana ${hourLabel(CONFIG.hours[(n.day+1)%7][0])}`; }
  const wk=[1,2,3,4,5].includes(n.day), cls = on => on?' class="today"':"";
  $("#hoursList").innerHTML = `<dt${cls(wk)}>Lunes a viernes</dt><dd${cls(wk)}>${range(1)}</dd><dt${cls(!wk)}>Sábados y domingos</dt><dd${cls(!wk)}>${range(0)}</dd>`;
}
function openHours(){
  sheetMode="hours"; const n=bogotaNow();
  $("#sheetKicker").textContent = isOpen() ? "Abierto ahora" : "Cerrado ahora";
  $("#sheetTitle").textContent = "Horario de atención";
  $("#sheetBody").innerHTML = `<div class="week">${[1,2,3,4,5,6,0].map(d=>`<div class="${d===n.day?"on":""}"><span>${DAYS[d]}</span><span>${range(d)}</span></div>`).join("")}</div><a class="addr muted" target="_blank" rel="noopener" href="${CONFIG.mapLink}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span>${esc(CONFIG.address)}</span></a>`;
  $("#sheetFoot").innerHTML = `<button class="btn btn-ghost" type="button" style="flex:1" data-close>Listo</button>`;
  openSheet();
}

/* =================== INICIO =================== */
let slideI = 0, slideT;
function renderHome(){
  // La primera diapositiva ya viene en el HTML: solo se le agrega el botón y se suman las demás (así la foto principal no se vuelve a pintar)
  const feat = $("#feature"), first = feat.querySelector(".slide");
  const [c0] = CONFIG.destacados[0];
  if(first && !first.querySelector(".go")) first.querySelector(".tx").insertAdjacentHTML("beforeend", `<button class="go" type="button" data-go="${c0}">Ver ${esc(MENU.find(c=>c.id===c0).short.toLowerCase())}</button>`);
  feat.insertAdjacentHTML("beforeend", CONFIG.destacados.map(([cid,t,p,img],i)=> i===0 ? "" : `<div class="slide${i===0?" on":""}"${i!==0?" inert":""}><img src="${imgSrc(img)}" alt="${esc("Foto de "+t.toLowerCase())}"${i===0?' fetchpriority="high"':' loading="lazy"'}><div class="tx"><span class="tag">Emily Pizza</span><h2>${esc(t)}</h2><span class="p">${esc(p)}</span><button class="go" type="button" data-go="${cid}">Ver ${esc(MENU.find(c=>c.id===cid).short.toLowerCase())}</button></div></div>`).join("")
    + `<div class="dots">${CONFIG.destacados.map((_,i)=>`<button type="button" aria-label="Destacado ${i+1}" data-slide="${i}" class="${i===0?"on":""}"></button>`).join("")}</div>`);
  renderCatsFavs();
  startSlides(7000);
}
function renderCatsFavs(){
  $("#cats").innerHTML = MENU.map(c=>{
    const off = STOCK.cat[c.id] || c.items.every(it=>itemStatus(it).out);
    return `<button class="cat${off?" off":""}" type="button" data-go="${c.id}"><span class="ph"><img src="${imgSrc(c.img)}" alt="" loading="lazy"></span>${esc(c.short)}${off?'<span class="sold">Agotado</span>':""}</button>`;
  }).join("");
  $("#favs").innerHTML = CONFIG.favoritos.map(id=>{
    const it = findItem(id); if(!it) return ""; const c = it.cat, st = itemStatus(it);
    const title = c.type==="combo" ? it.name : lineName(it);
    const sub = it.parts ? it.parts.join(" + ") : (it.desc||"");
    return `<button class="fav${st.out?" out":""}" type="button" data-id="${it.id}"${st.out?` data-out="${esc(st.reason)}"`:""}><span class="ph"><img src="${imgSrc(it.img||c.img)}" alt="" loading="lazy"></span><span class="in"><b>${esc(title)}</b><small>${esc(sub.length>70?sub.slice(0,68)+"…":sub)}</small><span class="row"><span class="price">${fmt(it.price)}</span>${st.out?'<span class="sold">Agotado hoy</span>':'<span class="add" aria-hidden="true">+</span>'}</span></span></button>`;
  }).join("");
  const av=$("#aviso"); av.hidden=!STOCK.aviso; av.innerHTML = STOCK.aviso ? `<b>Hoy</b>${esc(STOCK.aviso)}` : "";
}
function showSlide(i){
  const s = document.querySelectorAll(".slide"), d = document.querySelectorAll(".dots button");
  slideI = (i + s.length) % s.length;
  s.forEach((el,k)=>{ el.classList.toggle("on",k===slideI); el.inert = k!==slideI; });
  d.forEach((el,k)=>el.classList.toggle("on",k===slideI));
}
let slidePaused = false;
function startSlides(delay=5000){
  clearInterval(slideT); clearTimeout(slideT);
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  slideT = setTimeout(function tick(){ if(!slidePaused && !document.hidden) showSlide(slideI+1); slideT = setTimeout(tick, 5000); }, delay);
}
(function(){
  const f = document.getElementById("feature");
  const pause = v => () => { slidePaused = v; };
  f.addEventListener("pointerenter", pause(true)); f.addEventListener("pointerleave", pause(false));
  f.addEventListener("focusin", pause(true)); f.addEventListener("focusout", pause(false));
  f.addEventListener("touchstart", () => { slidePaused = true; clearTimeout(f._t); f._t = setTimeout(()=>{ slidePaused = false; }, 8000); }, { passive:true });
})();

/* =================== CARTA =================== */
const pizzaIcon = r => `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="19" cy="19" r="${r+2}"/><circle cx="19" cy="19" r="${r}" stroke-dasharray="2 2.5" opacity=".6"/><path d="M19 ${19-r}v${2*r}M${19-r} 19h${2*r}" opacity=".5"/></svg>`;
const photoAlt = c => `Foto de ${c.name.toLowerCase()} de Emily Pizza`;
const banner = c => `<div class="banner"><img src="${imgSrc(c.img)}" alt="${esc(photoAlt(c))}" loading="lazy"><div class="t"><h2>${esc(c.name)}</h2>${c.lead?`<p>${esc(c.lead)}</p>`:""}${c.badge?`<span class="badge">${esc(c.badge)}</span>`:""}</div></div>`;
function itemRow(it){
  const c = it.cat, st = itemStatus(it);
  const priceHtml = c.type==="pizza" ? `<span class="price"><small>desde</small>${fmt(PIZZA_SIZES[0].price)}</span>` : `<span class="price">${fmt(it.price)}</span>`;
  return `<button class="item${st.out?" out":""}" type="button" data-id="${it.id}"${st.out?` data-out="${esc(st.reason)}"`:""} data-search="${esc(norm(c.name+" "+it.name+" "+(it.desc||"")))}"><span class="txt"><h3>${esc(it.name)}</h3>${it.desc?`<p>${esc(it.desc)}</p>`:""}</span><span class="side">${priceHtml}${st.out?`<span class="sold">${esc(st.reason==="Agotado por hoy"?"Agotado":"No hay hoy")}</span>`:'<span class="add" aria-hidden="true">+</span>'}</span></button>`;
}
function renderMenu(){
  let html = "";
  for(const c of MENU){
    html += `<section class="section" id="${c.id}">${banner(c)}`;
    if(c.type==="pizza"){
      html += `<div class="step extra">1 · Elige el tamaño <em>o toca un sabor abajo</em></div>
        <div class="sizes extra">${PIZZA_SIZES.map(s=>`<button class="size${STOCK.cat.pizzas?" out":""}" type="button" data-size="${s.id}"${STOCK.cat.pizzas?' data-out="Hoy no hay pizzas"':""}>${pizzaIcon(s.r)}<b>${s.name}</b><span>${s.info}</span><span class="price">${fmt(s.price)}</span><span class="add" aria-hidden="true">+</span></button>`).join("")}</div>
        <div class="step extra">2 · Sabores <em>en mediana y familiar puedes pedir mitad y mitad</em></div>`;
    }
    if(c.type==="combo"){
      html += `<div class="combo-grid">${c.items.map(it=>{ const st=itemStatus(it); return `<button class="combo${st.out?" out":""}" type="button" data-id="${it.id}"${st.out?` data-out="${esc(st.reason)}"`:""} data-search="${esc(norm("combo "+it.name+" "+it.parts.join(" ")))}"><img src="${imgSrc(it.img)}" alt="${esc("Foto del "+it.name.toLowerCase()+": "+it.parts.join(", "))}" loading="lazy"><span class="in"><span class="num">${esc(it.name)}</span><ul>${it.parts.map(p=>`<li>${esc(p)}</li>`).join("")}</ul><span class="foot"><span class="price">${fmt(it.price)}</span>${st.out?'<span class="sold">Agotado hoy</span>':'<span class="add" aria-hidden="true">+</span>'}</span></span></button>`;}).join("")}</div>
        <div class="arma extra"><img src="img/arma.webp" alt="" loading="lazy"><div class="in"><b>${CONFIG.combo.label}</b><p>${CONFIG.combo.desc}. Agrégalo a tu hamburguesa, perro, salchipapa y más.</p><span class="price">${fmt(CONFIG.combo.price)}</span></div></div>`;
    } else html += `<div class="list">${c.items.map(itemRow).join("")}</div>`;
    if(c.type==="drink") html += `<div class="flavors extra">${c.flavors.map(f=>`<span>${f}</span>`).join("")}</div>`;
    html += `</section>`;
  }
  $("#menu").innerHTML = html;
  const nav = [...MENU.map(c=>[c.id,c.name]),["eventos","Eventos"],...(CONFIG.mostrarPagos?[["pagos","Pagos"]]:[]),["visitanos","Visítanos"]];
  $("#chips").innerHTML = nav.map(([id,n])=>`<button class="chip" type="button" data-go="${id}">${esc(n)}</button>`).join("");
}

/* =================== NAVEGACIÓN =================== */
let navLock=false, navLockT;
function setActive(id){
  const box=$("#chips");
  box.querySelectorAll(".chip").forEach(ch=>{
    const on = ch.dataset.go===id; ch.classList.toggle("active",on);
    if(on) box.scrollTo({ left: Math.max(0, ch.offsetLeft - box.clientWidth/2 + ch.offsetWidth/2), behavior:"smooth" });
  });
}
function goTo(id){
  buildBelowFold();
  const el=document.getElementById(id); if(!el) return;
  const inHome = !!el.closest("#inicio");
  const y = el.getBoundingClientRect().top + window.scrollY - (inHome ? 16 : $("#nav").offsetHeight + 6);
  navLock=true; clearTimeout(navLockT); setActive(id);
  window.scrollTo({ top:y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  navLockT = setTimeout(()=>{ navLock=false; }, 900);
}
function updateFab(){
  const ex = $("#explora");
  $("#fab").classList.toggle("show", ex.getBoundingClientRect().bottom < -200);
}
function spy(){
  updateFab();
  if(navLock) return;
  const lim = $("#nav").offsetHeight + 40; let cur = null;
  document.querySelectorAll("#menu .section, #eventos, #pagos, #visitanos").forEach(sec=>{ if(!sec.hidden && sec.getBoundingClientRect().top < lim) cur = sec.id; });
  cur = cur || MENU[0].id;
  if(!document.querySelector(`.chip.active[data-go="${cur}"]`)) setActive(cur);
}

/* =================== BÚSQUEDA =================== */
function applySearch(q){
  q = norm(q.trim()); let any=false;
  document.querySelectorAll("#menu .section").forEach(sec=>{
    let vis=0;
    sec.querySelectorAll("[data-search]").forEach(el=>{ const show = !q || q.split(/\s+/).every(w=>el.dataset.search.includes(w)); el.hidden=!show; if(show) vis++; });
    sec.hidden = !!q && vis===0; if(vis) any=true;
    sec.querySelectorAll(".extra").forEach(x=>x.hidden=!!q);
  });
  $("#empty").style.display = (q && !any) ? "block" : "none";
}
let searchT;
function searchAndJump(v){
  applySearch(v);
  clearTimeout(searchT);
  if(v.trim()) searchT = setTimeout(()=>{ const first = document.querySelector("#menu .section:not([hidden])"); if(first) goTo(first.id); else goTo("menu"); }, 650);
}

/* =================== CARRITO =================== */
let cart = store.get("emily-cart", []); if(!Array.isArray(cart)) cart = [];
const saveCart = () => store.set("emily-cart", cart);
const lineTotal = l => l.unit*l.qty;
const cartTotal = () => cart.reduce((a,l)=>a+lineTotal(l),0);
const cartCount = () => cart.reduce((a,l)=>a+l.qty,0);
function updateBar(bump){
  const n=cartCount(), bar=$("#cartbar");
  bar.classList.toggle("show", n>0);
  document.body.classList.toggle("has-cart", n>0);
  $("#cartCount").textContent=n; $("#cartTotal").textContent=fmt(cartTotal());
  if(bump){ bar.classList.remove("bump"); void bar.offsetWidth; bar.classList.add("bump"); }
}

/* =================== HOJA =================== */
let sheetMode=null, lastFocus=null, draft=null;
function openSheet(){ $("#sheet").inert=false; lastFocus=document.activeElement; $("#scrim").classList.add("show"); $("#sheet").classList.add("show"); document.body.style.overflow="hidden"; $("#sheetBody").scrollTop=0; setTimeout(()=>$("#closeSheet").focus(),60); }
function closeSheet(){ $("#sheet").inert=true; $("#scrim").classList.remove("show"); $("#sheet").classList.remove("show"); document.body.style.overflow=""; sheetMode=null; if(lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true}); }
// locked = ingredientes que hoy no hay: salen quitados y no se pueden volver a poner
const chips = (list, removed, key, locked=new Set()) => { locked.forEach(i=>removed.add(i)); return `<div class="ings">${list.map((g,i)=>locked.has(i)
  ? `<button type="button" class="ing locked" disabled aria-pressed="true">${esc(g)} · hoy no hay</button>`
  : `<button type="button" class="ing" data-ing="${key}:${i}" aria-pressed="${removed.has(i)}">${esc(g)}</button>`).join("")}</div>`; };
const noteBox = (val, ph) => `<div class="grp"><h4>Notas</h4><textarea id="note" placeholder="${esc(ph||"Ej.: salsas aparte, bien asada…")}">${esc(val)}</textarea></div>`;
const addonBox = on => `<label class="addon"><img src="img/arma.webp" alt=""><input type="checkbox" id="addon" ${on?"checked":""}><span class="lab"><b>${CONFIG.combo.label}</b><small>${CONFIG.combo.desc}</small></span><span class="price">+${fmt(CONFIG.combo.price)}</span></label>`;
function lineName(it){ const c=it.cat; return (c.single && !it.noPrefix && !it.name.startsWith(c.single)) ? `${c.single} ${it.name.toLowerCase()}` : it.name; }

function openItem(id){
  const it=findItem(id), c=it.cat;
  if(c.type==="pizza") return openPizza({ f1:it.name });
  if(c.type==="combo") return openCombo(it);
  draft = { kind:"item", it, ings:[...splitIngs(it.desc), ...(c.sides||[])], removed:new Set(), qty:1, addon:false, juice:c.flavors?(availableFlavors(c.flavors)[0]||""):"", note:"" };
  sheetMode="item"; $("#sheetKicker").textContent=c.name; $("#sheetTitle").textContent=it.name;
  renderItemSheet(); openSheet();
}
function renderItemSheet(){
  const d=draft, it=d.it, c=it.cat;
  let h = `<img class="sheet-img" src="${imgSrc(c.img)}" alt="">`;
  if(it.desc) h += `<p style="margin:0;color:var(--muted)">${esc(it.desc)}</p>`;
  if(it.pickFlavor) h += `<div class="grp"><h4>Sabor</h4><div class="fgrid">${c.flavors.map(f=>`<label class="fl"><input type="radio" name="juice" value="${f}" ${d.juice===f?"checked":""} ${ingState(f)==="agota"?"disabled":""}>${f}${ingState(f)==="agota"?"<small>No hay hoy</small>":""}</label>`).join("")}</div></div>`;
  if(d.ings.length) h += `<div class="grp"><h4>Ingredientes</h4><p class="hint">Toca lo que <b>no</b> quieres.</p>${chips(d.ings,d.removed,"x",lockedIdx(d.ings))}</div>`;
  if(!c.noCombo && !it.noCombo) h += addonBox(d.addon);
  h += noteBox(d.note, c.note);
  $("#sheetBody").innerHTML=h; renderFoot();
}

function openPizza({ size="personal", f1="" }={}){
  if(f1 && pizzaFlavorOut(f1)) f1 = "";
  draft = { kind:"pizza", size, f1, f2:"", removed:new Set(), qty:1, note:"" };
  sheetMode="item"; $("#sheetKicker").textContent="Arma tu pizza";
  renderPizzaSheet(); openSheet();
}
function pizzaIngs(){ const l=[]; [draft.f1,draft.f2].filter(Boolean).forEach(f=>splitIngs(flavorDesc(f)).forEach(x=>{ if(!l.includes(x)) l.push(x); })); return l; }
function renderPizzaSheet(){
  const d=draft, s=PIZZA_SIZES.find(x=>x.id===d.size);
  $("#sheetTitle").textContent = d.f1 ? `Pizza ${d.f1}${d.f2?" / "+d.f2:""}` : `Pizza ${s.name.toLowerCase()}`;
  let h = `<div class="grp"><h4>Tamaño</h4><div class="opts">${PIZZA_SIZES.map(z=>`<label class="opt"><input type="radio" name="size" value="${z.id}" ${d.size===z.id?"checked":""}><span class="lab">${z.name}<small>${z.info}</small></span><span class="price">${fmt(z.price)}</span></label>`).join("")}</div></div>`;
  h += `<div class="grp"><h4>${s.flavors===2?"Primer sabor":"Sabor"}</h4><div class="fgrid">${PIZZA_FLAVORS.map(([n,ds])=>`<label class="fl"><input type="radio" name="f1" value="${esc(n)}" ${d.f1===n?"checked":""} ${pizzaFlavorOut(n)?"disabled":""}>${esc(n)}<small>${pizzaFlavorOut(n)?"No hay hoy":esc(ds)}</small></label>`).join("")}</div></div>`;
  if(s.flavors===2) h += `<div class="grp"><h4>Segundo sabor</h4><p class="hint">Opcional. La pizza llega mitad y mitad.</p><div class="fgrid"><label class="fl"><input type="radio" name="f2" value="" ${!d.f2?"checked":""}>Toda de un sabor<small>Sin mitad y mitad</small></label>${PIZZA_FLAVORS.filter(f=>f[0]!==d.f1).map(([n,ds])=>`<label class="fl"><input type="radio" name="f2" value="${esc(n)}" ${d.f2===n?"checked":""} ${pizzaFlavorOut(n)?"disabled":""}>${esc(n)}<small>${pizzaFlavorOut(n)?"No hay hoy":esc(ds)}</small></label>`).join("")}</div></div>`;
  const ings = pizzaIngs();
  if(ings.length) h += `<div class="grp"><h4>Ingredientes</h4><p class="hint">Toca lo que <b>no</b> quieres.</p>${chips(ings,d.removed,"x",lockedIdx(ings))}</div>`;
  h += noteBox(d.note, "Ej.: bien tostada, cortada en cuadritos…");
  $("#sheetBody").innerHTML=h; renderFoot();
}

function openCombo(it){
  const firstOpt = it.choice ? Math.max(0, it.choice.options.findIndex(o=>!itemStatus(refItem(o.ref)).out)) : 0;
  const firstPizza = (PIZZA_FLAVORS.find(f=>!pizzaFlavorOut(f[0]))||PIZZA_FLAVORS[0])[0];
  draft = { kind:"combo", it, opt:firstOpt, units:[], qty:1, note:"", pizza:firstPizza, pizzaRemoved:new Set() };
  resetUnits(); sheetMode="item"; $("#sheetKicker").textContent="Promoción"; $("#sheetTitle").textContent=it.name;
  renderComboSheet(); openSheet();
}
function comboSpec(){
  const it=draft.it;
  if(it.fixedUnits) return { n:it.fixedUnits.n, unit:it.fixedUnits.unit, ings:splitIngs(it.fixedUnits.desc) };
  const o=it.choice.options[draft.opt]; return { n:o.n, unit:o.unit, ings:splitIngs(refItem(o.ref).desc) };
}
function resetUnits(){ draft.units = Array.from({length:comboSpec().n},()=>new Set()); }
function renderComboSheet(){
  const d=draft, it=d.it, sp=comboSpec();
  let h = `<img class="sheet-img" src="${imgSrc(it.img)}" alt=""><ul style="margin:0;padding-left:18px;color:var(--muted)">${it.parts.map(p=>`<li>${esc(p)}</li>`).join("")}</ul>`;
  if(it.choice) h += `<div class="grp"><h4>${esc(it.choice.label)}</h4><p class="hint">De la misma referencia.</p><div class="opts">${it.choice.options.map((o,i)=>`<label class="opt"><input type="radio" name="copt" value="${i}" ${d.opt===i?"checked":""} ${itemStatus(refItem(o.ref)).out?"disabled":""}><span class="lab">${esc(o.label)}<small>${esc(refItem(o.ref).desc)}</small></span></label>`).join("")}</div></div>`;
  h += `<div class="grp"><h4>Personaliza cada una</h4><p class="hint">Toca lo que <b>no</b> quieres en cada ${sp.unit.toLowerCase()}.</p><div style="display:flex;flex-direction:column;gap:10px">${d.units.map((set,u)=>`<div class="unit"><b>${sp.unit} ${u+1}</b>${chips(sp.ings,set,"u"+u,lockedIdx(sp.ings))}</div>`).join("")}</div></div>`;
  if(it.pizzaPick) h += `<div class="grp"><h4>Sabor de la pizza personal</h4><div class="fgrid">${PIZZA_FLAVORS.map(([n,ds])=>`<label class="fl"><input type="radio" name="cpizza" value="${esc(n)}" ${d.pizza===n?"checked":""} ${pizzaFlavorOut(n)?"disabled":""}>${esc(n)}<small>${pizzaFlavorOut(n)?"No hay hoy":esc(ds)}</small></label>`).join("")}</div><p class="hint" style="margin:12px 0 8px">Ingredientes de la pizza:</p>${chips(splitIngs(flavorDesc(d.pizza)),d.pizzaRemoved,"p",lockedIdx(splitIngs(flavorDesc(d.pizza))))}</div>`;
  h += noteBox(d.note);
  $("#sheetBody").innerHTML=h; renderFoot();
}

function draftUnit(){ const d=draft; if(d.kind==="pizza") return PIZZA_SIZES.find(s=>s.id===d.size).price; if(d.kind==="combo") return d.it.price; return d.it.price + (d.addon?CONFIG.combo.price:0); }
function renderFoot(){
  const off = draft.kind==="pizza" && !draft.f1;
  $("#sheetFoot").innerHTML = `<div class="stepper"><button type="button" data-step="-1" aria-label="Quitar uno">−</button><span id="qty">${draft.qty}</span><button type="button" data-step="1" aria-label="Agregar uno">+</button></div><button type="button" class="btn btn-main" id="addBtn"${off?' style="opacity:.55"':""}><span>${off?"Elige un sabor":"Agregar"}</span><span>${fmt(draftUnit()*draft.qty)}</span></button>`;
}
function refreshFoot(){ $("#qty").textContent=draft.qty; $("#addBtn").lastElementChild.textContent=fmt(draftUnit()*draft.qty); }
function draftLine(){
  const d=draft, out=[]; let name;
  const sin = (list,set) => [...set].sort((a,b)=>a-b).map(i=>list[i].toLowerCase()).join(", ");
  if(d.kind==="pizza"){
    const s=PIZZA_SIZES.find(x=>x.id===d.size); name=`Pizza ${s.name.toLowerCase()}`;
    out.push(d.f2 ? `Mitad ${d.f1} / mitad ${d.f2}` : `Sabor: ${d.f1}`);
    if(d.removed.size) out.push("Sin: "+sin(pizzaIngs(),d.removed));
  } else if(d.kind==="combo"){
    const sp=comboSpec(); name=d.it.name;
    if(d.it.choice) out.push(d.it.choice.options[d.opt].label);
    d.units.forEach((set,u)=>{ if(set.size) out.push(`${sp.unit} ${u+1} sin: ${sin(sp.ings,set)}`); });
    if(d.it.pizzaPick){ out.push(`Pizza personal: ${d.pizza}`); if(d.pizzaRemoved.size) out.push(`Pizza sin: ${sin(splitIngs(flavorDesc(d.pizza)),d.pizzaRemoved)}`); }
  } else {
    name=lineName(d.it);
    if(d.it.pickFlavor) out.push(`Sabor: ${d.juice}`);
    if(d.removed.size) out.push("Sin: "+sin(d.ings,d.removed));
    if(d.addon) out.push(`+ ${CONFIG.combo.label} (${CONFIG.combo.desc.toLowerCase()})`);
  }
  if(d.note.trim()) out.push(`Nota: ${d.note.trim()}`);
  return { name, details:out };
}
function addDraft(){
  if(draft.kind==="pizza" && !draft.f1){ toast("Elige un sabor"); return; }
  const { name, details } = draftLine(); const key = name+"|"+details.join("|");
  const ex = cart.find(l=>l.key===key);
  if(ex) ex.qty += draft.qty; else cart.push({ key, name, unit:draftUnit(), qty:draft.qty, details });
  saveCart(); closeSheet(); updateBar(true); toast("Agregado a tu pedido");
}

/* =================== PEDIDO =================== */
let order = Object.assign({ name:"", mode:"Para recoger", time:"", pay:"Nequi", note:"" }, store.get("emily-order", {}));
const saveOrder = () => store.set("emily-order", order);
const timeLabel = t => { const [h,m]=t.split(":").map(Number); return `${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"a. m.":"p. m."}`; };
function buildMessage(){
  const L=["¡Hola, Emily Pizza! Quiero hacer este pedido:",""];
  cart.forEach(l=>{ L.push(`${l.qty}× ${l.name} — ${fmt(lineTotal(l))}`); l.details.forEach(x=>L.push(`   • ${x}`)); });
  L.push("",`*Total: ${fmt(cartTotal())}*`,"",`Nombre: ${order.name.trim()||"—"}`,`Entrega: ${order.mode}`,`Hora: ${order.time?timeLabel(order.time):"Lo antes posible"}`,`Pago: ${order.pay}`);
  if(order.note.trim()) L.push(`Comentarios: ${order.note.trim()}`);
  return L.join("\n");
}
function openCart(){ sheetMode="cart"; $("#sheetKicker").textContent="Tu pedido"; $("#sheetTitle").textContent="Revisa y envía"; renderCart(); openSheet(); }
function renderCart(){
  if(!cart.length){ $("#sheetBody").innerHTML=`<p style="color:var(--muted);text-align:center;padding:30px 0">Tu pedido está vacío. Agrega algo del menú.</p>`; $("#sheetFoot").innerHTML=`<button class="btn btn-ghost" type="button" style="flex:1" data-close>Volver al menú</button>`; return; }
  let h = `<div>${cart.map((l,i)=>`<div class="line"><div><h3>${esc(l.name)}</h3>${l.details.length?`<ul>${l.details.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}</div><span class="price">${fmt(lineTotal(l))}</span><div class="ctrl"><div class="stepper"><button type="button" data-cstep="-1" data-i="${i}" aria-label="Quitar uno">−</button><span>${l.qty}</span><button type="button" data-cstep="1" data-i="${i}" aria-label="Agregar uno">+</button></div><button class="link" type="button" data-del="${i}">Eliminar</button></div></div>`).join("")}</div><div class="totals"><span>Total</span><b>${fmt(cartTotal())}</b></div>`;
  if(!isOpen()) h += `<p class="notice">Ahora estamos cerrados. Puedes enviar tu pedido y te respondemos al abrir.</p>`;
  h += `<div class="field"><label for="oName">Tu nombre</label><input type="text" id="oName" value="${esc(order.name)}" placeholder="¿A nombre de quién?" autocomplete="name"><p class="err" id="nameErr" hidden>Escribe tu nombre para que sepamos de quién es el pedido.</p></div>
    <div class="field"><span class="lbl">¿Cómo lo quieres?</span><div class="seg">${[["Para recoger","Paso a recogerlo"],["Para comer en el local","Lo como allá"]].map(([v,t])=>`<label><input type="radio" name="mode" value="${v}" ${order.mode===v?"checked":""}>${t}</label>`).join("")}</div></div>
    <div class="field"><label for="oTime">¿A qué hora pasas?</label><input type="time" id="oTime" value="${esc(order.time)}"><span style="font-size:.8rem;color:var(--dim)">Déjalo vacío si es lo antes posible.</span></div>
    <div class="field"><span class="lbl">Forma de pago</span><div class="seg seg3">${["Nequi","Bre-B","Efectivo"].map(v=>`<label><input type="radio" name="pay" value="${v}" ${order.pay===v?"checked":""}>${v}</label>`).join("")}</div></div>
    <div class="field"><label for="oNote">Comentarios (opcional)</label><textarea id="oNote" placeholder="Algo más que debamos saber">${esc(order.note)}</textarea></div>
    <div class="field"><span class="lbl">Así llegará tu mensaje</span><div class="preview" id="preview"></div></div>`;
  $("#sheetBody").innerHTML=h;
  $("#sheetFoot").innerHTML=`<button class="btn btn-ghost" type="button" id="copyMsg" style="flex:none">Copiar</button><a class="btn wa" id="sendWa" href="#" target="_blank" rel="noopener"><span>Enviar por WhatsApp</span><span>${fmt(cartTotal())}</span></a>`;
  refreshPreview();
}
function refreshPreview(){ const p=$("#preview"); if(!p) return; const m=buildMessage(); p.textContent=m; $("#sendWa").href=waLink(m); }

/* =================== EVENTOS =================== */
function eventMessage(){
  const v = s => ($(s)||{}).value || "";
  const food=[...document.querySelectorAll("#evFood input:checked")].map(i=>i.value);
  const date=v("#evDate");
  const dLabel = date ? new Date(date+"T12:00").toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"}) : "Por definir";
  const L=["¡Hola, Emily Pizza! Quiero una cotización para un evento:","",`Tipo: ${$('input[name="evType"]:checked').value}`,`Fecha: ${dLabel}`,`Personas: ${v("#evPeople")||"Por definir"}`,`Dónde: ${$('input[name="evWhere"]:checked').value}`];
  if(food.length) L.push(`Me interesa: ${food.join(", ")}`);
  if(v("#evNote").trim()) L.push(`Detalles: ${v("#evNote").trim()}`);
  L.push("",`Nombre: ${v("#evName").trim()||"—"}`);
  return L.join("\n");
}
const refreshEvent = () => { $("#evSend").href = waLink(eventMessage()); };

/* =================== EVENTOS DE UI =================== */
document.addEventListener("click", e=>{
  const t=e.target;
  const go=t.closest("[data-go]"); if(go){ e.preventDefault(); goTo(go.dataset.go); return; }
  const sl=t.closest("[data-slide]"); if(sl){ showSlide(+sl.dataset.slide); startSlides(); return; }
  const out=t.closest("[data-out]"); if(out){ toast(out.dataset.out); return; }
  const sz=t.closest("[data-size]"); if(sz){ openPizza({ size:sz.dataset.size }); return; }
  const card=t.closest("#menu [data-id], #favs [data-id]"); if(card){ openItem(card.dataset.id); return; }
  if(t.closest("#status")){ openHours(); return; }
  if(t.closest("#evToggle")){
    const b=$("#evToggle"), f=$("#eventForm"), open = b.getAttribute("aria-expanded")!=="true";
    b.setAttribute("aria-expanded", open); f.hidden=!open;
    b.querySelector(".ev-cta").firstChild.textContent = open ? "Cerrar " : "Pedir cotización ";
    if(open) setTimeout(()=>f.querySelector("input").focus({preventScroll:true}),50);
    return;
  }
  if(t.closest("#themeBtn")){ toggleTheme(); return; }
  if(t.closest("#installBtn")){ doInstall(); return; }
  if(t.closest("#loadMap")){ loadMap(); return; }
  if(t.closest("#openCart")){ openCart(); return; }
  if(t.closest("#closeSheet") || t.id==="scrim" || t.closest("[data-close]")){ closeSheet(); return; }
  if(t.closest("#copyPhone")){ copyText("3105840621","Número copiado"); return; }
  if(t.closest("#evSend")){ if(!$("#evName").value.trim()){ e.preventDefault(); $("#evErr").hidden=false; $("#evName").focus(); return; } refreshEvent(); toast("Abriendo WhatsApp…"); return; }
  if(sheetMode==="item"){
    const ing=t.closest("[data-ing]");
    if(ing){ const [k,s]=ing.dataset.ing.split(":"), i=+s; const set = k==="x"?draft.removed : k==="p"?draft.pizzaRemoved : draft.units[+k.slice(1)]; set.has(i)?set.delete(i):set.add(i); ing.setAttribute("aria-pressed", set.has(i)); return; }
    const st=t.closest("[data-step]"); if(st){ draft.qty=Math.max(1,draft.qty + +st.dataset.step); refreshFoot(); return; }
    if(t.closest("#addBtn")){ addDraft(); return; }
  }
  if(sheetMode==="cart"){
    const cs=t.closest("[data-cstep]"); if(cs){ const i=+cs.dataset.i; cart[i].qty += +cs.dataset.cstep; if(cart[i].qty<1) cart.splice(i,1); saveCart(); updateBar(); renderCart(); return; }
    const del=t.closest("[data-del]"); if(del){ cart.splice(+del.dataset.del,1); saveCart(); updateBar(); renderCart(); return; }
    if(t.closest("#copyMsg")){ copyText(buildMessage(),"Pedido copiado"); return; }
    if(t.closest("#sendWa")){ if(!order.name.trim()){ e.preventDefault(); $("#nameErr").hidden=false; $("#oName").focus(); return; } refreshPreview(); toast("Abriendo WhatsApp…"); return; }
  }
});
document.addEventListener("change", e=>{
  const t=e.target;
  if(sheetMode==="item"){
    const keep=$("#sheetBody").scrollTop;
    if(draft.kind==="pizza" && ["size","f1","f2"].includes(t.name)){
      if(t.name==="size"){ draft.size=t.value; if(PIZZA_SIZES.find(s=>s.id===t.value).flavors===1) draft.f2=""; }
      if(t.name==="f1"){ draft.f1=t.value; if(draft.f2===t.value) draft.f2=""; }
      if(t.name==="f2") draft.f2=t.value;
      draft.removed.clear(); renderPizzaSheet(); $("#sheetBody").scrollTop=keep;
    } else if(draft.kind==="combo"){
      if(t.name==="copt"){ draft.opt=+t.value; resetUnits(); renderComboSheet(); $("#sheetBody").scrollTop=keep; }
      if(t.name==="cpizza"){ draft.pizza=t.value; draft.pizzaRemoved.clear(); renderComboSheet(); $("#sheetBody").scrollTop=keep; }
    } else {
      if(t.name==="juice") draft.juice=t.value;
      if(t.id==="addon"){ draft.addon=t.checked; refreshFoot(); }
    }
  }
  if(sheetMode==="cart"){ if(t.name==="mode") order.mode=t.value; if(t.name==="pay") order.pay=t.value; if(t.id==="oTime") order.time=t.value; saveOrder(); refreshPreview(); }
  if(t.closest("#eventForm")) refreshEvent();
});
document.addEventListener("input", e=>{
  const t=e.target;
  if(t.id==="q") searchAndJump(t.value);
  if(sheetMode==="item" && t.id==="note") draft.note=t.value;
  if(sheetMode==="cart"){ if(t.id==="oName"){ order.name=t.value; if(t.value.trim()) $("#nameErr").hidden=true; } if(t.id==="oNote") order.note=t.value; if(t.id==="oTime") order.time=t.value; saveOrder(); refreshPreview(); }
  if(t.closest("#eventForm")){ if(t.id==="evName" && t.value.trim()) $("#evErr").hidden=true; refreshEvent(); }
});
$("#eventForm").addEventListener("submit", e=>e.preventDefault());
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && sheetMode) closeSheet(); if(e.key==="Enter" && e.target.id==="q"){ e.preventDefault(); clearTimeout(searchT); const f=document.querySelector("#menu .section:not([hidden])"); if(f) goTo(f.id); } });

/* =================== MAPA, QR, SPLASH =================== */
function renderMap(){
  $("#mapLink").href=CONFIG.mapLink;
  document.querySelectorAll("[data-maps]").forEach(a=>a.href=CONFIG.mapLink);
  if(store.get("emily-map-ok", false)) loadMap();
}
function loadMap(){ // el mapa de Google (con sus cookies) solo se carga cuando la persona lo pide
  if($("#map iframe")) return;
  store.set("emily-map-ok", true);
  { const f=document.createElement("iframe"); f.src=CONFIG.mapEmbed; f.loading="lazy"; f.title="Ubicación de Emily Pizza"; f.allowFullscreen=true; f.referrerPolicy="strict-origin-when-cross-origin"; $("#map").appendChild(f);
  }
}
function renderQRs(){
  $("#pagos").hidden = !CONFIG.mostrarPagos;
  if(CONFIG.qrNequi) $("#qrNequi").innerHTML=`<img src="${CONFIG.qrNequi}" alt="Código QR de Nequi">`;
  if(CONFIG.qrBreb) $("#qrBreb").innerHTML=`<img src="${CONFIG.qrBreb}" alt="Código QR de Bre-B">`;
}
function hideSplash(){ const s=$("#splash"); if(!s || s.classList.contains("out")) return; s.classList.add("out"); setTimeout(()=>s.remove(),600); jumpToHash(); }
(function(){
  const t0 = performance.now();
  const done = () => setTimeout(hideSplash, Math.max(0, 1000 - (performance.now()-t0)));
  done(); // el logo se ve ~1 segundo; no esperamos a que bajen todas las fotos
  setTimeout(hideSplash, 2500); // por si alguna imagen tarda
})();

if(firebaseOn()) STOCK = cleanStock(store.get("emily-stock", null));
syncThemeBtn(); renderStatus(); renderHome(); updateBar();
// La carta completa (más de 90 productos) se arma justo después de pintar la foto principal,
// para que la página se vea al instante. Nadie alcanza a llegar abajo antes de que esté lista.
let menuReady = false;
function buildBelowFold(){
  if(menuReady) return; menuReady = true;
  renderMenu(); renderQRs(); renderMap(); refreshEvent(); setActive(MENU[0].id);
  if(typeof applySearch==="function" && $("#q").value) applySearch($("#q").value);
  (window.requestIdleCallback || (f=>setTimeout(f,200)))(paintChalk);
}
(function(){
  const hero = document.querySelector("#feature img");
  const go = () => requestAnimationFrame(() => setTimeout(buildBelowFold, 0));
  if(!hero || hero.complete) go(); else { hero.addEventListener("load", go, { once:true }); hero.addEventListener("error", go, { once:true }); }
  setTimeout(buildBelowFold, 1500);
  ["pointerdown","keydown","scroll"].forEach(ev => addEventListener(ev, buildBelowFold, { once:true, passive:true }));
})();
setInterval(renderStatus, 60000);
let spyT; addEventListener("scroll", ()=>{ cancelAnimationFrame(spyT); spyT=requestAnimationFrame(spy); }, { passive:true });
/* =================== APP INSTALABLE =================== */
let installEvt = null;
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
function setupInstall(){
  if(standalone()) return;
  let framed = true; try{ framed = window.self !== window.top; }catch(e){}
  if(framed) return; // en vistas previas no se puede instalar
  if("serviceWorker" in navigator && location.protocol==="https:") navigator.serviceWorker.register("sw.js").catch(()=>{});
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; $("#installBtn").hidden = false; });
  addEventListener("appinstalled", () => { $("#installBtn").hidden = true; toast("¡Listo! Ya tienes Emily Pizza en tu celular"); });
  if(isIOS()) $("#installBtn").hidden = false;
}
async function doInstall(){
  if(installEvt){ installEvt.prompt(); const r = await installEvt.userChoice; if(r.outcome==="accepted") $("#installBtn").hidden = true; installEvt = null; return; }
  sheetMode = "hours"; // hoja informativa simple
  $("#sheetKicker").textContent = "App en tu iPhone";
  $("#sheetTitle").textContent = "Agrega Emily Pizza a tu inicio";
  $("#sheetBody").innerHTML = `<ol class="ios-steps">
    <li>Toca <b>Compartir</b> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M5 12v8h14v-8"/></svg> abajo en Safari.</li>
    <li>Elige <b>Agregar a inicio</b>.</li>
    <li>Toca <b>Agregar</b>. El ícono de Emily Pizza queda junto a tus apps.</li></ol>`;
  $("#sheetFoot").innerHTML = `<button class="btn btn-ghost" type="button" style="flex:1" data-close>Entendido</button>`;
  openSheet();
}

/* Enlaces directos a una sección: emily-pizza.vercel.app/#combos */
function jumpToHash(){
  const id = decodeURIComponent(location.hash.slice(1));
  if(id && document.getElementById(id)) setTimeout(()=>goTo(id), 300);
}
addEventListener("hashchange", jumpToHash);

function applyStock(st){
  STOCK = st; store.set("emily-stock", st);
  if(menuReady) renderMenu(); renderCatsFavs(); applySearch($("#q").value); spy();
}
watchStock(applyStock);
setupInstall();
addEventListener("scrollend", ()=>{ navLock=false; spy(); });
