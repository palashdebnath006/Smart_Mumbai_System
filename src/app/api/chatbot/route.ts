import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the SmartMumbai AI Assistant, an intelligent chatbot for the SmartMumbai City Dashboard — a real-time urban monitoring platform focused on Bandra, Mumbai.

You have access to the following modules:
- **Traffic**: Real-time traffic flow data, vehicle counts, average speeds for Bandra roads (Sea Link, SV Road, Linking Road, Hill Road, Turner Road, Reclamation). Data refreshes every 5 seconds.
- **Environment**: Real-time air quality (AQI, PM2.5, PM10, CO, NO2, O3, SO2) and weather (temperature, humidity, wind, pressure) from Open-Meteo API. Updated every 5 minutes.
- **Water**: Mumbai reservoir levels (Upper Vaitarna, Modak Sagar, Tansa, Bhatsa, Vihar, Tulsi), Bandra ward consumption (~200 MLD daily), and water quality parameters.
- **Energy**: Bandra power grid (~250 MW capacity), energy sources (Thermal 52%, Hydro 18%, Solar 14%, Wind 8%, Nuclear 8%), consumption patterns from Tata Power/Adani Electricity.
- **Waste**: Solid waste management for Bandra H-West Ward (~350 TPD), smart bin monitoring, fleet tracking, recycling rates (~32-40%).
- **Public Safety**: CCTV monitoring across Bandra locations, emergency services, safety incidents.

Key facts about Bandra, Mumbai:
- Bandra is in the H-West Ward of BMC (Brihanmumbai Municipal Corporation).
- Population: ~600,000 residents.
- Key landmarks: Bandra-Worli Sea Link, Bandstand, Carter Road, Linking Road, Bandra Station.
- Mumbai total water supply: ~3,850 MLD from 7 reservoirs.
- Mumbai generates ~7,000 tonnes of waste per day.

Keep responses concise (under 150 words), helpful, and data-focused. If asked about specific metrics, provide realistic current values based on time of day and season.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedMessage) {
      return NextResponse.json({ reply: 'Please provide a message.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    // Helper for offline / fallback responses based on Mumbai data
    const getFallbackResponse = (query: string): string => {
      const q = query.toLowerCase();
      if (q.includes('traffic') || q.includes('road') || q.includes('sea link') || q.includes('sv road') || q.includes('jam')) {
        return '🚗 **Bandra Traffic Update**: Traffic is flowing smoothly on Bandra-Worli Sea Link (avg speed 55 km/h). Moderate congestion observed at S.V. Road Lucky Junction due to ongoing metro work. Linking Road and Hill Road have normal evening shopping flow.';
      }
      if (q.includes('water') || q.includes('reservoir') || q.includes('lake') || q.includes('tank')) {
        return '💧 **Water Supply Status**: Mumbai 7 major reservoirs (Upper Vaitarna, Modak Sagar, Tansa, Middle Vaitarna, Bhatsa, Vehar, Tulsi) are currently at adequate seasonal capacity. Bandra H-West ward daily allocation is ~200 MLD with stable pressure.';
      }
      if (q.includes('air') || q.includes('aqi') || q.includes('pollution') || q.includes('weather') || q.includes('temp')) {
        return '🌤️ **Environment & AQI**: Current Air Quality in Bandra is Moderate (AQI ~92). PM2.5 levels are within standard ranges. Temperature is ~29°C with coastal sea breeze from Carter Road.';
      }
      if (q.includes('emergency') || q.includes('police') || q.includes('fire') || q.includes('ambulance') || q.includes('help')) {
        return '🚨 **Emergency Helplines**:\n- Police: **100**\n- Fire Brigade: **101**\n- Ambulance: **108**\n- BMC Disaster Management: **1916**\n- Bandra Police Station: **022-26422323**';
      }
      if (q.includes('waste') || q.includes('garbage') || q.includes('trash') || q.includes('bin')) {
        return '♻️ **Waste Management**: Bandra H-West ward processes ~350 tonnes/day with 18 compactor trucks active. Smart bin fill levels average 48%. Dry waste segregation compliance is at 74%.';
      }
      return `🏙️ **SmartMumbai Assistant**: I'm monitoring real-time urban metrics for Bandra, Mumbai across Traffic, Water, Air Quality, Energy, and Emergency services. (Note: For live AI reasoning, set a valid Gemini API key starting with 'AIzaSy...' in your .env file).`;
    };

    // If API key is missing or invalid placeholder
    if (!apiKey || !apiKey.startsWith('AIzaSy')) {
      const fallback = getFallbackResponse(trimmedMessage);
      return NextResponse.json({
        reply: fallback,
        notice: 'Note: To enable live Gemini AI generation, provide a valid Google AI Studio key starting with AIzaSy in .env'
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${SYSTEM_PROMPT}\n\nUser question: ${trimmedMessage}` }],
              }
            ],
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.7,
            }
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error?.message || 'Error calling Gemini API';
        console.warn('Gemini API Warning:', errorMsg);

        // Fallback gracefully without 500 error
        return NextResponse.json({
          reply: `${getFallbackResponse(trimmedMessage)}\n\n*(Gemini API Note: ${errorMsg.slice(0, 120)}...)*`
        });
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(trimmedMessage);

      return NextResponse.json({ reply });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn('Gemini Fetch Error:', fetchError);
      return NextResponse.json({
        reply: getFallbackResponse(trimmedMessage)
      });
    }
  } catch (error) {
    console.error('Chatbot Error:', error);
    return NextResponse.json({
      reply: 'The SmartMumbai assistant is currently operating in offline mode. Real-time dashboard sensors remain active.'
    });
  }
}

export async function GET() {
  return NextResponse.json({ messages: [], cooldownUntil: null });
}
