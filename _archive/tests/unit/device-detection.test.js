/**
 * Test específico para detección de dispositivos
 * Quiz Cristiano - Test aislado para getDeviceType
 */

const TransactionManager = require('../../js/modules/payments/transaction-manager.js');

// Mock simple de Firebase para evitar errores
global.firebase = {
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        set: jest.fn().mockResolvedValue(),
        update: jest.fn().mockResolvedValue(),
        get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) })
      })
    })
  })
};

describe('Device Detection Tests', () => {
  let transactionManager;

  beforeEach(() => {
    transactionManager = new TransactionManager();
  });

  describe('getDeviceType', () => {
    test('should detect server when navigator is undefined', () => {
      const originalNavigator = global.navigator;
      delete global.navigator;
      
      const deviceType = transactionManager.getDeviceType();
      expect(deviceType).toBe('server');
      
      global.navigator = originalNavigator;
    });

    test('should detect mobile devices', () => {
      const originalNavigator = global.navigator;
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      };
      
      const deviceType = transactionManager.getDeviceType();
      expect(deviceType).toBe('mobile');
      
      global.navigator = originalNavigator;
    });

    test('should detect tablet devices', () => {
      const originalNavigator = global.navigator;
      global.navigator = {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)'
      };
      
      const deviceType = transactionManager.getDeviceType();
      expect(deviceType).toBe('tablet');
      
      global.navigator = originalNavigator;
    });

    test('should detect desktop by default', () => {
      const originalNavigator = global.navigator;
      global.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };
      
      const deviceType = transactionManager.getDeviceType();
      expect(deviceType).toBe('desktop');
      
      global.navigator = originalNavigator;
    });
  });
});