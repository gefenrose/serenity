# serenity

A calm, text-based RTL Hebrew journaling companion - PWA shell.

## What's here

- `index.html` - the app: onboarding (name + gender), home screen with
  time-aware flows, and a chat view for each flow
- `manifest.json` - PWA manifest (installable, standalone, RTL, portrait)
- `sw.js` - network-first service worker for offline support + auto-update
- `icons/` - app icons (192, 512, apple-touch, favicon)
- `worker/` - Cloudflare Worker that proxies chat requests to the Gemini API

## Flows

יומן בוקר, סיכום יום, מצב רוח, יומן תודות, סיכום שבועי, ייצוא זכרונות,
and a quiet distress check-in - all defined in the `flows` object in
`index.html`.

## Status

The UI shell, onboarding, and the conversational flows (יומן בוקר, סיכום יום,
מצב רוח, יומן תודות, לחצן מצוקה) are wired up to Gemini via the worker below.
סיכום שבועי and ייצוא זכרונות still show static sample text - they need the
Firestore aggregation step (pulling stored mood/journal entries) before they
can call the model with real data.

## Set up the worker

Uses Google's Gemini API (`gemini-2.5-flash`), which has a genuinely free
tier - no card required.

1. Get a free API key at https://aistudio.google.com/apikey
2. `cd worker`
3. Log in: `npx wrangler login`
4. Add the key as a secret:
   `npx wrangler secret put GEMINI_API_KEY`
5. Deploy: `npx wrangler deploy`
6. Copy the resulting `*.workers.dev` URL into `WORKER_URL` near the top of
   the `<script>` in `index.html`, then commit and push.

The worker translates Gemini's response back into the same shape the
frontend expects, so `index.html` doesn't need to know which model is
behind it - swapping providers again later only means editing `worker.js`.

The worker only allows requests from `https://gefenrose.github.io` (see
`ALLOWED_ORIGIN` in `worker/worker.js`) - update that if you deploy the app
elsewhere.

## Deploy the app

Enable GitHub Pages for this repo (Settings -> Pages -> branch: main,
folder: /). The app will be served at:

https://gefenrose.github.io/serenity/

