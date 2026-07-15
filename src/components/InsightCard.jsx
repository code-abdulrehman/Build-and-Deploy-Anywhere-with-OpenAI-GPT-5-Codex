function MiniLineChart({ series, color = '#007a78', formatValue = (value) => value.toFixed(0) }) {
  if (!series?.length) return null;

  const width = 240;
  const height = 96;
  const padding = 10;
  const values = series.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);

  const points = series.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(series.length - 1, 1);
    const y = height - padding - ((item.value - minValue) / range) * (height - padding * 2);
    return { ...item, x, y };
  });

  const pathData = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="mini-chart" aria-hidden="true">
      <svg className="mini-line-chart" viewBox={`0 0 ${width} ${height}`} role="presentation">
        <polyline
          fill="none"
          stroke="rgba(21, 32, 26, 0.14)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pathData}
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pathData}
        />
        {points.map((point) => (
          <circle
            key={point.label}
            cx={point.x}
            cy={point.y}
            r={point.isActive ? 5.5 : 3.5}
            fill={point.isActive ? color : '#c7cfc8'}
          />
        ))}
      </svg>
      <div className="mini-line-labels">
        {series.map((item) => (
          <div key={item.label} className={`mini-line-label${item.isActive ? ' is-active' : ''}`}>
            <span className="mini-line-value">{formatValue(item.value)}</span>
            <span className="mini-line-name">{item.shortLabel ?? item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightCard({ title, body, chart }) {
  return (
    <article className="insight-card">
      <h3>{title}</h3>
      <p>{body}</p>
      <MiniLineChart series={chart?.series} color={chart?.color} formatValue={chart?.formatValue} />
    </article>
  );
}
