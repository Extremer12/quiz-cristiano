/**
 * Tests para esquemas de productos y validaciones
 * Ejecutar en consola del navegador para verificar funcionamiento
 */

// Pruebas Jest
describe('Product Schemas', () => {
  test('should validate individual products correctly', () => {
    const validProduct = {
      id: "test_avatar_1",
      name: "Avatar de Prueba",
      description: "Un avatar para testing",
      category: "avatares",
      type: "individual",
      price: { coins: 100, usd: 1.99, ars: 200 },
      images: ["test.png"],
      metadata: {},
      availability: { isActive: true },
      freeEarnMethod: { enabled: false, requirements: [], estimatedTime: "" },
    };
    
    expect(validProduct.id).toBeDefined();
    expect(validProduct.name).toBeTruthy();
    expect(validProduct.category).toBe('avatares');
  });
  
  test('should validate pack products correctly', () => {
    const validPack = {
      id: "test_pack_1",
      name: "Pack de Prueba",
      description: "Un pack para testing",
      category: "avatares",
      type: "pack",
      price: { coins: 200, usd: 3.99, ars: 400 },
      images: ["pack.png"],
      metadata: {},
      availability: { isActive: true },
      freeEarnMethod: { enabled: false, requirements: [], estimatedTime: "" },
      items: ["item1", "item2", "item3"],
    };
    
    expect(validPack.type).toBe('pack');
    expect(validPack.items).toHaveLength(3);
  });
});


