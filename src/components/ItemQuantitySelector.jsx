export default function ItemQuantitySelector({ quantity, stock, onChange }) {
  const decrement = () => onChange(Math.max(1, quantity - 1));
  const increment = () => onChange(Math.min(stock, quantity + 1));

  return (
    <div className="quantity-selector">
      <button
        type="button"
        className="qty-btn"
        onClick={decrement}
        disabled={quantity <= 1}
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <span className="qty-value">{quantity}</span>
      <button
        type="button"
        className="qty-btn"
        onClick={increment}
        disabled={quantity >= stock}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}
