export default function AddItemButton({ onAdd, quantity }) {
  return (
    <button type="button" className="btn btn-primary" onClick={onAdd}>
      Agregar {quantity > 1 ? `${quantity} unidades` : 'al carrito'}
    </button>
  );
}
