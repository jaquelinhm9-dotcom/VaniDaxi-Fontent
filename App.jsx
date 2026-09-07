import React, { useMemo, useState } from 'react'

const products = [
  { id: 1, name: 'Bolso mini acolchado', price: 349, old: 499, tag: '−30%', category: 'Moda', tone: 'lilac', emoji: '👜' },
  { id: 2, name: 'Tenis urbanos blancos', price: 699, old: 899, tag: '−22%', category: 'Para él', tone: 'ice', emoji: '👟' },
  { id: 3, name: 'Audífonos inalámbricos', price: 529, old: 799, tag: '−34%', category: 'Tecnología', tone: 'rose', emoji: '🎧' },
  { id: 4, name: 'Vestido satinado', price: 579, old: 799, tag: '−28%', category: 'Moda', tone: 'peach', emoji: '👗' },
  { id: 5, name: 'Reloj clásico', price: 849, old: 1099, tag: '−23%', category: 'Para él', tone: 'sand', emoji: '⌚' },
  { id: 6, name: 'Set de skincare', price: 429, old: 599, tag: '−28%', category: 'Belleza', tone: 'mint', emoji: '🧴' },
]

const categories = [
  ['Moda', '◌'], ['Belleza', '✦'], ['Hogar', '⌂'], ['Tecnología', '⌁'], ['Para él', '◇'], ['Accesorios', '♡'],
]

function Icon({ children }) { return <span className="icon" aria-hidden="true">{children}</span> }

