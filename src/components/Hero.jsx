import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import { FREE_SHIPPING_THRESHOLD } from '../utils/shipping';

// Foto a sangre con dos recortes (PC y celular) y el titulo en un "afiche"
// pegado sobre la pared, como la cartelería de la calle.
export default function Hero({ onShowFeatured }) {
  return (
    <section className="hero">
      <picture>
        <source media="(min-width: 768px)" srcSet="/images/hero-desktop.webp" />
        <img
          src="/images/hero-mobile.webp"
          alt="Chica con remera negra oversize y pañuelo frente a una pared de afiches"
          className="hero-image"
          fetchpriority="high"
        />
      </picture>
      <div className="hero-poster">
        <h1 className="hero-title">Ropa urbana para todos los días</h1>
        <p className="hero-text">
          Remeras de algodón pesado, jeans, zapatillas y accesorios. Envío gratis desde{' '}
          {formatPrice(FREE_SHIPPING_THRESHOLD)}.
        </p>
        <div className="hero-actions">
          <Link to="/catalogo" className="btn btn-primary">
            Ver el catálogo
          </Link>
          <button type="button" className="btn btn-outline" onClick={onShowFeatured}>
            Lo más elegido
          </button>
        </div>
      </div>
    </section>
  );
}
