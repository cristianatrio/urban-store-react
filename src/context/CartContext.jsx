import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getShippingCost } from '../utils/shipping';

const CartContext = createContext(null);

// Extra: cart persistente en localStorage
const STORAGE_KEY = 'urbanstore-cart';
// Id del pedido que se esta modificando desde "Mis ordenes"
const EDITING_ORDER_KEY = 'urbanstore-editing-order';

function loadInitialCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadEditingOrder() {
  try {
    return localStorage.getItem(EDITING_ORDER_KEY);
  } catch {
    return null;
  }
}

function toCartItem(product, quantity) {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    category: product.category,
    stock: product.stock,
    quantity,
  };
}

// Suma unidades de un producto respetando el stock disponible
function mergeItem(items, product, quantity) {
  const existing = items.find((i) => i.id === product.id);
  if (!existing) return [...items, toCartItem(product, Math.min(quantity, product.stock ?? quantity))];
  return items.map((i) =>
    i.id === product.id
      ? { ...i, stock: product.stock ?? i.stock, quantity: Math.min(i.quantity + quantity, product.stock ?? i.quantity + quantity) }
      : i
  );
}

// Deja cada producto de la orden con la cantidad del pedido (tope: stock de hoy).
// Lo que ya habia en el carrito se mantiene.
function setOrderQuantities(items, entries) {
  return entries.reduce((acc, { product, quantity }) => {
    const line = toCartItem(product, Math.min(quantity, product.stock));
    return acc.some((i) => i.id === product.id)
      ? acc.map((i) => (i.id === product.id ? line : i))
      : [...acc, line];
  }, items);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitialCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(loadEditingOrder);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Sin acceso a localStorage (modo privado): el carrito vive solo en memoria
    }
  }, [items]);

  useEffect(() => {
    try {
      if (editingOrderId) localStorage.setItem(EDITING_ORDER_KEY, editingOrderId);
      else localStorage.removeItem(EDITING_ORDER_KEY);
    } catch {
      // Sin localStorage la modificacion dura lo que la pestaña
    }
  }, [editingOrderId]);

  // Con el carrito vacio no queda nada del pedido que se estaba modificando
  useEffect(() => {
    if (items.length === 0) setEditingOrderId(null);
  }, [items.length]);

  // Agrega un producto y abre el panel con recomendaciones
  const addItem = (product, quantity = 1) => {
    setItems((prev) => mergeItem(prev, product, quantity));
    setLastAddedId(product.id);
    setDrawerOpen(true);
  };

  // Agrega varios productos de una vez (combo "Completa el look")
  // Recibe [{ product, quantity }]
  const addItems = (entries) => {
    setItems((prev) => entries.reduce((acc, { product, quantity }) => mergeItem(acc, product, quantity), prev));
    setDrawerOpen(true);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock ?? quantity)) }
          : i
      )
    );
  };

  // Actualiza datos de productos del carrito (precio, stock) con los de Firestore.
  // Recibe [{ id, ...campos }]; puede haber varias entradas para el mismo id.
  const syncItems = (updates) => {
    setItems((prev) =>
      prev.map((item) =>
        updates
          .filter((update) => update.id === item.id)
          .reduce((acc, update) => ({ ...acc, ...update }), item)
      )
    );
  };

  // "Modificar el pedido": pasa la orden al carrito para sumar o sacar productos.
  // Recibe [{ product, quantity }] con los productos del catalogo actual.
  const loadOrder = (orderId, entries) => {
    setItems((prev) => setOrderQuantities(prev, entries));
    setEditingOrderId(orderId);
  };

  const stopEditingOrder = () => setEditingOrderId(null);

  const clearCart = () => {
    setItems([]);
    setEditingOrderId(null);
  };
  const closeDrawer = () => setDrawerOpen(false);

  const totalQuantity = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity * i.price, 0),
    [items]
  );

  const shipping = getShippingCost(subtotal);

  const value = useMemo(
    () => ({
      items,
      addItem,
      addItems,
      removeItem,
      updateQuantity,
      syncItems,
      clearCart,
      loadOrder,
      stopEditingOrder,
      editingOrderId,
      totalQuantity,
      subtotal,
      shipping,
      total: subtotal + shipping,
      drawerOpen,
      closeDrawer,
      lastAddedId,
    }),
    [items, totalQuantity, subtotal, shipping, drawerOpen, lastAddedId, editingOrderId]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
