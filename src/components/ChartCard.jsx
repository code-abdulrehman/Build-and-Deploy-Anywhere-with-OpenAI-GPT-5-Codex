import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function ChartFrame({ title, description, children }) {
  return (
    <article className="chart-card">
      <div className="chart-head">
        <div className="chart-copy">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </article>
  );
}

function setupChart(ref, width, height, margin) {
  const svg = d3.select(ref.current);
  svg.selectAll('*').remove();
  svg.attr('viewBox', `0 0 ${width} ${height}`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const id = `clip-${Math.random().toString(36).slice(2, 9)}`;
  const defs = svg.append('defs');

  defs
    .append('clipPath')
    .attr('id', id)
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('rx', 18);

  const root = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  const plot = root.append('g').attr('clip-path', `url(#${id})`);
  const plotGroup = plot.append('g');
  const xAxis = root.append('g').attr('transform', `translate(0,${innerHeight})`);
  const yAxis = root.append('g');

  root
    .append('rect')
    .attr('class', 'chart-plot-bg')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('rx', 18)
    .attr('fill', 'rgba(23, 33, 29, 0.025)');

  return { plotGroup, xAxis, yAxis, innerWidth, innerHeight };
}

export function BarChartCard({ title, description, data, xKey, yKey, color = '#007a78', yFormat }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data.length) return;

    const width = 640;
    const height = 320;
    const margin = { top: 16, right: 16, bottom: 56, left: 56 };
    const { plotGroup, xAxis, yAxis, innerWidth, innerHeight } = setupChart(ref, width, height, margin);

    const x = d3.scaleBand().domain(data.map((item) => item[xKey])).range([0, innerWidth]).padding(0.24);
    const y = d3.scaleLinear().domain([0, d3.max(data, (item) => item[yKey]) ?? 0]).nice().range([innerHeight, 0]);

    yAxis
      .call(d3.axisLeft(y).ticks(5).tickFormat((value) => yFormat(value)))
      .call((axis) => axis.selectAll('.domain').remove())
      .call((axis) => axis.selectAll('line').attr('stroke', '#d6ddd7'));

    xAxis
      .call(d3.axisBottom(x))
      .call((axis) => axis.selectAll('.domain').remove())
      .call((axis) => axis.selectAll('text').attr('transform', 'translate(0,10)'));

    plotGroup
      .selectAll('rect.data-bar')
      .data(data)
      .join('rect')
      .attr('class', 'data-bar')
      .attr('x', (item) => x(item[xKey]) ?? 0)
      .attr('y', (item) => y(item[yKey]))
      .attr('width', x.bandwidth())
      .attr('height', (item) => innerHeight - y(item[yKey]))
      .attr('rx', 14)
      .attr('fill', color);

    plotGroup
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
    <ChartFrame title={title} description={description}>
      <svg ref={ref} className="chart" role="img" aria-label={title} />
    </ChartFrame>
  );
}

export function ScatterChartCard({ title, description, data, xKey, yKey, color = '#f4a261', xFormat, yFormat }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data.length) return;

    const width = 640;
    const height = 320;
    const margin = { top: 16, right: 16, bottom: 56, left: 56 };
    const { plotGroup, xAxis, yAxis, innerWidth, innerHeight } = setupChart(ref, width, height, margin);

    const x = d3.scaleLinear().domain(d3.extent(data, (item) => item[xKey])).nice().range([0, innerWidth]);
    const y = d3.scaleLinear().domain(d3.extent(data, (item) => item[yKey])).nice().range([innerHeight, 0]);

    yAxis
      .call(d3.axisLeft(y).ticks(5).tickFormat((value) => yFormat(value)))
      .call((axis) => axis.selectAll('.domain').remove())
      .call((axis) => axis.selectAll('line').attr('stroke', '#d6ddd7'));

    xAxis
      .call(d3.axisBottom(x).ticks(6).tickFormat((value) => xFormat(value)))
      .call((axis) => axis.selectAll('.domain').remove());

    plotGroup
      .append('line')
      .attr('x1', x(d3.min(data, (item) => item[xKey])))
      .attr('x2', x(d3.max(data, (item) => item[xKey])))
      .attr('y1', y(d3.min(data, (item) => item[yKey])))
      .attr('y2', y(d3.max(data, (item) => item[yKey])))
      .attr('stroke', '#c7cfc8')
      .attr('stroke-dasharray', '4 6');

    plotGroup
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (item) => x(item[xKey]))
      .attr('cy', (item) => y(item[yKey]))
      .attr('r', 4.5)
      .attr('fill', color)
      .attr('opacity', 0.62);
  }, [data, xKey, yKey, color, xFormat, yFormat]);

  return (
    <ChartFrame title={title} description={description}>
      <svg ref={ref} className="chart" role="img" aria-label={title} />
    </ChartFrame>
  );
}

export function HeatmapCard({ title, description, data, xLabels, yLabels, valueFormat }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!data.length) return;

    const width = 640;
    const height = 360;
    const margin = { top: 16, right: 16, bottom: 56, left: 88 };
    const { plotGroup, xAxis, yAxis, innerWidth, innerHeight } = setupChart(ref, width, height, margin);

    const x = d3.scaleBand().domain(xLabels).range([0, innerWidth]).padding(0.06);
    const y = d3.scaleBand().domain(yLabels).range([0, innerHeight]).padding(0.06);
    const color = d3.scaleSequential().domain(d3.extent(data, (item) => item.value)).interpolator(d3.interpolateYlGnBu);

    yAxis.call(d3.axisLeft(y)).call((axis) => axis.selectAll('.domain').remove());

    xAxis.call(d3.axisBottom(x)).call((axis) => axis.selectAll('.domain').remove());

    plotGroup
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (item) => x(item.time) ?? 0)
      .attr('y', (item) => y(item.day) ?? 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('rx', 14)
      .attr('fill', (item) => color(item.value));

    plotGroup
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
    <ChartFrame title={title} description={description}>
      <svg ref={ref} className="chart" role="img" aria-label={title} />
    </ChartFrame>
  );
}
