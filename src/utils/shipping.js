// Envio gratis a partir de un monto; por debajo se cobra un costo fijo.
export const FREE_SHIPPING_THRESHOLD = 100000;
export const SHIPPING_COST = 7500;

export function getShippingCost(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function getFreeShippingProgress(subtotal) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  return {
    remaining,
    reached: remaining === 0,
    percent: Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)),
  };
}
