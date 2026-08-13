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

  // Eğer giriş yapılmadıysa giriş ekranını göster
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

  // ... (Giriş yapılmışsa uygulamanın geri kalanı burada çalışacak) ...
  return (
    <div className="flex h-screen bg-soft-white text-gray-800 font-sans relative overflow-hidden">
        {/* Uygulamanın geri kalan gövdesi (Sidebar, Main Panel vb.) buraya gelecek */}
        <button onClick={() => supabase.auth.signOut()} className="absolute top-4 right-4 text-xs bg-red-100 p-2 rounded">
          <LogOut size={14}/>
        </button>
        {/* ... önceki tüm uygulama kodların burada olacak ... */}
    </div>
  );
}
