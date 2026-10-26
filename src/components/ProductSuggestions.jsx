import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import Icon from './Icon';

// Listado compacto de productos sugeridos con agregado rapido.
// variant "row": filas para el panel del carrito; "grid": tarjetas chicas.
export default function ProductSuggestions({ title, products, variant = 'grid' }) {
  const { addItem } = useCart();

  if (products.length === 0) return null;

  return (
    <section className={`suggestions suggestions-${variant}`}>
      <h2 className="suggestions-title">{title}</h2>
      <ul className="suggestions-list">
        {products.map((product) => (
          <li key={product.id} className="suggestion">
            <Link to={`/item/${product.id}`} className="suggestion-link">
              <img src={product.image} alt="" className="suggestion-image" loading="lazy" />
              <span className="suggestion-info">
                <span className="suggestion-name">{product.title}</span>
                <span className="suggestion-price">{formatPrice(product.price)}</span>
              </span>
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              onClick={() => addItem(product, 1)}
              aria-label={`Agregar ${product.title} al carrito`}
            >
              <Icon name="plus" size={16} />
              Agregar
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
