# Notificación de pedidos por Gmail

`Code.gs` es un script de Google Apps Script (no se despliega desde este
repositorio ni desde Cloudflare — se pega directo en script.google.com con la
cuenta de Gmail del dueño de la tienda). Cuando entra un pedido, el sitio le
manda los datos a este script y el script envía un correo usando esa misma
cuenta de Gmail.

## Instalación

1. Entra a [script.google.com](https://script.google.com) con el Gmail del
   dueño.
2. **Proyecto nuevo** → borra el código de ejemplo → pega todo el contenido
   de `Code.gs`.
3. Cambia dentro del script:
   - `SECRETO` por una clave inventada por ti (cualquier texto).
   - `CORREO_DESTINO` por el Gmail donde quieres recibir los avisos.
4. **Implementar → Nueva implementación**:
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
5. Autoriza los permisos (Google va a pedir confirmar que confías en tu
   propio script).
6. Copia la URL que termina en `/exec`.

## Conectarlo al sitio

En el panel admin del sitio, ve a **Configuración → Notificación de pedidos**:

- **URL de notificación**: pega la URL `/exec` del paso 6.
- **Clave secreta**: el mismo valor que pusiste en `SECRETO`.

Guarda. Desde ese momento, cada pedido nuevo manda un correo a
`CORREO_DESTINO`.

## Si actualizas el script

Los cambios al código no quedan activos solos. Hay que ir a
**Implementar → Gestionar implementaciones → editar (lápiz) → Nueva
versión → Implementar**. La URL no cambia, así que no hay que tocar nada en
el admin del sitio.

## Límites

Gmail personal permite mandar hasta 100 correos al día con `MailApp`
(1500/día si es una cuenta de Google Workspace). Para una tienda pequeña es
de sobra.
