import { formatPrice } from '../utils/format';

// Listado compacto de la orden con el precio total.
// Se reutiliza en el Checkout y en la vista de "Mis ordenes" (con itemAction
// para mostrar un aviso por producto, ej. "Hoy sin stock").
export default function Brief({ items, subtotal, shipping, total, title = 'Detalle de la compra', itemAction }) {
  const hasBreakdown = typeof subtotal === 'number' && typeof shipping === 'number';

  return (
    <div className="brief">
      <h2 className="brief-title">{title}</h2>
      <ul className="brief-list">
        {items.map((item) => {
          const action = itemAction?.(item);
          return (
            <li key={item.id} className="brief-item">
              {item.image && <img src={item.image} alt="" className="brief-item-image" />}
              <span className="brief-item-name">
                <span className="brief-item-qty">{item.quantity} ×</span> {item.title}
              </span>
              <span className="brief-item-price">{formatPrice(item.price * item.quantity)}</span>
              {action && <span className="brief-item-action">{action}</span>}
            </li>
          );
        })}
      </ul>
      <dl className="brief-totals">
        {hasBreakdown && (
          <>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>Envío</dt>
              <dd>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</dd>
            </div>
          </>
        )}
        <div className="brief-total">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
