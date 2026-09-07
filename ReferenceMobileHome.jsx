import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CART_KEY = "vanidaxi_cart";
const FAVORITES_KEY = "vanidaxi_favorites";

const products = [
  { id: "3", name: "Tenis deportivos", price: 599, oldPrice: 999, discount: 40, category: "Moda", rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=88" },
  { id: "4", name: "Audífonos inalámbricos", price: 799, oldPrice: 1199, discount: 35, category: "Tecnología", rating: 4.8, reviews: 176, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=88" },
  { id: "1", name: "Smartwatch", price: 1299, oldPrice: 1899, discount: 30, category: "Tecnología", rating: 4.8, reviews: 124, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=88" },
  { id: "5", name: "Mochila urbana", price: 699, oldPrice: 999, discount: 30, category: "Accesorios", rating: 4.6, reviews: 98, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=88" },
  { id: "6", name: "Playera básica", price: 349, oldPrice: 499, discount: 30, category: "Moda", rating: 4.7, reviews: 145, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=88" },
  { id: "7", name: "Perfume importado", price: 799, oldPrice: 1199, discount: 25, category: "Belleza", rating: 4.8, reviews: 87, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=88" },
  { id: "8", name: "Gorra casual", price: 299, oldPrice: 399, discount: 25, category: "Moda", rating: 4.7, reviews: 62, image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=700&q=88" },
  { id: "9", name: "Reloj de lujo", price: 1999, oldPrice: 2499, discount: 20, category: "Accesorios", rating: 4.9, reviews: 41, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=88" },
  { id: "10", name: "Sudadera", price: 599, oldPrice: 899, discount: 33, category: "Moda", rating: 4.8, reviews: 112, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=88" },
];

const categories = [
  ["Moda", "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=88"],
  ["Hombre", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=88"],
  ["Mujer", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=88"],
  ["Tecnología", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=88"],
  ["Hogar", "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=500&q=88"],
  ["Calzado", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=88"],
  ["Belleza", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=88"],
  ["Deportes", "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=88"],
];

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    cart: <><path d="M3 4h2l2.5 11a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6" /><circle cx="10" cy="20" r="1.2" /><circle cx="18" cy="20" r="1.2" /></>,
    heart: <path d="M20.8 8.8c0 5.3-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
    arrow: <path d="m9 18 6-6-6-6" />,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

function price(value) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);
}

function ReferenceProductCard({ product, favorite, onFavorite, onAdd, onOpen }) {
  return (
    <article className="reference-product-card">
      <button className="reference-product-image" onClick={() => onOpen(product.id)} aria-label={`Ver ${product.name}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.discount && <span className="reference-discount">-{product.discount}%</span>}
      </button>
      <button className={`reference-heart ${favorite ? "active" : ""}`} onClick={() => onFavorite(product.id)} aria-label="Favorito"><Icon name="heart" size={16} /></button>
      <div className="reference-product-copy">
        <span className="reference-product-category">{product.category}</span>
        <strong>{product.name}</strong>
        <span className="reference-rating">★ {product.rating} <small>({product.reviews})</small></span>
        <div className="reference-price-row"><b>{price(product.price)}</b><del>{price(product.oldPrice)}</del></div>
        <button className="reference-add" onClick={() => onAdd(product)}>Agregar al carrito</button>
      </div>
    </article>
  );
}

function SectionTitle({ title, subtitle, onMore }) {
  return <div className="reference-section-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{onMore && <button onClick={onMore}>Ver todo →</button>}</div>;
}

export default function ReferenceMobileHome() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState(() => readJson(FAVORITES_KEY, []));

  useEffect(() => {
    const refresh = () => {
      const cart = readJson(CART_KEY, []);
      setCartCount(Array.isArray(cart) ? cart.reduce((n, item) => n + Number(item?.quantity || 1), 0) : 0);
    };
    refresh();
    const timer = setInterval(refresh, 500);
    return () => clearInterval(timer);
  }, []);

  const dayOffers = useMemo(() => products.slice(0, 3), []);
  const flash = useMemo(() => products.slice(1, 4), []);
  const best = useMemo(() => products.slice(5, 8), []);
  const recommended = useMemo(() => products.slice(6, 9), []);

  function submitSearch(e) {
    e.preventDefault();
    const value = search.trim();
    navigate(value ? `/buscar?q=${encodeURIComponent(value)}` : "/productos");
  }

  function addToCart(product) {
    const cart = readJson(CART_KEY, []);
    const next = Array.isArray(cart) ? [...cart] : [];
    const index = next.findIndex((item) => String(item.id) === String(product.id));
    if (index >= 0) next[index] = { ...next[index], quantity: Number(next[index].quantity || 0) + 1 };
    else next.push({ ...product, quantity: 1 });
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    setCartCount(next.reduce((n, item) => n + Number(item?.quantity || 0), 0));
  }

  function toggleFavorite(id) {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }

  return (
    <main className="reference-mobile-home">
      <header className="reference-mobile-header">
        <div className="reference-mobile-brand"><img src={`${import.meta.env.BASE_URL}vanidaxi-icon.png`} alt="VaniDaxi" /><strong>VaniDaxi</strong></div>
        <div className="reference-mobile-actions">
          <button onClick={() => navigate("/notificaciones")} aria-label="Notificaciones"><Icon name="bell" size={19} /><b>3</b></button>
          <button onClick={() => navigate("/carrito")} aria-label="Carrito"><Icon name="cart" size={19} />{cartCount > 0 && <b>{cartCount}</b>}</button>
        </div>
      </header>

      <form className="reference-mobile-search" onSubmit={submitSearch}>
        <Icon name="search" size={16} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar productos, marcas..." aria-label="Buscar productos" />
      </form>

      <section className="reference-hero">
        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=88" alt="Ofertas VaniDaxi" />
        <div><span>HASTA 50% OFF</span><h1>Tu estilo,<br />sin límites.</h1><p>Moda, tecnología, hogar y mucho más.</p><button onClick={() => navigate("/ofertas")}>Ver ofertas →</button></div>
      </section>

      <section className="reference-category-row">
        {categories.slice(0, 5).map(([name, image]) => <button key={name} onClick={() => navigate(`/categoria/${encodeURIComponent(name)}`)}><img src={image} alt="" /><span>{name}</span></button>)}
      </section>

      <section className="reference-section">
        <SectionTitle title="Ofertas del día" onMore={() => navigate("/ofertas")} />
        <div className="reference-product-grid three">{dayOffers.map((p) => <ReferenceProductCard key={p.id} product={p} favorite={favorites.includes(p.id)} onFavorite={toggleFavorite} onAdd={addToCart} onOpen={(id) => navigate(`/producto/${id}`)} />)}</div>
      </section>

      <section className="reference-mini-banner"><div><b>Para él</b><strong>Estilo, tecnología<br />y rendimiento.</strong><button onClick={() => navigate("/productos")}>Ver productos →</button></div></section>

      <section className="reference-section">
        <SectionTitle title="Categorías destacadas" onMore={() => navigate("/categorias")} />
        <div className="reference-featured-categories">{categories.slice(5, 9).map(([name, image]) => <button key={name} onClick={() => navigate(`/categoria/${encodeURIComponent(name)}`)}><img src={image} alt="" /><span>{name}</span></button>)}</div>
      </section>

      <section className="reference-section"><SectionTitle title="Ofertas relámpago" onMore={() => navigate("/ofertas")} /><div className="reference-product-grid three">{flash.map((p) => <ReferenceProductCard key={p.id} product={p} favorite={favorites.includes(p.id)} onFavorite={toggleFavorite} onAdd={addToCart} onOpen={(id) => navigate(`/producto/${id}`)} />)}</div></section>
      <section className="reference-section"><SectionTitle title="Más vendidos" onMore={() => navigate("/productos")} /><div className="reference-product-grid three">{best.map((p) => <ReferenceProductCard key={p.id} product={p} favorite={favorites.includes(p.id)} onFavorite={toggleFavorite} onAdd={addToCart} onOpen={(id) => navigate(`/producto/${id}`)} />)}</div></section>
      <section className="reference-section"><SectionTitle title="Recomendados para ti" onMore={() => navigate("/productos")} /><div className="reference-product-grid three">{recommended.map((p) => <ReferenceProductCard key={p.id} product={p} favorite={favorites.includes(p.id)} onFavorite={toggleFavorite} onAdd={addToCart} onOpen={(id) => navigate(`/producto/${id}`)} />)}</div></section>

      <footer className="reference-mobile-brand-footer"><img src={`${import.meta.env.BASE_URL}vanidaxi-icon.png`} alt="" /><strong>VaniDaxi</strong><span>Todo lo que necesitas,<br />en un solo lugar.</span></footer>
    </main>
  );
}
