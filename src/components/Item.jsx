import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

export default function Item({ item }) {
  return (
    <article className="item-card">
      <Link to={`/item/${item.id}`}>
        <img src={item.image} alt={item.title} className="item-image" loading="lazy" />
        <div className="item-info">
          <h3 className="item-title">{item.title}</h3>
          <p className="item-category">{item.category}</p>
          <p className="item-price">{formatPrice(item.price)}</p>
        </div>
      </Link>
    </article>
  );
}
