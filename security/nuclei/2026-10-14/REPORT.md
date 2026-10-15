# Resultado: dashboard-frontend

Revision analizada: `9d1cd8a4e68e9b54a442ec64af9af33d07a0706d`. Fecha local: 2026-10-14 (America/Mexico_City).

Coincidencias Nuclei: **12**. Cada matcher/endpoint puede generar una fila; no equivale a ese numero de vulnerabilidades distintas.

| Severidad Nuclei | Coincidencias |
| --- | ---: |
| critical | 0 |
| high | 0 |
| medium | 0 |
| low | 0 |
| info | 12 |

## Inventario completo

| Plantilla | Matcher | Endpoint | Severidad |
| --- | --- | --- | --- |
| nginx-version |  | http://frontend | info |
| http-missing-security-headers | x-frame-options | http://frontend | info |
| http-missing-security-headers | x-permitted-cross-domain-policies | http://frontend | info |
| http-missing-security-headers | cross-origin-embedder-policy | http://frontend | info |
| http-missing-security-headers | cross-origin-opener-policy | http://frontend | info |
| http-missing-security-headers | permissions-policy | http://frontend | info |
| http-missing-security-headers | x-content-type-options | http://frontend | info |
| http-missing-security-headers | referrer-policy | http://frontend | info |
| http-missing-security-headers | cross-origin-resource-policy | http://frontend | info |
| http-missing-security-headers | strict-transport-security | http://frontend | info |
| http-missing-security-headers | content-security-policy | http://frontend | info |
| nginx-eol |  | http://frontend | info |

## Evaluacion

- Cabeceras ausentes: evidencia de configuracion, de severidad informativa en la plantilla. Priorizar CSP, nosniff, proteccion de framing y Referrer-Policy donde correspondan; validar compatibilidad antes de cambiar politicas entre origenes. HSTS necesita un despliegue HTTPS previo.
- Version de Nginx: banner confirmado; la alerta upstream EOL necesita evaluacion de parches Debian. Paquete instalado: `1.22.1-9+deb12u10`. No se confirma una CVE por el banner.
- No se realizaron correcciones en esta entrega. Conservar esta linea base para comparar con la fase posterior de commits granulares.

Consultar `../README.md` para cobertura y limitaciones. `scan.log` contiene conteos, duracion y finalizacion; `errors.log` registra errores de solicitudes. Los JSONL son la salida de Nuclei, sin solicitudes/respuestas crudas. `connectivity-before.txt` y `connectivity-after.txt` prueban conectividad desde el escaner.
