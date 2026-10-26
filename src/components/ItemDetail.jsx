import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCatalog, useCategories } from '../hooks/useStoreData';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatPrice } from '../utils/format';
import { FREE_SHIPPING_THRESHOLD } from '../utils/shipping';
import { buildCombo, getSuggestions } from '../utils/recommendations';
import ItemQuantitySelector from './ItemQuantitySelector';
import AddItemButton from './AddItemButton';
import Description from './Description';
import ComboOffer from './ComboOffer';
import ProductSuggestions from './ProductSuggestions';
import Icon from './Icon';

const LOW_STOCK = 5;

function stockText(stock) {
  if (stock <= 0) return 'Sin stock por ahora';
  if (stock <= LOW_STOCK) return `Quedan ${stock} ${stock === 1 ? 'unidad' : 'unidades'}`;
  return 'En stock';
}

export default function ItemDetail({ item }) {
  const { addItem, items } = useCart();
  const { products } = useCatalog();
  const { categories } = useCategories();
  const [quantity, setQuantity] = useState(1);
  useDocumentTitle(item.title);

  const inCart = items.find((i) => i.id === item.id)?.quantity ?? 0;
  const available = Math.max(0, item.stock - inCart);
  const category = categories.find((c) => c.key === item.category);
  const cartIds = items.map((i) => i.id);
  const combo = buildCombo(products, item, cartIds);
  const suggestions = getSuggestions(products, {
    base: item,
    excludeIds: [...cartIds, ...combo.map((p) => p.id)],
    limit: 4,
  });

  const handleAdd = () => {
    addItem(item, Math.min(quantity, available));
    setQuantity(1);
  };

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <Icon name="chevronRight" size={14} />
        <Link to={`/categories/${item.category}`}>{category?.description ?? item.category}</Link>
        <Icon name="chevronRight" size={14} />
        <span aria-current="page">{item.title}</span>
      </nav>

      <article className="item-detail">
        <div className="item-detail-media">
          <img src={item.image} alt={item.title} className="item-detail-image" />
        </div>

        <div className="item-detail-info">
          <h1 className="item-detail-title">{item.title}</h1>
          <p className="item-detail-price">{formatPrice(item.price)}</p>
          <p className={`item-stock ${item.stock <= LOW_STOCK ? 'is-low' : ''}`}>{stockText(item.stock)}</p>

          {available > 0 && (
            <div className="buy-actions">
              <ItemQuantitySelector
                quantity={Math.min(quantity, available)}
                stock={available}
                onChange={setQuantity}
              />
              <AddItemButton onAdd={handleAdd} quantity={Math.min(quantity, available)} />
            </div>
          )}
          {inCart > 0 && (
            <p className="in-cart-note">
              Ya tenés {inCart} en tu carrito.{' '}
              <Link to="/cart" className="text-link">
                Ver carrito
              </Link>
            </p>
          )}

          <ul className="item-perks">
            <li>
              <Icon name="truck" size={18} />
              Envío gratis en compras desde {formatPrice(FREE_SHIPPING_THRESHOLD)}
            </li>
            <li>
              <Icon name="swap" size={18} />
              Cambio de talle sin cargo dentro de los 30 días
            </li>
          </ul>

          <Description text={item.description} />
          <ComboOffer base={item} combo={combo} includeBase={inCart === 0 && item.stock > 0} />
        </div>
      </article>

      <ProductSuggestions title="Combinalo con" products={suggestions} />
    </div>
  );
}
