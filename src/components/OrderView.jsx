import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrder } from '../services/firestore';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../hooks/useStoreData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatPrice } from '../utils/format';
import { getSuggestions } from '../utils/recommendations';
import Brief from './Brief';
import ProductSuggestions from './ProductSuggestions';
import Icon from './Icon';

function ModifyAside({ isEditing, canModify, onModify }) {
  return (
    <aside className="summary">
      <h2 className="summary-title">¿Querés modificar el pedido o te faltó agregar algo?</h2>
      {isEditing ? (
        <p>Ya estás modificando este pedido. Tus cambios están en el carrito.</p>
      ) : (
        <p>
          Pasamos estos productos a tu carrito para que sumes, saques o cambies cantidades, con el precio y el
          stock de hoy. Después confirmás los cambios, sin volver a cargar tus datos.
        </p>
      )}
      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={onModify}
        disabled={!isEditing && !canModify}
      >
        <Icon name="edit" size={18} />
        {isEditing ? 'Seguir modificando' : 'Modificar el pedido'}
      </button>
      {!isEditing && !canModify && <p className="form-hint">Ninguno de estos productos tiene stock hoy.</p>}
      <Link to="/orders" className="btn btn-secondary btn-block">
        Buscar otra orden
      </Link>
    </aside>
  );
}

function ReplacedAside({ replacedBy }) {
  return (
    <aside className="summary">
      <h2 className="summary-title">Este pedido ya se modificó</h2>
      <p>Los cambios están en el pedido nuevo, que tiene su propio número.</p>
      <Link to={`/order/${replacedBy}`} className="btn btn-primary btn-block">
        Ver el pedido actualizado
      </Link>
      <Link to="/orders" className="btn btn-secondary btn-block">
        Buscar otra orden
      </Link>
    </aside>
  );
}

// Extra "Mis ordenes": con el orderId el usuario puede consultar como quedo
// conformada su orden (sin datos personales) y modificarla: los productos
// pasan al carrito para sumar o sacar y, al confirmar, la version nueva
// reemplaza a la original (que queda 'modificada' y apunta a ella).
export default function OrderView() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { loadOrder, editingOrderId, items: cartItems } = useCart();
  const { products } = useCatalog();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  useDocumentTitle('Mi orden');

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getOrder(orderId)
      .then((data) => {
        if (data) {
          setOrder(data);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error('Error cargando orden:', err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <div className="loader page-loader" aria-label="Buscando orden" />;
  }

  if (notFound) {
    return (
      <div className="container">
        <div className="empty-state">
          <h1>No encontramos esa orden</h1>
          <p>Revisá que el número esté completo y escrito igual que en el mensaje de compra.</p>
          <Link to="/orders" className="btn btn-primary">
            Buscar otra orden
          </Link>
        </div>
      </div>
    );
  }

  const date = order.date?.toDate ? order.date.toDate() : null;
  const productFor = (id) => products.find((p) => p.id === id);
  const items = order.items.map((item) => ({ ...item, image: productFor(item.id)?.image }));
  const available = order.items
    .map((item) => ({ product: productFor(item.id), quantity: item.quantity }))
    .filter(({ product }) => product && product.stock > 0);
  const isEditingThis = editingOrderId === order.id;
  const isReplaced = order.status === 'modificada' && Boolean(order.replacedBy);
  const suggestions = getSuggestions(products, {
    base: productFor(order.items[0]?.id),
    excludeIds: [...order.items.map((i) => i.id), ...cartItems.map((i) => i.id)],
    limit: 4,
  });

  const handleModify = () => {
    // Si ya se esta modificando este pedido, se respetan los cambios del carrito
    if (!isEditingThis) loadOrder(order.id, available);
    navigate('/cart');
  };

  // Aviso por producto de lo que cambia al pasarlo al carrito hoy
  const lineNote = (item) => {
    const product = productFor(item.id);
    if (!product || product.stock <= 0) return <span className="line-note is-out">Hoy sin stock</span>;
    if (product.stock < item.quantity) return <span className="line-note">Hoy quedan {product.stock}</span>;
    if (product.price !== item.price) return <span className="line-note">Hoy {formatPrice(product.price)}</span>;
    return null;
  };

  return (
    <section className="order-view container">
      <header className="order-head">
        <div>
          <h1 className="page-title">Tu orden</h1>
          <p className="order-meta">
            <code>{order.id}</code>
            {date && <span>{date.toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })}</span>}
          </p>
          {order.basedOn && (
            <p className="order-meta">
              Modifica al pedido{' '}
              <Link to={`/order/${order.basedOn}`} className="text-link">
                <code>{order.basedOn}</code>
              </Link>
            </p>
          )}
        </div>
        <span className={`status-pill ${isReplaced ? 'is-muted' : ''}`}>{order.status}</span>
      </header>

      {isReplaced && (
        <div className="order-banner" role="status">
          <Icon name="edit" size={20} />
          <p>
            Este pedido se modificó. La versión actual es el pedido{' '}
            <Link to={`/order/${order.replacedBy}`} className="text-link">
              <code>{order.replacedBy}</code>
            </Link>
            .
          </p>
        </div>
      )}

      <div className="order-layout">
        <Brief
          items={items}
          subtotal={order.subtotal}
          shipping={order.shipping}
          total={order.total}
          title="Productos"
          itemAction={isReplaced ? undefined : lineNote}
        />
        {isReplaced ? (
          <ReplacedAside replacedBy={order.replacedBy} />
        ) : (
          <ModifyAside
            isEditing={isEditingThis}
            canModify={available.length > 0}
            onModify={handleModify}
          />
        )}
      </div>

      <ProductSuggestions title="¿Te faltó algo?" products={suggestions} />
    </section>
  );
}
