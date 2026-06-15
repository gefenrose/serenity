// Proxies chat requests from the serenity app (PWA + Capacitor native builds)
// to Google's Gemini API (free tier, no card required), keeping the API key
// server-side. Deploy with wrangler (see README).
//
// The response is translated back into the same shape the frontend
// already expects ({ content: [{ text }] }), so index.html doesn't
// need to know which model is behind this.

const ALLOWED_ORIGINS = new Set([
  'https://gefenrose.github.io', // GitHub Pages PWA
  'capacitor://localhost',       // Capacitor iOS
  'https://localhost',           // Capacitor Android (default scheme since v6) / iOS with iosScheme:'https'
  'http://localhost'             // Capacitor Android (pre-v6 default scheme)
]);
const GEMINI_MODEL = 'gemini-2.5-flash';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://gefenrose.github.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders(origin) });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders(origin) });
    }

    if (!body.system || !Array.isArray(body.messages)) {
      return new Response('Missing system or messages', { status: 400, headers: corsHeaders(origin) });
    }

    // Gemini's native API uses "model" instead of "assistant" for the
    // assistant role, and keeps the system prompt in a separate field.
    const contents = body.messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: body.system }] },
          contents
        })
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const data = await upstream.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(JSON.stringify({ content: [{ text }] }), {
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }
};
