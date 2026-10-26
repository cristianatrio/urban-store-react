import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCategories } from '../hooks/useStoreData';
import { formatPrice } from '../utils/format';
import { FREE_SHIPPING_THRESHOLD } from '../utils/shipping';
import CartWidget from './CartWidget';
import Icon from './Icon';

// Cierra un menu al hacer click/tap fuera de el o al presionar Escape
function useDismiss(open, setOpen, ref) {
  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen, ref]);
}

export default function NavBar() {
  const { categories, loading } = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const headerRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useDismiss(menuOpen, setMenuOpen, dropdownRef);
  useDismiss(mobileOpen, setMobileOpen, headerRef);

  return (
    <header className="site-header" ref={headerRef}>
      <p className="announcement">
        <Icon name="truck" size={16} />
        Envío gratis en compras desde {formatPrice(FREE_SHIPPING_THRESHOLD)}
      </p>

      <nav className="navbar" aria-label="Principal">
        <button
          type="button"
          className="icon-button navbar-menu-toggle"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <Icon name={mobileOpen ? 'close' : 'menu'} size={22} />
        </button>

        <Link to="/" className="navbar-brand">
          Urban Store
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end className="nav-link">
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className="nav-link">
            Catálogo
          </NavLink>

          <div className="dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="nav-link dropdown-toggle"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              Categorías
              <Icon name="chevronDown" size={16} />
            </button>
            {menuOpen && (
              <ul className="dropdown-menu">
                {categories.map((cat) => (
                  <li key={cat.key}>
                    <NavLink to={`/categories/${cat.key}`} className="dropdown-item">
                      {cat.description}
                    </NavLink>
                  </li>
                ))}
                {loading && <li className="dropdown-item disabled">Cargando…</li>}
                <li className="dropdown-divider">
                  <Link to="/catalogo" className="dropdown-item">
                    Ver todo el catálogo
                  </Link>
                </li>
              </ul>
            )}
          </div>

          <NavLink to="/orders" className="nav-link">
            Mis órdenes
          </NavLink>
        </div>

        <CartWidget />
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="mobile-menu">
          <NavLink to="/" end className="mobile-menu-link">
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className="mobile-menu-link">
            Catálogo completo
          </NavLink>
          <p className="mobile-menu-heading">Categorías</p>
          {categories.map((cat) => (
            <NavLink key={cat.key} to={`/categories/${cat.key}`} className="mobile-menu-link is-sub">
              {cat.description}
            </NavLink>
          ))}
          <NavLink to="/orders" className="mobile-menu-link">
            Mis órdenes
          </NavLink>
        </div>
      )}
    </header>
  );
}
