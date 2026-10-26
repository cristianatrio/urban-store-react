import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// BrowserRouter no resetea el scroll al navegar: cada pagina nueva arranca arriba.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
