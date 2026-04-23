import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Probe from '../models/Probe';
import SensorReading from '../models/SensorReading';

const router = Router();

const ELEVENLABS_AGENT_ID = 'agent_8401kc0pqhv4fmnr13frj0r4erer';

/**
 * GET /api/assistant/elevenlabs-token
 * Returns a short-lived signed WebSocket URL for the ElevenLabs Conversation API.
 * The browser uses this instead of the raw agentId so the API key stays server-side.
 */
router.get('/elevenlabs-token', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      res.status(500).json({ success: false, message: 'ElevenLabs API key not configured' });
      return;
    }

    const tokenRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent_id: ELEVENLABS_AGENT_ID }),
      }
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      res.status(tokenRes.status).json({ success: false, message: `ElevenLabs error: ${err}` });
      return;
    }

    const { signed_url } = await tokenRes.json() as { signed_url: string };
    res.json({ success: true, signedUrl: signed_url });
  } catch (error) {
    next(error);
  }
});

/** Build a Hindi reply from live data without any external AI API key. */
function buildFallbackReply(
  message: string,
  readings: { probe: { name: string; uuid: string; status: string }; reading: { soilMoisture: number; temperature: number; humidity: number; pH: number; nitrogen: number; phosphorus: number; potassium: number; waterTankLevel: number; batteryLevel: number; conductivity: number } | null }[]
): string {
  const r = readings[0]?.reading;
  const probeName = readings[0]?.probe?.name ?? 'Probe';
  const status = readings[0]?.probe?.status ?? 'offline';

  if (!r || status === 'offline') {
    return `${probeName} abhi offline hai ya koi reading nahi mili. ESP32 ko check karein aur ensure karein ki WiFi connected hai. 🔌`;
  }

  const lower = message.toLowerCase();

  if (lower.includes('paani') || lower.includes('moisture') || lower.includes('water') || lower.includes('irrigation')) {
    const advice = r.soilMoisture < 30
      ? '⚠️ Soil moisture bahut kam hai — aaj zaroor paani dein!'
      : r.soilMoisture < 50
      ? '✅ Moisture thoda kam hai — kal tak paani de sakte hain.'
      : '✅ Abhi paani dene ki zarurat nahi, moisture theek hai.';
    return `Soil moisture ${r.soilMoisture.toFixed(1)}% hai. ${advice}`;
  }

  if (lower.includes('temperature') || lower.includes('temp') || lower.includes('garmi')) {
    const advice = r.temperature > 38 ? '🌡️ Bahut zyada garmi hai — fasal ko dhakna ya chhaya dena consider karein.' : r.temperature < 10 ? '❄️ Bahut thanda hai — fasal ko protect karein.' : '✅ Temperature sahi range mein hai.';
    return `Abhi temperature ${r.temperature.toFixed(1)}°C hai. ${advice}`;
  }

  if (lower.includes('ph') || lower.includes('acidity') || lower.includes('soil')) {
    if (r.pH === 0) return 'pH sensor se abhi reading nahi aayi. Sensor connection check karein.';
    const advice = r.pH < 6 ? '⚠️ Soil thodi acidic hai — lime (chuna) daalein.' : r.pH > 7.5 ? '⚠️ Soil thodi alkaline hai — sulfur ya organic matter daalein.' : '✅ pH bilkul sahi hai.';
    return `Soil pH ${r.pH.toFixed(1)} hai. ${advice}`;
  }

  if (lower.includes('fertilizer') || lower.includes('npk') || lower.includes('nitrogen') || lower.includes('urea')) {
    if (r.nitrogen === 0 && r.phosphorus === 0 && r.potassium === 0) return 'NPK sensor se abhi readings nahi aayi (sab 0 hain). Sensor connection check karein.';
    const nAdvice = r.nitrogen < 50 ? '⚠️ Nitrogen kam hai — urea daalein.' : '✅ Nitrogen theek hai.';
    return `NPK reading — N: ${r.nitrogen} mg/kg, P: ${r.phosphorus} mg/kg, K: ${r.potassium} mg/kg. ${nAdvice}`;
  }

  if (lower.includes('battery') || lower.includes('charge') || lower.includes('power')) {
    const advice = r.batteryLevel < 20 ? '🔋 Battery bahut kam hai — ESP32 ko charge karein!' : r.batteryLevel < 50 ? '🔋 Battery 50% se kam hai.' : '🔋 Battery theek hai.';
    return `Battery ${r.batteryLevel}% hai. ${advice}`;
  }

  if (lower.includes('warning') || lower.includes('alert') || lower.includes('problem') || lower.includes('koi')) {
    const issues: string[] = [];
    if (r.soilMoisture < 30) issues.push(`Soil moisture bahut kam (${r.soilMoisture.toFixed(1)}%)`);
    if (r.temperature > 38) issues.push(`Garmi zyada (${r.temperature.toFixed(1)}°C)`);
    if (r.batteryLevel < 20) issues.push(`Battery low (${r.batteryLevel}%)`);
    if (r.pH > 0 && (r.pH < 5.5 || r.pH > 7.5)) issues.push(`pH range se bahar (${r.pH.toFixed(1)})`);
    return issues.length === 0
      ? '✅ Sab theek lag raha hai! Koi badi problem nahi hai abhi.'
      : `⚠️ Ye problems hain abhi: ${issues.join(', ')}. Dhyan dein!`;
  }

  // Default: summary
  return `${probeName} live data — Temp: ${r.temperature.toFixed(1)}°C, Moisture: ${r.soilMoisture.toFixed(1)}%, pH: ${r.pH > 0 ? r.pH.toFixed(1) : 'N/A'}, Tank: ${r.waterTankLevel}%, Battery: ${r.batteryLevel}%. Kuch aur poochhna hai?`;
}

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, history = [] } = req.body as {
      message: string;
      history: { role: 'user' | 'model'; text: string }[];
    };

    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    // Fetch latest live data
    const probes = await Probe.find({ isActive: true }).limit(5).lean();
    const latestReadings = await Promise.all(
      probes.map(async (probe) => {
        const reading = await SensorReading.findOne({ probeId: probe._id })
          .sort({ timestamp: -1 })
          .lean();
        return { probe, reading };
      })
    );

    const farmDataSnapshot = latestReadings.map(({ probe, reading }) => ({
      probe: probe.name,
      status: probe.status,
      soilMoisture: reading?.soilMoisture,
      temperature: reading?.temperature,
      pH: reading?.pH,
      nitrogen: reading?.nitrogen,
      waterTankLevel: reading?.waterTankLevel,
    }));

    // If no Gemini key, use built-in live-data reply (no external API needed)
    if (!process.env.GEMINI_API_KEY) {
      const reply = buildFallbackReply(message, latestReadings as Parameters<typeof buildFallbackReply>[1]);
      res.json({ success: true, data: { reply, farmDataSnapshot } });
      return;
    }

    // Build farm context for AI
    const farmContext = latestReadings.map(({ probe, reading }) => {
      if (!reading) return `Probe ${probe.name}: No data available.`;
      return `Probe: ${probe.name} (${probe.uuid}) - Status: ${probe.status}
- Soil Moisture: ${reading.soilMoisture}%, Temperature: ${reading.temperature}°C, pH: ${reading.pH}
- N: ${reading.nitrogen} mg/kg, P: ${reading.phosphorus} mg/kg, K: ${reading.potassium} mg/kg
- Water Tank: ${reading.waterTankLevel}%, Battery: ${reading.batteryLevel}%`;
    }).join('\n');

    const systemPrompt = `Tu FertoBot ka AI assistant hai — ek smart farming assistant jo Indian farmers ki madad karta hai.

LIVE FARM DATA:
${farmContext}

RULES: Hindi mein jawab de (Hinglish theek hai). Simple bhasha. Specific numbers de. Max 3-4 sentences.`;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Theek hai, main FertoBot assistant hoon. Aap kya jaanna chahte hain?' }] },
          ...history.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text }],
          })),
        ],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      });

      const result = await chat.sendMessage(message);
      const reply = result.response.text() || 'Kuch gadbad ho gayi, dobara try karein.';
      res.json({ success: true, data: { reply, farmDataSnapshot } });
    } catch (_geminiErr) {
      // Gemini unavailable (quota/network) — fall back to keyword-based Hindi reply
      const reply = buildFallbackReply(message, latestReadings as Parameters<typeof buildFallbackReply>[1]);
      res.json({ success: true, data: { reply, farmDataSnapshot } });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
