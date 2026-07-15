import { useEffect, useState } from 'react';
import { BarChartCard, HeatmapCard, ScatterChartCard } from './components/ChartCard';
import { InsightCard } from './components/InsightCard';
import { StatCard } from './components/StatCard';
import { buildAnalytics, dayOrder, loadPodcastData, timeOrder } from './data/podcastData';
import { formatCount, formatMinutes, formatPercent } from './lib/formatters';

const chartNotes = [
  'Release timing heatmap to expose the strongest day and time combinations.',
  'Length bands to identify a format window listeners actually finish.',
  'Host popularity relationship to completion rate.',
  'Guest popularity relationship to completion rate.',
  'Ad load impact on listener completion.',
  'Genre leaderboard by completion rate.',
  'Sentiment comparison to see whether tone influences attention.',
];

function LoadingSkeleton() {
  return (
    <main className="app-shell">
      <section className="hero hero-skeleton">
        <div className="hero-copy skeleton-card">
          <div className="skeleton skeleton-pill" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line wide" />
          <div className="skeleton skeleton-line" />
        </div>
        <div className="hero-panel skeleton-card">
          <div className="skeleton skeleton-subtitle" />
          <div className="skeleton skeleton-line wide" />
          <div className="skeleton skeleton-line wide" />
          <div className="skeleton skeleton-line" />
        </div>
      </section>

      <section className="stats-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="stat-card skeleton-card">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-metric" />
            <div className="skeleton skeleton-line" />
          </article>
        ))}
      </section>

      <section className="insights-grid">
        {Array.from({ length: 5 }).map((_, index) => (
          <article key={index} className="insight-card skeleton-card">
            <div className="skeleton skeleton-subtitle" />
            <div className="skeleton skeleton-line wide" />
            <div className="skeleton skeleton-line wide" />
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-chart" />
          </article>
        ))}
      </section>

      <section className="charts-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <article key={index} className="chart-card skeleton-card">
            <div className="skeleton skeleton-subtitle" />
            <div className="skeleton skeleton-line wide" />
            <div className="skeleton skeleton-plot" />
          </article>
        ))}
      </section>
    </main>
  );
}

export default function App() {
  const [state, setState] = useState({ status: 'loading', analytics: null, error: null });

  useEffect(() => {
    let cancelled = false;

    loadPodcastData()
      .then((rows) => {
        if (cancelled) return;
        setState({ status: 'ready', analytics: buildAnalytics(rows), error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ status: 'error', analytics: null, error });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (state.status === 'error') {
    return (
      <main className="app-shell">
        <p className="status-message">The dashboard could not load `public/data.csv`: {state.error.message}</p>
      </main>
    );
  }

  const { analytics } = state;

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Podcast Performance Lab</p>
          <h1>Find the release patterns that grow listening time and completion.</h1>
          <p className="hero-body">
            This React 19 and D3 dashboard turns raw episode metadata into practical decisions about timing,
            format, guests, tone, and ad pressure.
          </p>
          <div className="hero-badges">
            <span>Release timing</span>
            <span>Completion rate</span>
            <span>Audience retention</span>
          </div>
        </div>
        <div className="hero-panel">
          <p className="panel-kicker">Decision Pack</p>
          <h2>Included analyses</h2>
          <ul>
            {chartNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Episodes analyzed"
          value={formatCount(analytics.kpis.totalEpisodes)}
          detail="Rows with usable listening and episode length values."
        />
        <StatCard
          label="Average listening time"
          value={formatMinutes(analytics.kpis.avgListeningTime)}
          detail="The mean number of minutes each episode retains."
        />
        <StatCard
          label="Average completion"
          value={formatPercent(analytics.kpis.avgCompletionRate)}
          detail="Listening time divided by episode length, capped at 100%."
        />
        <StatCard
          label="Total listening minutes"
          value={formatCount(Math.round(analytics.kpis.totalListeningTime))}
          detail="Aggregate attention captured across the full dataset."
        />
      </section>

      <section className="insights-grid">
        {analytics.recommendations.map((item) => (
          <InsightCard key={item.title} title={item.title} body={item.body} chart={item.chart} />
        ))}
      </section>

      <section className="charts-grid">
        <HeatmapCard
          title="Best Release Slot"
          description="Average completion rate by day and time reveals when audiences are most likely to stay through an episode."
          data={analytics.heatmap}
          xLabels={timeOrder}
          yLabels={dayOrder}
          valueFormat={(value) => `${value.toFixed(0)}%`}
        />

        <BarChartCard
          title="Optimal Episode Length"
          description="Completion rate by length band shows where shorter or longer formats start to lose attention."
          data={analytics.lengthBands}
          xKey="label"
          yKey="avgCompletionRate"
          color="#1d6fd6"
          yFormat={(value) => `${value.toFixed(0)}%`}
        />

        <ScatterChartCard
          title="Host Popularity vs Completion"
          description="Use this to see whether host fame alone predicts performance or whether strong content still outperforms celebrity."
          data={analytics.hostScatter}
          xKey="x"
          yKey="y"
          color="#ef476f"
          xFormat={(value) => `${value.toFixed(0)}%`}
          yFormat={(value) => `${value.toFixed(0)}%`}
        />

        <ScatterChartCard
          title="Guest Popularity vs Completion"
          description="Guest pull matters, but this chart helps you judge whether bigger names actually translate to deeper listening."
          data={analytics.guestScatter}
          xKey="x"
          yKey="y"
          color="#ff8c42"
          xFormat={(value) => `${value.toFixed(0)}%`}
          yFormat={(value) => `${value.toFixed(0)}%`}
        />

        <BarChartCard
          title="Ad Load Tradeoff"
          description="Average completion rate by number of ads helps balance monetization pressure against listener retention."
          data={analytics.adsData}
          xKey="label"
          yKey="avgCompletionRate"
          color="#8f5cff"
          yFormat={(value) => `${value.toFixed(0)}%`}
        />

        <BarChartCard
          title="Genre Performance Leaderboard"
          description="Top genres by completion rate point to themes and packaging styles worth borrowing for your own show strategy."
          data={analytics.genreData}
          xKey="label"
          yKey="avgCompletionRate"
          color="#00916e"
          yFormat={(value) => `${value.toFixed(0)}%`}
        />

        <BarChartCard
          title="Sentiment and Attention"
          description="Compare positive, neutral, and negative episode tone to understand whether emotional framing affects listener commitment."
          data={analytics.sentimentData}
          xKey="label"
          yKey="avgCompletionRate"
          color="#bc6c25"
          yFormat={(value) => `${value.toFixed(0)}%`}
        />
      </section>
    </main>
  );
}
