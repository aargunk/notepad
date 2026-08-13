'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Book, Plus, CheckSquare, FileText, Calendar as CalendarIcon, ExternalLink, X, Trash2, Repeat, Edit, Image as ImageIcon, Mail, RefreshCw, LogOut } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  // ... (Önceki state'ler: notebooks, notes, tasks vb. burada durmalı) ...
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [activeNotebook, setActiveNotebook] = useState('Kişisel');
  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Kayıt başarılı! Giriş yapabilirsiniz.');
    }
  };

 // ... (Giriş yapılmadıysa giriş ekranı kodları burası) ...
  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <form onSubmit={handleAuth} className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-4">
          <h2 className="text-xl font-bold text-deep-teal">{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
          <input type="email" placeholder="E-posta" className="w-full border p-2 rounded" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Şifre" className="w-full border p-2 rounded" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-deep-teal text-white p-2 rounded">{isLogin ? 'Giriş' : 'Kayıt Ol'}</button>
          <p className="text-xs text-center cursor-pointer text-blue-600" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
          </p>
        </form>
      </div>
    );
  }

  // --- BURAYA DİKKAT: Giriş yapıldıysa artık aşağıdakini döndürecek ---
  return (
    <div className="flex h-screen bg-[#f4f5f7] text-gray-800 font-sans relative overflow-hidden">
      {/* 1. SOL KENAR ÇUBUĞU */}
      <aside className="w-52 bg-deep-teal text-white p-4 flex flex-col justify-between shadow-md z-10">
        {/* ... önceki tüm sidebar kodların buraya gelecek ... */}
        {/* En alta çıkış butonu */}
        <button onClick={() => supabase.auth.signOut()} className="mt-4 text-[10px] text-teal-300 hover:text-white flex items-center gap-1">
          <LogOut size={12}/> Çıkış Yap
        </button>
      </aside>

      {/* 2. ORTA ALAN */}
      <main className="flex-1 p-6 bg-white overflow-y-auto flex flex-col relative">
        {/* ... önceki tüm orta alan kodların (Dashboard / Calendar / OneNote sayfalar) buraya gelecek ... */}
        <h1 className="text-2xl font-bold">Hoş Geldin!</h1>
        <p className="text-sm">Sol menüden yeni bir defter oluşturarak başla.</p>
      </main>

      {/* 3. SAĞ PANEL */}
      <aside className="w-72 bg-gray-50 border-l border-gray-200 p-5 flex flex-col gap-5 overflow-y-auto z-10">
        {/* ... önceki görev paneli kodların buraya gelecek ... */}
      </aside>
      
      {/* Modallar buraya eklenecek */}
    </div>
  );
}
