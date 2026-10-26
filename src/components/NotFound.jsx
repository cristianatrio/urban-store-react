import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="message error">
      <h2>404 - Página no encontrada</h2>
      <p>La ruta que buscás no existe.</p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
