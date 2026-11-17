# Gestión de Convenios — UNLPam

Sistema institucional para administrar los convenios de la Universidad Nacional de La Pampa: convenios marco y específicos de colaboración y de pasantía, adendas, renovaciones, partes firmantes, personas vinculadas, documentación, circuito de revisión y firma, plazos y estadísticas.

El sistema está compuesto por una **plataforma web de gestión** y una **aplicación móvil**, ambas conectadas a una misma **API REST**.

> Trabajo Integrador Final de las asignaturas **Programación Orientada a la Web** y **Laboratorio Orientado a Aplicaciones Móviles** — Facultad de Ingeniería, UNLPam.
>
> ⚠️ Proyecto académico. Todos los datos (convenios, personas, instituciones y documentos) son **ficticios**. La firma registrada en el sistema es administrativa y no equivale a firma digital ni a certificación de legalidad.

---

## ¿De qué se trata?

Las universidades gestionan una gran cantidad de convenios con otras instituciones, y su seguimiento suele depender de expedientes, planillas y correos dispersos. Este sistema centraliza ese circuito:

- **Registro de instrumentos:** convenios marco y específicos, adendas, renovaciones y sustituciones, cada uno con su ficha y código propio, vinculados a sus antecedentes.
- **Circuito de estados:** borrador → revisión → aprobado → firmado → rescindido / archivado, con registro de cada transición y su fundamento.
- **Revisión y observaciones:** el equipo revisor puede devolver un convenio con observaciones trazables.
- **Firma desde el celular:** lectura completa del PDF, firma manuscrita y verificación biométrica, registrando fecha, hora y ubicación del acto de firma.
- **Documentación:** carga de PDFs con versionado, verificación de integridad (SHA-256) y marca en los metadatos realizada por la API.
- **Plazos y alertas:** cálculo de vencimientos y preavisos, y notificaciones en web y móvil.
- **Estadísticas:** convenios por estado, tipo, unidad y año de firma.
- **Acceso por rol y unidad:** administración, gestión, revisión y consulta, respetando el alcance de cada usuario.

### Plataforma web

Orientada al trabajo de gestión desde escritorio: alta y edición de convenios, panel de revisión, búsqueda con filtros, panel de estadísticas, exportación CSV y trabajo sin conexión con IndexedDB.

### Aplicación móvil

Orientada a las autoridades que firman y consultan convenios:

- Login con email y contraseña, biometría y MFA (código por mail simulado o notificación push).
- Home con resumen: convenios firmados en el último año, vigentes, en trámite, últimos movimientos y pendientes de firma.
- Buscador en el header y buscador avanzado con filtros; resultados en forma de árbol (convenio padre → hijos → resoluciones → documentos).
- Firmador de convenios con visor de PDF con zoom, firma manuscrita + huella y opción de compartir por WhatsApp o email.
- Carga móvil de convenios y adjuntos (resoluciones, borradores y anexos) como borradores.
- Comentarios entre usuarios dentro de cada convenio, con detección automática de comentarios ofensivos.
- Registro de identidad (firma, huella y reconocimiento facial).
- Perfil: tamaño de letra, modo claro/oscuro y foto de perfil.
- Notificaciones push (desde la API) y locales (recordatorios de la app).
- Modo offline: consulta de convenios pendientes de firma sin conexión.
- Manual de usuario y ayudas contextuales.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | PHP / Laravel (API REST), Laravel Sanctum (autenticación por token) |
| Base de datos | MySQL |
| Web | React / Next.js |
| Móvil | React Native con Expo (Expo Router) |
| Persistencia local | IndexedDB (web), AsyncStorage + SecureStore (móvil) |

---

### Arquitectura

- **Backend:** MVC con capa de servicios, organizado en módulos por dominio. Los controladores delegan la validación en FormRequests, la autorización en Policies y la lógica de negocio en Services.
- **Web y móvil:** organización por features. En la app móvil cada feature sigue Clean Architecture (`domain`, `data`, `presentation`) y los componentes compartidos aplican Atomic Design (`atoms`, `molecules`, `organisms`).

El detalle y los diagramas están en [`docs/`](docs/).

---

## Requisitos previos

- [PHP](https://www.php.net/) 8.2 o superior y [Composer](https://getcomposer.org/)
- [MySQL](https://www.mysql.com/) 8
- [Node.js](https://nodejs.org/) 20 o superior y npm
- [Git](https://git-scm.com/)
- Para la app móvil: un dispositivo Android o un emulador ([Android Studio](https://developer.android.com/studio)), y una cuenta de [Expo](https://expo.dev/) para generar builds

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/lourdesibanez/gestion-convenios.git
cd gestion-convenios
```

### 2. Backend (API)

```bash
cd backend
composer install
cp .env.example .env        # en PowerShell: copy .env.example .env
php artisan key:generate
```

Crear una base de datos vacía llamada `gestion_convenios` y configurar la conexión en `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_convenios
DB_USERNAME=root
DB_PASSWORD=
```

Ejecutar migraciones con datos de prueba y levantar el servidor:

```bash
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

La API queda disponible en `http://localhost:8000/api`.

Para que funcionen las alertas de vencimiento y las tareas en segundo plano, en otras terminales:

```bash
php artisan schedule:work   # tareas programadas (vencimientos, preavisos)
php artisan queue:work      # cola de trabajos (notificaciones)
```

### 3. Cliente web

```bash
cd web
npm install
cp .env.example .env.local  # en PowerShell: copy .env.example .env.local
```

Configurar la URL de la API en `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Levantar el servidor de desarrollo:

```bash
npm run dev
```

La web queda disponible en `http://localhost:3000`.

### 4. App móvil

```bash
cd mobile
npm install
cp .env.example .env        # en PowerShell: copy .env.example .env
```

Configurar la URL de la API en `mobile/.env`. Desde el celular, `localhost` apunta al propio teléfono, así que hay que usar la **IP local de la computadora** donde corre el backend:

```env
EXPO_PUBLIC_API_URL=http://192.168.X.X:8000/api
```

La app usa módulos nativos (visor de PDF, notificaciones push), por lo que requiere un **development build** en lugar de Expo Go:

```bash
npx expo run:android        # compila e instala en el emulador o dispositivo conectado
```

O bien, usando EAS Build:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile development
npx expo start --dev-client
```

#### Generar el APK

```bash
eas build -p android --profile preview
```

Al finalizar, EAS devuelve el enlace de descarga del `.apk`.

Para el acceso de cada desarrollador al proyecto EAS y la configuración de credenciales de Expo Push/FCM, consultar la [guía de compilación móvil](mobile/README.md).
