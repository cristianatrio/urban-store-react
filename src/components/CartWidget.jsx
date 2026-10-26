import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Icon from './Icon';

export default function CartWidget() {
  const { totalQuantity } = useCart();
  const label =
    totalQuantity > 0
      ? `Ver carrito, ${totalQuantity} ${totalQuantity === 1 ? 'producto' : 'productos'}`
      : 'Ver carrito, vacío';

  return (
    <Link to="/cart" className="cart-widget" aria-label={label}>
      <Icon name="bag" size={24} />
      {totalQuantity > 0 && (
        <span className="cart-badge" aria-hidden="true">
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}
