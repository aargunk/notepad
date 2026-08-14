import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY sunucuda bulunamadı.' }, { status: 500 });
    }

    // Doğrudan yeni ve kararlı gemini-2.0-flash endpoint kullanımı
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('Gemini API Hatası:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Gemini API servis hatası.' },
        { status: res.status }
      );
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt üretilemedi.';
    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error('Sunucu Hatası:', error);
    return NextResponse.json({ error: 'Sunucu içi hata oluştu.' }, { status: 500 });
  }
}
