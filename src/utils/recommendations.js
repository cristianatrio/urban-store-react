// Recomendaciones y combos armados en el cliente a partir del catalogo.
// Cada categoria tiene un orden de categorias que "combinan" con ella.
const COMPLEMENTS = {
  remeras: ['pantalones', 'calzado', 'accesorios'],
  pantalones: ['remeras', 'calzado', 'accesorios'],
  calzado: ['pantalones', 'remeras', 'accesorios'],
  accesorios: ['remeras', 'pantalones', 'calzado'],
};

function complementRank(base, product) {
  if (!base) return 0;
  const order = COMPLEMENTS[base.category] ?? [];
  const index = order.indexOf(product.category);
  return index === -1 ? 0 : order.length - index;
}

/**
 * Devuelve productos sugeridos ordenados por afinidad.
 * @param {Array} catalog productos del catalogo
 * @param {{ base?: object, excludeIds?: string[], remaining?: number, limit?: number }} options
 *   base: producto de referencia; remaining: monto que falta para el envio gratis
 */
export function getSuggestions(catalog, { base = null, excludeIds = [], remaining = 0, limit = 4 } = {}) {
  const excluded = new Set([...(base ? [base.id] : []), ...excludeIds]);
  return catalog
    .filter((p) => !excluded.has(p.id) && p.stock > 0)
    .map((p) => ({
      product: p,
      score:
        complementRank(base, p) * 10 +
        (p.featured ? 3 : 0) +
        (remaining > 0 && p.price >= remaining ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price)
    .slice(0, limit)
    .map(({ product }) => product);
}

/**
 * Arma un combo con el producto base y uno de cada una de las dos categorias
 * que mejor combinan, priorizando destacados. Devuelve los productos a sumar
 * (sin el base) o un array vacio si no se puede armar.
 */
export function buildCombo(catalog, base, excludeIds = []) {
  if (!base) return [];
  const excluded = new Set([base.id, ...excludeIds]);
  const [first, second] = COMPLEMENTS[base.category] ?? [];
  const pick = (category) =>
    catalog
      .filter((p) => p.category === category && p.stock > 0 && !excluded.has(p.id))
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.price - b.price)[0];
  const combo = [pick(first), pick(second)].filter(Boolean);
  return combo.length === 2 ? combo : [];
}
