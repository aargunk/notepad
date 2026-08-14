import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key eksik!' }, { status: 500 });
    }

    // Doğrudan v1beta endpoint'i üzerinden en güncel ve kararlı model ismi
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Gemini API Hatası:', data);
      
      // Eğer model ismi hatası verirse fallback olarak varsayılan modeli dene
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const fallbackData = await fallbackRes.json();

      if (!fallbackRes.ok) {
        return NextResponse.json(
          { error: data.error?.message || 'Gemini yanıt vermedi.' },
          { status: res.status }
        );
      }

      const fallbackText = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt üretilemedi.';
      return NextResponse.json({ text: fallbackText });
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt üretilemedi.';
    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error('Server Route Hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
