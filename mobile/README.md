# App móvil — compilación y notificaciones push

La app usa Expo Notifications y Expo Push Service. Android entrega los push mediante FCM; el backend conserva las notificaciones en la bandeja y encola los envíos push cuando se registra cada firma.

## Requisitos

- Node.js 20 o superior y npm.
- Una cuenta de Expo con acceso al proyecto EAS `convenios-unlpam`.
- Android Studio o un dispositivo Android físico para instalar y probar la app.
- Acceso a la API del backend desde la computadora y el teléfono.

## Preparar el proyecto

Desde esta carpeta (`mobile`):

```bash
npm ci
```

Crear el archivo local de variables de entorno:

```powershell
Copy-Item .env.example .env
```

En `.env`, configurar la dirección de la API. Para probar desde el teléfono, usar la IP local de la computadora que ejecuta Laravel, no `localhost`:

```env
EXPO_PUBLIC_API_URL=http://192.168.X.X:8000/api
```

El backend debe estar accesible desde la misma red. Revisar también el firewall de Windows si el teléfono no logra conectarse.

## Acceso EAS para cada desarrollador

El proyecto ya está asociado al proyecto EAS de la organización mediante `owner` y `projectId` en `app.json`. Cada desarrollador puede iniciar sesión con su propia cuenta de Expo:

```bash
npx eas-cli@latest login
npx eas-cli@latest whoami
```

El administrador del proyecto `convenios-unlpam` debe invitar esa cuenta y darle acceso al proyecto EAS. No ejecutar `eas init` ni cambiar `owner` o `extra.eas.projectId` para una compilación del equipo: eso crearía o asociaría otro proyecto y sus tokens push no corresponderían a las credenciales compartidas.

## Credenciales Android para push

La configuración de Android ya apunta a `google-services.json` y el proyecto incluye `expo-notifications`. El administrador debe configurar una clave de servicio **FCM V1** una sola vez en las credenciales del proyecto EAS:

1. En Firebase Console, abrir el proyecto de la app y entrar a **Project settings → Service accounts**.
2. Generar una clave privada nueva de cuenta de servicio y guardarla fuera del repositorio.
3. En Expo, abrir el proyecto `convenios-unlpam` y entrar a **Project settings → Credentials → Android**.
4. Agregar la clave en **FCM V1 service account key**. También se puede usar `npx eas-cli@latest credentials -p android` y seguir las opciones para configurar esa clave.

La clave JSON de cuenta de servicio es secreta: no subirla a Git, no enviarla por chat y no guardarla dentro del repositorio. El `.gitignore` móvil ignora archivos de cuenta de servicio. El `google-services.json` de la app es distinto de esa clave privada.

## Compilar e iniciar la app

Compilación de desarrollo para instalar en un teléfono o emulador Android:

```bash
npx eas-cli@latest build --platform android --profile development
```

Una vez instalado el development build, iniciar Metro:

```bash
npx expo start --dev-client
```

Para generar un APK de prueba interna:

```bash
npx eas-cli@latest build --platform android --profile preview
```

La configuración de perfiles está en `eas.json`. Las notificaciones push requieren un dispositivo real o un emulador Android con Google Play Services y las credenciales FCM cargadas en EAS. Al iniciar sesión, la app solicita permiso, registra el token Expo en la API y queda lista para recibir notificaciones.

## Probar el flujo de firma y los push

En otra terminal, desde `backend`, ejecutar la API y un worker de cola:

```bash
php artisan serve --host=0.0.0.0 --port=8000
php artisan queue:work
```

El push se envía después de confirmar la firma en la base de datos. En cada firma reciben un aviso el creador y los firmantes asignados, incluido quien acaba de firmar. Los usuarios Consulta reciben el aviso cuando se completan todas las firmas y el convenio queda firmado. Si el dispositivo no tiene token push, el aviso igualmente queda en la bandeja de la app.

## Referencias oficiales

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Credenciales FCM V1 para Android](https://docs.expo.dev/push-notifications/fcm-credentials/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
