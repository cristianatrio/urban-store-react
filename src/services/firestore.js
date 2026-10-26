import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getShippingCost } from '../utils/shipping';

// --- Catalogo (coleccion "items") ---

export async function getItems(categoryId) {
  const itemsRef = collection(db, 'items');
  const q = categoryId
    ? query(itemsRef, where('category', '==', categoryId))
    : itemsRef;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getItem(id) {
  const snapshot = await getDoc(doc(db, 'items', id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// --- Categorias ---
// Version dinamica: coleccion "categories" con { key, description, tagline, image, order }.
// Si la coleccion no existe o esta vacia, se derivan las categorias
// desde los items del catalogo (version estatica como fallback).

export async function getCategories() {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    if (!snapshot.empty) {
      return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.description.localeCompare(b.description));
    }
  } catch {
    // Si falla la coleccion categories, se usa el fallback estatico
  }
  const items = await getItems();
  const keys = [...new Set(items.map((i) => i.category))];
  return keys.map((key) => ({
    key,
    description: key.charAt(0).toUpperCase() + key.slice(1),
  }));
}

// --- Ordenes (coleccion "orders") ---

// Se lanza cuando el carrito (guardado en localStorage) no coincide con el
// catalogo actual: productos sin stock suficiente o con precio modificado.
export class CartOutdatedError extends Error {
  constructor(outOfStock, priceChanges) {
    super('El carrito no coincide con el catalogo actual');
    this.name = 'CartOutdatedError';
    this.outOfStock = outOfStock;
    this.priceChanges = priceChanges;
  }
}

// Se lanza al confirmar cambios sobre un pedido que ya no se puede modificar
// (no existe o ya fue modificado antes).
export class OrderNotEditableError extends Error {
  constructor() {
    super('El pedido ya no se puede modificar');
    this.name = 'OrderNotEditableError';
  }
}

async function readProducts(transaction, ids) {
  const snapshots = await Promise.all(ids.map((id) => transaction.get(doc(db, 'items', id))));
  return Object.fromEntries(snapshots.map((snapshot) => [snapshot.id, snapshot]));
}

// Compara el carrito con Firestore. reserved: unidades que ya son del cliente
// (las del pedido que se modifica), que cuentan como disponibles.
function assertCartIsCurrent(cartItems, productById, reserved = {}) {
  const outOfStock = [];
  const priceChanges = [];
  cartItems.forEach((cartItem) => {
    const snapshot = productById[cartItem.id];
    const product = snapshot.exists() ? snapshot.data() : null;
    const available = product ? product.stock + (reserved[cartItem.id] ?? 0) : 0;
    if (available < cartItem.quantity) {
      outOfStock.push({ id: cartItem.id, title: cartItem.title, requested: cartItem.quantity, available });
    }
    if (product && product.price !== cartItem.price) {
      priceChanges.push({ id: cartItem.id, title: product.title, price: product.price });
    }
  });
  if (outOfStock.length > 0 || priceChanges.length > 0) {
    throw new CartOutdatedError(outOfStock, priceChanges);
  }
}

// Datos del catalogo al momento de la compra, no los del carrito local
function buildOrder(buyer, cartItems, productById) {
  const items = cartItems.map((cartItem) => {
    const product = productById[cartItem.id].data();
    return {
      id: cartItem.id,
      title: product.title,
      description: product.description ?? '',
      price: product.price,
      quantity: cartItem.quantity,
    };
  });
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shipping = getShippingCost(subtotal);
  return {
    buyer,
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: 'generada',
    date: serverTimestamp(),
  };
}

// Mueve unidades entre stock y vendidos (sold). Las reglas exigen que
// stock + sold no crezca: nunca puede haber mas stock que el inventario cargado.
function moveStock(transaction, snapshot, delta, returnedFrom) {
  const { stock, sold = 0 } = snapshot.data();
  if (delta > 0) {
    transaction.update(snapshot.ref, { stock: stock - delta, sold: sold + delta });
    return;
  }
  const returned = Math.min(-delta, sold);
  if (returned > 0) {
    transaction.update(snapshot.ref, { stock: stock + returned, sold: sold - returned, lastReturn: returnedFrom });
  }
}

// Genera la orden en una transaccion: valida stock y precio contra Firestore,
// descuenta el stock y guarda la orden.
export async function createOrder(buyer, cartItems) {
  return runTransaction(db, async (transaction) => {
    const productById = await readProducts(transaction, cartItems.map((i) => i.id));
    assertCartIsCurrent(cartItems, productById);

    cartItems.forEach((cartItem) => moveStock(transaction, productById[cartItem.id], cartItem.quantity));
    const orderRef = doc(collection(db, 'orders'));
    transaction.set(orderRef, buildOrder(buyer, cartItems, productById));
    return orderRef.id;
  });
}

// "Modificar el pedido": en una transaccion genera la version nueva con el
// carrito (mismos datos de contacto), marca la original como 'modificada' y
// ajusta el stock solo por la diferencia: lo que se saca vuelve al stock.
export async function modifyOrder(originalId, cartItems) {
  return runTransaction(db, async (transaction) => {
    const originalRef = doc(db, 'orders', originalId);
    const originalSnapshot = await transaction.get(originalRef);
    if (!originalSnapshot.exists() || originalSnapshot.data().status !== 'generada') {
      throw new OrderNotEditableError();
    }
    const original = originalSnapshot.data();
    const previous = Object.fromEntries(original.items.map((i) => [i.id, i.quantity]));
    const next = Object.fromEntries(cartItems.map((i) => [i.id, i.quantity]));
    const ids = [...new Set([...Object.keys(previous), ...Object.keys(next)])];

    const productById = await readProducts(transaction, ids);
    assertCartIsCurrent(cartItems, productById, previous);

    ids
      .filter((id) => productById[id].exists())
      .forEach((id) => moveStock(transaction, productById[id], (next[id] ?? 0) - (previous[id] ?? 0), originalId));

    const orderRef = doc(collection(db, 'orders'));
    transaction.set(orderRef, { ...buildOrder(original.buyer, cartItems, productById), basedOn: originalId });
    transaction.update(originalRef, { status: 'modificada', replacedBy: orderRef.id });
    return orderRef.id;
  });
}

export async function getOrder(orderId) {
  const snapshot = await getDoc(doc(db, 'orders', orderId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
