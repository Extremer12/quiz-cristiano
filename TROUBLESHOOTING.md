# Solución de Errores de Caché del Navegador

## Problema
Después de la refactorización, el navegador puede estar cargando archivos JavaScript antiguos desde el caché, causando errores como:
- `initializeFirebase is not defined`
- `Unexpected token` en varios archivos
- Errores de Service Worker

## Solución: Limpiar Caché Completo

### Opción 1: Hard Refresh (Recomendado)
1. Abre el sitio en el navegador
2. Presiona:
   - **Chrome/Edge**: `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
   - O haz clic derecho en el botón de recargar → "Vaciar caché y recargar de manera forzada"

### Opción 2: DevTools (Más Completo)
1. Abre DevTools (`F12`)
2. Ve a la pestaña **Application** (Chrome) o **Storage** (Firefox)
3. En el panel izquierdo:
   - Haz clic en "Clear storage" o "Borrar almacenamiento"
   - Marca todas las opciones:
     - ✅ Local storage
     - ✅ Session storage
     - ✅ IndexedDB
     - ✅ Cache storage
     - ✅ Service workers
   - Haz clic en "Clear site data" o "Borrar datos del sitio"
4. Recarga la página (`F5` o `Ctrl+R`)

### Opción 3: Desregistrar Service Worker Manualmente
1. Abre DevTools (`F12`)
2. Ve a **Application** → **Service Workers**
3. Haz clic en "Unregister" para cada service worker listado
4. Cierra y vuelve a abrir el navegador
5. Recarga el sitio

### Opción 4: Modo Incógnito (Para Pruebas)
- Abre una ventana de incógnito (`Ctrl + Shift + N`)
- Navega al sitio
- Esto cargará todo sin caché

## Verificación
Después de limpiar el caché, verifica en la consola:
- ✅ No debe haber errores de `initializeFirebase`
- ✅ No debe haber errores de sintaxis en archivos `.js`
- ✅ El mensaje `✅ Quiz Cristiano App inicializado` debe aparecer

## Archivos Eliminados (No Deben Cargarse)
Si ves errores de estos archivos, el caché no se limpió correctamente:
- `js/pages/store.js`
- `js/pages/store-paypal-integration.js`
- `js/modules/gamedatamanager.js`
- `js/modules/ads-manager.js`
- `js/config/firebase-config.js`

## Nota para Desarrollo
Durante el desarrollo, mantén DevTools abierto con "Disable cache" activado:
1. Abre DevTools (`F12`)
2. Ve a **Network**
3. Marca la casilla "Disable cache"
4. Mantén DevTools abierto mientras desarrollas
