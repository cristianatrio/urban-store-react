# 🛍️ Urban Store — Proyecto Final React JS (CoderHouse)

E-commerce de **indumentaria urbana** desarrollado con React + Vite, con catálogo,
carrito de compras y checkout conectados a **Firebase Firestore**.

## 🎯 Enfoque del proyecto

Se eligió el rubro **indumentaria urbana** (remeras, pantalones, calzado y accesorios).
La app está pensada como una SPA con navegación declarativa (React Router) y un
estado global de carrito (Context API) persistido en el navegador.

### Funcionalidades

**Requisitos base**

- Catálogo de productos en la ruta `/`, servido desde la colección `items` de Firestore.
- Menú desplegable de categorías en el NavBar → ruta `/categories/:categoryId`.
- Detalle de producto en `/item/:id` con foto, descripción, precio y selector de
  cantidad. Si el producto no existe en Firebase, se muestra un mensaje adecuado.
- `CartWidget` en el NavBar con el contador total de unidades, visible durante
  toda la experiencia → ruta `/cart`.
- Carrito con listado compacto, edición de cantidades, eliminación de ítems y total.
- Checkout (`/checkout`) con **Brief** (detalle de compra) y formulario de
  nombre, apellido, teléfono y e-mail (ingresado dos veces). El botón
  **"Realizar compra"** solo se activa cuando el formulario es válido y los
  e-mails coinciden.
- Al confirmar, se guarda la orden en la colección `orders` de Firestore
  (items con precios al momento de la compra, fecha y estado `generada`) y se
  entrega al usuario el **order id** generado por Firebase.
- Navegación 100% con React Router (sin `href` ni `location`).

**Extras implementados**

- 🗂️ **Categorías dinámicas**: el menú se hidrata desde la colección `categories`
  (`{ key, description }`), con fallback a categorías derivadas del catálogo.
- 💾 **Carrito persistente**: el carrito se guarda en `localStorage` y sobrevive
  a recargas del navegador.
- 📦 **Stock check**: antes de generar la orden se valida el stock disponible
  de cada producto.
- 🧾 **Mis órdenes**: con el `orderId` se puede consultar el detalle de la orden
  en `/order/:orderId` (sin datos personales).

## 🚀 Cómo correr el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Firebase
#    Copiar .env.example como .env y completar las credenciales
#    de tu proyecto (https://console.firebase.google.com)
cp .env.example .env

# 3. Cargar el catálogo inicial en Firestore (colecciones items y categories)
npm run seed

# 4. Levantar el servidor de desarrollo
npm run dev
```

Para recargar el catálogo desde cero: `node --env-file=.env scripts/seed.js --force`

## 🗃️ Estructura de Firestore

| Colección   | Documento                                                                |
| ----------- | ------------------------------------------------------------------------ |
| `items`     | `title`, `price`, `category`, `stock`, `image`, `description`            |
| `categories`| `key`, `description`                                                     |
| `orders`    | `buyer`, `items[]` (id, title, price, quantity), `total`, `date`, `status` |

## 📁 Estructura de componentes

```
src/
├── components/
│   ├── NavBar.jsx
│   ├── CartWidget.jsx
│   ├── ItemListContainer.jsx
│   ├── ItemList.jsx
│   ├── Item.jsx
│   ├── ItemDetailContainer.jsx
│   ├── ItemDetail.jsx
│   ├── ItemQuantitySelector.jsx
│   ├── AddItemButton.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Brief.jsx
│   ├── OrderView.jsx
│   └── NotFound.jsx
├── context/
│   └── CartContext.jsx
├── firebase/
│   └── config.js
├── services/
│   └── firestore.js
└── utils/
    └── format.js
```

## 📚 Librerías utilizadas

| Librería | Link | Justificación |
| --- | --- | --- |
| **react-router-dom** | https://github.com/remix-run/react-router | Permite la navegación declarativa por rutas (`/`, `/categories/:categoryId`, `/item/:id`, `/cart`, `/checkout`) exigida por el brief, sin recargas de página ni uso de `href`. |
| **firebase** | https://github.com/firebase/firebase-js-sdk | SDK oficial para usar **Firestore** como base de datos del catálogo (`items`), las categorías (`categories`) y las órdenes de compra (`orders`). |
| **vite** | https://github.com/vitejs/vite | Entorno de desarrollo y build mucho más rápido que CRA, con soporte nativo de variables de entorno (`import.meta.env`) para las credenciales de Firebase. |

No se utilizaron librerías de UI: todos los estilos son CSS propio (`src/index.css`),
para demostrar dominio de layout (flex/grid) y componentes sin dependencias visuales.

## 🖼️ Imágenes

Las imágenes de los productos son SVG estáticos servidos desde `public/images/`
(siguiendo la sugerencia del brief de alojar las fotos en una subruta `/images/:itemid`),
por lo que el proyecto no depende de servicios externos de imágenes.
