import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../services/firestore';
import Brief from './Brief';

// Extra "Mis ordenes": con el orderId el usuario puede consultar
// como quedo conformada su orden (sin datos personales).
export default function OrderView() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
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
    return (
      <div className="loader-container">
        <div className="loader" />
        <p>Buscando orden…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="message error">
        <h2>Orden no encontrada</h2>
        <p>No existe una orden con el número indicado.</p>
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const date = order.date?.toDate ? order.date.toDate() : null;

  return (
    <section className="order-view">
      <h1 className="page-title">Detalle de la orden</h1>
      <p>
        Número de orden: <code>{order.id}</code>
      </p>
      <p>
        Estado: <strong>{order.status}</strong>
        {date && ` — Fecha: ${date.toLocaleString('es-AR')}`}
      </p>
      <Brief items={order.items} total={order.total} />
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </section>
  );
}
