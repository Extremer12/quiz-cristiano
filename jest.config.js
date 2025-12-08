export default {
  // Configuración básica de Jest
  testEnvironment: 'jsdom',

  // Permitir pasar cuando no hay tests
  passWithNoTests: true,

  // Archivos de configuración
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Patrones de archivos de prueba
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // Excluir pruebas e2e de Jest (estas se ejecutan con Playwright)
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],

  // Configuración de cobertura
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**'
  ],

  // Directorios de cobertura
  coverageDirectory: 'coverage',

  // Reportes de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],

  // Transformaciones
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Configuración de módulos
  moduleFileExtensions: ['js', 'json'],

  // Configuración de timeout
  testTimeout: 10000,

  // Configuración de reportes
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './test-reports',
        filename: 'jest-report.html',
        expand: true
      }
    ]
  ],

  // Variables de entorno para pruebas
  testEnvironmentOptions: {
    url: 'http://localhost'
  },

  // Configuración adicional
  verbose: true,
  clearMocks: true,
  restoreMocks: true
};