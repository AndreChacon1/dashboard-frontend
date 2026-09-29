# Checkpoint · Frontend

Dashboard de videojuegos con login LDAP/Keycloak, listado personal y pantalla de alta. Axios inyecta el JWT con un interceptor en `src/api.js`. El POST exitoso regresa al dashboard y consulta nuevamente el GET. Incluye búsqueda, filtros, estados de carga, errores y cierre de sesión.

## Ejecutar

Requiere Node.js 22.12+ o 24, el laboratorio LDAP/Keycloak en el puerto 8081 y el backend en el 3001.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Abrir **http://localhost:5173** (usar localhost, no 127.0.0.1, para coincidir con CORS). Usuario del laboratorio: `alice` / `alice123` o `bob` / `bob123`.

El realm debe permitir `http://localhost:5173` en Web origins del cliente `fastapi-api`. El archivo del laboratorio incluido ya lo configura; si tu realm existía, actualiza ese campo en la consola de Keycloak y guarda. Importar nuevamente no sobrescribe un realm existente.

## Flujo JWT

1. Login hace POST form-urlencoded al token endpoint del laboratorio. Keycloak valida la cuenta contra LDAP y devuelve `access_token`.
2. El token se guarda en sessionStorage y se elimina al salir o recibir 401.
3. La instancia Axios del backend agrega `Authorization: Bearer <JWT>` a GET y POST mediante un interceptor.
4. Network del navegador muestra el header completo; la consola confirma su presencia sin copiar el secreto completo al registro.

El request inicial de login no lleva JWT porque precisamente lo solicita. Los preflight OPTIONS tampoco llevan Bearer; son intercambios CORS del navegador. Los requests de datos GET/POST sí deben llevarlo.

Se usa el password grant habilitado por el laboratorio de clase. Está destinado a esta práctica local; para una aplicación pública se debe migrar a Authorization Code con PKCE y revisar el almacenamiento de sesión. El token no se renueva automáticamente: al expirar se solicita otro login.

```powershell
npm run build
```

La configuración `VITE_*` es pública. No introducir secretos de cliente en ella.
