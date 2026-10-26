import Icon from './Icon';

export default function AddItemButton({ onAdd, quantity }) {
  return (
    <button type="button" className="btn btn-primary btn-grow" onClick={onAdd}>
      <Icon name="bag" size={20} />
      {quantity > 1 ? `Agregar ${quantity} al carrito` : 'Agregar al carrito'}
    </button>
  );
}