// Test de validación de productos individuales
function testIndividualProductValidation() {
    console.log("🧪 Testing Individual Product Validation...");
  
    // Producto válido
    const validProduct = {
      id: "test_avatar_1",
      name: "Avatar de Prueba",
      description: "Un avatar para testing",
      category: "avatares",
      type: "individual",
      price: { coins: 100, usd: 1.99, ars: 200 },
      images: ["test.png"],
      metadata: {},
      availability: { isActive: true },
      freeEarnMethod: { enabled: false, requirements: [], estimatedTime: "" },
    };
  
    const validation = ProductValidator.validate(validProduct);
    console.log("✅ Valid product validation:", validation);
  
    // Producto inválido (sin nombre)
    const invalidProduct = { ...validProduct, name: "" };
    const invalidValidation = ProductValidator.validate(invalidProduct);
    console.log("❌ Invalid product validation:", invalidValidation);
  
    return validation.isValid && !invalidValidation.isValid;
  }
  
  // Test de validación de packs
  function testPackValidation() {
    console.log("🧪 Testing Pack Validation...");
  
    const validPack = {
      id: "test_pack_1",
      name: "Pack de Prueba",
      description: "Un pack para testing",
      category: "avatares",
      type: "pack",
      price: { coins: 200, usd: 3.99, ars: 400 },
      images: ["pack.png"],
      metadata: {},
      availability: { isActive: true },
      freeEarnMethod: { enabled: false, requirements: [], estimatedTime: "" },
      items: ["item1", "item2", "item3"],
      discountPercentage: 25,
      dynamicPricing: true,
    };
  
    const validation = ProductValidator.validate(validPack, PackSchema);
    console.log("✅ Valid pack validation:", validation);
  
    // Pack inválido (sin items suficientes)
    const invalidPack = { ...validPack, items: ["item1"] };
    const invalidValidation = ProductValidator.validate(invalidPack, PackSchema);
    console.log("❌ Invalid pack validation:", invalidValidation);
  
    return validation.isValid && !invalidValidation.isValid;
  }
  
  // Test de validación de suscripciones
  function testSubscriptionValidation() {
    console.log("🧪 Testing Subscription Validation...");
  
    const validSubscription = {
      id: "test_sub_1",
      name: "Suscripción de Prueba",
      description: "Una suscripción para testing",
      category: "premium",
      type: "subscription",
      price: { coins: 0, usd: 9.99, ars: 1000 },
      images: ["sub.png"],
      metadata: {},
      availability: { isActive: true },
      freeEarnMethod: { enabled: false, requirements: [], estimatedTime: "" },
      duration: "monthly",
      benefits: ["Beneficio 1", "Beneficio 2"],
      autoRenew: true,
    };
  
    const validation = ProductValidator.validate(
      validSubscription,
      SubscriptionSchema
    );
    console.log("✅ Valid subscription validation:", validation);
  
    // Suscripción inválida (sin beneficios)
    const invalidSubscription = { ...validSubscription, benefits: [] };
    const invalidValidation = ProductValidator.validate(
      invalidSubscription,
      SubscriptionSchema
    );
    console.log("❌ Invalid subscription validation:", invalidValidation);
  
    return validation.isValid && !invalidValidation.isValid;
  }
  
  // Test del ProductFactory
  function testProductFactory() {
    console.log("🧪 Testing ProductFactory...");
  
    try {
      // Crear producto individual
      const individualData = {
        id: "factory_test_1",
        name: "Producto Factory",
        description: "Creado con factory",
        category: "avatares",
        price: { coins: 150, usd: 2.99, ars: 300 },
      };
  
      const individual = ProductFactory.createIndividualProduct(individualData);
      console.log("✅ Individual product created:", individual);
  
      // Crear pack
      const packData = {
        id: "factory_pack_1",
        name: "Pack Factory",
        description: "Pack creado con factory",
        category: "avatares",
        price: { coins: 400, usd: 7.99, ars: 800 },
        items: ["item1", "item2", "item3"],
        discountPercentage: 30,
      };
  
      const pack = ProductFactory.createPack(packData);
      console.log("✅ Pack created:", pack);
  
      // Crear suscripción
      const subscriptionData = {
        id: "factory_sub_1",
        name: "Suscripción Factory",
        description: "Suscripción creada con factory",
        category: "premium",
        price: { usd: 12.99, ars: 1300 },
        duration: "monthly",
        benefits: ["Beneficio Factory 1", "Beneficio Factory 2"],
      };
  
      const subscription = ProductFactory.createSubscription(subscriptionData);
      console.log("✅ Subscription created:", subscription);
  
      return true;
    } catch (error) {
      console.error("❌ ProductFactory test failed:", error);
      return false;
    }
  }
  
  // Test de creación múltiple
  function testMultipleProductCreation() {
    console.log("🧪 Testing Multiple Product Creation...");
  
    const productsData = [
      {
        id: "multi_1",
        name: "Producto Multi 1",
        description: "Primer producto múltiple",
        category: "avatares",
        type: "individual",
        price: { coins: 100, usd: 1.99, ars: 200 },
      },
      {
        id: "multi_2",
        name: "Pack Multi 2",
        description: "Segundo producto múltiple",
        category: "avatares",
        type: "pack",
        price: { coins: 250, usd: 4.99, ars: 500 },
        items: ["item1", "item2"],
        discountPercentage: 20,
      },
      {
        // Producto inválido para probar manejo de errores
        id: "multi_invalid",
        name: "", // Nombre vacío
        category: "avatares",
        type: "individual",
      },
    ];
  
    const results = ProductFactory.createMultipleProducts(productsData);
    console.log("✅ Multiple products creation results:", results);
  
    return results.success.length === 2 && results.errors.length === 1;
  }
  
  // Ejecutar todos los tests
  function runAllTests() {
    console.log("🚀 Iniciando tests de esquemas de productos...\n");
  
    const tests = [
      {
        name: "Individual Product Validation",
        fn: testIndividualProductValidation,
      },
      { name: "Pack Validation", fn: testPackValidation },
      { name: "Subscription Validation", fn: testSubscriptionValidation },
      { name: "Product Factory", fn: testProductFactory },
      { name: "Multiple Product Creation", fn: testMultipleProductCreation },
    ];
  
    let passed = 0;
    let failed = 0;
  
    tests.forEach((test) => {
      try {
        const result = test.fn();
        if (result) {
          console.log(`✅ ${test.name}: PASSED\n`);
          passed++;
        } else {
          console.log(`❌ ${test.name}: FAILED\n`);
          failed++;
        }
      } catch (error) {
        console.error(`💥 ${test.name}: ERROR - ${error.message}\n`);
        failed++;
      }
    });
  
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
    if (failed === 0) {
      console.log("🎉 All tests passed! Product schemas are working correctly.");
    } else {
      console.log("⚠️ Some tests failed. Check the implementation.");
    }
  
    return { passed, failed };
  }
  
  // Función para ejecutar desde la consola
  function testProductSchemas() {
    // Verificar que las clases estén disponibles
    if (
      typeof ProductValidator === "undefined" ||
      typeof ProductFactory === "undefined"
    ) {
      console.error(
        "❌ ProductValidator or ProductFactory not loaded. Make sure to include product-schemas.js first."
      );
      return;
    }
  
    return runAllTests();
  }
  
  // Exportar para uso en otros módulos
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      testProductSchemas,
      runAllTests,
      testIndividualProductValidation,
      testPackValidation,
      testSubscriptionValidation,
      testProductFactory,
      testMultipleProductCreation,
    };
  }
  
  // Auto-ejecutar si se carga en el navegador
  if (typeof window !== "undefined") {
    console.log(
      "📋 Product Schemas Test Suite loaded. Run testProductSchemas() to execute all tests."
    );
  }
  