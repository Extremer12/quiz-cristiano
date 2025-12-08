# Plan Simplificado - Consolidación de Tienda

## Problema

Múltiples specs y archivos duplicados están creando complejidad innecesaria. La tienda tiene:

- 4 specs diferentes que se solapan
- 2 archivos StoreController conflictivos
- Más de 40 archivos en js/modules/store/ cuando podríamos tener menos de 10

## Solución Arquitectónica Simple

- [ ] 1. **Consolidar specs en uno solo**

  - Fusionar store-bug-fixes, store-controller-conflict-fix, paypal-payment-integration y tienda-mejorada
  - Crear un único spec "store-unified" que cubra todo
  - Eliminar specs redundantes

- [x] 2. **Resolver conflicto de StoreController inmediatamente**

  - Eliminar `js/pages/store-controller.js` (no se usa en store.html)
  - Mantener solo `js/modules/store/StoreController.js`
  - Verificar que la tienda funciona correctamente

- [x] 3. **Consolidar archivos de módulos**

  - Fusionar archivos pequeños relacionados en módulos más grandes
  - Reducir de 40+ archivos a máximo 8-10 archivos esenciales
  - Mantener solo: StoreController, ProductService, PaymentService, CartService

- [ ] 4. **Simplificar configuración**

  - Usar solo los archivos de config necesarios
  - Consolidar configuraciones relacionadas

- [ ] 5. **Prueba final**

  - Verificar que la tienda carga productos correctamente
  - Confirmar que PayPal funciona
  - Validar que no hay errores en consola

## Arquitectura Final Propuesta

```
js/modules/store/
├── StoreController.js (único, consolidado)
├── ProductService.js
├── PaymentService.js (incluye PayPal)
├── CartService.js
└── store-config.js (configuración unificada)
```

**Resultado**: De 40+ archivos a 5 archivos esenciales, un solo spec, funcionalidad completa.
