# 📖 FUNCIONALIDADES DEL PROYECTO - QUIZ CRISTIANO

## 🎯 DESCRIPCIÓN GENERAL

Quiz Cristiano es una Progressive Web App (PWA) educativa diseñada para fortalecer el conocimiento bíblico a través de un sistema de juego interactivo y gamificado. La aplicación combina elementos de aprendizaje con mecánicas de juego para crear una experiencia atractiva y educativa.

---

## 🎮 FUNCIONALIDADES PRINCIPALES

### 1. SISTEMA DE AUTENTICACIÓN Y USUARIOS

**¿Qué hace?**

- Permite a los usuarios crear cuentas y acceder de forma segura
- Soporta inicio de sesión con Google y modo anónimo
- Mantiene la sesión activa durante 24 horas
- Protege contra bucles de redirección y errores de autenticación

**Cómo funciona:**

- Al entrar, verifica si hay una sesión válida
- Si no hay sesión, redirige al login
- Guarda los datos del usuario en localStorage
- Sincroniza con Firebase para respaldo en la nube

**Archivos relacionados:** `login.html`, `js/modules/protection.js`

---

### 2. SISTEMA DE JUEGO - MODO INDIVIDUAL

**¿Qué hace?**

- Presenta preguntas bíblicas del Antiguo y Nuevo Testamento
- Ofrece diferentes niveles de dificultad
- Sistema de puntuación basado en velocidad y precisión
- Más de 500 preguntas categorizadas

**Cómo funciona:**

- El jugador selecciona una categoría (Antiguo/Nuevo Testamento, Personajes biblicos y otros)
- Se presentan preguntas de opción múltiple
- Cada respuesta correcta suma puntos y monedas
- El tiempo de respuesta afecta la puntuación
- Al finalizar, se muestran estadísticas y recompensas


---

### 3. SISTEMA DE JUEGO - MODO MULTIJUGADOR

**¿Qué hace?**

- Permite jugar con otros usuarios en tiempo real
- Sistema de salas privadas con códigos
- Competencia directa entre jugadores
- Ranking en vivo durante la partida

**Cómo funciona:**

-Debe ser como preguntados, primero se elije un adversario al azar o se juega contra un amigo
-Comienza jugando quien crea el efrentamiento y responde hasta perder o hasta que gane 2 categorias como maximo asi el rival tiene oportunidad de jugar. 
-El enfrentamiento no es en una sala con los dos usuarios al mismo tiempo, primero juega uno y luego el otro jugador tiene 24 horas para jugar su turno, si no juega su turno en ese tiempo pierde el enfrentamiento.
-El turno del otro usuario llega, y su juego no tiene limites si gana las 4 categorias gana el efrentamiento. 
- El enfrentamiento termina cuando uno de los dos usuarios gane las 4 categorias, o uno de los usuarios no responde en el tiempo limite. 


---

### 4. ECONOMÍA VIRTUAL - SISTEMA DE MONEDAS

**¿Qué hace?**

- Los jugadores ganan monedas al responder correctamente
- Las monedas se usan para comprar power-ups y mejoras
- Sistema de recompensas diarias
- Bonificaciones por rachas de victorias

**Cómo funciona:**

- Cada respuesta correcta otorga monedas (10-50 según dificultad)
- Las monedas se acumulan en el perfil del usuario
- Se pueden gastar en la tienda
- El sistema previene trampas validando las transacciones

---

### 5. TIENDA PREMIUM

**¿Qué hace?**

- Vende power-ups y mejoras con monedas virtuales
- Ofrece productos premium con dinero real 
- Sistema de suscripciones mensuales
- Paquetes especiales y ofertas

**Productos disponibles:**

- **Power-ups:** Eliminar opciones, tiempo extra, segunda oportunidad
- **Cosméticos:** Temas, avatares, efectos especiales
- **Premium:** Sin anuncios, monedas extra, contenido exclusivo

**Cómo funciona:**

