# Writeflow

A clean, AI-powered writing assistant built with Next.js. Edit text in a distraction-free editor, run Gemini-powered actions on selections or the full draft, and keep version snapshots locally.

**Live demo:** [writeflow-blond.vercel.app](https://writeflow-blond.vercel.app)

## Features

- **AI actions** — Improve, Grammar Check, Summarize, Expand, Rewrite, and Rephrase
- **Command palette** — quick access to actions and document tools
- **Draft history** — save and restore snapshots in the browser
- **Diff view** — compare before/after AI changes
- **Export** — copy or download as Markdown
- **Dark mode** — light/dark theme toggle
- **Multilingual UI** — English and Indonesian (Bahasa Indonesia)

## Tech stack

- Next.js 14 (App Router)
- Google Gemini (`gemini-2.5-flash`) via a secure server-side API route
- Zustand for state, Tailwind CSS for styling, Framer Motion for UI motion

## Getting started

### Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com) API key

### Setup

```bash
git clone https://github.com/Hafizhvito/AI-Writing-Assistant.git
cd AI-Writing-Assistant
npm install
```

Create `.env.local` from the example and add your API key:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_key_here
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest tests |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key (server-side only) |

Never commit `.env.local` or expose your API key in client code.

## Deploy

The app is ready for [Vercel](https://vercel.com). Set `GEMINI_API_KEY` in your project environment variables, then deploy.

## License

Private project — see repository owner for usage terms.
