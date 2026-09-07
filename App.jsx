import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "./supabaseClient";
import { createOrder, createProduct, getFavorites, getProfile, getProducts, isSupabaseAvailable, setFavorite, upsertProfile } from "./marketplace";

/* =========================================================
   VaniDaxi
   Marketplace
   ========================================================= */

const CART_KEY = "vanidaxi_cart";
const FAVORITES_KEY = "vanidaxi_favorites";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "";

/* =========================================================
   CATEGORÍAS
   Imágenes reales, tarjetas compactas.
   ========================================================= */

const categories = [
  {
    name: "Moda",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Hogar",
    image:
      "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Belleza",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Autos y Motos",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Comida",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Juguetes",
    image:
      "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Deportes",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=88",
  },
];

const offerBanners = [
  {
    kicker: "Ofertas de temporada",
    title: "Tu estilo, sin límites.",
    text: "Moda, tecnología, hogar y mucho más con precios especiales.",
    button: "Ver ofertas",
    link: "/ofertas",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=88",
  },
  {
    kicker: "Tecnología",
    title: "Tecnología que te conecta.",
    text: "Los mejores dispositivos y accesorios a un mejor precio.",
    button: "Explorar tecnología",
    link: "/categoria/Tecnología",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=88",
  },
  {
    kicker: "Ofertas relámpago",
    title: "Precios especiales por tiempo limitado.",
    text: "Aprovecha descuentos en productos seleccionados.",
    button: "Ver ofertas",
    link: "/ofertas",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=88",
  },
  {
    kicker: "Para todos",
    title: "Todo lo que necesitas, en un solo lugar.",
    text: "Productos para hombres, mujeres, familias y todos los estilos.",
    button: "Ver productos",
    link: "/productos",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=88",
  },
];


/* =========================================================
   PRODUCTOS DEMO
   ========================================================= */

const initialProducts = [
  {
    id: "1",
    name: "Smartwatch Pro",
    price: 899,
    oldPrice: 1299,
    rating: 4.8,
    reviews: 124,
    discount: 31,
    category: "Tecnología",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=90",
    description:
      "Smartwatch moderno con pantalla táctil, monitoreo de actividad y diseño elegante.",
    specifications: [
      "Pantalla táctil",
      "Monitoreo de actividad",
      "Bluetooth",
      "Resistente a salpicaduras",
    ],
  },
  {
    id: "2",
    name: "Licuadora Profesional",
    price: 749,
    oldPrice: 999,
    rating: 4.7,
    reviews: 86,
    discount: 25,
    category: "Hogar",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=90",
    description:
      "Licuadora de alta potencia ideal para preparar bebidas, salsas y alimentos.",
    specifications: [
      "Alta potencia",
      "Vaso de gran capacidad",
      "Cuchillas de acero",
      "Varias velocidades",
    ],
  },
  {
    id: "3",
    name: "Tenis Urbanos",
    price: 599,
    oldPrice: 799,
    rating: 4.9,
    reviews: 213,
    discount: 25,
    category: "Moda",
    type: "Popular",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=90",
    description:
      "Tenis urbanos cómodos y versátiles para uso diario.",
    specifications: [
      "Diseño urbano",
      "Suela antiderrapante",
      "Material ligero",
      "Uso diario",
    ],
  },
  {
    id: "4",
    name: "Audífonos Bluetooth",
    price: 449,
    oldPrice: 699,
    rating: 4.8,
    reviews: 176,
    discount: 36,
    category: "Tecnología",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=90",
    description:
      "Audífonos inalámbricos con sonido envolvente y batería de larga duración.",
    specifications: [
      "Bluetooth",
      "Micrófono integrado",
      "Batería de larga duración",
      "Estuche de carga",
    ],
  },
];

/* =========================================================
   UTILIDADES
   ========================================================= */

