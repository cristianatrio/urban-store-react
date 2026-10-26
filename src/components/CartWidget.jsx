import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartWidget() {
  const { totalQuantity } = useCart();

  return (
    <Link to="/cart" className="cart-widget" title="Ir al carrito">
      <span className="cart-icon">🛒</span>
      {totalQuantity > 0 && (
        <span className="cart-badge">{totalQuantity}</span>
      )}
    </Link>
  );
}
