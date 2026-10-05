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
| `firestore.rules` | Quién puede leer y cambiar el inventario |
| `manifest.webmanifest`, `sw.js` | App instalable en el celular |
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

Mientras `firebase-config.js` esté vacío, la página funciona normal y todo sale disponible.

## Enlaces directos

Cualquier sección se puede compartir con `#`: `/#combos`, `/#pizzas`, `/#hamburguesas`, `/#eventos`, `/#visitanos`.