- El usuario navega por los productos
- Selecciona lo que desea comprar
- Para compras con monedas: se valida el saldo y se descuenta
- Para compras con dinero real: se redirige a MercadoPago
- Después del pago, se activa el producto automáticamente


---

### 6. SISTEMA DE POWER-UPS

**¿Qué hace?**

- Proporciona ayudas estratégicas durante el juego
- Se activan en momentos clave para mejorar el rendimiento
- Tienen usos limitados

**Power-ups disponibles:**

- **50/50:** Elimina dos opciones incorrectas
- **Tiempo Extra:** Añade 15 segundos al temporizador
- **Segunda Oportunidad:** Permite fallar una vez sin perder

**Cómo funciona:**

- El jugador compra power-ups en la tienda
- Durante el juego, aparecen botones para activarlos
- Al usarse, se aplica el efecto inmediatamente
- Se descuenta del inventario del usuario


---

### 7. SISTEMA DE LOGROS Y GAMIFICACIÓN

**¿Qué hace?**

- Recompensa a los jugadores por alcanzar metas
- Desbloquea insignias y títulos especiales
- Motiva a seguir jugando con objetivos claros

**Tipos de logros:**

- **Por cantidad:** Responder X preguntas correctas
- **Por racha:** Ganar X partidas seguidas
- **Por velocidad:** Responder en menos de X segundos
- **Especiales:** Completar desafíos únicos

**Cómo funciona:**

- El sistema monitorea las acciones del jugador
- Cuando se cumple un objetivo, se desbloquea el logro
- Se otorgan recompensas (monedas, títulos, avatares)
- Los logros se muestran en el perfil


---

### 8. RANKING GLOBAL

**¿Qué hace?**

- Muestra los mejores jugadores de la comunidad
- Clasifica por puntuación, victorias y nivel
- Actualización en tiempo real
- Competencias semanales y mensuales

**Cómo funciona:**

- Cada partida actualiza las estadísticas del jugador
- Firebase sincroniza los datos con el servidor
- El ranking se calcula automáticamente
- Los jugadores pueden ver su posición y la de otros


---


---

### 9. PROGRESSIVE WEB APP (PWA)

**¿Qué hace?**

- Permite instalar la app como si fuera nativa
- Funciona offline con datos en caché
- Notificaciones push para eventos importantes
- Actualizaciones automáticas

**Características PWA:**

- **Instalable:** Se puede agregar a la pantalla de inicio
- **Offline:** Juega sin conexión con preguntas guardadas
- **Rápida:** Carga instantánea con Service Workers
- **Responsive:** Se adapta a cualquier dispositivo

**Cómo funciona:**

- El Service Worker cachea recursos importantes
- Cuando no hay internet, usa los datos guardados
- Al volver online, sincroniza automáticamente
- Las actualizaciones se descargan en segundo plano


---

### 11. SISTEMA DE ANUNCIOS (ADSENSE)

**¿Qué hace?**

- Muestra anuncios no intrusivos para monetización
- Respeta a usuarios premium (sin anuncios)
- Anuncios estratégicos entre partidas

**Cómo funciona:**

- Se cargan anuncios de Google AdSense
- Aparecen en momentos específicos (fin de partida, menús)
- Los usuarios premium no ven anuncios
- El sistema valida que no interfieran con el juego


---



### 13. SISTEMA DE ESTADÍSTICAS

**¿Qué hace?**

- Registra todas las partidas y resultados
- Calcula promedios, rachas y tendencias
- Gráficos visuales de progreso
- Comparación con otros jugadores

**Estadísticas rastreadas:**

- Total de partidas jugadas
- Porcentaje de aciertos
- Tiempo promedio de respuesta
- Racha actual y mejor racha
- Categorías favoritas
- Progreso semanal/mensual

**Cómo funciona:**

- Cada acción del jugador se registra
- Los datos se procesan y almacenan
- Se generan gráficos y resúmenes
- Se muestran en el perfil del usuario


