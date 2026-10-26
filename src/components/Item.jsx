import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import Icon from './Icon';

const LOW_STOCK = 5;

export default function Item({ item }) {
  const { addItem } = useCart();
  const outOfStock = item.stock <= 0;

  return (
    <article className="item-card">
      <Link to={`/item/${item.id}`} className="item-card-link">
        <span className="item-media">
          <img src={item.image} alt={item.title} className="item-image" loading="lazy" />
          {outOfStock && <span className="tag tag-muted">Sin stock</span>}
          {!outOfStock && item.stock <= LOW_STOCK && (
            <span className="tag">Últimas {item.stock}</span>
          )}
        </span>
        <span className="item-info">
          <span className="item-category">{item.category}</span>
          <span className="item-title">{item.title}</span>
          <span className="item-price">{formatPrice(item.price)}</span>
        </span>
      </Link>
      <button
        type="button"
        className="btn btn-secondary btn-small item-add"
        onClick={() => addItem(item, 1)}
        disabled={outOfStock}
        aria-label={outOfStock ? `${item.title} sin stock` : `Agregar ${item.title} al carrito`}
      >
        {outOfStock ? (
          'Sin stock'
        ) : (
          <>
            <Icon name="plus" size={16} />
            Agregar
          </>
        )}
      </button>
    </article>
  );
}
