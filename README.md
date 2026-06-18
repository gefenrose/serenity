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

Uses Groq (console.groq.com), which has a genuinely free tier - no card
required. (An OpenRouter-based setup was tried for better Hebrew quality
via a free Gemini route, but that specific free model ID stopped being
live and silently fell through to a random small free model with poor
Hebrew - reverted back to Groq until a properly-verified alternative is
in place.)

### Ongoing changes: deploys automatically already

This repo's Worker is connected to Cloudflare via their native Git
integration (Workers Builds) - every push to `main` that touches
`worker/` deploys automatically, visible as a commit status/check on
GitHub. No separate CI workflow or Cloudflare editor needed for code
changes.

(A `CLOUDFLARE_API_TOKEN` GitHub Actions secret may exist from an
earlier attempt to wire up a redundant GitHub Action for this - safe
to delete, it's not used for anything.)

### First-time setup (or to rotate the AI provider key)

The `GROQ_API_KEY` secret on the Worker itself is separate from the
deploy token above, and isn't something a GitHub Action needs to
touch - set it once via the Cloudflare dashboard:

1. Get a free API key at https://console.groq.com/keys
2. Cloudflare dashboard → Workers & Pages → serenity-api → Settings →
   Variables and Secrets → Add → type **Secret**, name `GROQ_API_KEY`,
   paste the value → Deploy

(Or via CLI: `cd worker`, `npx wrangler login`, then
`npx wrangler secret put GROQ_API_KEY`.)

The worker translates the provider's response back into the same shape
the frontend expects, so `index.html` doesn't need to know which model
is behind it - swapping providers again later only means editing
`worker.js` and pushing (which now deploys itself).

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

