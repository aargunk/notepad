// GEMINI AI CHATBOT FONKSİYONU (BACKEND API ROUTE İLE GÜVENLİ ÇAĞRI)
  const handleSendGemini = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || geminiInput;
    if (!promptToSend.trim() || isGeminiLoading) return;

    if (!userSession) {
      alert("Gemini AI Asistanını kullanabilmek için lütfen Google hesabınızla giriş yapın.");
      return;
    }

    const userMessage = { role: 'user' as const, text: promptToSend };
    setGeminiMessages(prev => [...prev, userMessage]);
    if (!overridePrompt) setGeminiInput('');
    setIsGeminiLoading(true);

    try {
      let contextText = '';
      if (openedNotePage) {
        contextText = `\n\n[ŞU ANDA AÇIK OLAN NOT]\nBaşlık: ${openedNotePage.title}\nİçerik: ${openedNotePage.content}\n\n`;
      }

      const fullPrompt = `Sen Notepad Pro uygulamasının akıllı AI asistanısın. Kullanıcıya Türkçe, nazik ve üretken bir şekilde yardımcı ol.${contextText}Kullanıcının sorusi / talebi: ${promptToSend}`;

      // Kendi sunduğumuz güvenli API route'a istek atıyoruz
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      const data = await res.json();

      if (data.error) {
        setGeminiMessages(prev => [...prev, { role: 'model', text: `Hata: ${data.error}` }]);
      } else {
        setGeminiMessages(prev => [...prev, { role: 'model', text: data.text }]);
      }
    } catch (err) {
      console.error("Gemini AI Hatası:", err);
      setGeminiMessages(prev => [...prev, { role: 'model', text: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.' }]);
    } finally {
      setIsGeminiLoading(false);
    }
  };
