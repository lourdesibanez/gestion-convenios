**Lineamientos del proyecto**

Sistema de Gestión de Convenios — UNLPam

Programación Orientada a la Web & Laboratorio de Aplicaciones Móviles

**Versión:** 1.0 — 27/10/2026

**Alcance:** backend (API Laravel), app móvil (Expo / React Native) y cliente web (Next.js).

Este documento es la referencia del equipo para que el proyecto se mantenga ordenado y fácil de extender. Antes de crear una tabla, un endpoint o una pantalla, revisen la sección que corresponde. Si una regla cambia, se actualiza acá, en el **Registro de decisiones** (sección 10), y se sube la nueva versión al repositorio.

# **1\. Visión general**

| Carpeta | Qué contiene | Tecnología |
| :---- | :---- | :---- |
| backend/ | API REST: reglas de negocio, autorización, base de datos y archivos | Laravel 12, PHP 8.2, Sanctum, MySQL 8 |
| mobile/ | App para autoridades: firma, búsqueda, comentarios, notificaciones | Expo SDK 58, React Native, expo-router, TypeScript |
| web/ | Plataforma de gestión (a crear) | Next.js |
| docs/ | Documentación del proyecto, incluido este archivo | — |

**Principios que guían todas las decisiones:**

* **Una sola fuente de verdad.** Las reglas de negocio, la validación y los permisos viven en la API. La web y la app solo muestran datos y llaman a la API; nunca deciden por su cuenta si algo está permitido.

* **Lo más simple que cumpla el TP.** Antes de agregar una tabla, columna o librería, verificar que la pida alguno de los dos TP o que resuelva un problema real.

* **Cada cosa en su lugar.** Validación, autorización, reglas de negocio y presentación van en capas separadas (secciones 4 y 5).

* **Solo datos ficticios.** No se cargan personas, convenios ni documentos reales en ningún entorno.

# **2\. Idioma y nombres**

Regla general: **el dominio se nombra en español** (es el idioma del TP y de los usuarios) y **los términos del framework se dejan en inglés**. La única excepción son las URLs de la API, que van en inglés porque el TP las define así.

| Elemento | Convención | Ejemplo |
| :---- | :---- | :---- |
| Tablas | español, singular, snake\_case | instrumento, parte\_firmante |
| Columnas | español, snake\_case | fecha\_preaviso, es\_interna |
| Claves foráneas | id\_\<tabla\>; si hay dos a la misma tabla, con sufijo | id\_instrumento, id\_estado\_anterior |
| Columnas de auditoría | inglés (convención de Laravel) | created\_at, created\_by, deleted\_at |
| Modelos | español, singular, PascalCase | Instrumento, CodigoVerificacion |
| Controladores | \<Modelo\>Controller | InstrumentoController |
| Métodos y variables (PHP y TS) | español, camelCase | verificarCodigo(), estaSuspendido() |
| URLs de la API | inglés, plural, kebab-case | /api/agreements, /api/auth/verify-code |
| Campos JSON | iguales a las columnas | id\_instrumento, fecha\_fin |
| Componentes React | español, PascalCase; archivo en kebab-case | TarjetaConvenio en tarjeta-convenio.tsx |
| Hooks | use \+ español | useConvenios, useSesion |
| Mensajes al usuario | español, claros, sin jerga técnica | "El código es incorrecto o está vencido." |

## **Equivalencia entre recursos de la API y tablas**

| Recurso (TP) | Tablas principales |
| :---- | :---- |
| /auth | usuario, codigo\_verificacion, personal\_access\_tokens |
| /users | usuario, usuario\_perfil, perfil |
| /units | institucion con es\_interna \= true |
| /agreements | instrumento \+ convenio |
| /agreements/{id}/links | instrumento\_vinculo |
| /parties | institucion, parte\_firmante |
| /people | representante, representante\_instrumento, pasantia |
| /documents | archivo |
| /dashboard | consultas sobre instrumento, firma, historial\_estado |
| /alerts | notificacion |

# **3\. Base de datos**

## **3.1 Reglas generales**

* Motor **MySQL 8** (Laragon), base gestion\_convenios, intercalación utf8mb4\_unicode\_ci.

* **Una migración por tabla**, llamada create\_\<tabla\>\_table. Las migraciones están numeradas para que cada tabla se cree después de las tablas a las que apunta.

* Clave primaria id autoincremental. Única excepción: convenio, cuya clave primaria es id\_instrumento porque es un subtipo de instrumento.

