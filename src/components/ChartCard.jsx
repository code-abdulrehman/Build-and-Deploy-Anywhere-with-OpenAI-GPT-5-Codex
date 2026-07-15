import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function createSvg(ref, width, height, margin) {
  const svg = d3.select(ref.current);
  svg.selectAll('*').remove();
  svg.attr('viewBox', `0 0 ${width} ${height}`);
  return svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
}

export function BarChartCard({ title, description, data, xKey, yKey, color = '#007a78', yFormat }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data.length) return;

    const width = 640;
    const height = 320;
    const margin = { top: 16, right: 16, bottom: 56, left: 56 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const root = createSvg(ref, width, height, margin);

    const x = d3
      .scaleBand()
      .domain(data.map((item) => item[xKey]))
      .range([0, innerWidth])
      .padding(0.24);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (item) => item[yKey]) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    root
      .append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((value) => yFormat(value)))
      .call((axis) => axis.selectAll('.domain').remove())
      .call((axis) => axis.selectAll('line').attr('stroke', '#d6ddd7'));

    root
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .call((axis) => axis.selectAll('.domain').remove())
      .call((axis) => axis.selectAll('text').attr('transform', 'translate(0,10)'));

    root
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (item) => x(item[xKey]) ?? 0)
      .attr('y', (item) => y(item[yKey]))
      .attr('width', x.bandwidth())
      .attr('height', (item) => innerHeight - y(item[yKey]))
      .attr('rx', 12)
      .attr('fill', color);

    root
      .selectAll('.bar-label')
      .data(data)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', (item) => (x(item[xKey]) ?? 0) + x.bandwidth() / 2)
      .attr('y', (item) => y(item[yKey]) - 8)
      .attr('text-anchor', 'middle')
      .text((item) => yFormat(item[yKey]));
  }, [data, xKey, yKey, color, yFormat]);

  return (
    <article className="chart-card">
      <div className="chart-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <svg ref={ref} className="chart" role="img" aria-label={title} />
    </article>
  );
}

export function ScatterChartCard({
  title,
  description,
  data,
  xKey,
  yKey,
  color = '#f4a261',
  xFormat,
  yFormat,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data.length) return;

    const width = 640;
    const height = 320;
    const margin = { top: 16, right: 16, bottom: 56, left: 56 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const root = createSvg(ref, width, height, margin);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (item) => item[xKey]))
      .nice()
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (item) => item[yKey]))
      .nice()
      .range([innerHeight, 0]);

    root
      .append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((value) => yFormat(value)))
      .call((axis) => axis.selectAll('.domain').remove())
      .call((axis) => axis.selectAll('line').attr('stroke', '#d6ddd7'));

    root
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat((value) => xFormat(value)))
      .call((axis) => axis.selectAll('.domain').remove());

    root
      .append('line')
      .attr('x1', x(d3.min(data, (item) => item[xKey])))
      .attr('x2', x(d3.max(data, (item) => item[xKey])))
      .attr('y1', y(d3.min(data, (item) => item[yKey])))
      .attr('y2', y(d3.max(data, (item) => item[yKey])))
      .attr('stroke', '#c7cfc8')
      .attr('stroke-dasharray', '4 6');

    root
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (item) => x(item[xKey]))
      .attr('cy', (item) => y(item[yKey]))
      .attr('r', 4.5)
      .attr('fill', color)
      .attr('opacity', 0.58);
  }, [data, xKey, yKey, color, xFormat, yFormat]);

  return (
    <article className="chart-card">
      <div className="chart-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <svg ref={ref} className="chart" role="img" aria-label={title} />
    </article>
  );
}

export function HeatmapCard({ title, description, data, xLabels, yLabels, valueFormat }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data.length) return;

    const width = 640;
    const height = 360;
    const margin = { top: 16, right: 16, bottom: 56, left: 88 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const root = createSvg(ref, width, height, margin);

    const x = d3.scaleBand().domain(xLabels).range([0, innerWidth]).padding(0.06);
    const y = d3.scaleBand().domain(yLabels).range([0, innerHeight]).padding(0.06);
    const color = d3
      .scaleSequential()
      .domain(d3.extent(data, (item) => item.value))
      .interpolator(d3.interpolateYlGnBu);

    root
      .append('g')
      .call(d3.axisLeft(y))
      .call((axis) => axis.selectAll('.domain').remove());

    root
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .call((axis) => axis.selectAll('.domain').remove());

    root
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (item) => x(item.time) ?? 0)
      .attr('y', (item) => y(item.day) ?? 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 12)
      .attr('fill', (item) => color(item.value));

    root
      .selectAll('.heatmap-label')
      .data(data)
      .join('text')
      .attr('class', 'heatmap-label')
      .attr('x', (item) => (x(item.time) ?? 0) + x.bandwidth() / 2)
      .attr('y', (item) => (y(item.day) ?? 0) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'middle')
      .text((item) => valueFormat(item.value));
  }, [data, xLabels, yLabels, valueFormat]);

  return (
    <article className="chart-card">
      <div className="chart-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <svg ref={ref} className="chart" role="img" aria-label={title} />
    </article>
  );
}
