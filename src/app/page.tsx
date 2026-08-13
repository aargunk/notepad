'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Book, Plus, CheckSquare, FileText, Calendar as CalendarIcon, Trash2, LogOut, ArrowLeft, Edit } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  // App State
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [activeNotebook, setActiveNotebook] = useState('Kişisel');
  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const fetchData = async () => {
    const userId = session.user.id;
    const { data: nbs } = await supabase.from('notebooks').select('*').eq('user_id', userId);
    const { data: nts } = await supabase.from('notes').select('*').eq('user_id', userId);
    const { data: tks } = await supabase.from('tasks').select('*').eq('user_id', userId);
    setNotebooks(nbs || []);
    setNotes(nts || []);
    setTasks(tks || []);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) await supabase.auth.signInWithPassword({ email, password });
    else await supabase.auth.signUp({ email, password });
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <form onSubmit={handleAuth} className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-4">
          <h2 className="text-xl font-bold text-deep-teal">{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
          <input type="email" placeholder="E-posta" className="w-full border p-2 rounded" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Şifre" className="w-full border p-2 rounded" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-teal-800 text-white p-2 rounded">{isLogin ? 'Giriş' : 'Kayıt Ol'}</button>
          <p className="text-xs text-center cursor-pointer text-blue-600" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f5f7] text-gray-800 font-sans overflow-hidden">
      {/* 1. SIDEBAR */}
      <aside className="w-52 bg-teal-900 text-white p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8"><FileText size={20} /> <span className="font-bold">Notepad Pro</span></div>
          <div className="space-y-4">
            <p className="text-teal-400 text-[10px] uppercase font-bold">Defterlerim</p>
            {notebooks.map(nb => (
              <div key={nb.id} onClick={() => setActiveNotebook(nb.name)} className="flex items-center gap-2 cursor-pointer hover:text-white text-teal-100 text-xs">
                <Book size={14} /> {nb.name}
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-[10px] text-teal-300 hover:text-white">
          <LogOut size={12} /> Çıkış Yap
        </button>
      </aside>

      {/* 2. ANA EKRAN */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{activeNotebook} Defteri</h2>
        <div className="grid grid-cols-3 gap-4">
          {notes.filter(n => n.notebook_name === activeNotebook).map(n => (
            <div key={n.id} className={`${n.color} p-4 rounded-xl border shadow-sm`}>
              <h3 className="font-bold text-sm">{n.title}</h3>
              <p className="text-xs mt-2">{n.content}</p>
            </div>
          ))}
        </div>
      </main>

      {/* 3. GÖREVLER */}
      <aside className="w-72 bg-gray-50 border-l border-gray-200 p-5">
        <h3 className="font-bold text-xs uppercase mb-4">Görevlerim</h3>
        {tasks.map(t => (
          <div key={t.id} className="text-xs p-2 bg-white rounded border mb-2">{t.title}</div>
        ))}
      </aside>
    </div>
  );
}
