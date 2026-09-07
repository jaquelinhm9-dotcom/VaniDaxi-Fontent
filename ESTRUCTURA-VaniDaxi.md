# VaniDaxi — estructura actual

Esta es la estructura real de la versión reconstruida que vive en `main`.

## Identidad visual
- Icono principal: `public/vanidaxi-icon.png`
- Paleta: rosa → fucsia → morado → índigo
- La identidad visual existente se conserva; no se reemplaza por una plantilla nueva.

## Aplicación
- `App.jsx` — páginas, componentes, navegación, autenticación y flujos de marketplace.
- `styles.css` — estilos globales y responsive.
- `main.jsx` — entrada React y `BrowserRouter` con la base de GitHub Pages.
- `vite.config.js` — base `/VaniDaxi-Fontent/`.

## Datos y backend
- `supabaseClient.js` — cliente Supabase y fallback cuando no hay variables configuradas.
- `marketplace.js` — productos, perfiles, favoritos, publicaciones y pedidos.
- `schema.sql` — tablas, índices, trigger de perfiles y políticas RLS.
- `api.js` — helper para endpoints HTTP opcionales mediante `VITE_API_URL`.

## Flujo comprador
Inicio → Categorías → Producto → Carrito → Checkout → Pedido

La creación del pedido valida los productos contra Supabase y recalcula el total con los precios actuales de la base de datos.

## Flujo vendedor
Vendedor → Publicar producto → Catálogo del vendedor → Pedidos

`/vendedor` está protegido y sirve como entrada al área de vendedor. La publicación de productos usa el usuario autenticado como `seller_id`.

## Cuenta
Cuenta → Perfil → Pedidos → Favoritos → Configuración → Cerrar sesión

## Despliegue
- `.github/workflows/deploy.yml` construye con Vite y publica en GitHub Pages.
- El proyecto usa la base `/VaniDaxi-Fontent/`.
- `public/vanidaxi-icon.png` es el recurso de logo utilizado durante la ejecución de React.

## Variables de entorno
Usa `.env.example` como plantilla para el entorno local. Nunca subas valores reales de Supabase al repositorio.
