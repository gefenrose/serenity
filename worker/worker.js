// Proxies chat requests from the serenity PWA to Google's Gemini API
// (free tier, no card required), keeping the API key server-side.
// Deploy with wrangler (see README).
//
// The response is translated back into the same shape the frontend
// already expects ({ content: [{ text }] }), so index.html doesn't
// need to know which model is behind this.

const ALLOWED_ORIGIN = 'https://gefenrose.github.io';
const GEMINI_MODEL = 'gemini-2.5-flash';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400, headers: corsHeaders() });
    }

    if (!body.system || !Array.isArray(body.messages)) {
      return new Response('Missing system or messages', { status: 400, headers: corsHeaders() });
    }

    const messages = [
      { role: 'system', content: body.system },
      ...body.messages
    ];

    const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        messages
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }

    const data = await upstream.json();
    const text = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ content: [{ text }] }), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }
};
