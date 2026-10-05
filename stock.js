/* Emily Pizza · conexión en vivo con Firebase para los agotados.
   Si firebase-config.js está vacío, la tienda funciona normal (todo disponible). */
const FB_VER = "10.12.2";
const FB_URL = n => `https://www.gstatic.com/firebasejs/${FB_VER}/firebase-${n}-compat.js`;
function loadScript(src){ return new Promise((ok,fail)=>{ const s=document.createElement("script"); s.src=src; s.onload=ok; s.onerror=fail; document.head.appendChild(s); }); }
let _fbApp = null;
const firebaseOn = () => !!(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && window.FIREBASE_CONFIG.projectId);
async function firebaseReady(withAuth){
  if(!firebaseOn()) return null;
  if(!_fbApp) _fbApp = (async()=>{ await loadScript(FB_URL("app")); await loadScript(FB_URL("firestore")); firebase.initializeApp(window.FIREBASE_CONFIG); return firebase; })();
  const fb = await _fbApp;
  if(withAuth && !fb.auth) await loadScript(FB_URL("auth"));
  return fb;
}
const stockRef = fb => fb.firestore().collection("tienda").doc("estado");
// Fecha de hoy en Bogotá (AAAA-MM-DD). El aviso del día solo se muestra el mismo día en que se escribió.
const hoyBogota = () => new Intl.DateTimeFormat("en-CA",{ timeZone:"America/Bogota" }).format(new Date());
const cleanStock = d => {
  const vigente = !!(d && d.aviso && d.avisoFecha === hoyBogota());
  return { ing:(d&&d.ing)||{}, prod:(d&&d.prod)||{}, cat:(d&&d.cat)||{}, aviso: vigente ? d.aviso : "", avisoFecha: vigente ? d.avisoFecha : "" };
};
async function watchStock(cb){
  try{
    const fb = await firebaseReady(false); if(!fb) return false;
    stockRef(fb).onSnapshot(snap => cb(cleanStock(snap.data())), err => console.warn("Inventario:", err.message));
    return true;
  }catch(e){ console.warn("No se pudo conectar con Firebase", e); return false; }
}
