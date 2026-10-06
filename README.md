# Maestro AI — Frontend

Maestro AI is an AI music composition studio in the browser. You describe a song's style, mood, theme, key and tempo, and a team of AI agents writes the chords, melody and lyrics. You can then edit the arrangement, play it back, and export it as MIDI, WAV, MP3, stems, MusicXML or a full package.

This repo holds the **React + Vite** web app. The API lives in the `MusicBackend` repo.

## Features

- **Agent-driven composition**: a live progress overlay streams each agent's step (reference → lyricist → sentiment → theorist → composer → improvisor → director).
- **Studio workspace**: arrangement map, chord timeline, piano roll, note editor, section editor, chord/lyric sheet view and mixer.
- **Refine with AI**: regenerate or improve a single part (melody, chords, lyrics…) with extra instructions.
- **Quality checks**: music-theory validation, an evaluation score and a commercial-readiness review.
- **Accounts and organisation**: sign up, log in, reset your password with an emailed code, and save your work as workspaces → projects → drafts.
- **Exports**: MIDI, WAV, MP3, stems, MusicXML, notation text and a ZIP package.

## Tech stack

React 19 · Vite 8 · lucide-react · plain CSS

## Getting started

Requirements: **Node.js 20.19+** (or 22.12+) and a running Maestro AI backend (`MusicBackend` repo).

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your backend
npm run dev               # http://localhost:3000
```

| Variable            | Default                         | Description                     |
| ------------------- | ------------------------------- | ------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:5050/api/v1`  | Base URL of the backend API     |

> The backend must allow this app's origin in `CORS_ORIGIN` (the default already includes `http://localhost:3000`).

### Scripts

| Command           | What it does                     |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start the dev server on port 3000 |
| `npm run build`   | Build for production into `dist/` |
| `npm run preview` | Serve the production build        |

## Deployment

**Vercel**: import the repo and set `VITE_API_BASE_URL` in the project's environment variables. `vercel.json` already sets up the SPA rewrites and asset caching.

**Docker**: the image builds the app and serves it with nginx on port 3000:

```bash
docker build --build-arg VITE_API_BASE_URL=https://your-backend.example.com/api/v1 -t maestro-ai-web .
docker run -p 3000:3000 maestro-ai-web
```

## Project structure

```
src/
├── App.jsx            # App shell and studio state
├── api.js             # All backend calls (incl. SSE streaming for /compose)
├── components/        # Studio UI: PianoRoll, NoteEditor, MixerPanel, ...
├── constants/         # Styles, moods, keys, agents and instrument presets
├── utils/             # Music and formatting helpers
└── styles.css
```

## License

[MIT](LICENSE)
