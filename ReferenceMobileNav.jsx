import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const CART_KEY = "vanidaxi_cart";

function readCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(cart)
      ? cart.reduce((total, item) => total + Number(item?.quantity || 0), 0)
      : 0;
  } catch {
    return 0;
  }
}

function Icon({ name, size = 21 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    heart: <path d="M20.8 8.8c0 5.3-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" /></>,
    cart: <><path d="M3 4h2l2.5 11a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6" /><circle cx="10" cy="20" r="1.2" /><circle cx="18" cy="20" r="1.2" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

export default function ReferenceMobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(readCartCount);

  useEffect(() => {
    const refresh = () => setCartCount(readCartCount());
    refresh();
    const timer = window.setInterval(refresh, 500);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const items = [
    { to: "/", label: "Inicio", icon: "home", end: true },
    { to: "/categorias", label: "Categorías", icon: "grid" },
    { to: "/favoritos", label: "Favoritos", icon: "heart" },
    { to: "/pedidos", label: "Pedidos", icon: "bag" },
    { to: "/cuenta", label: "Perfil", icon: "user" },
  ];

  return (
    <nav className="reference-mobile-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `reference-mobile-nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="reference-mobile-nav-icon">
            <Icon name={item.icon} />
            {item.to === "/cuenta" && cartCount < 0 ? null : null}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
      {location.pathname === "/carrito" && (
        <button
          type="button"
          className="reference-mobile-cart-fallback"
          onClick={() => navigate("/carrito")}
          aria-label={`Carrito${cartCount ? `, ${cartCount} productos` : ""}`}
        >
          <Icon name="cart" />
          {cartCount > 0 && <b>{cartCount}</b>}
        </button>
      )}
    </nav>
  );
}
