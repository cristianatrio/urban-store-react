import { Link } from 'react-router-dom';
import Icon from './Icon';

// Confirmacion despues de comprar o de modificar un pedido (basedOn).
export default function OrderSuccess({ orderId, basedOn }) {
  return (
    <div className="container">
      <div className="order-success">
        <Icon name="check" size={40} />
        <h1>{basedOn ? '¡Listo, pedido modificado!' : '¡Gracias por tu compra!'}</h1>
        <p>
          {basedOn
            ? 'Tu pedido tiene un número nuevo. El anterior quedó marcado como modificado y apunta a este.'
            : 'Tu orden fue generada. Guardá este número para seguirla desde Mis órdenes.'}
        </p>
        <p className="order-number">
          <span>Número de orden</span>
          <code>{orderId}</code>
        </p>
        <div className="order-success-actions">
          <Link to={`/order/${orderId}`} className="btn btn-primary">
            Ver mi orden
          </Link>
          <Link to="/catalogo" className="btn btn-secondary">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
