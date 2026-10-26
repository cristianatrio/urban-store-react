export default function Description({ text }) {
  if (!text) return null;
  return (
    <section className="description">
      <h2 className="description-title">Descripción</h2>
      <p>{text}</p>
    </section>
  );
}
