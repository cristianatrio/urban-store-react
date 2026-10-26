import { formatPrice } from '../utils/format';
import { FREE_SHIPPING_THRESHOLD, getFreeShippingProgress } from '../utils/shipping';
import Icon from './Icon';

export default function FreeShippingBar({ subtotal }) {
  const { remaining, reached, percent } = getFreeShippingProgress(subtotal);

  return (
    <div className={`shipping-bar ${reached ? 'is-reached' : ''}`}>
      <p className="shipping-bar-text" aria-live="polite">
        <Icon name={reached ? 'check' : 'truck'} size={18} />
        {reached ? (
          <span>Tenés envío gratis</span>
        ) : (
          <span>
            Te faltan <strong>{formatPrice(remaining)}</strong> para el envío gratis
          </span>
        )}
      </p>
      <div
        className="shipping-bar-track"
        role="progressbar"
        aria-label={`Progreso hacia el envío gratis desde ${formatPrice(FREE_SHIPPING_THRESHOLD)}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="shipping-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
