import { useEffect, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { getItems } from '../services/firestore';
import { useCatalog, useCategories } from '../hooks/useStoreData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import ItemList from './ItemList';
import Icon from './Icon';

const SORTS = {
  featured: { label: 'Destacados', compare: (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) },
  priceAsc: { label: 'Menor precio', compare: (a, b) => a.price - b.price },
  priceDesc: { label: 'Mayor precio', compare: (a, b) => b.price - a.price },
  name: { label: 'Nombre (A-Z)', compare: (a, b) => a.title.localeCompare(b.title) },
};

const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Catalogo completo (/catalogo) o filtrado por categoria (/categories/:categoryId)
export default function ItemListContainer() {
  const { categoryId } = useParams();
  const { categories } = useCategories();
  const { products: allProducts } = useCatalog();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  const category = categories.find((c) => c.key === categoryId);
  const title = categoryId ? category?.description ?? categoryId : 'Catálogo';
  useDocumentTitle(title);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getItems(categoryId)
      .then(setItems)
      .catch((err) => {
        console.error('Error cargando productos:', err);
        setError('No pudimos cargar los productos. Revisá tu conexión y recargá la página.');
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  const query = normalize(search.trim());
  const visible = items
    .filter((item) => !query || normalize(item.title).includes(query))
    .filter((item) => !onlyInStock || item.stock > 0)
    .sort(SORTS[sort].compare);
  const countFor = (key) => allProducts.filter((p) => !key || p.category === key).length;

  return (
    <section className="catalog container">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <Icon name="chevronRight" size={14} />
        {categoryId ? <Link to="/catalogo">Catálogo</Link> : <span aria-current="page">Catálogo</span>}
        {categoryId && (
          <>
            <Icon name="chevronRight" size={14} />
            <span aria-current="page">{title}</span>
          </>
        )}
      </nav>

      <header className="catalog-head">
        <h1 className="page-title">{title}</h1>
        {!loading && !error && (
          <p className="catalog-count">
            {visible.length} {visible.length === 1 ? 'producto' : 'productos'}
          </p>
        )}
      </header>

      <div className="catalog-toolbar">
        <nav className="chips" aria-label="Categorías">
          <NavLink to="/catalogo" end className="chip">
            Todo <span className="chip-count">{countFor(null)}</span>
          </NavLink>
          {categories.map((cat) => (
            <NavLink key={cat.key} to={`/categories/${cat.key}`} className="chip">
              {cat.description} <span className="chip-count">{countFor(cat.key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="catalog-controls">
          <label className="search-field">
            <Icon name="search" size={18} />
            <span className="visually-hidden">Buscar productos</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre"
            />
          </label>
          <label className="select-field">
            <span>Ordenar por</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="check-field">
            <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} />
            Solo con stock
          </label>
        </div>
      </div>

      {loading && <div className="loader" aria-label="Cargando productos" />}
      {error && <p className="notice notice-error">{error}</p>}
      {!loading && !error && visible.length > 0 && <ItemList items={visible} />}
      {!loading && !error && visible.length === 0 && (
        <div className="empty-state">
          <h2>{query ? `No encontramos productos para "${search.trim()}"` : 'No hay productos en esta categoría'}</h2>
          <p>Probá con otra búsqueda o mirá el catálogo completo.</p>
          {query ? (
            <button type="button" className="btn btn-secondary" onClick={() => setSearch('')}>
              Borrar búsqueda
            </button>
          ) : (
            <Link to="/catalogo" className="btn btn-primary">
              Ver el catálogo completo
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
