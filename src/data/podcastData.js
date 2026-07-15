import * as d3 from 'd3';
import Papa from 'papaparse';

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeOrder = ['Morning', 'Afternoon', 'Evening', 'Night'];
const CSV_PATH = '/data.csv';

const average = (items, key) => d3.mean(items, (item) => item[key]) ?? 0;

const sum = (items, key) => d3.sum(items, (item) => item[key] ?? 0);

const withCount = (groups, valueBuilder) =>
  groups.map(([label, items]) => ({
    label,
    count: items.length,
    ...valueBuilder(items),
  }));

export async function loadPodcastData() {
  const response = await fetch(CSV_PATH);
  const text = await response.text();

  const parsed = Papa.parse(text, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
  });

  return parsed.data
    .map((row) => {
      const lengthMinutes = Number(row.Episode_Length_minutes);
      const listeningTime = Number(row.Listening_Time_minutes);
      const hostPopularity = Number(row.Host_Popularity_percentage);
      const guestPopularity = Number(row.Guest_Popularity_percentage);
      const numberOfAds = Number(row.Number_of_Ads);

      return {
        podcastName: row.Podcast_Name,
        episodeTitle: row.Episode_Title,
        genre: row.Genre,
        publicationDay: row.Publication_Day,
        publicationTime: row.Publication_Time,
        sentiment: row.Episode_Sentiment,
        episodeLength: Number.isFinite(lengthMinutes) ? lengthMinutes : null,
        listeningTime: Number.isFinite(listeningTime) ? listeningTime : null,
        hostPopularity: Number.isFinite(hostPopularity) ? hostPopularity : null,
        guestPopularity: Number.isFinite(guestPopularity) ? guestPopularity : null,
        numberOfAds: Number.isFinite(numberOfAds) ? numberOfAds : null,
      };
    })
    .filter((row) => row.episodeLength && row.listeningTime && row.hostPopularity !== null);
}

function buildLengthBands(rows) {
  const bands = [
    { label: '0-30 min', min: 0, max: 30 },
    { label: '30-45 min', min: 30, max: 45 },
    { label: '45-60 min', min: 45, max: 60 },
    { label: '60-90 min', min: 60, max: 90 },
    { label: '90+ min', min: 90, max: Number.POSITIVE_INFINITY },
  ];

  return bands.map((band) => {
    const items = rows.filter((row) => row.episodeLength >= band.min && row.episodeLength < band.max);
    return {
      label: band.label,
      avgListeningTime: average(items, 'listeningTime'),
      avgCompletionRate: average(items, 'completionRate'),
      count: items.length,
    };
  });
}

export function buildAnalytics(rows) {
  const enriched = rows.map((row) => ({
    ...row,
    completionRate: Math.min((row.listeningTime / row.episodeLength) * 100, 100),
  }));

  const validGuestRows = enriched.filter((row) => row.guestPopularity !== null);
  const validAdRows = enriched.filter((row) => row.numberOfAds !== null);

  const dayData = withCount(
    [...d3.group(enriched, (row) => row.publicationDay).entries()].sort(
      (a, b) => dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]),
    ),
    (items) => ({
      avgListeningTime: average(items, 'listeningTime'),
      avgCompletionRate: average(items, 'completionRate'),
    }),
  );

  const timeData = withCount(
    [...d3.group(enriched, (row) => row.publicationTime).entries()].sort(
      (a, b) => timeOrder.indexOf(a[0]) - timeOrder.indexOf(b[0]),
    ),
    (items) => ({
      avgListeningTime: average(items, 'listeningTime'),
      avgCompletionRate: average(items, 'completionRate'),
    }),
  );

  const heatmap = dayOrder.flatMap((day) =>
    timeOrder.map((time) => {
      const items = enriched.filter((row) => row.publicationDay === day && row.publicationTime === time);
      return {
        day,
        time,
        value: average(items, 'completionRate'),
      };
    }),
  );

  const lengthBands = buildLengthBands(enriched);

  const genreData = withCount(
    [...d3.group(enriched, (row) => row.genre).entries()].sort(
      (a, b) => average(b[1], 'completionRate') - average(a[1], 'completionRate'),
    ),
    (items) => ({
      avgListeningTime: average(items, 'listeningTime'),
      avgCompletionRate: average(items, 'completionRate'),
    }),
  ).slice(0, 8);

  const sentimentData = withCount(
    [...d3.group(enriched, (row) => row.sentiment).entries()],
    (items) => ({
      avgListeningTime: average(items, 'listeningTime'),
      avgCompletionRate: average(items, 'completionRate'),
    }),
  );

  const adsData = withCount(
    [...d3.group(validAdRows, (row) => row.numberOfAds).entries()].sort((a, b) => Number(a[0]) - Number(b[0])),
    (items) => ({
      avgListeningTime: average(items, 'listeningTime'),
      avgCompletionRate: average(items, 'completionRate'),
    }),
  );

  const kpis = {
    totalEpisodes: enriched.length,
    avgListeningTime: average(enriched, 'listeningTime'),
    avgCompletionRate: average(enriched, 'completionRate'),
    totalListeningTime: sum(enriched, 'listeningTime'),
  };

  const bestDay = dayData.reduce((best, current) =>
    current.avgCompletionRate > best.avgCompletionRate ? current : best,
  );
  const bestTime = timeData.reduce((best, current) =>
    current.avgCompletionRate > best.avgCompletionRate ? current : best,
  );
  const bestLength = lengthBands.reduce((best, current) =>
    current.avgCompletionRate > best.avgCompletionRate ? current : best,
  );
  const bestGenre = genreData.reduce((best, current) =>
    current.avgCompletionRate > best.avgCompletionRate ? current : best,
  );
  const bestAds = adsData.reduce((best, current) =>
    current.avgCompletionRate > best.avgCompletionRate ? current : best,
  );

  const recommendations = [
    {
      title: `Prioritize ${bestDay.label} releases`,
      body: `${bestDay.label} shows the strongest average completion rate at ${bestDay.avgCompletionRate.toFixed(1)}%, making it the best weekday to test premium episodes and promotional launches.`,
    },
    {
      title: `Publish more often in the ${bestTime.label.toLowerCase()}`,
      body: `${bestTime.label} releases keep listeners around for ${bestTime.avgCompletionRate.toFixed(1)}% of an episode on average, suggesting stronger habit alignment in that slot.`,
    },
    {
      title: `Aim for ${bestLength.label} episodes`,
      body: `Episodes in the ${bestLength.label} range produce the best average completion rate at ${bestLength.avgCompletionRate.toFixed(1)}%, which is a strong target for your main format.`,
    },
    {
      title: `Lean into ${bestGenre.label}`,
      body: `${bestGenre.label} leads the genre table by completion rate. If your show can borrow adjacent topics or packaging cues from that genre, it is worth testing.`,
    },
    {
      title: `Keep ad load near ${bestAds.label}`,
      body: `${bestAds.label} ads correlates with the best completion rate in this dataset. Treat heavier ad breaks cautiously unless revenue outweighs attention loss.`,
    },
  ];

  return {
    rows: enriched,
    kpis,
    recommendations,
    dayData,
    timeData,
    heatmap,
    lengthBands,
    genreData,
    sentimentData,
    adsData,
    hostScatter: enriched.map((row) => ({
      x: row.hostPopularity,
      y: row.completionRate,
    })),
    guestScatter: validGuestRows.map((row) => ({
      x: row.guestPopularity,
      y: row.completionRate,
    })),
  };
}

export { dayOrder, timeOrder };
