// Proxies chat requests from the serenity app (PWA + Capacitor native builds)
// to Groq's API (free tier, OpenAI-compatible), keeping the API key
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
const GROQ_MODEL = 'llama-3.3-70b-versatile';

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

    const messages = [
      { role: 'system', content: body.system },
      ...body.messages
    ];

    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }

    const data = await upstream.json();
    const text = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ content: [{ text }] }), {
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
    });
  }
};
