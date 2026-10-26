import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useStoreData';
import { formatPrice } from '../utils/format';
import { FREE_SHIPPING_THRESHOLD } from '../utils/shipping';

export default function Footer() {
  const { categories } = useCategories();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">Urban Store</p>
          <p className="footer-text">
            Ropa urbana con envío gratis desde {formatPrice(FREE_SHIPPING_THRESHOLD)}. Proyecto Final de React
            JS en CoderHouse.
          </p>
        </div>
        <nav aria-label="Categorías">
          <p className="footer-heading">Categorías</p>
          <ul className="footer-links">
            {categories.map((cat) => (
              <li key={cat.key}>
                <Link to={`/categories/${cat.key}`}>{cat.description}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Ayuda">
          <p className="footer-heading">Ayuda</p>
          <ul className="footer-links">
            <li>
              <Link to="/catalogo">Catálogo completo</Link>
            </li>
            <li>
              <Link to="/orders">Mis órdenes</Link>
            </li>
            <li>
              <Link to="/cart">Carrito</Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="container footer-legal">Fotos de Unsplash. Créditos completos en el README del proyecto.</p>
    </footer>
  );
}
