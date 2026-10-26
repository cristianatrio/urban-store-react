import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { getFreeShippingProgress } from '../utils/shipping';
import Icon from './Icon';

// "Completa el look": el producto base + dos que combinan, con un solo boton
// para sumar los que faltan al carrito (includeBase suma tambien el base).
export default function ComboOffer({ base, combo, includeBase = false }) {
  const { addItems, subtotal } = useCart();

  if (!base || combo.length === 0) return null;

  const toAdd = includeBase ? [base, ...combo] : combo;
  const comboPrice = toAdd.reduce((acc, p) => acc + p.price, 0);
  const unlocksShipping =
    !getFreeShippingProgress(subtotal).reached && getFreeShippingProgress(subtotal + comboPrice).reached;

  return (
    <section className="combo">
      <h2 className="combo-title">Completá el look</h2>
      <ul className="combo-items">
        {[base, ...combo].map((product, index) => (
          <li key={product.id} className="combo-item">
            {index > 0 && <Icon name="plus" size={16} className="combo-plus" />}
            <img src={product.image} alt="" className="combo-image" loading="lazy" />
            <span className="combo-name">{product.title}</span>
            <span className="combo-price">{formatPrice(product.price)}</span>
          </li>
        ))}
      </ul>
      {unlocksShipping && <p className="combo-note">Con este combo llegás al envío gratis.</p>}
      <button
        type="button"
        className="btn btn-accent btn-block"
        onClick={() => addItems(toAdd.map((product) => ({ product, quantity: 1 })))}
      >
        Agregar los {toAdd.length} por {formatPrice(comboPrice)}
      </button>
    </section>
  );
}
