import { formatPrice } from './format';

// Mensaje para el usuario cuando el carrito no coincide con Firestore
// (CartOutdatedError): sin stock suficiente o con precio nuevo.
export function describeOutdatedCart({ outOfStock, priceChanges }) {
  const messages = [];
  if (outOfStock.length > 0) {
    const detail = outOfStock.map((p) => `${p.title} (disponible: ${p.available})`).join(', ');
    messages.push(`Sin stock suficiente para: ${detail}. Ajustá las cantidades en el carrito.`);
  }
  if (priceChanges.length > 0) {
    const detail = priceChanges.map((p) => `${p.title} (ahora ${formatPrice(p.price)})`).join(', ');
    messages.push(`Cambió el precio de: ${detail}. Revisá el nuevo total y confirmá la compra.`);
  }
  return messages.join(' ');
}

// Actualizaciones para syncItems a partir de un CartOutdatedError
export function outdatedCartUpdates({ outOfStock, priceChanges }) {
  return [
    ...outOfStock.map((p) => ({ id: p.id, stock: p.available })),
    ...priceChanges.map((p) => ({ id: p.id, price: p.price })),
  ];
}
