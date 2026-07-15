export function InsightCard({ title, body }) {
  return (
    <article className="insight-card">
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
