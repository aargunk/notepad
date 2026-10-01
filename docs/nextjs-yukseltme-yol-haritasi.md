# Next.js 14 → 15/16 Yükseltme Yol Haritası

Bu bir uygulama değil, bir plan. Bugün kod değiştirmedik; sadece ne yapılması gerektiğini ve neden aciliyet taşıdığını netleştiriyoruz.

## Neden gerekli

- **Next.js 14.1.0 artık desteklenmiyor.** Resmi destek (security support) Ekim 2025'te sona erdi. Son yama olan 14.2.35 bile Aralık 2025'te çıktı — o tarihten sonra 14.x hattına hiçbir güncelleme gelmiyor.
- `npm install` çalıştırıldığında npm'in kendisi şu uyarıyı veriyor: *"next@14.1.0: This version has a security vulnerability. Please upgrade to a patched version."*
- 22 Eylül 2026'da (bu yazının tarihinden birkaç gün önce), Next.js'in hâlâ desteklenen hatlarında (15.5.26 ve 16.3.6) kritik bir güvenlik açığı için acil (out-of-band) bir yama yayınlandı. 14.x bu yamayı hiç almayacak.

## Bu uygulama için haber verdiğim kadar kötü değil

`page.tsx` uçtan uca `'use client'` ile yazılmış, saf bir istemci bileşeni. Next.js 14→15 geçişinde çoğu projeyi zorlayan değişikliklerin **hiçbiri bu projeyi etkilemiyor**, çünkü:

- Dinamik rota parametreleri (`params`, `searchParams`) hiç kullanılmıyor.
- `cookies()`, `headers()`, `draftMode()` gibi Next 15'te senkron'dan asenkron'a geçen API'lerin hiçbiri kullanılmıyor.
- Tek API route'u (`/api/gemini`) basit bir `POST` handler; dinamik segment yok, caching davranışı değişikliklerinden etkilenmiyor.
- `next/font`, middleware, edge runtime kullanılmıyor.

Yani riskin büyük kısmı "bilinmeyen breaking change'ler" değil, sıradan bir bağımlılık güncellemesi riski.

## Asıl dikkat edilmesi gereken noktalar

1. **React 18 → 19 zorunlu geçiş.** Next.js 15 ve 16, minimum React 19 istiyor.
2. `@supabase/supabase-js`, `lucide-react`, `tailwindcss` gibi bağımlılıkların React 19 ile uyumluluğu build sırasında doğrulanmalı (büyük ihtimalle sorunsuz, ama garanti değil).
3. Vercel proje ayarlarında Node.js çalışma zamanının çok eski bir sürüme sabitlenmediğinden emin olunmalı (Next 15/16, güncel bir Node sürümü istiyor).

## Önerilen adımlar

1. Ayrı bir git dalında çalış, `main`'e/canlıya hemen dokunma.
2. Resmi otomatik geçiş aracını çalıştır: `npx @next/codemod@canary upgrade latest` (ya da elle `next@latest react@latest react-dom@latest eslint-config-next@latest` kur).
3. `npm run build` ile derleme/tip hatalarını gör, varsa tek tek düzelt.
4. Yerelde şu akışların hepsini elle test et: giriş / üye ol / şifremi unuttum / yeni şifre belirleme, not-görev-etkinlik oluşturma ve düzenleme, dosya yükleme, arama, takvim görünümleri (gün/hafta/ay), admin onay paneli, Gemini asistan, Google Calendar bağlantısı (varsa).
5. Vercel'in otomatik "preview deployment" özelliğiyle bir kez daha, gerçek ortamda dene.
6. Sorun yoksa `main`'e birleştir ve canlıya al.

## Neden bugün değil de ayrı bir oturumda

Bugün zaten üç bağımsız değişiklik yaptık (silme hataları, defter/sayfa/not ilişkisinin ID'ye taşınması, defter sıralamasının kalıcı hale gelmesi). Next.js yükseltmesi bunlarla aynı anda yapılırsa, bir şey bozulduğunda hangi değişikliğin sebep olduğunu ayırt etmek zorlaşır. Bunu ayrı, kendi başına test edilebilen bir adım olarak ele almak daha güvenli.
