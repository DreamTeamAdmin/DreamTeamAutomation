// Cloudflare Worker: Web3Forms proxy to keep the access key server-side.
// Configure a secret in Cloudflare: WEB3FORMS_KEY
// Route: e.g. https://api.dreamteamautomation.com/contact
// CORS allowlist below should include your site origins.

const ALLOWED_ORIGINS = [
  'https://www.dreamteamautomation.com',
  'https://dreamteamautomation.com'
];

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const origin = request.headers.get('origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const incoming = await request.formData();

    // Honeypot: block if botcheck is filled
    if (incoming.get('botcheck')) {
      return new Response('Spam detected', { status: 400, headers: corsHeaders });
    }

    // Build payload for Web3Forms
    const payload = new FormData();
    payload.set('access_key', env.WEB3FORMS_KEY);
    for (const [k, v] of incoming.entries()) {
      if (k !== 'botcheck') payload.set(k, v);
    }

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: payload
    });

    const headers = new Headers(res.headers);
    headers.set('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    headers.set('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
    headers.set('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);

    return new Response(res.body, { status: res.status, headers });
  }
};

