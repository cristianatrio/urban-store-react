import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import ItemQuantitySelector from './ItemQuantitySelector';
import AddItemButton from './AddItemButton';

export default function ItemDetail({ item }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(item, quantity);
    setAdded(true);
  };

  return (
    <article className="item-detail">
      <img src={item.image} alt={item.title} className="item-detail-image" />
      <div className="item-detail-info">
        <p className="item-category">{item.category}</p>
        <h1>{item.title}</h1>
        <p className="item-detail-description">{item.description}</p>
        <p className="item-detail-price">{formatPrice(item.price)}</p>
        <p className="item-stock">
          {item.stock > 0 ? `Stock disponible: ${item.stock}` : 'Sin stock'}
        </p>

        {item.stock > 0 &&
          (added ? (
            <div className="added-actions">
              <p className="message success">✅ Producto agregado al carrito</p>
              <Link to="/cart" className="btn btn-primary">
                Ir al carrito
              </Link>
              <Link to="/" className="btn btn-secondary">
                Seguir comprando
              </Link>
            </div>
          ) : (
            <div className="buy-actions">
              <ItemQuantitySelector
                quantity={quantity}
                stock={item.stock}
                onChange={setQuantity}
              />
              <AddItemButton onAdd={handleAdd} quantity={quantity} />
            </div>
          ))}
      </div>
    </article>
  );
}
