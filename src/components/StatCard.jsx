export function StatCard({ label, value, detail }) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <strong className="stat-value">{value}</strong>
      <p className="stat-detail">{detail}</p>
    </article>
  );
}
