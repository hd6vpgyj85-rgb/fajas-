# SETUP — Puesta en marcha de beautylat

Checklist para dejar el sitio funcionando de punta a punta. Desde
`/admin/configuracion` se edita, sin tocar código: nombre del negocio,
logo, título y foto del hero, foto de la tienda, imágenes de cada
categoría, WhatsApp, teléfono, correo, dirección, horario, mapa y redes
sociales. Las categorías en sí (fajas/ropa/bolsas/perfumes/accesorios) y
los colores de marca siguen fijos en el código.

## 1. Crear el proyecto de Supabase

- [ ] Crea un proyecto nuevo en [Supabase](https://supabase.com).
- [ ] Ve a **SQL Editor** → pega el contenido completo de
      [`supabase/schema.sql`](./supabase/schema.sql) → **Run**.
- [ ] Ve a **Storage** y confirma que el bucket `product-images` exista y
      esté marcado como público (el script lo crea junto con sus políticas
      de subida; solo revisa que aparezca).
- [ ] Verifica en **Table Editor** que `loyalty_tiers` tenga los 3 niveles
      de ejemplo sembrados por el script.

## 2. Crear el usuario administrador

- [ ] Supabase Dashboard → **Authentication → Users → Add user**. Crea el
      correo y contraseña del primer administrador (no hay pantalla de
      registro público por seguridad).
- [ ] Confirma que puedes entrar en `/admin/login` con ese correo y
      contraseña una vez el sitio esté corriendo.

## 3. Variables de entorno

- [ ] Copia `.env.example` como `.env.local` y completa con los valores de
      Supabase → **Project Settings → API**:
      ```
      VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
      VITE_SUPABASE_ANON_KEY=tu-anon-public-key
      ```
- [ ] En Cloudflare Workers → tu proyecto → **Settings → Variables and
      Secrets**, agrega esas mismas dos variables. `.env.local` no se sube
      al repositorio, así que el build en la nube no las ve sin este paso.

## 4. Personalizar el negocio

- [ ] Entra a **`/admin/configuracion`** y completa nombre, logo, hero,
      foto de la tienda, imágenes de categorías, WhatsApp, contacto,
      dirección, horario, mapa y redes sociales. Se guarda en la tabla
      `site_settings` y se refleja de inmediato en el sitio público (el
      logo del header, el título de la pestaña del navegador, etc.).
- [ ] **`src/styles/theme.css`**: colores de marca (`--color-primary`,
      `--color-accent`, etc.) y tipografías (`--font-display`,
      `--font-body`) — no son editables desde el admin a propósito, para
      no complicar el build.
- [ ] **`public/favicon.svg`**, **`public/og-image.svg`** e **`index.html`**
      (`<title>`, meta `description`, Open Graph): SEO estático, se sirve
      antes de que la app cargue datos de Supabase, por eso no es editable
      desde el admin (el título de la pestaña sí se actualiza en cuanto
      carga la app, vía JavaScript).
- [ ] **`src/pages/public/TerminosPage.tsx`** y
      **`src/pages/public/PrivacidadPage.tsx`**: textos legales de ejemplo,
      reemplázalos por los reales del negocio.
- [ ] **`wrangler.jsonc`**, campo `name`: debe coincidir con el nombre del
      Worker creado en Cloudflare.

## 5. Cargar el catálogo real

Desde `/admin/productos`:

- [ ] Carga productos uno por uno con **+ Nuevo**, o usa
      **Importar** para subir el `.zip` o `products_export.csv` de una
      exportación de Shopify (revisa categoría, marca y nivel de cada
      producto antes de confirmar la importación).
- [ ] Ajusta los niveles del programa de fidelidad desde
      `/admin/clientes` (sección plegable al final de la página).
- [ ] Revisa cupones de ejemplo en `/admin/cupones`.

## 6. Desplegar en Cloudflare Workers

- [ ] Conecta el repositorio en Cloudflare Workers (Compute → Workers →
      Import a repository / Git integration).
- [ ] Build command: `npm install && npm run build`.
- [ ] Output/assets directory: `dist`.
- [ ] Agrega las variables de entorno del paso 3.
- [ ] Despliega. Cada push a la rama configurada vuelve a construir el
      sitio automáticamente.

## 7. Verificación final

- [ ] Entra a `/admin/login` y confirma acceso al panel.
- [ ] Haz un pedido de prueba desde el checkout y confirma que abre
      WhatsApp con el mensaje completo y que el pedido aparece en
      `/admin/pedidos`.
- [ ] Escanea el QR de fidelidad generado al finalizar el pedido y confirma
      que abre `/fidelidad/:token` correctamente.
- [ ] Revisa el sitio en un celular real antes de entregarlo al cliente
      final.
