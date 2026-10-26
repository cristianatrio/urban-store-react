import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getItem } from '../services/firestore';
import ItemDetail from './ItemDetail';

export default function ItemDetailContainer() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getItem(id)
      .then((product) => {
        if (product) {
          setItem(product);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error('Error cargando producto:', err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader" />
        <p>Cargando producto…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="message error">
        <h2>Producto no encontrado 😕</h2>
        <p>El producto que estás buscando no existe o fue eliminado del catálogo.</p>
      </div>
    );
  }

  return <ItemDetail item={item} />;
}
