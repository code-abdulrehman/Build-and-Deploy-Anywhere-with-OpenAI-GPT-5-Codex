# Podcast Success Dashboard

A React 19 + D3 dashboard for analyzing podcast episode performance from a CSV dataset. The app loads podcast metadata from `public/data.csv`, computes completion and listening-time analytics, and surfaces practical recommendations on release timing, episode length, guest strategy, genre focus, sentiment, and ad load.

## Stack
- React 19
- Vite 8
- D3 7
- Papa Parse
- pnpm

## Features
- KPI cards for total episodes, average listening time, completion rate, and total listening minutes
- 7 decision-oriented charts built with reusable D3 components
- Recommendation cards generated from computed analytics
- Mobile-friendly dashboard layout

## Dataset
Expected CSV columns:
- `Podcast_Name`
- `Episode_Title`
- `Episode_Length_minutes`
- `Genre`
- `Host_Popularity_percentage`
- `Publication_Day`
- `Publication_Time`
- `Guest_Popularity_percentage`
- `Number_of_Ads`
- `Episode_Sentiment`
- `Listening_Time_minutes`

The default dataset path is `public/data.csv`.

## Development
Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Create a production build:

```bash
pnpm build
```

## Project Structure
- `src/App.jsx` dashboard composition and loading state
- `src/data/podcastData.js` CSV parsing, cleaning, analytics, recommendations
- `src/components/ChartCard.jsx` reusable D3 chart renderers
- `src/components/StatCard.jsx` KPI cards
- `src/components/InsightCard.jsx` recommendation cards
- `public/data.csv` source dataset

## Notes
- Missing numeric values are coerced to `null`
- Completion rate is computed as `listeningTime / episodeLength`, capped at `100%`
- Build verification currently passes with `pnpm build`
