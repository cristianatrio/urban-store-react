import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../hooks/useStoreData';
import { formatPrice } from '../utils/format';
import { getFreeShippingProgress } from '../utils/shipping';
import { buildCombo, getSuggestions } from '../utils/recommendations';
import FreeShippingBar from './FreeShippingBar';
import ComboOffer from './ComboOffer';
import ProductSuggestions from './ProductSuggestions';
import Icon from './Icon';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])';

// Mantiene el foco dentro del panel, cierra con Escape y bloquea el scroll del fondo
function useDialogBehavior(open, onClose, dialogRef, initialFocusRef) {
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    initialFocusRef.current?.focus();
    document.body.classList.add('no-scroll');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('no-scroll');
      previousFocus?.focus?.();
    };
    // onClose cambia en cada render; solo importa abrir/cerrar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, lastAddedId, items, subtotal, totalQuantity, editingOrderId } = useCart();
  const { products } = useCatalog();
  const { pathname } = useLocation();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  // Al navegar (ej. "Ver carrito" o una sugerencia) el panel se cierra
  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useDialogBehavior(drawerOpen, closeDrawer, dialogRef, closeRef);

  if (!drawerOpen) return null;

  const addedLine = items.find((i) => i.id === lastAddedId);
  const base = products.find((p) => p.id === lastAddedId) ?? addedLine;
  const cartIds = items.map((i) => i.id);
  const combo = buildCombo(products, base, cartIds);
  const suggestions = getSuggestions(products, {
    base,
    excludeIds: [...cartIds, ...combo.map((p) => p.id)],
    remaining: getFreeShippingProgress(subtotal).remaining,
    limit: 3,
  });

  return (
    <div className="drawer-root">
      <div className="drawer-overlay" onClick={closeDrawer} aria-hidden="true" />
      <aside
        ref={dialogRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <header className="drawer-header">
          <h2 id="drawer-title" className="drawer-title">
            <Icon name="check" size={20} />
            Agregaste al carrito
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="icon-button"
            onClick={closeDrawer}
            aria-label="Cerrar el carrito"
          >
            <Icon name="close" />
          </button>
        </header>

        <div className="drawer-body">
          {addedLine && (
            <div className="drawer-added">
              <img src={addedLine.image} alt="" className="drawer-added-image" />
              <div>
                <p className="drawer-added-name">{addedLine.title}</p>
                <p className="drawer-added-meta">
                  {addedLine.quantity} {addedLine.quantity === 1 ? 'unidad' : 'unidades'} en tu carrito
                </p>
                <p className="drawer-added-price">{formatPrice(addedLine.price * addedLine.quantity)}</p>
              </div>
            </div>
          )}
          <FreeShippingBar subtotal={subtotal} />
          <ComboOffer base={base} combo={combo} />
          <ProductSuggestions title="También te puede gustar" products={suggestions} variant="row" />
        </div>

        <footer className="drawer-footer">
          <p className="drawer-subtotal">
            <span>
              Subtotal ({totalQuantity} {totalQuantity === 1 ? 'producto' : 'productos'})
            </span>
            <strong>{formatPrice(subtotal)}</strong>
          </p>
          <div className="drawer-actions">
            <Link to="/cart" className="btn btn-secondary">
              Ver carrito
            </Link>
            <Link to="/checkout" className="btn btn-primary">
              {editingOrderId ? 'Revisar cambios' : 'Finalizar compra'}
            </Link>
          </div>
        </footer>
      </aside>
    </div>
  );
}
