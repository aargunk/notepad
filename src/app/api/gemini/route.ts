import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY sunucuda bulunamadı.' }, { status: 500 });
    }

    // Google'ın güncel ve aktif Flash modelleri
    const modelsToTry = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash'];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
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
          return NextResponse.json({ 
            text: data.candidates[0].content.parts[0].text,
            modelUsed: modelName 
          });
        } else {
          lastError = data.error?.message || `${modelName} yanıt veremedi.`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    return NextResponse.json(
      { error: `Modeller yanıt vermedi: ${lastError}` },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Sunucu Hatası:', error);
    return NextResponse.json({ error: 'Sunucu içi hata oluştu.' }, { status: 500 });
  }
}
