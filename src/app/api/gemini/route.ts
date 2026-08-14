import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key bulunamadı.' }, { status: 500 });
    }

    // Google API'nin desteklediği olası model isimleri listesi
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        // v1 ve v1beta sürümlerinin ikisini de kapsayan resmi REST çağrısı
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        const data = await res.json();

        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const responseText = data.candidates[0].content.parts[0].text;
          return NextResponse.json({ text: responseText, usedModel: modelName });
        } else {
          lastError = data.error?.message || `${modelName} yanıt vermedi.`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    return NextResponse.json(
      { error: `Hiçbir model yanıt vermedi. Son hata: ${lastError}` },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Server Route Hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
