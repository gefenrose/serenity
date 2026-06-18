# serenity

A calm, text-based RTL Hebrew journaling companion - PWA + Capacitor native app.

## What's here

- `index.html` - the app: onboarding (name + gender), home screen with
  time-aware flows, and a chat view for each flow
- `manifest.json` - PWA manifest (installable, standalone, RTL, portrait)
- `sw.js` - network-first service worker for offline support + auto-update
  (PWA only - skipped when running as the native app)
- `icons/` - app icons (192, 512, apple-touch, favicon)
- `worker/` - Cloudflare Worker that proxies chat requests to OpenRouter
- `build.js` / `www/` - copies the files above into `www/`, the web root
  Capacitor expects (generated, not committed)
- `capacitor.config.json`, `package.json` - Capacitor project config

## Flows

יומן בוקר, סיכום יום, מצב רוח, יומן תודות, סיכום שבועי, ייצוא זכרונות,
and a quiet distress check-in - all defined in the `flows` object in
`index.html`.

## Status

The UI shell, onboarding, and all flows (יומן בוקר, סיכום יום, מצב רוח,
יומן תודות, סיכום שבועי, ייצוא זכרונות, לחצן מצוקה) are wired up to
OpenRouter via the worker below, with סיכום שבועי and ייצוא זכרונות
pulling real entries from local storage.

## Set up the worker

Uses OpenRouter (openrouter.ai), which gives one key/account access to
many providers' models, including free-tier options - no card required
for free models. The worker defaults to a free Gemini model (good Hebrew
+ reasoning) and automatically falls back to OpenRouter's auto-selecting
free router if that specific model is ever retired upstream.

1. Get a free API key at https://openrouter.ai/keys
2. `cd worker`
3. Log in: `npx wrangler login`
4. Add the key as a secret:
   `npx wrangler secret put OPENROUTER_API_KEY`
5. Deploy: `npx wrangler deploy`
6. Copy the resulting `*.workers.dev` URL into `WORKER_URL` near the top of
   the `<script>` in `index.html`, then commit and push.

Free-tier model IDs on OpenRouter rotate as providers add/remove free
hosting - check current options at openrouter.ai/models?max_price=0 and
update `PRIMARY_MODEL` in `worker/worker.js` if the default one listed
there has been retired.

The worker translates OpenRouter's response back into the same shape the
frontend expects, so `index.html` doesn't need to know which model is
behind it - swapping providers again later only means editing `worker.js`.

The worker only allows requests from a small allowlist of origins (see
`ALLOWED_ORIGINS` in `worker/worker.js`): the GitHub Pages PWA
(`https://gefenrose.github.io`) and Capacitor's default native origins
(`capacitor://localhost`, `https://localhost`, `http://localhost`). Add
more if you deploy elsewhere.

## Deploy the app (PWA)

Enable GitHub Pages for this repo (Settings -> Pages -> branch: main,
folder: /). The app will be served at:

https://gefenrose.github.io/serenity/

## Capacitor (native app)

This wraps the same app as an iOS/Android app via
[Capacitor](https://capacitorjs.com).

1. Install dependencies: `npm install`
2. Add the platform(s) you need:
   - `npx cap add ios` (requires macOS + Xcode)
   - `npx cap add android` (requires Android Studio)
3. Build the web assets and sync them into the native projects:
   `npm run sync` (runs `build.js` to populate `www/`, then `cap sync`)
4. Open and run:
   - iOS: `npx cap open ios`
   - Android: `npx cap open android`

After any change to `index.html`/`manifest.json`/`sw.js`/`icons/`, re-run
`npm run sync` before building the native app again.

`capacitor.config.json` sets `appId: "com.gefenrose.serenity"` and
`appName: "יומן רגוע"` - change `appId` before your first real build if
you want a different bundle identifier (changing it later affects app
store identity).

### Heads up: storage is per-origin

The native app runs from a different origin (`capacitor://localhost` on
iOS, `https://localhost` on Android) than the PWA
(`https://gefenrose.github.io`). `localStorage` - and therefore your
journal entries and profile - is **not shared** between the PWA and the
native app; they're separate installs with separate data. Use the
"ייצוא גיבוי" / "ייבוא גיבוי" buttons on the home screen to move a backup
between them.