export default function App() {
  const [screen, setScreen] = useState('home')
  const [selected, setSelected] = useState(null)
  const [favorites, setFavorites] = useState(new Set([2]))
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [profileTab, setProfileTab] = useState('Pedidos')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(q)) : products
  }, [query])

  const toggleFav = id => setFavorites(prev => {
    const n = new Set(prev)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const addToCart = product => setCart(prev => [...prev, product])

  const openProduct = product => { setSelected(product); setScreen('detail') }

  return (
    <div className="app-shell">
      <div className="phone-frame">
        {screen !== 'detail' && screen !== 'profile' && screen !== 'cart' && (
          <header className="topbar">
            <div className="brand-row">
              <button className="brand" onClick={() => setScreen('home')} aria-label="Inicio">
                <span className="brand-mark">V</span><span>VaniDaxi</span>
              </button>
              <button className="top-icon" onClick={() => setScreen('profile')}><Icon>♙</Icon></button>
            </div>
            <div className="search-wrap">
              <Icon>⌕</Icon>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="¿Qué estás buscando hoy?" />
              <button className="filter-pill" onClick={() => setScreen('categories')}>☷</button>
            </div>
          </header>
        )}

        {screen === 'home' && (
          <main className="content home-screen">
            <section className="hero-ref">
              <div>
                <div className="eyebrow">TU ESTILO, TU MUNDO</div>
                <h1>Encuentra eso<br /><em>que te encanta.</em></h1>
                <p>Moda, belleza, tecnología y mucho más en un solo lugar.</p>
                <button className="hero-btn" onClick={() => setScreen('categories')}>Explorar ahora <span>→</span></button>
              </div>
              <div className="hero-orb"><div className="hero-girl">✿</div></div>
            </section>

            <section className="section-block compact">
              <div className="section-heading"><h2>Categorías</h2><button onClick={() => setScreen('categories')}>Ver todas</button></div>
              <div className="cat-row">
                {categories.map(([name, glyph]) => <button className="cat-item" key={name} onClick={() => { setQuery(name); setScreen('products') }}><span className="cat-circle">{glyph}</span><span>{name}</span></button>)}
              </div>
            </section>

            <section className="section-block">
              <div className="section-heading"><h2>Ofertas del día</h2><button onClick={() => setScreen('products')}>Ver todo</button></div>
              <div className="product-scroll">
                {filtered.slice(0, 4).map(p => <ProductCard key={p.id} product={p} favorite={favorites.has(p.id)} onFav={() => toggleFav(p.id)} onOpen={() => openProduct(p)} />)}
              </div>
            </section>

            <section className="promo-banner">
              <div><span>OFERTA RELÁMPAGO</span><strong>Hasta 50% OFF</strong><small>Solo por tiempo limitado</small></div>
              <button onClick={() => setScreen('products')}>Comprar</button>
            </section>

            <section className="section-block">
              <div className="section-heading"><h2>Para ti</h2><button onClick={() => setScreen('products')}>Más productos</button></div>
              <div className="product-grid">{products.slice(2).map(p => <ProductCard key={p.id} product={p} favorite={favorites.has(p.id)} onFav={() => toggleFav(p.id)} onOpen={() => openProduct(p)} />)}</div>
            </section>
          </main>
        )}

        {screen === 'categories' && <CategoryScreen onOpen={name => { setQuery(name); setScreen('products') }} />}
        {screen === 'products' && <ProductScreen products={filtered} favorites={favorites} onFav={toggleFav} onOpen={openProduct} />}
        {screen === 'detail' && selected && <DetailScreen product={selected} favorite={favorites.has(selected.id)} onFav={() => toggleFav(selected.id)} onAdd={() => addToCart(selected)} onBack={() => setScreen('home')} cartCount={cart.length} onCart={() => setScreen('cart')} />}
        {screen === 'cart' && <CartScreen cart={cart} onBack={() => setScreen('home')} />}
        {screen === 'profile' && <ProfileScreen profileTab={profileTab} setProfileTab={setProfileTab} onBack={() => setScreen('home')} />}

        {screen !== 'detail' && <BottomNav screen={screen} setScreen={setScreen} cartCount={cart.length} />}
      </div>
    </div>
  )
}

function ProductCard({ product, favorite, onFav, onOpen }) {
  return <article className="product-card" onClick={onOpen}>
    <div className={`product-art ${product.tone}`}><span>{product.emoji}</span><button className={`heart ${favorite ? 'liked' : ''}`} onClick={e => { e.stopPropagation(); onFav() }}>{favorite ? '♥' : '♡'}</button><span className="sale-tag">{product.tag}</span></div>
    <div className="product-copy"><small>{product.category}</small><h3>{product.name}</h3><div className="rating">★★★★★ <b>4.9</b></div><div className="price-row"><strong>${product.price}</strong><del>${product.old}</del></div></div>
  </article>
}

function CategoryScreen({ onOpen }) {
  return <main className="content inner-screen"><div className="screen-title"><button onClick={() => window.history.back()} className="back">‹</button><div><span>Explora</span><h1>Categorías</h1></div></div><div className="category-large-grid">{categories.concat([['Ofertas','%'],['Novedades','✧']]).map(([n,g]) => <button key={n} className="category-large" onClick={() => onOpen(n)}><span>{g}</span><strong>{n}</strong><small>Descubre más →</small></button>)}</div></main>
}

function ProductScreen({ products, favorites, onFav, onOpen }) {
  return <main className="content inner-screen"><div className="screen-title"><button onClick={() => window.history.back()} className="back">‹</button><div><span>VaniDaxi</span><h1>Productos</h1></div><button className="sort">↕</button></div><div className="result-row"><span>{products.length} productos</span><button>Más vendidos⌄</button></div><div className="product-grid full">{products.map(p => <ProductCard key={p.id} product={p} favorite={favorites.has(p.id)} onFav={() => onFav(p.id)} onOpen={() => onOpen(p)} />)}</div></main>
}

function DetailScreen({ product, favorite, onFav, onAdd, onBack, cartCount, onCart }) {
  return <main className="detail-screen"><div className={`detail-art ${product.tone}`}><button className="round-btn" onClick={onBack}>‹</button><button className="round-btn right" onClick={onFav}>{favorite ? '♥' : '♡'}</button><div>{product.emoji}</div><span className="detail-sale">{product.tag}</span></div><div className="detail-body"><div className="detail-kicker">{product.category} · En tendencia</div><h1>{product.name}</h1><div className="detail-rating">★★★★★ <strong>4.9</strong> <span>· 123 reseñas</span></div><div className="detail-price"><strong>${product.price}</strong><del>${product.old}</del><span>Envío gratis</span></div><p>Diseño pensado para tu día a día, con materiales seleccionados y un acabado cuidado.</p><div className="choice-row"><span>Color</span><div><button className="swatch one active"></button><button className="swatch two"></button><button className="swatch three"></button></div></div><button className="add-main" onClick={onAdd}>Agregar al carrito <span>${product.price}</span></button><button className="cart-link" onClick={onCart}>Ver carrito {cartCount > 0 ? `(${cartCount})` : ''}</button></div></main>
}

function CartScreen({ cart, onBack }) {
  const total = cart.reduce((s, p) => s + p.price, 0)
  return <main className="content inner-screen"><div className="screen-title"><button onClick={onBack} className="back">‹</button><div><span>VaniDaxi</span><h1>Mi carrito</h1></div></div>{cart.length === 0 ? <div className="empty"><div>🛍️</div><h2>Tu carrito está vacío</h2><p>Agrega productos que te encanten.</p><button className="primary" onClick={onBack}>Seguir comprando</button></div> : <><div className="cart-list">{cart.map((p, i) => <div className="cart-item" key={`${p.id}-${i}`}><div className={`mini-art ${p.tone}`}>{p.emoji}</div><div><strong>{p.name}</strong><small>{p.category}</small><b>${p.price}</b></div><span>×1</span></div>)}</div><div className="checkout"><div><span>Total</span><strong>${total}</strong></div><button className="primary">Continuar</button></div></>}</main>
}

function ProfileScreen({ profileTab, setProfileTab, onBack }) {
  return <main className="content profile-screen"><div className="profile-top"><button className="back" onClick={onBack}>‹</button><button className="dots">•••</button></div><div className="profile-head"><div className="avatar">J</div><h1>¡Hola, Jaquelin!</h1><p>Tu espacio VaniDaxi</p><div className="profile-stats"><span><b>12</b><small>Pedidos</small></span><span><b>7</b><small>Favoritos</small></span><span><b>3</b><small>Cupones</small></span></div></div><div className="tab-row">{['Pedidos','Favoritos','Cuenta'].map(t => <button className={profileTab === t ? 'active' : ''} onClick={() => setProfileTab(t)} key={t}>{t}</button>)}</div><div className="profile-panel">{profileTab === 'Pedidos' && <><div className="panel-title"><h2>Pedidos recientes</h2><span>Ver todos</span></div>{['#VD-10294 · Entregado','#VD-10251 · En camino','#VD-10188 · Entregado'].map((x,i)=><div className="order-row" key={x}><div className="order-icon">{i===1?'⌁':'✓'}</div><div><strong>{x.split(' · ')[0]}</strong><small>{x.split(' · ')[1]}</small></div><b>${[699,429,579][i]}</b></div>)}</>}{profileTab === 'Favoritos' && <div className="empty mini"><div>♡</div><h2>Tus favoritos aparecerán aquí</h2></div>}{profileTab === 'Cuenta' && <div className="account-list">{['Datos personales','Direcciones','Métodos de pago','Notificaciones','Ayuda'].map(x=><button key={x}>{x}<span>›</span></button>)}</div>}</div></main>
}

function BottomNav({ screen, setScreen, cartCount }) {
  return <nav className="bottom-nav"><button className={screen === 'home' ? 'active' : ''} onClick={() => setScreen('home')}><span>⌂</span>Inicio</button><button className={screen === 'categories' || screen === 'products' ? 'active' : ''} onClick={() => setScreen('categories')}><span>⌕</span>Explorar</button><button onClick={() => setScreen('cart')} className="bag-tab"><span>🛍</span>{cartCount > 0 && <i>{cartCount}</i>}Carrito</button><button className={screen === 'profile' ? 'active' : ''} onClick={() => setScreen('profile')}><span>♙</span>Perfil</button></nav>
}
