# OPEN THE BOOK

Mobile-first Next.js prototype for a contemplative Bible NFC experience.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## NFC routes

- `/?t=main` opens the main experience.
- `/?t=journal` opens Journey directly.
- `/?t=study` opens Read directly.
- `/?t=guest` opens the independent guest experience.
- `/?t=meeting` or `/?t=notes` opens the meeting-notes photo summary flow.

## Data and persistence

- User state is device-local through `src/lib/storageService.ts`.
- Meeting-note photos are never stored; only generated summaries are saved in
  local storage.
- Demo data is separated in `src/data/demo.ts` and never seeded into `localStorage`.
- Bible passages are in `src/data/passages.ts`, using Reina-Valera 1909 public-domain text from the `open-bibles` project.

## Vercel + OpenAI

Set these variables in Vercel:

```bash
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-5.6
```

`OPENAI_MODEL` is optional. The default is `gpt-5.6`.

## Validation

```bash
npm run lint
npm run build
```

## GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. On GitHub, set
Pages to deploy from GitHub Actions, then push to `master` or `main`.