---

### 14. MINI-JUEGO DE ESTUDIO BÍBLICO

**¿Qué hace?**

- Modo de estudio sin presión de tiempo
- Explicaciones detalladas de cada respuesta
- Referencias bíblicas para profundizar
- Modo de repaso de preguntas falladas

**Cómo funciona:**

- El usuario selecciona temas específicos
- Se presentan preguntas sin límite de tiempo
- Después de responder, se muestra la explicación
- Se pueden marcar preguntas para repasar después

---

### 15. SISTEMA DE PERFIL DE USUARIO

**¿Qué hace?**

- Muestra información del jugador
- Permite personalizar avatar y nombre
- Historial de partidas y logros
- Configuración de privacidad

**Información del perfil:**

- Nombre y avatar
- Nivel y experiencia
- Estadísticas generales
- Logros desbloqueados
- Historial de compras
- Amigos y seguidores

**Cómo funciona:**

- Los datos se cargan desde Firebase
- El usuario puede editar su información
- Los cambios se sincronizan automáticamente
- Otros jugadores pueden ver el perfil público


---

### 16. SISTEMA DE PROTECCIÓN Y SEGURIDAD

**¿Qué hace?**

- Previene trampas y manipulación de datos
- Protege contra bucles de redirección
- Valida todas las transacciones
- Detecta comportamientos sospechosos

**Medidas de seguridad:**

- Validación de sesiones
- Encriptación de datos sensibles
- Límites de intentos de login
- Detección de modificación de localStorage
- Validación de compras en el servidor

**Cómo funciona:**

- Cada acción crítica se valida
- Los datos se verifican en el servidor
- Se registran intentos sospechosos
- Se bloquean cuentas con actividad anómala



---

### 17. SISTEMA DE NOTIFICACIONES

**¿Qué hace?**

- Envía alertas sobre eventos importantes
- Recordatorios de recompensas diarias
- Notificaciones de desafíos y competencias
- Avisos de actualizaciones

**Tipos de notificaciones:**

- Recompensas disponibles
- Nuevos logros desbloqueados
- Invitaciones a partidas multijugador
- Ofertas especiales en la tienda
- Actualizaciones de la app

**Cómo funciona:**

- El usuario autoriza las notificaciones
- El sistema programa alertas según eventos
- Se envían notificaciones push
- El usuario puede configurar qué recibir

---


---



---

### 20. SISTEMA DE CONFIGURACIÓN

**¿Qué hace?**

- Permite personalizar la experiencia
- Ajustes de sonido y efectos
- Configuración de notificaciones
- Gestión de privacidad

**Opciones configurables:**

- Volumen de música y efectos
- Activar/desactivar notificaciones
- Modo de dificultad predeterminado
- Idioma (futuro)
- Privacidad del perfil

**Archivos relacionados:** `ajustes.html`


---

## 🎯 FLUJO DE USUARIO TÍPICO

1. **Inicio:** Usuario abre la app o se registra
2. **Pantalla principal:** Ve sus estadísticas y opciones de juego
3. **Selección de modo:** Elige individual o multijugador
4. **Juego:** Responde preguntas y gana monedas
5. **Resultados:** Ve su puntuación y recompensas
6. **Tienda:** Gasta monedas en power-ups o compra premium
7. **Perfil:** Revisa logros y estadísticas
8. **Ranking:** Compara su progreso con otros jugadores


## 📊 MÉTRICAS Y ANALYTICS

El proyecto incluye seguimiento de:

- Usuarios activos diarios/mensuales
- Tasa de retención
- Partidas jugadas por usuario
- Conversión de compras
- Tiempo promedio de sesión
- Páginas más visitadas

---

## 🚀 FUTURAS FUNCIONALIDADES

- Sistema de amigos y chat
- Torneos y competencias programadas
- Más categorías de preguntas
- Modo de desafío diario
- Integración con redes sociales
- Versión en más idiomas
- Modo de estudio con IA

