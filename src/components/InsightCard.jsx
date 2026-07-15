import * as d3 from 'd3';

function MiniLineChart({ series, color = '#007a78', formatValue = (value) => value.toFixed(0) }) {
  if (!series?.length) return null;

  const width = 240;
  const height = 108;
  const padding = 12;
  const gradientId = `mini-gradient-${color.replace(/[^a-z0-9]/gi, '')}`;
  const values = series.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);

  const points = series.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(series.length - 1, 1);
    const y = height - padding - ((item.value - minValue) / range) * (height - padding * 2);
    return { ...item, x, y };
  });

  const line = d3
    .line()
    .x((point) => point.x)
    .y((point) => point.y)
    .curve(d3.curveMonotoneX);

  const area = d3
    .area()
    .x((point) => point.x)
    .y0(height - padding)
    .y1((point) => point.y)
    .curve(d3.curveMonotoneX);

  const linePath = line(points) ?? '';
  const areaPath = area(points) ?? '';
  const keyPoints = series.filter((item, index) => item.isActive || index === 0 || index === series.length - 1);

  return (
    <div className="mini-chart" aria-hidden="true">
      <svg className="mini-line-chart" viewBox={`0 0 ${width} ${height}`} role="presentation">
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke="rgba(21, 32, 26, 0.08)" strokeWidth="10" strokeLinecap="round" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
        {points.map((point) => (
          <g key={point.label}>
            {point.isActive ? <circle cx={point.x} cy={point.y} r="10" fill={color} opacity="0.16" /> : null}
            <circle cx={point.x} cy={point.y} r={point.isActive ? 5.5 : 3.5} fill={point.isActive ? color : '#c7cfc8'} />
          </g>
        ))}
      </svg>
      <div className="mini-line-labels">
        {keyPoints.map((item) => (
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
      <p className="insight-summary">{body}</p>
      <MiniLineChart series={chart?.series} color={chart?.color} formatValue={chart?.formatValue} />
    </article>
  );
}
