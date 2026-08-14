import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key bulunamadı.' }, { status: 500 });
    }

    // Doğrudan v1beta standart generateContent çağrısı
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
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
      console.error('Gemini API Yanıt Hatası:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Gemini API erişim hatası.' },
        { status: res.status }
      );
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt üretilemedi.';
    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error('Server Route Hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
