import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog, useCategories } from '../hooks/useStoreData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatPrice } from '../utils/format';
import { FREE_SHIPPING_THRESHOLD } from '../utils/shipping';
import Hero from './Hero';
import CategoryCard from './CategoryCard';
import ItemList from './ItemList';
import Icon from './Icon';

const FEATURED_LIMIT = 4;

const BENEFITS = [
  { icon: 'truck', title: `Envío gratis desde ${formatPrice(FREE_SHIPPING_THRESHOLD)}`, text: 'A todo el país.' },
  { icon: 'swap', title: 'Cambio de talle sin cargo', text: 'Dentro de los 30 días.' },
  { icon: 'receipt', title: 'Seguí tu pedido', text: 'Con el número de orden, desde Mis órdenes.' },
];

// Inicio: hero, beneficios, categorias y destacados. El catalogo completo
// con filtros vive en /catalogo para no amontonar todo en la portada.
export default function Home() {
  useDocumentTitle(null);
  const { products, loading, error } = useCatalog();
  const { categories } = useCategories();
  const featuredRef = useRef(null);

  const featured = [...products]
    .filter((p) => p.stock > 0)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, FEATURED_LIMIT);
  const countByCategory = products.reduce(
    (acc, p) => ({ ...acc, [p.category]: (acc[p.category] ?? 0) + 1 }),
    {}
  );

  return (
    <>
      <Hero onShowFeatured={() => featuredRef.current?.scrollIntoView({ behavior: 'smooth' })} />

      <ul className="benefits container">
        {BENEFITS.map((benefit) => (
          <li key={benefit.title} className="benefit">
            <Icon name={benefit.icon} size={26} />
            <span>
              <strong>{benefit.title}</strong>
              <span>{benefit.text}</span>
            </span>
          </li>
        ))}
      </ul>

      <section className="home-section container" aria-labelledby="categories-title">
        <h2 id="categories-title" className="section-title">
          Comprá por categoría
        </h2>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.key} category={category} count={countByCategory[category.key] ?? 0} />
          ))}
        </div>
      </section>

      <section ref={featuredRef} className="home-section container" aria-labelledby="featured-title">
        <h2 id="featured-title" className="section-title">
          Lo más elegido
        </h2>
        {error && <p className="notice notice-error">No pudimos cargar los productos. Recargá la página.</p>}
        {loading ? <div className="loader" aria-label="Cargando productos" /> : <ItemList items={featured} />}
        <div className="section-foot">
          <Link to="/catalogo" className="btn btn-primary">
            {products.length > 0 ? `Ver los ${products.length} productos` : 'Ver el catálogo completo'}
          </Link>
        </div>
      </section>
    </>
  );
}
