# VaniDaxi

Marketplace frontend built with React + Vite + Supabase.

## Local development

1. Copy `.env.example` to `.env`.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. In Supabase SQL Editor, run `supabase/schema.sql`.
4. Install dependencies with `npm install`.
5. Start with `npm run dev`.

## GitHub Pages

The project is configured to build under `/VaniDaxi-frontend/` and deploy from the `main` branch using GitHub Actions. Add the two Supabase values as repository Actions secrets.

## Estado de la versión entregada

Esta versión conserva el diseño existente, elimina archivos duplicados, conecta productos/favoritos/perfiles/pedidos/publicaciones con Supabase cuando está configurado, protege rutas sensibles y añade recuperación de contraseña. Cuando Supabase no está configurado, el catálogo demo y la experiencia local siguen funcionando.

La integración de pagos con tarjeta/mercado-pago/Stripe no está activada todavía; el checkout crea pedidos con método `contra_entrega` hasta conectar un proveedor de pagos y su backend seguro.


### VaniDaxi 2.0
La identidad visual usa el icono VaniDaxi seleccionado y una paleta rosa/fucsia/morado/índigo. El panel `/vendedor` está protegido y sirve como punto de entrada al flujo de vendedor.
