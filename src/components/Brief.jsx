import { formatPrice } from '../utils/format';

// Listado compacto de la orden con el precio total.
// Se reutiliza en el Checkout y en la vista de "Mis ordenes".
export default function Brief({ items, total }) {
  return (
    <div className="brief">
      <h3>Detalle de la compra</h3>
      <ul className="brief-list">
        {items.map((item) => (
          <li key={item.id} className="brief-item">
            <span>
              {item.quantity} × {item.title}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <p className="brief-total">
        Total: <strong>{formatPrice(total)}</strong>
      </p>
    </div>
  );
}
