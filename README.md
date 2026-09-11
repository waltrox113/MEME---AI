# Meme AI

A starter MVP for an AI meme generator.

## Requirements

- Node.js 18+
- A Gemini API key (optional for testing; without it, fallback mode works)

## Setup

```bash
npm install
copy .env.example .env.local
```

On macOS/Linux use:

```bash
cp .env.example .env.local
```

Put your Gemini key in `.env.local`:

```env
GEMINI_API_KEY=your_key_here
```

Never upload or commit `.env.local`.

## Run

```bash
npm run dev
```

Open http://localhost:3000

## Current MVP

- Image upload
- Image preview
- Gemini vision analysis
- 5 meme concepts
- Expression/context analysis
- Meme scoring
- Provider failure fallback

Next upgrades should add a real meme-format database, live trend retrieval, actual meme image rendering, and the advanced editor.