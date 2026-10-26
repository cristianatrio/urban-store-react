import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

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
// Version dinamica: coleccion "categories" con { key, description }.
// Si la coleccion no existe o esta vacia, se derivan las categorias
// desde los items del catalogo (version estatica como fallback).

export async function getCategories() {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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

export async function createOrder(order) {
  const ref = await addDoc(collection(db, 'orders'), {
    ...order,
    status: 'generada',
    date: serverTimestamp(),
  });
  return ref.id;
}

export async function getOrder(orderId) {
  const snapshot = await getDoc(doc(db, 'orders', orderId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// Valida que haya stock suficiente para todos los items del carrito.
// Devuelve un array con los productos sin stock suficiente (vacio si esta todo ok).
export async function checkStock(cartItems) {
  const outOfStock = [];
  await Promise.all(
    cartItems.map(async (cartItem) => {
      const product = await getItem(cartItem.id);
      if (!product || product.stock < cartItem.quantity) {
        outOfStock.push({
          id: cartItem.id,
          title: cartItem.title,
          requested: cartItem.quantity,
          available: product ? product.stock : 0,
        });
      }
    })
  );
  return outOfStock;
}
