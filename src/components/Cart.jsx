import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../hooks/useStoreData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatPrice } from '../utils/format';
import { getFreeShippingProgress } from '../utils/shipping';
import { getSuggestions } from '../utils/recommendations';
import ItemQuantitySelector from './ItemQuantitySelector';
import FreeShippingBar from './FreeShippingBar';
import ProductSuggestions from './ProductSuggestions';
import Icon from './Icon';

export default function Cart() {
  useDocumentTitle('Carrito');
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalQuantity,
    subtotal,
    shipping,
    total,
    editingOrderId,
    stopEditingOrder,
  } = useCart();
  const { products } = useCatalog();

  const lastItem = items[items.length - 1];
  const suggestions = getSuggestions(products, {
    base: products.find((p) => p.id === lastItem?.id) ?? lastItem,
    excludeIds: items.map((i) => i.id),
    remaining: getFreeShippingProgress(subtotal).remaining,
    limit: 4,
  });

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <Icon name="bag" size={40} />
          <h1>Tu carrito está vacío</h1>
          <p>Mirá el catálogo y agregá lo que te guste.</p>
          <Link to="/catalogo" className="btn btn-primary">
            Ver el catálogo
          </Link>
        </div>
        <ProductSuggestions title="Lo más elegido" products={suggestions} />
      </div>
    );
  }

  return (
    <section className="cart-view container">
      <header className="catalog-head">
        <h1 className="page-title">Tu carrito</h1>
        <p className="catalog-count">
          {totalQuantity} {totalQuantity === 1 ? 'producto' : 'productos'}
        </p>
      </header>

      {editingOrderId && (
        <div className="order-banner" role="status">
          <Icon name="edit" size={20} />
          <p>
            Estás modificando el pedido <code>{editingOrderId}</code>. Sumá, sacá o cambiá cantidades y
            después revisá y confirmá los cambios.
          </p>
          <button type="button" className="text-button" onClick={stopEditingOrder}>
            Dejar de modificar
          </button>
        </div>
      )}

      <div className="cart-layout">
        <div>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt="" className="cart-item-image" />
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
                <span className="cart-item-subtotal">{formatPrice(item.price * item.quantity)}</span>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Quitar ${item.title} del carrito`}
                >
                  <Icon name="close" size={18} />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="text-button" onClick={clearCart}>
            Vaciar carrito
          </button>
        </div>

        <aside className="summary">
          <FreeShippingBar subtotal={subtotal} />
          <dl className="brief-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>Envío</dt>
              <dd>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</dd>
            </div>
            <div className="brief-total">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          <Link to="/checkout" className="btn btn-primary btn-block">
            {editingOrderId ? 'Revisar los cambios' : 'Finalizar compra'}
          </Link>
          <Link to="/catalogo" className="btn btn-secondary btn-block">
            Seguir comprando
          </Link>
        </aside>
      </div>

      <ProductSuggestions
        title={editingOrderId ? '¿Te faltó algo?' : 'Sumá a tu compra'}
        products={suggestions}
      />
    </section>
  );
}
