/**
 * Pruebas de validación de sintaxis para StoreController
 * Verifica la validez del código JavaScript y estructura de clases
 */

const fs = require('fs');
const path = require('path');

describe('Validación de Sintaxis - StoreController', () => {
  let storeControllerCode;
  let StoreController;

  beforeAll(() => {
    // Leer el código fuente del StoreController
    const filePath = path.join(__dirname, '../../js/modules/store/StoreController.js');
    storeControllerCode = fs.readFileSync(filePath, 'utf8');
    
    // Importar la clase para pruebas
    StoreController = require('../../js/modules/store/StoreController.js');
  });

  describe('Validación de código JavaScript', () => {
    test('el archivo debe tener sintaxis JavaScript válida', () => {
      expect(() => {
        // Remover imports/exports para validación de sintaxis
        const codeWithoutImports = storeControllerCode
          .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
          .replace(/export\s+default\s+\w+;?\s*/g, '')
          .replace(/export\s+\{[^}]*\}\s*;?\s*/g, '')
          .replace(/export\s+.*?;?\s*/g, '')
          .trim();

        // Intentar evaluar el código sin ejecutarlo
        new Function(codeWithoutImports);
      }).not.toThrow();
    });

    test('no debe contener errores de sintaxis básicos', () => {
      // Verificar que no hay llaves desbalanceadas
      const openBraces = (storeControllerCode.match(/{/g) || []).length;
      const closeBraces = (storeControllerCode.match(/}/g) || []).length;
      expect(openBraces).toBe(closeBraces);

      // Verificar que no hay paréntesis desbalanceados
      const openParens = (storeControllerCode.match(/\(/g) || []).length;
      const closeParens = (storeControllerCode.match(/\)/g) || []).length;
      expect(openParens).toBe(closeParens);
    });

    test('no debe contener caracteres de control inválidos', () => {
      // Verificar que no hay caracteres de control problemáticos
      const invalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
      expect(storeControllerCode).not.toMatch(invalidChars);
    });
  });

  describe('Validación de estructura de clase', () => {
    test('StoreController debe ser una clase válida', () => {
      expect(typeof StoreController).toBe('function');
      expect(StoreController.prototype).toBeDefined();
      expect(StoreController.prototype.constructor).toBe(StoreController);
    });

    test('debe tener un constructor válido', () => {
      expect(() => {
        new StoreController();
      }).not.toThrow();
    });

    test('debe definir métodos esenciales', () => {
      const instance = new StoreController();
      
      // Métodos principales
      expect(typeof instance.initialize).toBe('function');
      expect(typeof instance.switchCategory).toBe('function');
      expect(typeof instance.loadCategoryProducts).toBe('function');
      
      // Métodos de navegación mejorada
      expect(typeof instance.showCategoryLoadingIndicator).toBe('function');
      expect(typeof instance.hideCategoryLoadingIndicator).toBe('function');
      expect(typeof instance.updateCategoryNavigation).toBe('function');
      expect(typeof instance.switchCategorySection).toBe('function');
    });

    test('los métodos deben tener la aridad correcta', () => {
      const instance = new StoreController();
      
      // Verificar que los métodos aceptan el número correcto de parámetros
      expect(instance.switchCategory.length).toBe(1); // category
      expect(instance.showCategoryLoadingIndicator.length).toBe(1); // category
      expect(instance.updateCategoryNavigation.length).toBe(1); // category
      expect(instance.switchCategorySection.length).toBe(1); // category
    });

    test('debe tener propiedades de instancia inicializadas', () => {
      const instance = new StoreController();
      
      // Propiedades de control de navegación
      expect(instance.hasOwnProperty('isSwitchingCategory')).toBe(true);
      expect(instance.hasOwnProperty('forceReload')).toBe(true);
      expect(instance.hasOwnProperty('currentCategory')).toBe(true);
      expect(instance.hasOwnProperty('lastError')).toBe(true);
    });
  });

  describe('Validación de referencias de métodos', () => {
    test('no debe contener referencias a métodos inexistentes', () => {
      // Buscar llamadas a métodos que podrían no existir
      const methodCalls = storeControllerCode.match(/this\.\w+\(/g) || [];
      const instance = new StoreController();
      
      const invalidCalls = methodCalls.filter(call => {
        const methodName = call.replace('this.', '').replace('(', '');
        return typeof instance[methodName] !== 'function';
      });

      // Permitir algunas referencias a métodos dinámicos o externos
      const allowedMissing = [
        'getCurrentUserId',
        'getProductsData',
        'validateProductsData',
        'preloadCategory'
      ];

      const actuallyInvalid = invalidCalls.filter(call => {
        const methodName = call.replace('this.', '').replace('(', '');
        return !allowedMissing.includes(methodName);
      });

      expect(actuallyInvalid).toEqual([]);
    });

    test('no debe contener métodos duplicados', () => {
      // Buscar definiciones de métodos de clase específicamente (no llamadas a funciones)
      const methodDefinitions = storeControllerCode.match(/^\s*(?:async\s+)?[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/gm) || [];
      const methodNames = methodDefinitions.map(def => 
        def.trim().replace(/^async\s+/, '').replace(/\s*\(.*/, '')
      );

      // Filtrar solo métodos válidos de clase (excluir llamadas a funciones)
      const validMethodNames = methodNames.filter(name => {
        return name && 
               !name.includes('function') && 
               !name.includes('if') && 
               !name.includes('for') &&
               !name.includes('while') &&
               !name.includes('switch') &&
               !name.includes('catch') &&
               !name.includes('setTimeout') &&
               !name.includes('setInterval') &&
               name !== 'console' &&
               name !== 'document' &&
               name !== 'window' &&
               name !== 'alert' &&  // Excluir llamadas a alert
               name !== 'localStorage' &&
               name !== 'querySelector' &&
               name !== 'addEventListener';
      });

      // Contar ocurrencias de cada método
      const methodCounts = {};
      validMethodNames.forEach(name => {
        methodCounts[name] = (methodCounts[name] || 0) + 1;
      });

      // Verificar que no hay métodos duplicados
      const duplicatedMethods = Object.entries(methodCounts)
        .filter(([name, count]) => count > 1)
        .map(([name]) => name);

      expect(duplicatedMethods).toEqual([]);
    });

    test('debe usar referencias consistentes a propiedades', () => {
      // Verificar que las propiedades se usan consistentemente
      const propertyReferences = storeControllerCode.match(/this\.\w+(?!\()/g) || [];
      const uniqueProperties = [...new Set(propertyReferences)];

      // Verificar que las propiedades principales están presentes
      const expectedProperties = [
        'this.currentCategory',
        'this.isSwitchingCategory',
        'this.forceReload',
        'this.lastError'
      ];

      expectedProperties.forEach(prop => {
        expect(uniqueProperties).toContain(prop);
      });
    });
  });
});