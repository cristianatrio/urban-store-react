import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import ItemQuantitySelector from './ItemQuantitySelector';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="message">
        <h2>Tu carrito está vacío 🛒</h2>
        <p>Agregá productos desde el catálogo para empezar tu compra.</p>
        <Link to="/" className="btn btn-primary">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <section className="cart-view">
      <h1 className="page-title">Tu carrito</h1>

      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id} className="cart-item">
            <img src={item.image} alt={item.title} className="cart-item-image" />
            <div className="cart-item-info">
              <Link to={`/item/${item.id}`} className="cart-item-title">
                {item.title}
              </Link>
              <span className="cart-item-price">{formatPrice(item.price)} c/u</span>
            </div>
            <ItemQuantitySelector
              quantity={item.quantity}
              stock={item.stock ?? item.quantity}
              onChange={(qty) => updateQuantity(item.id, qty)}
            />
            <span className="cart-item-subtotal">
              {formatPrice(item.price * item.quantity)}
            </span>
            <button
              type="button"
              className="btn-remove"
              onClick={() => removeItem(item.id)}
              aria-label={`Quitar ${item.title}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <p className="cart-total">
          Total: <strong>{formatPrice(totalPrice)}</strong>
        </p>
        <div className="cart-actions">
          <button type="button" className="btn btn-secondary" onClick={clearCart}>
            Vaciar carrito
          </button>
          <Link to="/checkout" className="btn btn-primary">
            Finalizar compra
          </Link>
        </div>
      </div>
    </section>
  );
}
