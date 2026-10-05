# Emily Pizza · Menú digital

Carta digital de Emily Pizza (Candelaria La Nueva, Ciudad Bolívar, Bogotá) para armar pedidos personalizados y enviarlos por WhatsApp.

Sitio estático, sin build: se despliega tal cual en Vercel.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La página de los clientes |
| `admin.html` | Panel del local para marcar agotados (no aparece en buscadores) |
| `menu.js` | Menú, precios, horario, favoritos y configuración (`CONFIG`) |
| `stock.js` | Conexión en vivo con Firebase para los agotados |
| `firebase-config.js` | Datos del proyecto de Firebase |
| `firestore.rules` | Quién puede leer y cambiar el inventario, y validación de los datos |
| `privacidad.html`, `terminos.html` | Política de privacidad (Ley 1581) y términos |
| `404.html` | Página de error con regreso al menú |
| `vercel.json` | URLs limpias y cabeceras de seguridad |
| `robots.txt`, `sitemap.xml` | Buscadores (el panel no se indexa) |
| `manifest.webmanifest`, `sw.js` | App instalable de la tienda |
| `admin.webmanifest` | App instalable del panel (ícono dorado) |
| `img/` | Logo, fotos, íconos e imagen para compartir |

## Cambios rápidos

Todo está en `CONFIG` al inicio de `menu.js`: WhatsApp, horario, favoritos, destacados del carrusel, QR de pagos (`mostrarPagos`) y qué trae "vegetales".

Si cambias archivos, sube la versión en `sw.js` (`emily-v1` → `emily-v2`) para que los celulares con la app instalada se actualicen.

## Activar los agotados en vivo

1. Crear un proyecto en [Firebase](https://console.firebase.google.com).
2. **Firestore Database** → Crear base de datos (modo producción, región `southamerica-east1`).
3. **Authentication** → Método de acceso → activar **Correo electrónico/contraseña** → crear un usuario para el local.
4. **Configuración del proyecto** → Tus apps → **Web** → copiar los valores a `firebase-config.js`.
5. En `firestore.rules`, poner el correo del usuario del local y publicar las reglas (consola de Firebase → Firestore → Reglas, o `firebase deploy --only firestore:rules`).
6. **Authentication** → Configuración → Dominios autorizados → agregar `emily-pizza.vercel.app`.

El panel queda en `https://emily-pizza.vercel.app/admin.html`.

Si se borra la configuración de `firebase-config.js`, la página sigue funcionando y todo sale disponible.

## Enlaces directos

Cualquier sección se puede compartir con `#`: `/#combos`, `/#pizzas`, `/#hamburguesas`, `/#eventos`, `/#visitanos`.

## Checklist de lanzamiento

| Punto | Estado |
|---|---|
| Sin secretos en el frontend | ✅ La config de Firebase es pública por diseño; la seguridad está en las reglas |
| Autenticación + reglas por fila | ✅ Solo correos autorizados y verificados escriben el inventario |
| Validación del lado del servidor | ✅ Las reglas revisan la forma y el tamaño de cada dato |
| Rate limiting | ⚠️ Firebase Auth limita intentos de login. Opcional: activar App Check |
| HTTPS | ✅ Vercel + HSTS |
| Privacidad y términos | ✅ Revisar con los dueños |
| Cookies | ✅ Sin cookies de rastreo; el mapa de Google solo carga con permiso |
| Accesibilidad | ✅ Lighthouse 100 |
| SEO | ✅ Título, descripción, sitemap, robots, datos de restaurante (JSON-LD) |
| Favicon, Open Graph, 404 | ✅ |
| Rendimiento | ✅ Lighthouse escritorio 97, móvil 85 (carga real ~0,2 s); fuentes propias, scripts diferidos |
| Enlaces rotos | ✅ Revisados |
| Spam en formularios | ✅ No hay formularios con servidor; todo sale por WhatsApp |
| Analítica | ⚠️ Activar en Vercel → proyecto → Analytics → Enable |
