import { useEffect, useState } from 'react';
import { getCategories, getItems } from '../services/firestore';

// Cache en memoria: el catalogo completo y las categorias se piden una sola
// vez y se comparten entre Home, NavBar, recomendaciones y "Mis ordenes".
const cache = { catalog: null, categories: null };

function useCachedResource(key, loader) {
  const [state, setState] = useState(() => ({
    data: cache[key]?.value ?? [],
    loading: !cache[key]?.value,
    error: null,
  }));

  useEffect(() => {
    if (cache[key]?.value) return undefined;
    let active = true;
    cache[key] = cache[key] ?? { promise: loader() };
    cache[key].promise
      .then((value) => {
        cache[key].value = value;
        if (active) setState({ data: value, loading: false, error: null });
      })
      .catch((error) => {
        console.error(`Error cargando ${key}:`, error);
        cache[key] = null;
        if (active) setState({ data: [], loading: false, error });
      });
    return () => {
      active = false;
    };
  }, [key, loader]);

  return state;
}

export function useCatalog() {
  const { data, loading, error } = useCachedResource('catalog', getItems);
  return { products: data, loading, error };
}

export function useCategories() {
  const { data, loading, error } = useCachedResource('categories', getCategories);
  return { categories: data, loading, error };
}

// Despues de una compra el stock cambia: se descarta el catalogo cacheado.
export function invalidateCatalog() {
  cache.catalog = null;
}
