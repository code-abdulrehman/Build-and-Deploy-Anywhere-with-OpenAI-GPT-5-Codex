# Project Agents Guide

## Mission
Maintain and extend a React 19 + Vite podcast analytics dashboard that uses D3 to turn CSV episode data into actionable programming, growth, and monetization decisions.

## Current State
- Framework: React 19
- Bundler: Vite 8
- Charts: D3 7
- CSV parser: Papa Parse
- Package manager: `pnpm`
- Dataset location: `public/data.csv`
- Main dashboard entry: `src/App.jsx`
- Data parsing and aggregation: `src/data/podcastData.js`
- Reusable chart primitives: `src/components/ChartCard.jsx`

## Product Goal
Help a podcast operator answer:
- When should episodes be published?
- How long should episodes run?
- How much ad load is safe?
- Do guests and host popularity improve completion?
- Which genres and emotional tones sustain attention?

## Dataset Contract
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

## Data Handling Rules
- Read the dataset from `public/data.csv` with `fetch('/data.csv')`
- Parse once in `loadPodcastData()`
- Convert numeric fields during parsing
- Preserve missing values as `null`
- Filter unusable rows only after coercion
- Keep raw parsing concerns separate from derived analytics

## Analytics Model
Current KPI layer:
- Total episodes analyzed
- Average listening time
- Average completion rate
- Total listening minutes

Current chart set:
1. Release slot heatmap by day and time
2. Episode length band performance
3. Host popularity vs completion scatter
4. Guest popularity vs completion scatter
5. Ad load vs completion comparison
6. Genre completion leaderboard
7. Sentiment vs completion comparison

Current recommendation layer:
- Best publication day
- Best publication time
- Best episode length range
- Best-performing genre
- Best-performing ad load

## Architecture
- `src/App.jsx`
  Owns loading, ready/error states, and dashboard composition.
- `src/data/podcastData.js`
  Owns CSV fetch, parsing, cleaning, KPI derivation, grouped analytics, and recommendation generation.
- `src/components/ChartCard.jsx`
  Owns reusable D3 chart renderers.
- `src/components/StatCard.jsx`
  Owns KPI presentation.
- `src/components/InsightCard.jsx`
  Owns recommendation presentation.
- `src/lib/formatters.js`
  Owns numeric display formatting.

## Working Rules For Agents
- Prefer extending existing chart primitives before adding one-off chart files
- Keep business logic out of presentational components
- If a new metric is introduced, derive it in `src/data/podcastData.js`
- If a chart needs a new visual grammar, add a reusable renderer rather than embedding D3 inside `App.jsx`
- Preserve mobile layout quality when adding dashboard sections
- Use concise explanatory copy that helps a podcast operator act on the chart
- Do not move dataset parsing into multiple components

## Safe Change Workflow
1. Inspect `public/data.csv` if a metric or field assumption changes
2. Update parsing and analytics functions first
3. Update charts and cards second
4. Run `pnpm build` after changes

## Extension Ideas
- Add chart tooltips and hover states
- Add filters by genre, publication day, or sentiment
- Add a top-level “next best episode strategy” panel
- Add trend or percentile charts if the dataset later includes dates or download counts
- Add exportable recommendations for content planning

## Definition of Done
- Dashboard loads successfully from `public/data.csv`
- New or changed charts use D3 through reusable components
- Recommendations still match the computed analytics
- `pnpm build` passes
