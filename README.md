# GCS Bucket Viewer

A small browser UI for a local [fake-gcs-server](https://github.com/fsouza/fake-gcs-server)
emulator. Lists buckets and objects, and previews CSVs as a table.

Read-only. It never writes to or deletes from a bucket.


## Running

```bash
npm install
npm run dev
```

Then open http://localhost:5180.

It talks to `http://localhost:4443` by default. Point it elsewhere with the host box in the
header, or with `?host=http://localhost:PORT` in the URL.

## Two things worth knowing

**It has to be served, not opened as a file.** Chrome blocks `fetch()` from a `file://`
origin whatever CORS headers the server sends, so opening `dist/index.html` directly shows
an empty page with no error. Serve it and it works — fake-gcs-server sends
`Access-Control-Allow-Origin: *`, so no proxy is needed.

**Objects usually do not survive a restart.** fake-gcs-server keeps everything in memory
unless you give it a volume, so the buckets come back empty after the container restarts.
That is the emulator, not this app.

## Features

- Buckets listed with object counts, so an empty one is obvious at a glance
- Objects grouped by key prefix rather than shown as one flat list
- CSV preview as a real table with a sticky header, capped at 200 rows
- Anything non-CSV previews as text
- A link to the raw object for the actual download
- Dark by default, with a theme toggle that persists

## Theme

The class is set by an inline script in `index.html` before first paint — doing it from
React instead flashes the wrong theme on every load.

## Stack

Vite, React 19, TypeScript, Tailwind v4, shadcn/ui, IBM Plex Sans + Plex Mono.

- `src/lib/gcs.ts` — the emulator client, formatting and CSV parsing
- `src/lib/theme.ts` — theme state and persistence
- `src/components/` — Toolbar, BucketList, ObjectList, ObjectPreview, ThemeToggle
- `src/components/ui/` — generated shadcn components

Every identifier renders in Plex Mono and every column of digits uses tabular figures, so
ids, sizes and timestamps line up and do not jitter as they change.

## Licence

MIT
