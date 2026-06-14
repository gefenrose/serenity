# serenity

A calm, text-based RTL Hebrew journaling companion - PWA shell.

## What's here

- `index.html` - the app: onboarding (name + gender), home screen with
  time-aware flows, and a chat view for each flow
- `manifest.json` - PWA manifest (installable, standalone, RTL, portrait)
- `sw.js` - network-first service worker for offline support + auto-update
- `icons/` - app icons (192, 512, apple-touch, favicon)

## Flows

יומן בוקר, סיכום יום, מצב רוח, יומן תודות, סיכום שבועי, ייצוא זכרונות,
and a quiet distress check-in - all defined in the `flows` object in
`index.html`.

## Status

This is the UI shell and onboarding flow only. The Claude API integration
(sending `[FLOW: ...]`, streaming responses into the chat bubble, and
persisting mood/journal entries) is not wired up yet.

## Deploy

Enable GitHub Pages for this repo (Settings -> Pages -> branch: main,
folder: /). The app will be served at:

https://gefenrose.github.io/serenity/