* Las claves foráneas siempre indican la tabla: constrained('instrumento'). Como las tablas están en singular, Laravel no la puede adivinar.

* Al borrar: los hijos de instrumento se borran en cascada; los catálogos y usuarios no se pueden borrar si están en uso (restrictOnDelete); las columnas de auditoría quedan en null (nullOnDelete).

* MySQL no acepta nombres de índice de más de **64 caracteres**. Si Laravel genera uno más largo, se le pone un nombre explícito (por ejemplo instrumento\_vinculo\_unique).

* **Valores fijos:** si los define el TP y no van a cambiar, se guardan como texto y la migración documenta los valores válidos en un comentario (por ejemplo tipo\_vinculo, observacion.estado). Si tienen que poder crecer sin tocar código, van en una tabla catálogo (estado, tipo\_instrumento, perfil, permiso).

* **No duplicar datos.** Si un dato se puede obtener de otra tabla, no se copia (por eso se eliminaron alcance y finalidad de convenio).

* date para fechas de negocio (fecha\_fin); timestamp para eventos (firmado\_en, created\_at).

* Los archivos nunca se guardan en la base: se guarda la ruta, el tipo MIME, el tamaño y el hash SHA-256.

## **3.2 Auditoría**

Cada tabla lleva solo los campos de auditoría que tienen sentido para ella:

| Campos | Tablas | Motivo |
| :---- | :---- | :---- |
| Todos \+ suspended\_at / suspended\_by | usuario, institucion, usuario\_perfil (sin borrado lógico) | Se pueden suspender sin borrarse |
| created, updated, deleted (fecha \+ quién) | instrumento, firma, estado, perfil, tipo\_instrumento, representante, representante\_instrumento, pasantia | Entidades editables que se dan de baja |
| created y updated (fecha \+ quién) | convenio, instrumento\_vinculo, parte\_firmante | Se editan pero no se borran solas |
| created \+ borrado lógico | archivo | Las cargas no se editan; se conservan las anteriores |
| Fechas \+ borrado lógico, sin created\_by | comentario, observacion (sin borrado) | id\_usuario ya es el autor |
| Solo created\_at | historial\_estado, usuario\_instrumento, codigo\_verificacion | Registros que no se modifican |
| Solo fechas | notificacion, permiso, personal\_access\_tokens | — |
| Ninguno | perfil\_permiso | Solo une dos ids |

Una tabla nueva sigue el mismo criterio: hay que elegir la fila de esta tabla que le corresponde y documentarlo.

## **3.3 Cómo se cambian las migraciones**

* **Fase de modelado (ahora):** se pueden editar las migraciones existentes. Después de cada git pull, cada integrante corre php artisan migrate:fresh \--seed (borra su base local y la recrea).

* **Desde que se congela el modelo** (fecha a acordar por el equipo): una migración que ya está en main no se edita nunca más. Cada cambio va en una migración nueva, por ejemplo add\_uuid\_to\_instrumento\_table.

* **Seeders:** CatalogoSeeder carga los catálogos del TP (tipos de instrumento y estados); DatabaseSeeder crea el usuario de prueba. Los datos de demostración, siempre ficticios, van en un DemoSeeder aparte.

# **4\. Backend (API Laravel)**

## **4.1 Carpetas**

| Carpeta | Responsabilidad |
| :---- | :---- |
| routes/api.php | Define URLs y middleware (auth:sanctum, throttle). Sin lógica. |
| app/Http/Requests/ | Validación de cada petición (FormRequest). |
| app/Policies/ | Autorización: qué rol y qué unidad puede hacer cada acción. |
| app/Http/Controllers/ | Controladores finos: reciben la petición, llaman al servicio y devuelven la respuesta. |
| app/Services/ | Reglas de negocio (circuito de estados, firma, marca de PDF, notificaciones). |
| app/Http/Resources/ | Forma del JSON de salida (qué campos se exponen). |
| app/Models/ | Modelos Eloquent: tabla, campos asignables, casts y relaciones. |
| app/Models/Concerns/ | Traits compartidos entre modelos (por ejemplo, completar created\_by). |
| tests/Feature/ | Tests por endpoint. |

## **4.2 Recorrido de una petición**

Ruta (auth:sanctum) → FormRequest (valida) → Policy (autoriza)  
  → Controller → Service (reglas, DB::transaction) → Model  
  → Resource (formatea) → respuesta JSON

## **4.3 Reglas**

* **Controladores cortos:** un método no consulta la base directamente ni aplica reglas de negocio; delega en un servicio.

