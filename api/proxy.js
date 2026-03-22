export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { service, ...body } = req.body;
  try {
    if (service === 'replicate_create') {
      const r = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: { 'Authorization': `Token ${body.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: '7762fd07cf82c948538e41f63f77d685e02b063e37291ef63c364ad29c807a', input: { prompt: body.prompt, negative_prompt: 'blurry, low quality, deformed, watermark', width: 576, height: 1024, num_inference_steps: 30, guidance_scale: 7.5 } })
      });
      return res.status(r.status).json(await r.json());
    }
    if (service === 'replicate_poll') {
      const r = await fetch(`https://api.replicate.com/v1/predictions/${body.predictionId}`, {
        headers: { 'Authorization': `Token ${body.apiKey}` }
      });
      return res.status(r.status).json(await r.json());
    }
    if (service === 'elevenlabs') {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${body.voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': body.apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
        body: JSON.stringify({ text: body.text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.5 } })
      });
      if (!r.ok) return res.status(r.status).json({ error: 'ElevenLabs error' });
      const buf = await r.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.send(Buffer.from(buf));
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
