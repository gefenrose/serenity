# serenity

A calm, text-based RTL Hebrew journaling companion - PWA shell.

## What's here

- `index.html` - the app: onboarding (name + gender), home screen with
  time-aware flows, and a chat view for each flow
- `manifest.json` - PWA manifest (installable, standalone, RTL, portrait)
- `sw.js` - network-first service worker for offline support + auto-update
- `icons/` - app icons (192, 512, apple-touch, favicon)
- `worker/` - Cloudflare Worker that proxies chat requests to the Claude API

## Flows

יומן בוקר, סיכום יום, מצב רוח, יומן תודות, סיכום שבועי, ייצוא זכרונות,
and a quiet distress check-in - all defined in the `flows` object in
`index.html`.

## Status

The UI shell, onboarding, and the conversational flows (יומן בוקר, סיכום יום,
מצב רוח, יומן תודות, לחצן מצוקה) are wired up to Claude via the worker below.
סיכום שבועי and ייצוא זכרונות still show static sample text - they need the
Firestore aggregation step (pulling stored mood/journal entries) before they
can call the model with real data.

## Set up the Claude API worker

1. `cd worker`
2. Log in: `npx wrangler login`
3. Add your Anthropic API key as a secret:
   `npx wrangler secret put ANTHROPIC_API_KEY`
4. Deploy: `npx wrangler deploy`
5. Copy the resulting `*.workers.dev` URL into `WORKER_URL` near the top of
   the `<script>` in `index.html`, then commit and push.

The worker only allows requests from `https://gefenrose.github.io` (see
`ALLOWED_ORIGIN` in `worker/worker.js`) - update that if you deploy the app
elsewhere.

## Deploy the app

Enable GitHub Pages for this repo (Settings -> Pages -> branch: main,
folder: /). The app will be served at:

https://gefenrose.github.io/serenity/