* **Nombres de métodos del backend:** controladores y servicios usan español y camelCase. En todas las entidades, las operaciones CRUD se llaman `listar`, `crear`, `obtenerDetalle`, `actualizar` y `eliminar`, respectivamente; los servicios usan los mismos nombres que sus controladores. Las acciones especiales usan un verbo y un propósito claros, por ejemplo `listarEnRevision`, `descargar`, `iniciarSesion` y `obtenerDatos`.

* **Rutas explícitas:** como los controladores usan nombres de dominio en español en lugar de las acciones convencionales de Laravel (`index`, `store`, `show`, `update`, `destroy`), cada método se vincula explícitamente en `routes/api.php`. Las URLs y sus nombres públicos no dependen del nombre interno del método.

* **Validación siempre en la API**, aunque la web o la app también validen. Cada endpoint que recibe datos usa un FormRequest y el controlador trabaja con `validated()`.

* **Autenticación:** todas las rutas usan auth:sanctum, salvo POST /auth/login, /auth/verify-code, /auth/resend-code, /auth/forgot-password y /auth/reset-password.

* **Autorización en el servidor:** los controladores autorizan cada acción con una Policy. Las consultas también se filtran por el alcance del usuario. Un usuario ve solo los instrumentos de las instituciones de su usuario\_perfil, salvo que tenga alcance global (id\_institucion \= null).

* **Respuestas:** los recursos individuales devuelven sus campos directamente; los listados paginados usan `data`, `links` y `meta`. No se agrega un envoltorio `ok` ni se duplica `data`.

* **Transacciones:** toda operación que escribe en más de una tabla va dentro de DB::transaction.

* **Cambios de estado:** solo los hace el servicio del circuito, que valida la transición, registra historial\_estado con su fundamento y genera las notificaciones.

* **Auditoría de acciones:** las acciones relevantes y las descargas se registran en usuario\_instrumento.

* **Concurrencia:** el cliente envía la version que leyó. Si no coincide con la de la base, la API responde **409**; si coincide, guarda y suma 1\.

* **Archivos:** se guardan en un disco privado; solo PDF de hasta 20 MB (mimes:pdf\|max:20480); se calcula el SHA-256 al subirlos; se descargan solo por un endpoint que verifica permisos. La marca en los metadatos del PDF la hace la API.

* **Exportación CSV:** las celdas que empiezan con \=, \+, \- o @ se escriben con un ' adelante, para que no se ejecuten como fórmulas.

* **Secretos:** solo en .env. .env.example lleva todas las variables, pero sin valores secretos.

## **4.4 Respuestas**

| Código | Cuándo |
| :---- | :---- |
| 200 | Consulta o actualización correcta |
| 201 | Recurso creado |
| 204 | Acción correcta sin contenido (por ejemplo, logout) |
| 401 | Falta el token o no es válido |
| 403 | Autenticado pero sin permiso (o usuario suspendido) |
| 404 | No existe o está fuera del alcance del usuario |
| 409 | Conflicto de versión (otro usuario editó antes) |
| 422 | Error de validación: { message, errors: { campo: \[...\] } } |
| 429 | Demasiados intentos (throttle) |

* Los errores siempre vuelven en JSON (configurado en bootstrap/app.php), con mensajes en español.

* Los listados se paginan con ?page=; el JSON incluye `data`, `links` y `meta`; 15 elementos por página, salvo que el TP pida otra cosa (por ejemplo, "máximo 10 movimientos").

## **4.5 Autenticación (implementada)**

| Paso | Endpoint | Resultado |
| :---- | :---- | :---- |
| 1\. Email y contraseña | POST /api/auth/login | Genera un código de 6 dígitos (vence en 10 min, sirve una vez) y lo envía por mail simulado. Devuelve id\_desafio. |
| 2\. Código MFA | POST /api/auth/verify-code | Devuelve el token de Sanctum y el usuario. |
| Usuario actual | GET /api/auth/me | Datos del usuario logueado. |
| Cerrar sesión | POST /api/auth/logout | Revoca solo el token de ese dispositivo. |

* El token no vence y hay uno por dispositivo: eso cubre "múltiples accesos" y "una vez que se loguea no se pide más".

* La biometría no pasa por la API: la app guarda el token cifrado en el celular y pide la huella para usarlo.

* Con APP\_DEBUG=true, el login devuelve el código en codigo\_debug para probar desde la app. En producción ese campo vuelve vacío.

