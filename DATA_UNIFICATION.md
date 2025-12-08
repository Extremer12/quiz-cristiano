# Unificación de Datos - Documentación

## Problema Resuelto
Las páginas legacy (`ranking.html`, `logros.html`) cargaban `js/modules/gamedatamanager.js` que ya no existe, causando potenciales inconsistencias de datos con el nuevo `GameDataService`.

## Solución Implementada

### 1. Script de Migración Automática
**Archivo:** `src/utils/DataMigration.js`

- **Función:** Migra automáticamente datos del formato legacy al nuevo formato.
- **Ejecución:** Se ejecuta una sola vez al cargar la aplicación.
- **Seguridad:** Conserva datos legacy para verificación (no los elimina automáticamente).

**Claves Legacy Soportadas:**
- `userData`
- `userCoins`
- `userInventory`
- `gameStats`
- `playerData`

**Claves Nuevas:**
- `quizCristianoData` - Datos del juego (monedas, estadísticas, logros)
- `quizCristianoInventory` - Inventario de power-ups

### 2. Capa de Compatibilidad
**Archivo:** `src/utils/LegacyCompat.js`

- **Función:** Proporciona un objeto global `window.GameDataManager` compatible con código legacy.
- **Implementación:** Wrapper que delega todas las llamadas a `GameDataService`.
- **Beneficio:** Las páginas legacy pueden seguir usando `GameDataManager` sin modificaciones.

### 3. Integración en main.js
La migración se ejecuta automáticamente antes de inicializar servicios:

```javascript
// 1. Migración de datos
const migration = new DataMigration();
migration.migrate();

// 2. Inicialización de servicios
GameDataService.init();
```

## Uso

### Para Desarrolladores

**Verificar si la migración se ejecutó:**
```javascript
const migrated = localStorage.getItem('dataMigrationCompleted');
console.log('Migración completada:', migrated);
```

**Resetear migración (solo desarrollo):**
```javascript
const migration = new DataMigration();
migration.reset();
```

**Ver datos actuales:**
```javascript
console.log('Datos:', localStorage.getItem('quizCristianoData'));
console.log('Inventario:', localStorage.getItem('quizCristianoInventory'));
```

### Para Páginas Legacy

Las páginas que aún usan código antiguo pueden acceder a los datos a través de:

```javascript
// Estos métodos funcionan automáticamente gracias a LegacyCompat.js
GameDataManager.getCoins();
GameDataManager.addCoins(100, 'reward');
GameDataManager.getPowerupCount('eliminate');
```

## Próximos Pasos

1. **Verificar Funcionamiento:**
   - Cargar `ranking.html` y verificar que muestre las monedas correctamente.
   - Cargar `logros.html` y verificar que muestre el progreso.

2. **Migrar Páginas Restantes:**
   - Una vez verificado, migrar `ranking.html`, `logros.html`, `perfil.html` para usar `src/main.js` directamente.
   - Eliminar referencias a scripts legacy.

3. **Limpieza Final:**
   - Después de migrar todas las páginas, eliminar `LegacyCompat.js`.
   - Eliminar datos legacy de localStorage (opcional).

## Notas Técnicas

- **Prioridad de Datos:** Si existen datos tanto en formato legacy como nuevo, se priorizan los datos nuevos.
- **Sincronización:** Los cambios en cualquier pestaña se sincronizan automáticamente vía `storage` event.
- **Firebase Sync:** Los datos se sincronizan con Firebase cada 30 segundos si hay cambios.
