import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getCategories } from '../services/firestore';
import CartWidget from './CartWidget';

export default function NavBar() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => console.error('Error cargando categorias:', err));
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🛍️ Urban Store
      </Link>

      <div className="navbar-links">
        <NavLink to="/" end className="nav-link">
          Inicio
        </NavLink>

        <div
          className="dropdown"
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            type="button"
            className="nav-link dropdown-toggle"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Categorías ▾
          </button>
          {menuOpen && (
            <ul className="dropdown-menu">
              {categories.map((cat) => (
                <li key={cat.key}>
                  <NavLink
                    to={`/categories/${cat.key}`}
                    className="dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat.description}
                  </NavLink>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="dropdown-item disabled">Cargando…</li>
              )}
            </ul>
          )}
        </div>
      </div>

      <CartWidget />
    </nav>
  );
}