* Login y verificación permiten 5 intentos por minuto. Un usuario suspendido no puede ingresar.

# **5\. App móvil (Expo / React Native)**

## **5.1 Arquitectura**

Organización **por funcionalidad** (cada parte de la app tiene su carpeta) combinada con **Atomic Design** para los componentes compartidos, que es requisito del TP.

mobile/src/  
  app/                 pantallas y rutas de expo-router (delgadas)  
    (auth)/            login, código de verificación  
    (app)/             home, buscador, firmador, perfil, identidad...  
  features/            una carpeta por funcionalidad  
    auth/              api.ts, hooks/, components/, types.ts  
    convenios/  
    firma/  
    comentarios/  
    perfil/  
    identidad/  
    notificaciones/  
  components/          UI compartida (Atomic Design)  
    atoms/  
    molecules/  
    organisms/  
  services/            api-client, almacenamiento seguro, notificaciones  
  context/             sesión, tema y tamaño de letra  
  theme/               colores claro/oscuro, escalas de letra, espaciados  
  hooks/  utils/  types/

## **5.2 Atomic Design**

| Nivel | Qué es | Ejemplos |
| :---- | :---- | :---- |
| Átomo | Elemento mínimo, sin lógica de negocio | Boton, Texto, CampoTexto, Icono, Insignia |
| Molécula | Combinación chica de átomos | CampoConEtiqueta, BuscadorHeader, FilaDocumento |
| Organismo | Bloque completo de una pantalla | TarjetaConvenio, ArbolConvenio, FormularioLogin |
| Pantalla | Ruta de app/ que arma organismos | app/(auth)/login.tsx |

## **5.3 Reglas**

