import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getItem } from '../services/firestore';
import ItemDetail from './ItemDetail';

export default function ItemDetailContainer() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    getItem(id)
      .then((product) => {
        setItem(product);
        setStatus(product ? 'ready' : 'not-found');
      })
      .catch((err) => {
        console.error('Error cargando producto:', err);
        setStatus('error');
      });
  }, [id]);

  if (status === 'loading') {
    return <div className="loader page-loader" aria-label="Cargando producto" />;
  }

  if (status !== 'ready') {
    return (
      <div className="empty-state container">
        <h1>{status === 'not-found' ? 'Este producto no existe' : 'No pudimos cargar el producto'}</h1>
        <p>
          {status === 'not-found'
            ? 'Puede que el link esté mal escrito o que el producto ya no esté en el catálogo.'
            : 'Revisá tu conexión y recargá la página.'}
        </p>
        <Link to="/catalogo" className="btn btn-primary">
          Ver el catálogo
        </Link>
      </div>
    );
  }

  return <ItemDetail key={item.id} item={item} />;
}
