import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Página no encontrada');
  return (
    <div className="container">
      <div className="empty-state">
        <h1>Esta página no existe</h1>
        <p>Puede que el link esté mal escrito. Volvé al inicio o mirá el catálogo.</p>
        <div className="order-success-actions">
          <Link to="/" className="btn btn-secondary">
            Ir al inicio
          </Link>
          <Link to="/catalogo" className="btn btn-primary">
            Ver el catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
