# VaniDaxi — nueva arquitectura

Esta rama de `main` inicia una reconstrucción integral de VaniDaxi.

## Principios de arquitectura
- Superapp con dos experiencias principales: comprador y vendedor.
- El rol se define antes de exponer el contenido principal de la aplicación.
- El frontend se reconstruye desde una base limpia, sin arrastrar parches visuales ni componentes antiguos.
- Supabase, autenticación, hCaptcha, pagos y funciones backend existentes se conservan como infraestructura y se reintegrarán mediante interfaces limpias.
- Stripe y Mercado Pago quedan preparados para la capa comercial posterior.
- La arquitectura debe permitir incorporar una sección de Viajes en el futuro sin rehacer el núcleo.

## Orden de construcción
1. Bienvenida.
2. Selección comprador/vendedor.
3. Registro y autenticación.
4. Inicialización del perfil y rol.
5. Experiencia comprador.
6. Experiencia vendedor/negocio.
7. Superapp: módulos y servicios.
8. Pagos, pedidos, logística y devoluciones.
9. Viajes como módulo futuro desacoplado.

Cada etapa se valida con build verde antes de avanzar.
