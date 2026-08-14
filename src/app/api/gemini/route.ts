import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key eksik!' }, { status: 500 });
    }

    // Google Resmî AI SDK Başlatma
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Varsayılan kararlı model çağrısı
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error('Gemini SDK Hatası:', error);

    // Eğer model ismi hatası alırsak 'gemini-pro' modeline otomatik geçiş
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      const genAI = new GoogleGenerativeAI(apiKey);
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const { prompt } = await req.clone().json();
      const result = await fallbackModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({ text });
    } catch (fallbackError: any) {
      return NextResponse.json(
        { error: error?.message || 'Gemini yanıt veremedi.' },
        { status: 500 }
      );
    }
  }
}
