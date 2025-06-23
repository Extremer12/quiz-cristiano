# 📖 Quiz Cristiano - PWA Educativa

Una Progressive Web App (PWA) interactiva para fortalecer el conocimiento bíblico a través del juego.

## ✨ Características Principales

- 🎮 **Sistema de Juego Completo:** Preguntas del Antiguo y Nuevo Testamento
- 💰 **Economía Virtual:** Monedas, power-ups y sistema de recompensas
- 🏆 **Gamificación:** Logros, ranking y estadísticas detalladas
- 📱 **PWA Nativa:** Instalable como app móvil
- 🌙 **Temas Personalizables:** Modo claro y oscuro
- 👥 **Multijugador:** Sistema de salas privadas
- 💳 **Tienda Premium:** Integración con MercadoPago
- 🔥 **Firebase Backend:** Autenticación y sincronización

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **PWA:** Service Workers, Web App Manifest
- **Backend:** Firebase (Auth, Firestore)
- **Pagos:** MercadoPago API
- **Hosting:** Vercel
- **Analytics:** Google Analytics

## 🚀 Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/quiz-cristiano.git
cd quiz-cristiano

# Configurar variables de entorno
cp js/config/config.example.js js/config/config.js
# Editar config.js con tus credenciales

# Servir localmente
npx serve . -p 3000
```

## 📱 Generar APK

### Método 1: PWA Builder (Recomendado)
1. Sube el proyecto a tu hosting
2. Ve a [pwabuilder.com](https://pwabuilder.com)
3. Ingresa tu URL
4. Descarga el APK generado

### Método 2: Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android
npx cap sync
npx cap open android
```

## 🎮 Características del Juego

- **+500 preguntas** categorizadas por dificultad
- **Sistema de monedas** para compras en la tienda
- **Power-ups estratégicos:** Eliminar opciones, tiempo extra, segunda oportunidad
- **Logros desbloqueables** con recompensas
- **Ranking global** con competencias
- **Modo offline** para jugar sin internet

## 🔧 Configuración

### Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Configurar Authentication (Google, Anónimo)
3. Crear base de datos Firestore
4. Copiar credenciales a `config.js`

### MercadoPago
1. Crear cuenta en [MercadoPago Developers](https://developers.mercadopago.com)
2. Obtener credenciales de prueba/producción
3. Configurar webhook para notificaciones

## 📊 Analytics y Monetización

- **Google AdSense** integrado para anuncios no intrusivos
- **Analytics detallado** de comportamiento del usuario
- **Sistema freemium** con compras opcionales
- **Respeto a usuarios premium** sin anuncios

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push al branch (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- Contenido bíblico basado en la traducción Reina-Valera
- Iconografía cristiana con respeto y reverencia
- Comunidad de desarrolladores web cristianos

---

**Desarrollado con ❤️ para fortalecer la fe a través de la tecnología**