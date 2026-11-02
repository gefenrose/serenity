# Serenity — יומן רגוע

A calm, text-based RTL Hebrew journaling companion for the web (PWA) and Capacitor native apps.

## How it works

- `index.html` — onboarding, journal flows, chat, mood chart, settings and backups
- `manifest.json` — PWA manifest
- `sw.js` — network-first PWA service worker for offline access to the app shell
- `icons/` — app icons
- `build.js` — prepares the `www/` directory for Capacitor
- `capacitor.config.json` and `package.json` — native app tooling

### Journal flows

יומן בוקר, סיכום יום, מצב רוח, יומן תודות, סיכום שבועי, ייצוא זכרונות, ולחצן מצוקה.

Recent journal entries for weekly summaries are read from this device's local storage.

## Connect AI directly to Groq (no server required)

Serenity no longer needs a Cloudflare Worker, OpenRouter account, or server environment variables. The app sends its chat requests from the browser directly to the Groq API, using **your own personal Groq API key**.

1. Create your personal key at https://console.groq.com/keys.
2. Open Serenity: https://gefenrose.github.io/serenity/.
3. Open **הגדרות** (gear icon) → **חיבור לבינה מלאכותית · Groq**.
4. Paste your key (starts with `gsk_`) and select **שמירת מפתח**.
5. Select **בדיקת חיבור** to check the key. Start a journaling flow.

Serenity currently uses `openai/gpt-oss-120b` through Groq, with `openai/gpt-oss-20b` as its fallback. The `openai/` prefix is part of Groq's *model identifier*; this setup does **not** use an OpenAI API key.

### API key security and privacy

**A direct browser connection is less secure than keeping the key on a trusted server.**

- By default the key is kept in this browser tab's `sessionStorage`, so it is not meant to be permanent. It can survive a refresh, but you may need to enter it again in another tab or session.
- To keep it across sessions, explicitly enable **לזכור את המפתח במכשיר (פחות בטוח)** before saving. This writes it into browser `localStorage` in readable form. Other scripts running on the same origin, browser extensions or someone with device access may be able to read it.
- The key is never committed into GitHub source files, and Serenity excludes it from local backup files and Google Drive backups.
- Clearing browser storage may remove the key. Deleting the key in settings removes the stored copies.
- Journal messages are sent to **Groq**, an external AI provider, to generate responses. Treat sensitive journal content accordingly.
- Use a dedicated personal key, monitor usage, and revoke/rotate the key from Groq's dashboard if exposed.
- Groq's free and paid limits and availability can change.

### Troubleshooting

- **מפתח נדחה**: check that the key belongs to Groq, begins with `gsk_` and is active.
- **מכסת הבקשות הושגה**: wait for your Groq request limit to reset, or consult your Groq account.
- **לא ניתן להגיע ל-Groq**: check network access and browser privacy/CORS restrictions.
- **No response**: verify the model is enabled for your Groq account.

The connection-test button checks key validity and model listing. It is not a full chat-generation test.

## Deploy the web app

Enable GitHub Pages for the `main` branch, repository root, under **Settings → Pages**.

URL: https://gefenrose.github.io/serenity/

## Capacitor (native app)

1. Install dependencies: `npm install`
2. Add platforms:
   - `npx cap add ios` (requires macOS + Xcode)
   - `npx cap add android` (requires Android Studio)
3. Sync: `npm run sync` (generates `www/` and runs `cap sync`)
4. Open the project:
   - iOS: `npx cap open ios`
   - Android: `npx cap open android`

After editing `index.html`, `manifest.json`, `sw.js`, or `icons/`, rerun `npm run sync` before building a native app.

### Storage is per origin

GitHub Pages (`https://gefenrose.github.io`) and native Capacitor origins
(`capacitor://localhost` on iOS and `https://localhost` on Android) each
have their own local storage. Profiles and journal entries are not shared
automatically. Use the backup/import controls to move journal data; enter
the personal Groq API key separately on each device.

## Legacy Cloudflare deployment

Older app versions used `serenity-api.gefenrose.workers.dev`. The new
web app makes no requests to it. The old deployed Worker (if still present)
can be disabled or deleted separately in the Cloudflare dashboard after all
devices have updated; removing files from this repository does not delete
the deployed Cloudflare service.