* **Las pantallas no llaman a \`fetch\`:** usan hooks de su funcionalidad, que a su vez usan el api-client.

* **Un único \`api-client\`:** agrega Authorization: Bearer y Accept: application/json; si recibe 401, borra el token y vuelve al login.

* **URL de la API** en la variable EXPO\_PUBLIC\_API\_URL del archivo mobile/.env (con su .env.example). En el emulador de Android: http\://10.0.2.2:8000/api.

* **El token se guarda en \`expo-secure-store\`**, nunca en AsyncStorage. La biometría se pide con expo-local-authentication.

* **Colores y tamaños siempre del \`theme\`.** Nada de colores ni tamaños de letra fijos en los componentes; así funcionan el modo oscuro y el tamaño de letra para toda la app.

* **Cada pantalla contempla sus estados:** cargando, vacío, error y sin conexión.

* **Sin conexión:** solo se ven los convenios pendientes de firma (guardados localmente). El buscador, los comentarios, la firma y el registro de identidad muestran que no hay conexión. Sin sesión iniciada no se puede entrar.

* **Accesibilidad:** accessibilityLabel en botones que solo tienen ícono, buen contraste y áreas táctiles de al menos 44 px.

* **TypeScript estricto**, sin any. Imports con el alias @/.

* **Preferencias** (tamaño de letra, tema) y datos biométricos quedan solo en el dispositivo.

# **6\. Cliente web (Next.js)**

La web sigue los mismos principios que la app: componentes compartidos, un único cliente HTTP y ninguna regla de negocio propia.

* **Cliente HTTP:** las llamadas se centralizan en `web/src/app/lib/api.js`; los componentes no llaman a `fetch` directamente.

* **Paginación:** el cliente interpreta `data`, `links` y `meta`. Si una pantalla necesita el listado completo, recorre las páginas mediante el helper correspondiente.

* **URL de la API:** se configura con `NEXT_PUBLIC_API_URL`; no se escriben direcciones de backend directamente en los componentes.

* **Sin conexión:** se resuelve con IndexedDB, como pide el TP.

# **7\. Git y trabajo en equipo**

* main siempre tiene que funcionar. No se trabaja directo sobre main.

* **Ramas:** feature/\<descripcion\>, fix/\<descripcion\>, docs/\<descripcion\>. Ejemplo: feature/login-movil.

* **Commits:** tipo: descripción en español. Tipos: feat, fix, refactor, test, docs, chore. Ejemplo: feat: agrega verificación de código MFA. Evitar mensajes como "algo" o "fix".

* **Pull requests:** describen qué cambia y cómo probarlo; los revisa otro integrante; los tests tienen que pasar antes de unir.

* **No se suben:** .env, vendor/, node\_modules/, bases de datos ni archivos subidos por usuarios.

# **8\. Puesta en marcha**

## **Backend — primera vez**

Con MySQL iniciado en Laragon y la base gestion\_convenios creada (vacía):

cd backend  
composer install  
copy .env.example .env  
php artisan key:generate  
php artisan migrate \--seed  
php artisan serve \--host=0.0.0.0

## **Backend — después de cada pull**

cd backend  
composer install  
php artisan migrate:fresh \--seed     (borra los datos locales)

Usuario de prueba: test@example.com / password.

## **Tests del backend**

Los tests usan SQLite en memoria. Si el PHP de Laragon no tiene SQLite activado:

php \-d extension=pdo\_sqlite \-d extension=sqlite3 vendor/bin/phpunit

## **App móvil**

cd mobile  
npm install  
npx expo start

# **9\. Definición de terminado**

Una funcionalidad está terminada cuando cumple todo esto:

1. Si cambia el modelo: migración actualizada, con los campos de auditoría que correspondan (sección 3.2).

2. Validación en un FormRequest y autorización en una Policy.

3. Tests de Feature: caso correcto, error de validación y falta de permiso.

4. Errores en JSON con mensajes en español.

5. En web y app: estados de carga, vacío, error y sin conexión; modo oscuro y tamaño de letra funcionando.

6. Endpoint documentado y, si hubo una decisión nueva, agregada a la sección 10\.

7. Revisado por otro integrante en un pull request.

# **10\. Registro de decisiones**

| Tema | Decisión | Motivo |
| :---- | :---- | :---- |
| Usuarios | Tabla usuario (se eliminó users). La contraseña está en contrasena. Sin "recordarme". | Coherencia con el DER en español |
| Unidades | No hay tabla unidad: una unidad es una institucion con es\_interna \= true. Las internas tienen latitud y longitud. | El TP trata a la UNLPam y sus unidades como partes; evita duplicar datos |
| Unidad responsable | instrumento.id\_institucion: una sola por instrumento. | Define el alcance por unidad, los filtros y las estadísticas |
| Partes firmantes | Tabla parte\_firmante (N:N con fecha\_firma por parte). Mínimo 2 partes para aprobar. | Puede haber más de dos partes |
| Tipos de instrumento | Catálogo tipo\_instrumento (nombre, ambito, categoria) con 5 tipos. | Escalable; permite filtrar por pasantía o por marco |
| Renovación, sustitución, adenda, específico | Son relaciones: instrumento\_vinculo.tipo\_vinculo (especifico\_de, modifica, renueva, sustituye). El nuevo instrumento tiene ficha propia. | El TP pide no alterar el antecedente |
| Observación vs. comentario | Tablas separadas. Observación: revisión formal (pendiente / respondida / resuelta, con quién respondió). Comentario: conversación libre. | Distintos ciclos de vida y campos |
| Comentarios ofensivos | es\_ofensivo. La API devuelve "comentario ofensivo" y guarda el texto original solo para auditoría. | Lo pide el TP móvil |
| Revisión asignada | Se asigna a la unidad. Se crea una notificación para cada revisor de esa unidad. | Sin columnas extra; cumple el TP |
| Firma | Tabla firma: autoridad (id\_usuario), firmado\_en (null \= pendiente), latitud, longitud, imagen y hash. | Firma en la app con fecha, hora y ubicación |
| Login | Email y contraseña → código MFA (mail simulado) → token Sanctum sin vencimiento, uno por dispositivo. Biometría local. | TP móvil: múltiples accesos, MFA, no volver a pedir login |
| QR | El QR lleva instrumento.uuid, no el id ni el código. | Referencia segura y no adivinable |
| Concurrencia | instrumento.version (bloqueo optimista, respuesta 409). | El TP pide no pisar cambios más recientes |
| Archivos | Sin updated\_at; la fecha de carga es created\_at. | Se conservan las cargas anteriores |
| URLs | En inglés, como las nombra el TP. | Pedido explícito del TP |

# **11\. Pendientes conocidos**

* Trait que complete solos created\_by, updated\_by y deleted\_by con el usuario logueado (todavía no está implementado).

* AuthController valida dentro del controlador: hay que pasarlo a FormRequest para cumplir la sección 4\.

* Definir cómo se detecta un comentario ofensivo (por ejemplo, una lista de palabras configurable).

* Envío del código MFA por push o SMS (hoy solo hay mail simulado).

* Reorganizar mobile/src según la sección 5.1 (hoy es la plantilla de Expo).

* Crear el cliente web y completar la sección 6\.

* Acordar la fecha en que se congela el modelo de datos (sección 3.3).