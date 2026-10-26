import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { checkStock, createOrder } from '../services/firestore';
import Brief from './Brief';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  emailConfirm: '',
};

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const emailsMatch = form.email === form.emailConfirm;
  const isFormValid =
    form.nombre.trim() !== '' &&
    form.apellido.trim() !== '' &&
    form.telefono.trim() !== '' &&
    EMAIL_REGEX.test(form.email) &&
    emailsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Extra: validacion de stock antes de generar la orden
      const outOfStock = await checkStock(items);
      if (outOfStock.length > 0) {
        const detail = outOfStock
          .map((p) => `${p.title} (disponible: ${p.available})`)
          .join(', ');
        setError(`Sin stock suficiente para: ${detail}. Ajustá las cantidades en el carrito.`);
        return;
      }

      const order = {
        buyer: {
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim(),
        },
        items: items.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
        })),
        total: totalPrice,
      };

      const id = await createOrder(order);
      setOrderId(id);
      clearCart();
    } catch (err) {
      console.error('Error generando la orden:', err);
      setError('Ocurrió un error al generar la orden. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="message success checkout-success">
        <h2>¡Gracias por tu compra! 🎉</h2>
        <p>Tu orden fue generada correctamente.</p>
        <p className="order-id">
          Número de orden: <code>{orderId}</code>
        </p>
        <p>Guardá este número para consultar tu orden más adelante.</p>
        <div className="cart-actions">
          <Link to={`/order/${orderId}`} className="btn btn-secondary">
            Ver mi orden
          </Link>
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="message">
        <h2>No hay productos para comprar</h2>
        <Link to="/" className="btn btn-primary">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <section className="checkout">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-grid">
        <Brief items={items} total={totalPrice} />

        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Datos del comprador</h3>

          <label>
            Nombre
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Juan"
              required
            />
          </label>

          <label>
            Apellido
            <input
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Pérez"
              required
            />
          </label>

          <label>
            Teléfono
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="11 5555 5555"
              required
            />
          </label>

          <label>
            E-mail
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="juan@email.com"
              required
            />
          </label>

          <label>
            Repetir e-mail
            <input
              type="email"
              name="emailConfirm"
              value={form.emailConfirm}
              onChange={handleChange}
              placeholder="juan@email.com"
              required
            />
          </label>

          {form.emailConfirm && !emailsMatch && (
            <p className="message error">Los e-mails no coinciden.</p>
          )}

          {error && <p className="message error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isFormValid || loading}
          >
            {loading ? 'Procesando…' : 'Realizar compra'}
          </button>
        </form>
      </div>
    </section>
  );
}
