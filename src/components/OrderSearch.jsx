import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Icon from './Icon';

// Extra "Mis ordenes": buscador por el orderId que se entrega al finalizar la compra.
export default function OrderSearch() {
  useDocumentTitle('Mis órdenes');
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = orderId.trim();
    if (id) navigate(`/order/${encodeURIComponent(id)}`);
  };

  return (
    <section className="order-search container">
      <Icon name="receipt" size={40} />
      <h1 className="page-title">Mis órdenes</h1>
      <p>Ingresá el número que recibiste al finalizar tu compra para ver el detalle o modificar tu pedido.</p>
      <form className="order-search-form" onSubmit={handleSubmit}>
        <label className="search-field">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Número de orden</span>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Ej: 33fJB7GoQ9m4F7flO8dn"
            required
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={!orderId.trim()}>
          Buscar orden
        </button>
      </form>
    </section>
  );
}
