import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getItems } from '../services/firestore';
import ItemList from './ItemList';

export default function ItemListContainer() {
  const { categoryId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getItems(categoryId)
      .then(setItems)
      .catch((err) => {
        console.error('Error cargando productos:', err);
        setError('No se pudieron cargar los productos. Revisá la conexión con Firebase.');
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader" />
        <p>Cargando productos…</p>
      </div>
    );
  }

  if (error) {
    return <p className="message error">{error}</p>;
  }

  return (
    <section>
      <h1 className="page-title">
        {categoryId
          ? `Categoría: ${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}`
          : 'Catálogo de productos'}
      </h1>
      {items.length === 0 ? (
        <p className="message">No hay productos disponibles en esta categoría.</p>
      ) : (
        <ItemList items={items} />
      )}
    </section>
  );
}
