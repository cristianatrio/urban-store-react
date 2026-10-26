import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { invalidateCatalog } from '../hooks/useStoreData';
import { CartOutdatedError, OrderNotEditableError, getOrder, modifyOrder } from '../services/firestore';
import { formatPrice } from '../utils/format';
import { describeOutdatedCart, outdatedCartUpdates } from '../utils/cartMessages';
import Brief from './Brief';
import Icon from './Icon';

// Que cambio entre el pedido original y el carrito
function diffOrder(originalItems, cartItems) {
  const before = Object.fromEntries(originalItems.map((i) => [i.id, i]));
  const after = Object.fromEntries(cartItems.map((i) => [i.id, i]));
  return {
    removed: originalItems.filter((i) => !after[i.id]),
    added: cartItems.filter((i) => !before[i.id]),
    changed: cartItems
      .filter((i) => before[i.id] && before[i.id].quantity !== i.quantity)
      .map((i) => ({ ...i, from: before[i.id].quantity })),
  };
}

function ChangesList({ changes }) {
  return (
    <ul className="changes-list">
      {changes.removed.map((item) => (
        <li key={item.id} className="change is-removed">
          <Icon name="close" size={16} />
          Sacaste {item.title}
        </li>
      ))}
      {changes.added.map((item) => (
        <li key={item.id} className="change is-added">
          <Icon name="plus" size={16} />
          Sumaste {item.quantity} × {item.title}
        </li>
      ))}
      {changes.changed.map((item) => (
        <li key={item.id} className="change">
          <Icon name="edit" size={16} />
          {item.title}: de {item.from} a {item.quantity}
        </li>
      ))}
    </ul>
  );
}

// Checkout de una modificacion: sin formulario, con los datos de contacto
// del pedido original. onDone recibe { orderId, basedOn } del pedido nuevo.
export default function ModifyOrderConfirm({ onDone }) {
  const { items, subtotal, shipping, total, editingOrderId, clearCart, syncItems } = useCart();
  const [original, setOriginal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrder(editingOrderId)
      .then(setOriginal)
      .catch((err) => {
        console.error('Error cargando el pedido original:', err);
        setError('No pudimos cargar el pedido original. Revisá tu conexión y recargá la página.');
      });
  }, [editingOrderId]);

  const changes = original ? diffOrder(original.items, items) : null;
  const hasChanges = Boolean(changes) && Object.values(changes).some((list) => list.length > 0);

  const handleConfirm = async () => {
    setSaving(true);
    setError(null);
    try {
      const orderId = await modifyOrder(editingOrderId, items);
      invalidateCatalog();
      onDone({ orderId, basedOn: editingOrderId });
      clearCart();
    } catch (err) {
      if (err instanceof CartOutdatedError) {
        syncItems(outdatedCartUpdates(err));
        setError(describeOutdatedCart(err));
      } else if (err instanceof OrderNotEditableError) {
        setError('Este pedido ya se modificó antes. Buscá la versión actual en Mis órdenes.');
      } else {
        console.error('Error modificando el pedido:', err);
        setError('No pudimos guardar los cambios. Revisá tu conexión e intentá de nuevo.');
      }
      setSaving(false);
    }
  };

  return (
    <section className="checkout container">
      <h1 className="page-title">Confirmá los cambios</h1>
      <p className="checkout-lead">
        Así queda tu pedido <code>{editingOrderId}</code>. Usamos los mismos datos de contacto de la compra
        original.
      </p>

      <div className="checkout-grid">
        <Brief items={items} subtotal={subtotal} shipping={shipping} total={total} title="Pedido modificado" />

        <aside className="summary">
          <h2 className="summary-title">Cambios</h2>
          {!original && !error && <div className="loader" aria-label="Cargando el pedido original" />}
          {changes &&
            (hasChanges ? (
              <ChangesList changes={changes} />
            ) : (
              <p>Todavía no hiciste cambios. Volvé al carrito para sumar o sacar productos.</p>
            ))}
          {original && (
            <dl className="brief-totals">
              <div>
                <dt>Total anterior</dt>
                <dd>{formatPrice(original.total)}</dd>
              </div>
              <div className="brief-total">
                <dt>Total nuevo</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
          )}
          {error && (
            <p className="notice notice-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleConfirm}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Guardando los cambios…' : 'Confirmar cambios'}
          </button>
          <Link to="/cart" className="btn btn-secondary btn-block">
            Seguir modificando
          </Link>
        </aside>
      </div>
    </section>
  );
}