function formatPrice(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* =========================================================
   ICONOS
   ========================================================= */

function Icon({ name, size = 21, stroke = 2 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.5 11a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6" />
        <circle cx="10" cy="20" r="1.2" />
        <circle cx="18" cy="20" r="1.2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
      </>
    ),
    heart: (
      <path d="M20.8 8.8c0 5.3-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l1 13H4L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-1.9 1.9-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.7v.2h-2.7v-.2a1.8 1.8 0 0 0-1.1-1.7 1.8 1.8 0 0 0-2 .4l-.1.1L7 17.1l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.7-1.1h-.2v-2.7h.2a1.8 1.8 0 0 0 1.7-1.1 1.8 1.8 0 0 0-.4-2L7 8l1.9-1.9.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1.1-1.7v-.2h2.7v.2a1.8 1.8 0 0 0 1.1 1.7 1.8 1.8 0 0 0 2-.4l.1-.1L19.9 8l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.7 1.1h.2v2.7h-.2a1.8 1.8 0 0 0-1.7 1.1Z" />
      </>
    ),
    message: (
      <>
        <path d="M4 5h16v11H8l-4 4V5Z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    back: <path d="m15 18-6-6 6-6" />,
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    trash: (
      <>
        <path d="M5 7h14" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 7V4h6v3" />
        <path d="m7 7 1 14h8l1-14" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.4 2.4 0 0 1 4.6 1c0 1.7-2.3 2-2.3 3.4" />
        <path d="M12 17h.01" />
      </>
    ),
  };

  return <svg {...common}>{icons[name] || icons.help}</svg>;
}

/* =========================================================
   LOGO
   Concepto elegido:
   círculo + carrito + bolsa interior.
   ========================================================= */

function VaniLogo({ compact = false }) {
  const logoUrl = `${import.meta.env.BASE_URL}vanidaxi-icon.png`;

  return (
    <Link
      to="/"
      className={`vani-logo ${compact ? "vani-logo-compact" : ""}`}
      aria-label="VaniDaxi"
    >
      <img className="vani-logo-image" src={logoUrl} alt="VaniDaxi" />
    </Link>
  );
}

/* =========================================================
   ESTILOS
   ========================================================= */

/* =========================================================
   HEADER
   ========================================================= */

function Header({
  cartCount,
  search,
  setSearch,
  onMenu,
  onCart,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 35);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function submitSearch(event) {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate("/");
      return;
    }

    navigate(`/buscar?q=${encodeURIComponent(value)}`);
  }

  return (
    <>
      <header className={`top-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="page-shell header-inner">
          <button
            className="icon-button menu-button"
            onClick={onMenu}
            aria-label="Abrir menú"
          >
            <Icon name="menu" />
          </button>

          <div className="header-brand">
            <VaniLogo />
          </div>

          <form className="header-search" onSubmit={submitSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="¿Qué estás buscando?"
              aria-label="Buscar"
            />
            <button
              className="search-button"
              type="submit"
              aria-label="Buscar"
            >
              <Icon name="search" size={18} stroke={2.2} />
            </button>
          </form>

          <div className="header-actions">
            <button
              className="icon-button notification-button"
              onClick={() => navigate("/notificaciones")}
              aria-label="Notificaciones"
            >
              <Icon name="bell" />
              <span className="notification-count">3</span>
            </button>

            <button
              className="icon-button"
              onClick={onCart}
              aria-label="Carrito"
            >
              <Icon name="cart" />
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <nav className="category-nav">
        <div className="page-shell category-nav-inner">
          <button
            className={`category-link ${
              location.pathname === "/" ? "active" : ""
            }`}
            onClick={() => navigate("/")}
          >
            Inicio
          </button>

          {categories.map((category) => (
            <button
              key={category.name}
              className="category-link"
              onClick={() =>
                navigate(
                  `/categoria/${encodeURIComponent(category.name)}`
                )
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

function ProductCard({
  product,
  favorite,
  onFavorite,
  onAdd,
}) {
  const navigate = useNavigate();

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          className="product-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />

        {product.discount > 0 && (
          <span className="discount">
            -{product.discount}%
          </span>
        )}

        <button
          className={`favorite-button ${
            favorite ? "active" : ""
          }`}
          onClick={() => onFavorite(product.id)}
          aria-label="Favorito"
        >
          <Icon name="heart" size={18} />
        </button>
      </div>

      <div className="product-info">
        <div className="product-category">
          {product.category}
        </div>

        <div className="product-name">
          {product.name}
        </div>

        <div className="rating">
          <Icon name="star" size={12} />
          <strong>{product.rating}</strong>
          <span>({product.reviews})</span>
        </div>

        <div className="price-row">
          <span className="price">
            {formatPrice(product.price)}
          </span>

          {product.oldPrice && (
            <span className="old-price">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="product-actions">
          <button
            className="add-button"
            onClick={() => onAdd(product)}
          >
            Agregar al carrito
          </button>

          <button
            className="view-button"
            onClick={() =>
              navigate(`/producto/${product.id}`)
            }
            aria-label="Ver producto"
          >
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   OFERTAS
   ========================================================= */

function OfferCarousel({ navigate }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % offerBanners.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  const slide = offerBanners[active];

  return (
    <div className="promo-carousel" aria-label="Ofertas destacadas">
      <article
        className="promo-slide"
        style={{ "--promo-image": `url(${slide.image})` }}
      >
        <div className="promo-slide-content">
          <span className="promo-slide-kicker">{slide.kicker}</span>
          <h1>{slide.title}</h1>
          <p>{slide.text}</p>
          <button
            className="promo-slide-button"
            onClick={() => navigate(slide.link)}
          >
            {slide.button} →
          </button>
        </div>
        <div className="promo-dots" aria-label="Seleccionar oferta">
          {offerBanners.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={`promo-dot ${index === active ? "active" : ""}`}
              onClick={() => setActive(index)}
              aria-label={`Mostrar oferta ${index + 1}`}
            />
          ))}
        </div>
      </article>
    </div>
  );
}

/* =========================================================
   HOME
   ========================================================= */

function HomePage({ products, favorites, onFavorite, onAdd }) {
  const navigate = useNavigate();
  const pool = products.length ? products : initialProducts;
  const dayOffers = pool.slice(0, 4);
  const best = pool.slice().reverse().slice(0, 4);
  const recommended = [...pool, ...initialProducts].slice(0, 4);
  const categoryItems = categories.slice(0, 8);

  const productStrip = (items, sectionClass = "") => (
    <div className={`product-strip ${sectionClass}`}>
      {items.map((product, index) => (
        <ProductCard
          key={`${sectionClass}-${product.id}-${index}`}
          product={product}
          favorite={favorites.includes(product.id)}
          onFavorite={onFavorite}
          onAdd={onAdd}
        />
      ))}
    </div>
  );

  return (
    <main className="page-shell home-page">
      <section className="home-hero-section">
        <OfferCarousel navigate={navigate} />
      </section>

      <section className="section section-tight">
        <div className="section-heading">
          <div>
            <h2>Categorías</h2>
            <p>Encuentra lo que buscas sin importar tu estilo.</p>
          </div>
          <button className="text-link" onClick={() => navigate("/categorias")}>
            Ver todas →
          </button>
        </div>

        <div className="home-category-strip">
          {categoryItems.map((category) => (
            <button
              key={category.name}
              className="home-category-item"
              onClick={() => navigate(`/categoria/${encodeURIComponent(category.name)}`)}
            >
              <span className="home-category-icon">
                <img src={category.image} alt="" loading="lazy" />
              </span>
              <span className="home-category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section section-tight">
        <div className="section-heading">
          <div><h2>Ofertas del día</h2><p>Descuentos seleccionados para ti.</p></div>
          <button className="text-link" onClick={() => navigate("/ofertas")}>Ver todo →</button>
        </div>
        {productStrip(dayOffers, "day-offers")}
      </section>

      <section className="section section-tight">
        <div className="section-heading">
          <div><h2>Ofertas relámpago</h2><p>Precios especiales por tiempo limitado.</p></div>
          <button className="text-link" onClick={() => navigate("/ofertas")}>Ver todo →</button>
        </div>
        {productStrip(best, "flash-offers")}
      </section>

      <section className="section section-tight">
        <div className="section-heading">
          <div><h2>Más vendidos</h2><p>Lo que más están eligiendo otros compradores.</p></div>
          <button className="text-link" onClick={() => navigate("/productos")}>Ver todo →</button>
        </div>
        {productStrip(best, "best-sellers")}
      </section>

      <section className="section section-tight">
        <div className="section-heading">
          <div><h2>Recomendados para ti</h2><p>Selecciones que pueden encajar contigo.</p></div>
          <button className="text-link" onClick={() => navigate("/productos")}>Ver todo →</button>
        </div>
        {productStrip(recommended, "recommended")}
      </section>

      <section className="section section-tight">
        <div className="section-heading">
          <div><h2>Categorías destacadas</h2><p>Explora productos por interés.</p></div>
          <button className="text-link" onClick={() => navigate("/categorias")}>Ver todo →</button>
        </div>
        <div className="featured-category-grid">
          {categoryItems.slice(0, 4).map((category) => (
            <button
              key={`featured-${category.name}`}
              className="featured-category-card"
              onClick={() => navigate(`/categoria/${encodeURIComponent(category.name)}`)}
            >
              <img src={category.image} alt={category.name} loading="lazy" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section section-tight">
        <div className="promo-wide">
          <div>
            <span className="promo-wide-kicker">VENDE EN VANIDAXI</span>
            <h2>Convierte lo que ya no usas en una nueva oportunidad.</h2>
            <p>Publica tus productos y llega a compradores desde VaniDaxi.</p>
            <button className="primary-button" onClick={() => navigate("/publicar")}>Publicar producto</button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   NOTIFICACIONES
   ========================================================= */

function NotificationsPage() {
  return (
    <main className="page-shell inner-page">
      <div className="section-heading">
        <div>
          <h1 className="page-title">Notificaciones</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Aquí aparecerán tus novedades, ofertas y avisos de VaniDaxi.
          </p>
        </div>
      </div>

      <div className="page-card">
        <div className="empty">
          <div className="empty-icon">
            <Icon name="bell" />
          </div>
          <strong>No tienes notificaciones nuevas.</strong>
          <p>
            Cuando tengas novedades sobre tus pedidos, favoritos u ofertas,
            aparecerán aquí.
          </p>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   CATEGORÍAS
   ========================================================= */

function CategoriesPage() {
  const navigate = useNavigate();

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">Categorías</h1>
      <p className="page-subtitle">
        Explora todas las categorías disponibles en VaniDaxi.
      </p>

      <div className="categories-grid">
        {categories.map((category) => (
          <button
            key={category.name}
            className="category-card"
            onClick={() =>
              navigate(
                `/categoria/${encodeURIComponent(
                  category.name
                )}`
              )
            }
          >
            <img
              className="category-image"
              src={category.image}
              alt={category.name}
            />

            <div className="category-name">
              {category.name}
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}

/* =========================================================
   CATEGORY PAGE
   ========================================================= */

function CategoryPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const { name } = useParams();

  const categoryName = decodeURIComponent(name || "");

  const category = categories.find(
    (item) =>
      item.name.toLowerCase() ===
      categoryName.toLowerCase()
  );

  const filtered = products.filter(
    (product) =>
      product.category.toLowerCase() ===
      categoryName.toLowerCase()
  );

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        {category?.name || categoryName}
      </h1>

      <p className="page-subtitle">
        Productos disponibles en esta categoría.
      </p>

      {filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite={favorites.includes(product.id)}
              onFavorite={onFavorite}
              onAdd={onAdd}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">
            <Icon name="bag" />
          </div>

          <strong>
            Todavía no hay productos aquí.
          </strong>

          <p>
            Pronto encontrarás nuevos productos en esta
            categoría.
          </p>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   PRODUCTS PAGE
   ========================================================= */

function ProductsPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Todos los productos
      </h1>

      <p className="page-subtitle">
        Explora el catálogo completo de VaniDaxi.
      </p>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            favorite={favorites.includes(product.id)}
            onFavorite={onFavorite}
            onAdd={onAdd}
          />
        ))}
      </div>
    </main>
  );
}

/* =========================================================
   OFFERS
   ========================================================= */

function OffersPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const offers = products.filter(
    (product) => Number(product.discount) > 0
  );

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">Ofertas</h1>

      <p className="page-subtitle">
        Aprovecha los productos con descuento.
      </p>

      <div className="product-grid">
        {offers.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            favorite={favorites.includes(product.id)}
            onFavorite={onFavorite}
            onAdd={onAdd}
          />
        ))}
      </div>
    </main>
  );
}

/* =========================================================
   SEARCH
   ========================================================= */

function SearchPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";

  const results = products.filter((product) => {
    const text = `
      ${product.name}
      ${product.category}
      ${product.description}
    `.toLowerCase();

    return text.includes(query.toLowerCase());
  });

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Resultados
      </h1>

      <p className="page-subtitle">
        Buscando: <strong>{query}</strong>
      </p>

      {results.length ? (
        <div className="product-grid">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite={favorites.includes(product.id)}
              onFavorite={onFavorite}
              onAdd={onAdd}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">
            <Icon name="search" />
          </div>

          <strong>
            No encontramos resultados.
          </strong>

          <p>
            Intenta buscar con otro término.
          </p>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   PRODUCT DETAIL
   ========================================================= */

function ProductPage({
  products,
  onAdd,
  favorites,
  onFavorite,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <main className="page-shell inner-page">
        <div className="empty">
          <strong>
            Producto no encontrado.
          </strong>

          <br />

          <button
            className="primary-button"
            onClick={() => navigate("/productos")}
            style={{ marginTop: 15 }}
          >
            Ver productos
          </button>
        </div>
      </main>
    );
  }

  function add() {
    for (let i = 0; i < quantity; i += 1) {
      onAdd(product);
    }
  }

  return (
    <main className="page-shell inner-page">
      <button
        className="text-link"
        onClick={() => navigate(-1)}
        style={{
          border: 0,
          background: "transparent",
          marginBottom: 18,
          padding: 0,
        }}
      >
        ← Volver
      </button>

      <div className="detail-grid">
        <img
          className="detail-image"
          src={product.image}
          alt={product.name}
        />

        <div>
          <div className="detail-category">
            {product.category}
          </div>

          <h1 className="detail-title">
            {product.name}
          </h1>

          <div className="rating">
            <Icon name="star" size={14} />
            <strong>{product.rating}</strong>
            <span>
              {product.reviews} reseñas
            </span>
          </div>

          <div className="price-row">
            <span className="price">
              {formatPrice(product.price)}
            </span>

            {product.oldPrice && (
              <span className="old-price">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <p className="detail-description">
            {product.description}
          </p>

          <ul className="spec-list">
            {product.specifications?.map((spec) => (
              <li key={spec}>
                <Icon name="check" size={16} />
                {spec}
              </li>
            ))}
          </ul>

          <div className="quantity-row">
            <div className="quantity">
              <button
                onClick={() =>
                  setQuantity((value) =>
                    Math.max(1, value - 1)
                  )
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={() =>
                  setQuantity((value) => value + 1)
                }
              >
                +
              </button>
            </div>

            <button
              className={`favorite-button ${
                favorites.includes(product.id)
                  ? "active"
                  : ""
              }`}
              onClick={() => onFavorite(product.id)}
              style={{
                position: "static",
                border: "1px solid #eee",
              }}
            >
              <Icon name="heart" />
            </button>
          </div>

          <div className="form-actions">
            <button
              className="primary-button"
              onClick={add}
            >
              Agregar al carrito
            </button>

            <button
              className="secondary-button"
              onClick={() => {
                add();
                navigate("/carrito");
              }}
            >
              Comprar ahora
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   CART PAGE
   ========================================================= */

function CartPage({ cart, onRemove, onQuantity }) {
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  if (!cart.length) {
    return (
      <main className="page-shell inner-page">
        <h1 className="page-title">Tu carrito</h1>

        <div className="empty" style={{ marginTop: 20 }}>
          <div className="empty-icon">
            <Icon name="cart" />
          </div>

          <strong>
            Tu carrito está vacío.
          </strong>

          <p>
            Agrega productos para comenzar tu compra.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/productos")}
            style={{ marginTop: 12 }}
          >
            Explorar productos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">Tu carrito</h1>

      <p className="page-subtitle">
        Revisa tus productos antes de continuar.
      </p>

      <div className="page-card">
        <div className="cart-list">
          {cart.map((item) => (
            <div
              className="cart-item"
              key={item.id}
            >
              <img
                src={item.image}
                alt={item.name}
              />

              <div>
                <h3>{item.name}</h3>

                <p>
                  {formatPrice(item.price)}
                </p>

                <div
                  className="quantity"
                  style={{
                    marginTop: 7,
                    width: "fit-content",
                  }}
                >
                  <button
                    onClick={() =>
                      onQuantity(
                        item.id,
                        Math.max(
                          1,
                          item.quantity - 1
                        )
                      )
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      onQuantity(
                        item.id,
                        item.quantity + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="icon-button"
                onClick={() => onRemove(item.id)}
                aria-label="Eliminar"
              >
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-total">
          <div>
            <span>Total</span>
          </div>

          <strong>{formatPrice(total)}</strong>
        </div>

        <button
          className="primary-button"
          style={{
            width: "100%",
            marginTop: 16,
          }}
          onClick={() => navigate("/checkout")}
        >
          Continuar al pago
        </button>
      </div>
    </main>
  );
}

/* =========================================================
   CHECKOUT
   ========================================================= */

function CheckoutPage({ cart, user, onOrderCreated }) {
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    reference: "",
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        userId: user.id,
        customer: form,
        cart,
        total,
      });

      if (result.error) throw result.error;

      onOrderCreated?.(result.data);
      setSuccess(result.data?.id ? `Pedido creado: ${result.data.id}` : "Pedido creado correctamente.");
      navigate("/pedidos");
    } catch (submitError) {
      setError(submitError?.message || "No fue posible crear el pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart.length) {
    return (
      <main className="page-shell inner-page">
        <div className="empty">
          <strong>
            No hay productos para pagar.
          </strong>

          <button
            className="primary-button"
            style={{ marginTop: 14 }}
            onClick={() => navigate("/productos")}
          >
            Ir a productos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Finalizar compra
      </h1>

      <p className="page-subtitle">
        Completa tus datos para continuar.
      </p>

      <div className="detail-grid">
        <div className="page-card">
          <form
            className="form"
            onSubmit={submit}
          >
            <label>
              Nombre completo
              <input
                value={form.name}
                onChange={(e) =>
                  update("name", e.target.value)
                }
                required
              />
            </label>

            <label>
              Teléfono
              <input
                value={form.phone}
                onChange={(e) =>
                  update("phone", e.target.value)
                }
                required
              />
            </label>

            <label>
              Dirección
              <input
                value={form.address}
                onChange={(e) =>
                  update("address", e.target.value)
                }
                required
              />
            </label>

            <label>
              Ciudad
              <input
                value={form.city}
                onChange={(e) =>
                  update("city", e.target.value)
                }
                required
              />
            </label>

            <label>
              Referencia
              <textarea
                value={form.reference}
                onChange={(e) =>
                  update(
                    "reference",
                    e.target.value
                  )
                }
              />
            </label>

            {error && <div className="form-message error">{error}</div>}
            {success && <div className="form-message success">{success}</div>}

            <button
              className="primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Creando pedido..." : "Confirmar pedido"}
            </button>
          </form>
        </div>

        <div className="page-card">
          <h2 style={{ marginTop: 0 }}>
            Resumen
          </h2>

          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 10,
                padding: "9px 0",
                borderBottom:
                  "1px solid var(--line)",
                fontSize: 13,
              }}
            >
              <span>
                {item.name} × {item.quantity}
              </span>

              <strong>
                {formatPrice(
                  item.price * item.quantity
                )}
              </strong>
            </div>
          ))}

          <div className="cart-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   ACCOUNT
   ========================================================= */

function AccountPage({ user, onLogin, onLogout }) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <main className="page-shell inner-page">
        <h1 className="page-title">Mi cuenta</h1>

        <p className="page-subtitle">
          Inicia sesión para acceder a todas las
          funciones de tu cuenta.
        </p>

        <div className="page-card">
          <div className="options-grid">
            <button
              className="option-card"
              onClick={onLogin}
            >
              <span className="option-icon">
                <Icon name="user" />
              </span>

              <span>
                <strong>Iniciar sesión</strong>
                <span>
                  Accede a tu cuenta.
                </span>
              </span>
            </button>

            <button
              className="option-card"
              onClick={onLogin}
            >
              <span className="option-icon">
                <Icon name="plus" />
              </span>

              <span>
                <strong>Crear cuenta</strong>
                <span>
                  Regístrate en VaniDaxi.
                </span>
              </span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Mi cuenta
      </h1>

      <p className="page-subtitle">
        Administra tu cuenta y tus actividades.
      </p>

      <div className="options-grid">
        <AccountOption
          icon="user"
          title="Mi perfil"
          text="Información personal"
          to="/perfil"
        />

        <AccountOption
          icon="bag"
          title="Mis pedidos"
          text="Consulta tus compras"
          to="/pedidos"
        />

        <AccountOption
          icon="heart"
          title="Favoritos"
          text="Productos guardados"
          to="/favoritos"
        />

        <AccountOption
          icon="plus"
          title="Publicar producto"
          text="Vende en VaniDaxi"
          to="/publicar"
        />

        <AccountOption
          icon="message"
          title="Mensajes"
          text="Comunícate con vendedores"
          to="/mensajes"
        />

        <AccountOption
          icon="settings"
          title="Configuración"
          text="Preferencias de cuenta"
          to="/configuracion"
        />

        <AccountOption
          icon="help"
          title="Ayuda"
          text="Centro de ayuda"
          to="/ayuda"
        />
      </div>

      <button
        className="secondary-button"
        onClick={onLogout}
        style={{ marginTop: 20 }}
      >
        Cerrar sesión
      </button>
    </main>
  );
}

/* =========================================================
   ACCOUNT OPTION
   ========================================================= */

function AccountOption({
  icon,
  title,
  text,
  to,
}) {
  return (
    <Link className="option-card" to={to}>
      <span className="option-icon">
        <Icon name={icon} />
      </span>

      <span>
        <strong>{title}</strong>
        <span>{text}</span>
      </span>

      <Icon
        name="arrow"
        size={17}
        style={{ marginLeft: "auto" }}
      />
    </Link>
  );
}

/* =========================================================
   PROFILE
   ========================================================= */

function ProfilePage({ user }) {
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!user?.id) { setLoading(false); return () => {}; }
    getProfile(user.id).then(({ data }) => {
      if (!active) return;
      setForm({ full_name: data?.full_name || user.user_metadata?.name || "", phone: data?.phone || "" });
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { active = false; };
  }, [user]);

  async function save(event) {
    event.preventDefault();
    setSaving(true); setMessage(""); setError("");
    try {
      const { error: authError } = await supabase.auth.updateUser({ data: { name: form.full_name } });
      if (authError && isSupabaseAvailable) throw authError;
      const result = await upsertProfile(user.id, form);
      if (result.error && !result.unavailable) throw result.error;
      setMessage("Perfil actualizado correctamente.");
    } catch (saveError) {
      setError(saveError?.message || "No fue posible guardar los cambios.");
    } finally { setSaving(false); }
  }

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">Mi perfil</h1>
      <p className="page-subtitle">Información de tu cuenta VaniDaxi.</p>
      <div className="page-card">
        {loading ? <div className="empty"><p>Cargando perfil...</p></div> : (
          <form className="form" onSubmit={save}>
            <label>Correo electrónico<input value={user?.email || ""} readOnly /></label>
            <label>Nombre<input value={form.full_name} onChange={(e) => setForm((v) => ({ ...v, full_name: e.target.value }))} required /></label>
            <label>Teléfono<input value={form.phone} onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))} /></label>
            {message && <div className="form-message success">{message}</div>}
            {error && <div className="form-message error">{error}</div>}
            <button className="primary-button" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
          </form>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   FAVORITES
   ========================================================= */

function FavoritesPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const saved = products.filter((product) =>
    favorites.includes(product.id)
  );

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Favoritos
      </h1>

      <p className="page-subtitle">
        Tus productos guardados.
      </p>

      {saved.length ? (
        <div className="product-grid">
          {saved.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite
              onFavorite={onFavorite}
              onAdd={onAdd}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">
            <Icon name="heart" />
          </div>

          <strong>
            Todavía no tienes favoritos.
          </strong>

          <p>
            Toca el corazón de un producto para guardarlo.
          </p>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   ORDERS
   ========================================================= */

function OrdersPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!user?.id || !isSupabaseAvailable) { setLoading(false); return () => {}; }
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError(queryError.message); else setOrders(data || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, [user]);

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">Mis pedidos</h1>
      <p className="page-subtitle">Consulta el estado de tus compras.</p>
      {loading ? <div className="empty"><p>Cargando pedidos...</p></div> : error ? <div className="empty"><strong>No se pudieron cargar los pedidos.</strong><p>{error}</p></div> : orders.length ? (
        <div className="options-grid">
          {orders.map((order) => (
            <article className="option-card" key={order.id}>
              <span className="option-icon"><Icon name="bag" /></span>
              <span><strong>{formatPrice(order.total)}</strong><span>{new Date(order.created_at).toLocaleDateString("es-MX")} · {order.status}</span></span>
            </article>
          ))}
        </div>
      ) : <div className="empty"><div className="empty-icon"><Icon name="bag" /></div><strong>Todavía no tienes pedidos.</strong><p>Tus compras confirmadas aparecerán aquí.</p></div>}
    </main>
  );
}

/* =========================================================
   MESSAGES
   ========================================================= */

function MessagesPage() {
  return (
    <SimpleSectionPage
      title="Mensajes"
      subtitle="Todas tus conversaciones estarán aquí."
      icon="message"
      items={[
        [
          "Vendedores",
          "Consulta tus conversaciones con vendedores.",
        ],
        [
          "Compradores",
          "Responde a compradores interesados.",
        ],
        [
          "Soporte VaniDaxi",
          "Contacta al equipo de atención.",
        ],
      ]}
    />
  );
}

/* =========================================================
   SETTINGS
   ========================================================= */

function SettingsPage() {
  return (
    <SimpleSectionPage
      title="Configuración"
      subtitle="Personaliza tu experiencia en VaniDaxi."
      icon="settings"
      items={[
        [
          "Datos personales",
          "Administra tu información.",
        ],
        [
          "Notificaciones",
          "Controla qué avisos quieres recibir.",
        ],
        [
          "Privacidad",
          "Administra tus preferencias de privacidad.",
        ],
        [
          "Seguridad",
          "Protege tu cuenta.",
        ],
      ]}
    />
  );
}

/* =========================================================
   HELP
   ========================================================= */

function HelpPage() {
  return (
    <SimpleSectionPage
      title="Centro de ayuda"
      subtitle="Encuentra respuestas y formas de contactarnos."
      icon="help"
      items={[
        [
          "Preguntas frecuentes",
          "Respuestas a las preguntas más comunes.",
        ],
        [
          "Compras",
          "Ayuda con pedidos y pagos.",
        ],
        [
          "Ventas",
          "Ayuda para publicar y vender.",
        ],
        [
          "Contactar soporte",
          "Habla con nuestro equipo.",
        ],
      ]}
    />
  );
}

/* =========================================================
   SIMPLE SECTION
   ========================================================= */

function SimpleSectionPage({
  title,
  subtitle,
  icon,
  items,
}) {
  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        {title}
      </h1>

      <p className="page-subtitle">
        {subtitle}
      </p>

      <div className="options-grid">
        {items.map(([itemTitle, text]) => (
          <Link
            key={itemTitle}
            to={`/seccion/${encodeURIComponent(
              itemTitle
            )}`}
            className="option-card"
          >
            <span className="option-icon">
              <Icon name={icon} />
            </span>

            <span>
              <strong>{itemTitle}</strong>
              <span>{text}</span>
            </span>

            <Icon name="arrow" size={17} />
          </Link>
        ))}
      </div>
    </main>
  );
}

/* =========================================================
   GENERIC SUBSECTION
   ========================================================= */

function SubSectionPage() {
  const { name } = useParams();
  const title = decodeURIComponent(name || "");
  const content = {
    "Pedidos recientes": ["Revisa aquí tus pedidos actuales y su estado de entrega.", "Puedes volver a Mis pedidos para consultar el detalle de cada compra."],
    "Pedidos entregados": ["Aquí podrás consultar compras que ya fueron entregadas.", "Cuando el backend de pedidos esté activo, esta vista mostrará comprobantes y detalles."],
    "Devoluciones": ["Las devoluciones requerirán un pedido entregado y una solicitud válida.", "La política de devolución definitiva debe configurarse antes de abrir esta función al público."],
    "Vendedores": ["La mensajería comprador-vendedor está preparada como siguiente módulo.", "La tabla de conversaciones y las notificaciones deben activarse en Supabase antes de publicar esta función."],
    "Compradores": ["Como vendedor, aquí podrás responder consultas de compradores interesados.", "La conversación se asociará al producto y a los dos usuarios."],
    "Soporte VaniDaxi": ["Usa este espacio para contactar soporte.", WHATSAPP_NUMBER ? `WhatsApp: +${WHATSAPP_NUMBER}` : "Configura VITE_WHATSAPP_NUMBER para habilitar un contacto directo."],
    "Datos personales": ["Edita tu nombre y teléfono desde Mi perfil.", "Los cambios guardados con Supabase se mantienen asociados a tu cuenta."],
    "Notificaciones": ["Esta preferencia queda pendiente de conectar al centro de notificaciones.", "La estructura puede evolucionar junto con mensajes y pedidos."],
    "Privacidad": ["No compartas contraseñas ni claves privadas.", "Las reglas RLS de Supabase limitan los datos de perfil, favoritos y pedidos al usuario autenticado."],
    "Seguridad": ["Activa la recuperación de contraseña desde la pantalla de acceso.", "Mantén las claves de servicio fuera del frontend y de GitHub."],
    "Preguntas frecuentes": ["¿Cómo compro? Agrega productos al carrito y confirma el pedido.", "¿Cómo vendo? Inicia sesión y usa Publicar producto."],
    "Compras": ["El checkout crea pedidos cuando Supabase está configurado y el usuario está autenticado.", "El pago con tarjeta todavía requiere un proveedor de pagos y backend seguro."],
    "Ventas": ["Publicar producto guarda la publicación en Supabase cuando la tabla products existe.", "La gestión avanzada de inventario y ventas es el siguiente módulo."],
    "Contactar soporte": ["La información de contacto se puede centralizar aquí.", WHATSAPP_NUMBER ? `WhatsApp: +${WHATSAPP_NUMBER}` : "Falta configurar el número de WhatsApp en las variables de entorno."]
  };
  const [description, detail] = content[title] || ["Esta sección está disponible dentro de VaniDaxi.", "Estamos preparando los módulos avanzados para la siguiente etapa."];

  return (
    <main className="page-shell inner-page">
      <Link className="text-link" to="/cuenta" style={{ display: "inline-block", marginBottom: 18 }}>← Volver a mi cuenta</Link>
      <div className="page-card">
        <div className="empty" style={{ border: 0 }}>
          <div className="empty-icon"><Icon name="check" /></div>
          <h1 style={{ margin: "0 0 8px", fontSize: 25 }}>{title}</h1>
          <p>{description}</p>
          <p>{detail}</p>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SELL / PUBLISH
   ========================================================= */

function PublishPage({ onPublish, user }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Moda",
    image: "",
    description: "",
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!user) { navigate("/login"); return; }
    setLoading(true);
    const payload = {
      ...form, price: Number(form.price),
      image: form.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=90",
    };
    try {
      await onPublish(payload);
      navigate("/productos");
    } catch (publishError) {
      setError(publishError?.message || "No fue posible publicar el producto.");
    } finally { setLoading(false); }
  }

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Publicar producto
      </h1>

      <p className="page-subtitle">
        Crea una publicación para vender en VaniDaxi.
      </p>

      <div className="page-card">
        <form
          className="form"
          onSubmit={submit}
        >
          <label>
            Nombre del producto
            <input
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              required
            />
          </label>

          <label>
            Precio
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={(e) =>
                update("price", e.target.value)
              }
              required
            />
          </label>

          <label>
            Categoría
            <select
              value={form.category}
              onChange={(e) =>
                update("category", e.target.value)
              }
            >
              {categories.map((category) => (
                <option
                  key={category.name}
                  value={category.name}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Imagen
            <input
              value={form.image}
              onChange={(e) =>
                update("image", e.target.value)
              }
              placeholder="URL de la imagen"
            />
          </label>

          <label>
            Descripción
            <textarea
              value={form.description}
              onChange={(e) =>
                update(
                  "description",
                  e.target.value
                )
              }
              required
            />
          </label>

          {error && <div className="form-message error">{error}</div>}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </div>
    </main>
  );
}

/* =========================================================
   LOGIN / REGISTER
   ========================================================= */

function AuthPage({ onSuccess }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [notice, setNotice] = useState("");

  async function submit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setNotice("");

    try {
      if (forgotMode) {
        if (!email) throw new Error("Escribe tu correo electrónico.");
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/VaniDaxi-frontend/perfil`,
        });
        if (resetError) throw resetError;
        setNotice("Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo.");
        return;
      }
      if (mode === "register") {
        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
            },
          });

        if (signUpError) {
          throw signUpError;
        }

        if (data?.session) {
          onSuccess(data.session.user);
          navigate("/cuenta");
        } else {
          setNotice("Cuenta creada. Revisa tu correo si VaniDaxi solicita confirmación antes de iniciar sesión.");
          setMode("login");
        }
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          throw signInError;
        }

        onSuccess(data.user);
        navigate("/cuenta");
      }
    } catch (authError) {
      setError(
        authError?.message ||
          "No fue posible completar la operación."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell inner-page">
      <div
        style={{
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        <div className="page-card">
          <div
            style={{
              textAlign: "center",
              marginBottom: 22,
            }}
          >
            <VaniLogo />

            <h1
              className="page-title"
              style={{
                fontSize: 28,
                marginTop: 20,
              }}
            >
              {forgotMode ? "Restablecer contraseña" : mode === "login" ? "Bienvenido" : "Crear cuenta"}
            </h1>
          </div>

          <form
            className="form"
            onSubmit={submit}
          >
            {mode === "register" && !forgotMode && (
              <label>
                Nombre
                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </label>
            )}

            <label>
              Correo electrónico
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </label>

            {!forgotMode && (
              <label>
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </label>
            )}

            {notice && <div className="form-message success">{notice}</div>}

            {error && (
              <div
                style={{
                  padding: 11,
                  borderRadius: 10,
                  background: "#ffffff1f3",
                  color: "#b51f58",
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Procesando..."
                : forgotMode
                ? "Enviar enlace"
                : mode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
            </button>
          </form>

          {mode === "login" && (
            <button type="button" className="text-link" style={{ marginTop: 12 }} onClick={() => setForgotMode((v) => !v)}>
              {forgotMode ? "Volver al inicio de sesión" : "¿Olvidaste tu contraseña?"}
            </button>
          )}

          <button
            className="secondary-button"
            style={{
              width: "100%",
              marginTop: 10,
            }}
            onClick={() => {
              setForgotMode(false);
              setMode((current) => current === "login" ? "register" : "login");
            }}
          >
            {mode === "login"
              ? "Crear una cuenta"
              : "Ya tengo una cuenta"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   MENU LATERAL
   ========================================================= */

function SideMenu({ onClose, user }) {
  return (
    <div
      className="overlay"
      onClick={onClose}
    >
      <aside
        className="side-panel"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="menu-header">
          <strong>VaniDaxi</strong>

          <button
            className="icon-button"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="menu-list">
          <MenuLink
            to="/"
            icon="home"
            text="Inicio"
            onClose={onClose}
          />

          <MenuLink
            to="/categorias"
            icon="bag"
            text="Categorías"
            onClose={onClose}
          />

          <MenuLink
            to="/ofertas"
            icon="star"
            text="Ofertas"
            onClose={onClose}
          />

          <MenuLink
            to="/productos"
            icon="bag"
            text="Productos"
            onClose={onClose}
          />

          <MenuLink
            to="/publicar"
            icon="plus"
            text="Vender en VaniDaxi"
            onClose={onClose}
          />

          <MenuLink
            to="/vendedor"
            icon="bag"
            text="Panel de vendedor"
            onClose={onClose}
          />

          <MenuLink
            to="/favoritos"
            icon="heart"
            text="Favoritos"
            onClose={onClose}
          />

          <MenuLink
            to="/pedidos"
            icon="bag"
            text="Mis pedidos"
            onClose={onClose}
          />

          <MenuLink
            to="/mensajes"
            icon="message"
            text="Mensajes"
            onClose={onClose}
          />

          <MenuLink
            to="/cuenta"
            icon="user"
            text={user ? "Mi cuenta" : "Iniciar sesión"}
            onClose={onClose}
          />

          <MenuLink
            to="/configuracion"
            icon="settings"
            text="Configuración"
            onClose={onClose}
          />

          <MenuLink
            to="/ayuda"
            icon="help"
            text="Ayuda"
            onClose={onClose}
          />
        </div>
      </aside>
    </div>
  );
}

function MenuLink({
  to,
  icon,
  text,
  onClose,
}) {
  return (
    <Link
      to={to}
      className="menu-item"
      onClick={onClose}
    >
      <Icon name={icon} size={19} />
      <span>{text}</span>
    </Link>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */

function Footer() {
  return (
    <footer className="footer">
      <div className="page-shell footer-grid">
        <div>
          <VaniLogo />

          <p>
            VaniDaxi: todo en un solo lugar.
          </p>
        </div>

        <div>
          <h3>Comprar</h3>

          <div className="footer-links">
            <Link to="/productos">
              Productos
            </Link>

            <Link to="/categorias">
              Categorías
            </Link>

            <Link to="/ofertas">
              Ofertas
            </Link>
          </div>
        </div>

        <div>
          <h3>Vender</h3>

          <div className="footer-links">
            <Link to="/publicar">
              Publicar producto
            </Link>

            <Link to="/cuenta">
              Mi cuenta
            </Link>
          </div>
        </div>

        <div>
          <h3>Ayuda</h3>

          <div className="footer-links">
            <Link to="/ayuda">
              Centro de ayuda
            </Link>

            <Link to="/mensajes">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   MOBILE NAV
   ========================================================= */

function MobileBottomNav({ cartCount }) {
  return (
    <nav className="mobile-bottom">
      <NavLink to="/" end><Icon name="home" /><span>Inicio</span></NavLink>
      <NavLink to="/categorias"><Icon name="bag" /><span>Categorías</span></NavLink>
      <NavLink className="mobile-sell" to="/vendedor"><span className="mobile-sell-icon"><VaniLogo compact /></span><span>Vender</span></NavLink>
      <NavLink to="/favoritos"><Icon name="heart" /><span>Favoritos</span></NavLink>
      <NavLink to="/carrito"><span className="mobile-cart-wrap"><Icon name="cart" />{cartCount > 0 && <span className="cart-count">{cartCount}</span>}</span><span>Carrito</span></NavLink>
    </nav>
  );
}

function SellerDashboard({ user, products }) {
  const mine = products.filter((product) => product.sellerId && product.sellerId === user?.id);
  const fallbackMine = mine.length ? mine : products.slice(0, 4);
  const sales = fallbackMine.reduce((sum, product) => sum + Number(product.price || 0), 0);

  return (
    <main className="page-shell dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">ÁREA DEL VENDEDOR</span>
          <h1>Tu tienda, tus ventas, tu crecimiento.</h1>
          <p>Publica productos, revisa tus pedidos y mantén todo VaniDaxi bajo control.</p>
        </div>
        <VaniLogo compact />
      </section>

      <section className="dashboard-stats">
        <article><span>Productos</span><strong>{fallbackMine.length}</strong></article>
        <article><span>Ventas estimadas</span><strong>{formatPrice(sales)}</strong></article>
        <article><span>Pedidos</span><strong>0</strong></article>
      </section>

      <section className="dashboard-grid">
        <Link className="dashboard-card dashboard-card-primary" to="/publicar">
          <Icon name="plus" size={28} />
          <div><strong>Publicar producto</strong><span>Agrega un nuevo artículo a tu catálogo.</span></div>
          <Icon name="arrow" />
        </Link>
        <Link className="dashboard-card" to="/productos">
          <Icon name="bag" size={28} />
          <div><strong>Mis ventas</strong><span>Consulta tus productos publicados.</span></div>
          <Icon name="arrow" />
        </Link>
        <Link className="dashboard-card" to="/pedidos">
          <Icon name="cart" size={28} />
          <div><strong>Pedidos</strong><span>Da seguimiento a tus pedidos.</span></div>
          <Icon name="arrow" />
        </Link>
        <Link className="dashboard-card" to="/mensajes">
          <Icon name="message" size={28} />
          <div><strong>Mensajes</strong><span>Habla con tus compradores.</span></div>
          <Icon name="arrow" />
        </Link>
      </section>
    </main>
  );
}

function ProtectedRoute({ user, children }) {
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate("/login", { replace: true }); }, [user, navigate]);
  if (!user) return null;
  return children;
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const navigate = useNavigate();

  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState(() => readStorage(CART_KEY, []));
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY, []));
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => { saveStorage(CART_KEY, cart); }, [cart]);
  useEffect(() => { saveStorage(FAVORITES_KEY, favorites); }, [favorites]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [{ data: sessionData }, productResult] = await Promise.all([
        supabase.auth.getSession(),
        getProducts(),
      ]);
      if (!mounted) return;
      const sessionUser = sessionData?.session?.user || null;
      setUser(sessionUser);
      if (productResult?.data?.length) setProducts(productResult.data);
      if (sessionUser?.id) {
        const favoriteResult = await getFavorites(sessionUser.id);
        if (mounted && favoriteResult?.data) setFavorites(favoriteResult.data);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const nextUser = session?.user || null;
      setUser(nextUser);
      if (nextUser?.id) {
        const favoriteResult = await getFavorites(nextUser.id);
        if (mounted && favoriteResult?.data) setFavorites(favoriteResult.data);
      } else {
        setFavorites(readStorage(FAVORITES_KEY, []));
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  function addToCart(product) {
    setCart((current) => {
      const exists = current.find(
        (item) => item.id === product.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  Number(item.quantity) + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(id) {
    setCart((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  function changeQuantity(id, quantity) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  async function toggleFavorite(id) {
    const active = favorites.includes(id);
    setFavorites((current) => active ? current.filter((item) => item !== id) : [...current, id]);
    if (user?.id && isSupabaseAvailable) {
      const result = await setFavorite(user.id, id, !active);
      if (result.error) {
        setFavorites((current) => active ? [...current, id] : current.filter((item) => item !== id));
      }
    }
  }

  async function publishProduct(data) {
    const payload = { ...data, type: "Nuevo", specifications: [], stock: 1 };
    if (user?.id && isSupabaseAvailable) {
      const result = await createProduct(payload, user.id);
      if (result.error) throw result.error;
      if (result.data) { setProducts((current) => [result.data, ...current]); return; }
    }

    const newItem = {
      id: `local-${Date.now()}`,
      name: data.name || "Nuevo producto",
      price: Number(data.price) || 0,
      oldPrice: null, rating: 5, reviews: 0, discount: 0,
      category: data.category || "Moda", type: "Nuevo", image: data.image,
      description: data.description || "", specifications: [], stock: 1, sellerId: user?.id || null,
    };
    setProducts((current) => [newItem, ...current]);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  }

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.quantity),
        0
      ),
    [cart]
  );

  return (
    <div className="app">

      <Header
        cartCount={cartCount}
        search={search}
        setSearch={setSearch}
        onMenu={() => setShowMenu(true)}
        onCart={() => navigate("/carrito")}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/categorias"
          element={<CategoriesPage />}
        />

        <Route
          path="/categoria/:name"
          element={
            <CategoryPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/productos"
          element={
            <ProductsPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/ofertas"
          element={
            <OffersPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/buscar"
          element={
            <SearchPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/producto/:id"
          element={
            <ProductPage
              products={products}
              onAdd={addToCart}
              favorites={favorites}
              onFavorite={toggleFavorite}
            />
          }
        />

        <Route
          path="/carrito"
          element={
            <CartPage
              cart={cart}
              onRemove={removeFromCart}
              onQuantity={changeQuantity}
            />
          }
        />

        <Route path="/checkout" element={<ProtectedRoute user={user}><CheckoutPage cart={cart} user={user} onOrderCreated={() => { setCart([]); }} /></ProtectedRoute>} />

        <Route
          path="/notificaciones"
          element={<NotificationsPage />}
        />

        <Route
          path="/cuenta"
          element={
            <AccountPage
              user={user}
              onLogin={() =>
                navigate("/login")
              }
              onLogout={logout}
            />
          }
        />

        <Route
          path="/login"
          element={
            <AuthPage
              onSuccess={setUser}
            />
          }
        />

        <Route path="/perfil" element={<ProtectedRoute user={user}><ProfilePage user={user} /></ProtectedRoute>} />

        <Route
          path="/favoritos"
          element={
            <FavoritesPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route path="/pedidos" element={<ProtectedRoute user={user}><OrdersPage user={user} /></ProtectedRoute>} />

        <Route
          path="/mensajes"
          element={<MessagesPage />}
        />

        <Route
          path="/configuracion"
          element={<SettingsPage />}
        />

        <Route
          path="/ayuda"
          element={<HelpPage />}
        />

        <Route path="/publicar" element={<ProtectedRoute user={user}><PublishPage user={user} onPublish={publishProduct} /></ProtectedRoute>} />

        <Route path="/vendedor" element={<ProtectedRoute user={user}><SellerDashboard user={user} products={products} /></ProtectedRoute>} />

        <Route
          path="/seccion/:name"
          element={<SubSectionPage />}
        />

        <Route
          path="*"
          element={
            <main className="page-shell inner-page">
              <div className="empty">
                <div className="empty-icon">
                  <Icon name="help" />
                </div>

                <strong>
                  Página no encontrada.
                </strong>

                <p>
                  La opción que buscas no existe.
                </p>

                <button
                  className="primary-button"
                  onClick={() => navigate("/")}
                  style={{ marginTop: 12 }}
                >
                  Volver al inicio
                </button>
              </div>
            </main>
          }
        />
      </Routes>

      <Footer />

      <MobileBottomNav
        cartCount={cartCount}
      />

      {showMenu && (
        <SideMenu
          user={user}
          onClose={() =>
            setShowMenu(false)
          }
        />
      )}
    </div>
  );
}

export default App;
