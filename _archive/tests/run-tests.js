/**
 * Test Runner Script
 * Quiz Cristiano - Script para ejecutar tests con configuración personalizada
 */

const { execSync } = require('child_process');
const path = require('path');

// Colores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${description}`, 'cyan');
  log(`Ejecutando: ${command}`, 'yellow');
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    log(`✅ ${description} completado exitosamente`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error en ${description}`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  log('🧪 Quiz Cristiano - Test Runner', 'bright');
  log('=====================================', 'bright');

  switch (command) {
    case 'unit':
      log('Ejecutando tests unitarios...', 'blue');
      runCommand('npm run test:unit', 'Tests unitarios');
      break;

    case 'integration':
      log('Ejecutando tests de integración...', 'blue');
      runCommand('npm run test:integration', 'Tests de integración');
      break;

    case 'coverage':
      log('Ejecutando tests con coverage...', 'blue');
      runCommand('npm run test:coverage', 'Tests con coverage');
      break;

    case 'watch':
      log('Ejecutando tests en modo watch...', 'blue');
      runCommand('npm run test:watch', 'Tests en modo watch');
      break;

    case 'ci':
      log('Ejecutando tests para CI/CD...', 'blue');
      runCommand('npm run test:ci', 'Tests para CI/CD');
      break;

    case 'all':
    default:
      log('Ejecutando todos los tests...', 'blue');
      
      const results = [
        runCommand('npm run test:unit', 'Tests unitarios'),
        runCommand('npm run test:integration', 'Tests de integración'),
        runCommand('npm run test:coverage', 'Coverage report')
      ];

      const allPassed = results.every(result => result);
      
      if (allPassed) {
        log('\n🎉 Todos los tests pasaron exitosamente!', 'green');
      } else {
        log('\n💥 Algunos tests fallaron. Revisa los errores arriba.', 'red');
        process.exit(1);
      }
      break;

    case 'help':
      log('\nComandos disponibles:', 'bright');
      log('  unit        - Ejecutar solo tests unitarios', 'yellow');
      log('  integration - Ejecutar solo tests de integración', 'yellow');
      log('  coverage    - Ejecutar tests con reporte de coverage', 'yellow');
      log('  watch       - Ejecutar tests en modo watch', 'yellow');
      log('  ci          - Ejecutar tests para CI/CD', 'yellow');
      log('  all         - Ejecutar todos los tests (default)', 'yellow');
      log('  help        - Mostrar esta ayuda', 'yellow');
      log('\nEjemplos:', 'bright');
      log('  node tests/run-tests.js unit', 'cyan');
      log('  node tests/run-tests.js coverage', 'cyan');
      log('  node tests/run-tests.js watch', 'cyan');
      break;

    default:
      log(`❌ Comando desconocido: ${command}`, 'red');
      log('Usa "help" para ver los comandos disponibles', 'yellow');
      process.exit(1);
  }
}

// Verificar que Jest esté instalado
try {
  execSync('npx jest --version', { stdio: 'pipe' });
} catch (error) {
  log('❌ Jest no está instalado. Instala las dependencias primero:', 'red');
  log('npm install', 'yellow');
  process.exit(1);
}

main();