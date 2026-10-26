import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { invalidateCatalog } from '../hooks/useStoreData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CartOutdatedError, createOrder } from '../services/firestore';
import { formatPrice } from '../utils/format';
import { describeOutdatedCart, outdatedCartUpdates } from '../utils/cartMessages';
import Brief from './Brief';
import ModifyOrderConfirm from './ModifyOrderConfirm';
import OrderSuccess from './OrderSuccess';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  emailConfirm: '',
};

const FIELDS = [
  { name: 'nombre', label: 'Nombre', type: 'text', autoComplete: 'given-name', placeholder: 'Juan' },
  { name: 'apellido', label: 'Apellido', type: 'text', autoComplete: 'family-name', placeholder: 'Pérez' },
  { name: 'telefono', label: 'Teléfono', type: 'tel', autoComplete: 'tel', placeholder: '11 5555 5555' },
  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email', placeholder: 'juan@email.com' },
  { name: 'emailConfirm', label: 'Repetí el e-mail', type: 'email', autoComplete: 'email', placeholder: 'juan@email.com' },
];

export default function Checkout() {
  const { items, subtotal, shipping, total, clearCart, syncItems, editingOrderId } = useCart();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  // Orden generada: { orderId, basedOn } (basedOn si fue una modificacion)
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  useDocumentTitle(editingOrderId && !result ? 'Confirmar cambios' : 'Finalizar compra');

  // La confirmacion reemplaza al formulario en la misma ruta: volver arriba
  useEffect(() => {
    if (result) window.scrollTo({ top: 0 });
  }, [result]);

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
      const buyer = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
      };

      // Extra: la orden valida stock y precios y descuenta el stock en una transaccion
      const orderId = await createOrder(buyer, items);
      invalidateCatalog();
      setResult({ orderId, basedOn: null });
      clearCart();
    } catch (err) {
      if (err instanceof CartOutdatedError) {
        syncItems(outdatedCartUpdates(err));
        setError(describeOutdatedCart(err));
        return;
      }
      console.error('Error generando la orden:', err);
      setError('No pudimos generar la orden. Revisá tu conexión e intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <OrderSuccess orderId={result.orderId} basedOn={result.basedOn} />;
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h1>No hay productos para comprar</h1>
          <p>Agregá productos al carrito para finalizar la compra.</p>
          <Link to="/catalogo" className="btn btn-primary">
            Ver el catálogo
          </Link>
        </div>
      </div>
    );
  }

  // Modificacion de un pedido desde "Mis ordenes": sin formulario
  if (editingOrderId) {
    return <ModifyOrderConfirm onDone={setResult} />;
  }

  return (
    <section className="checkout container">
      <h1 className="page-title">Finalizar compra</h1>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <h2 className="form-title">Tus datos</h2>
          <div className="form-grid">
            {FIELDS.map((field) => (
              <label key={field.name} className={`field field-${field.name}`}>
                <span>{field.label}</span>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete={field.name === 'emailConfirm' ? 'off' : field.autoComplete}
                  aria-invalid={field.name === 'emailConfirm' && form.emailConfirm !== '' && !emailsMatch}
                  required
                />
              </label>
            ))}
          </div>

          {form.emailConfirm && !emailsMatch && (
            <p className="notice notice-error" role="alert">
              Los e-mails no coinciden. Revisá que estén escritos igual.
            </p>
          )}
          {error && (
            <p className="notice notice-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={!isFormValid || loading}>
            {loading ? 'Generando la orden…' : `Realizar compra por ${formatPrice(total)}`}
          </button>
          {!isFormValid && <p className="form-hint">Completá todos los datos para realizar la compra.</p>}
        </form>

        <Brief items={items} subtotal={subtotal} shipping={shipping} total={total} />
      </div>
    </section>
  );
}
