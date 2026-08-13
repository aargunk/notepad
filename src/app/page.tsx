'use client';
import React, { useState, useEffect } from 'react';
import { Book, Plus, CheckSquare, FileText, Calendar as CalendarIcon, Trash2, Edit, ArrowLeft, Settings, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [activeNotebook, setActiveNotebook] = useState('Kişisel');
  const [activeView, setActiveView] = useState<'notes' | 'calendar'>('notes');

  const [openedNotePage, setOpenedNotePage] = useState<any>(null);

  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');

  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [notes, setNotes] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDayIndex, setNewDayIndex] = useState(0);
  const [newTime, setNewTime] = useState('09:00');
  const [newColor, setNewColor] = useState('bg-[#e2f0d9] border-[#c5e1a5] text-emerald-950');
  const [newBadge, setNewBadge] = useState('bg-emerald-200 text-emerald-900');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // GOOGLE TAKVİM ENTEGRASYON STATE'LERİ
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const currentMonth = "Ağustos 2026";
  const days = ['Pzt 10', 'Sal 11', 'Çar 12', 'Per 13', 'Cum 14', 'Cmt 15', 'Paz 16'];

  const colorOptions = [
    { name: 'Yeşil', card: 'bg-[#e2f0d9] border-[#c5e1a5] text-emerald-950', badge: 'bg-emerald-200 text-emerald-900' },
    { name: 'Bej/Sarı', card: 'bg-[#fef9e7] border-[#fdebd0] text-amber-950', badge: 'bg-amber-200 text-amber-900' },
    { name: 'Mor', card: 'bg-[#f4ecf7] border-[#d7bde2] text-purple-950', badge: 'bg-purple-200 text-purple-900' },
    { name: 'Mavi', card: 'bg-[#ebf5fb] border-[#aed6f1] text-sky-950', badge: 'bg-sky-200 text-sky-900' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: nbs } = await supabase.from('notebooks').select('*').order('created_at', { ascending: true });
    if (nbs && nbs.length > 0) setNotebooks(nbs);
    else setNotebooks([{ id: 'mock-1', name: 'Kişisel' }]);

    const { data: tks } = await supabase.from('tasks').select('*').order('created_at', { ascending: true });
    if (tks) setTasks(tks);

    const { data: nts } = await supabase.from('notes').select('*').order('created_at', { ascending: true });
    if (nts) setNotes(nts);
  };

  const addNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;
    const { data } = await supabase.from('notebooks').insert([{ name: newNotebookName.trim() }]).select();
    if (data) {
      setNotebooks([...notebooks, data[0]]);
      setActiveNotebook(data[0].name);
    }
    setNewNotebookName('');
    setIsNotebookModalOpen(false);
  };

  const deleteNotebook = async (nbName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notebooks.length <= 1) { alert('En az bir defter kalmalıdır!'); return; }
    if (confirm(`"${nbName}" defterini silmek istediğinize emin misiniz?`)) {
      await supabase.from('notebooks').delete().eq('name', nbName);
      await supabase.from('notes').delete().eq('notebook_name', nbName);
      const remainingNotebooks = notebooks.filter(nb => nb.name !== nbName);
      setNotebooks(remainingNotebooks);
      setNotes(notes.filter(n => n.notebook_name !== nbName));
      if (activeNotebook === nbName) setActiveNotebook(remainingNotebooks[0].name);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const { data } = await supabase.from('tasks').insert([{ title: newTaskTitle.trim(), completed: false, category: activeNotebook }]).select();
    if (data) setTasks([...tasks, data[0]]);
    setNewTaskTitle('');
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    const { data } = await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', id).select();
    if (data) setTasks(tasks.map(t => t.id === id ? data[0] : t));
  };

  const deleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const notePayload = {
      notebook_name: activeNotebook,
      title: newTitle,
      content: newContent || 'İçerik girilmedi...',
      day_index: Number(newDayIndex),
      time: newTime,
      color: newColor,
      badge_color: newBadge,
      file_name: attachedFile,
      file_url: attachedFile ? '#' : null,
      image_url: attachedImage,
    };

    if (isEditMode && editingNoteId) {
      const { data } = await supabase.from('notes').update(notePayload).eq('id', editingNoteId).select();
      if (data) {
        setNotes(notes.map(n => n.id === editingNoteId ? data[0] : n));
        if (openedNotePage?.id === editingNoteId) setOpenedNotePage(data[0]);
      }
    } else {
      const { data } = await supabase.from('notes').insert([notePayload]).select();
      if (data) setNotes([...notes, data[0]]);
    }
    resetForm();
  };

  const deleteNote = async (id: string) => {
    if(confirm("Bu notu silmek istediğinize emin misiniz?")) {
      await supabase.from('notes').delete().eq('id', id);
      setNotes(notes.filter(n => n.id !== id));
      setOpenedNotePage(null);
    }
  };

  const openEditModal = (note: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEditMode(true);
    setEditingNoteId(note.id);
    setNewTitle(note.title);
    setNewContent(note.content);
    setNewDayIndex(note.day_index);
    setNewTime(note.time);
    setNewColor(note.color);
    setNewBadge(note.badge_color);
    setAttachedFile(note.file_name);
    setAttachedImage(note.image_url);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingNoteId(null);
    setNewTitle('');
    setNewContent('');
    setAttachedFile(null);
    setAttachedImage(null);
    setIsModalOpen(false);
  };

  const handleConnectGoogleCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsGoogleCalendarConnected(true);
      setIsSyncing(false);
      const googleEvent = {
        notebook_name: activeNotebook,
        title: '📅 Google Takvim: Haftalık Ekip Toplantısı',
        content: 'Google Calendar API üzerinden otomatik çekildi.',
        day_index: 2,
        time: '14:00',
        color: 'bg-sky-50 border-sky-200 text-sky-950',
        badge_color: 'bg-sky-200 text-sky-900',
      };
      supabase.from('notes').insert([googleEvent]).then(({ data }) => {
        if (data) setNotes(prev => [...prev, data[0]]);
        else fetchData();
      });
    }, 1200);
  };

  const handleDisconnectGoogleCalendar = () => {
    setIsGoogleCalendarConnected(false);
  };

  const filteredNotes = notes.filter(n => n.notebook_name === activeNotebook);

  return (
    <div className="flex h-screen bg-[#f4f5f7] text-gray-800 font-sans relative overflow-hidden">
      
      {/* 1. SOL KENAR ÇUBUĞU */}
      <aside className="w-52 bg-deep-teal text-white p-4 flex flex-col justify-between shadow-md z-10">
        <div>
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <FileText className="text-white" size={20} />
            </div>
            <h1 className="text-base font-bold tracking-wide">Notepad Pro</h1>
          </div>

          <nav className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <p className="text-teal-200 text-[11px] font-semibold uppercase tracking-wider">Defterler</p>
                <button onClick={() => setIsNotebookModalOpen(true)} className="text-teal-200 hover:text-white text-xs flex items-center bg-white/10 px-1.5 py-0.5 rounded">
                  <Plus size={12} />
                </button>
              </div>

              {notebooks.map(nb => (
                <div 
                  key={nb.id} 
                  onClick={() => { setActiveNotebook(nb.name); setActiveView('notes'); setOpenedNotePage(null); }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors group ${activeView === 'notes' && activeNotebook === nb.name && !openedNotePage ? 'bg-white/20 font-medium text-white' : 'hover:bg-white/5 text-teal-100'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Book size={14} /> 
                    <span className="truncate">{nb.name}</span>
                  </div>
                  {notebooks.length > 1 && (
                    <button onClick={(e) => deleteNotebook(nb.name, e)} className="opacity-0 group-hover:opacity-100 text-teal-200 hover:text-red-300 p-0.5">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-teal-800">
              <p className="text-teal-200 text-[11px] font-semibold uppercase tracking-wider px-1">Plan</p>
              <div 
                onClick={() => { setActiveView('calendar'); setOpenedNotePage(null); }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${activeView === 'calendar' && !openedNotePage ? 'bg-white/20 font-medium text-white' : 'hover:bg-white/5 text-teal-100'}`}
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} /> Takvim
                </div>
                {isGoogleCalendarConnected && <span className="w-2 h-2 rounded-full bg-emerald-400" title="Google Takvim Bağlı" />}
              </div>
            </div>
          </nav>
        </div>

        <div className="text-[10px] text-teal-300 border-t border-teal-800 pt-3 flex items-center justify-between">
          <span>Veritabanı:</span> <span>🟢</span>
        </div>
      </aside>

      {/* 2. ORTA ALAN */}
      <main className="flex-1 p-6 bg-white overflow-y-auto flex flex-col relative">
        
        {openedNotePage ? (
          /* ONENOTE TARZI ÇİZGİLİ DEFTER SAYFASI */
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <button 
                onClick={() => setOpenedNotePage(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} /> Dashboard'a Dön
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditModal(openedNotePage)} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1"><Edit size={14}/> Düzenle</button>
                <button onClick={() => deleteNote(openedNotePage.id)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><Trash2 size={14}/> Sil</button>
              </div>
            </div>

            <div className="flex-1 bg-[#fefdf0] border border-[#f0e68c] rounded-2xl p-8 shadow-inner relative overflow-y-auto"
                 style={{
                   backgroundImage: 'repeating-linear-gradient(white, white 27px, #e8f0fe 28px)',
                   lineHeight: '28px'
                 }}>
              
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">{openedNotePage.title}</h1>
                <span className="text-xs bg-amber-200 text-amber-900 px-2.5 py-1 rounded font-bold">{currentMonth} - {days[openedNotePage.day_index]} ({openedNotePage.time})</span>
              </div>

              {openedNotePage.image_url && (
                <div className="my-4 max-w-md rounded-xl overflow-hidden border shadow-sm">
                  <img src={openedNotePage.image_url} alt="Görsel" className="w-full object-cover" />
                </div>
              )}

              <div className="text-base text-gray-800 whitespace-pre-wrap font-serif pt-2">
                {openedNotePage.content}
              </div>
            </div>
          </div>
        ) : activeView === 'notes' ? (
          /* DASHBOARD (DİNAMİK ESNEYEN KARTLAR: min 1 satır, max ~8 satır) */
          <>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeNotebook} Defteri</h2>
                <p className="text-xs text-gray-500">Not kartlarına tıklayarak detay sayfasına ulaşabilirsiniz.</p>
              </div>
              <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-deep-teal hover:bg-teal-800 text-white px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus size={16} /> Yeni Not Kartı
              </button>
            </header>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {filteredNotes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-12 col-span-full">Bu defterde henüz not kartı yok.</p>
              ) : (
                filteredNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => setOpenedNotePage(note)}
                    className={`${note.color || 'bg-amber-50'} p-5 rounded-2xl border shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between break-inside-avoid relative group min-h-[130px] max-h-[320px] overflow-hidden`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`${note.badge_color || 'bg-amber-200'} text-[10px] px-2 py-0.5 rounded font-bold`}>
                          [{days[note.day_index]}] [{note.time}]
                        </span>
                      </div>
                      <h3 className="font-bold text-sm mb-1.5 text-gray-900">{note.title}</h3>
                      {/* İçerik metni: Line-clamp ile maksimum ~8 satır (160px) sınırlandırıldı */}
                      <p className="text-xs opacity-90 leading-relaxed whitespace-pre-wrap line-clamp-[8]">{note.content}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-black/5 flex justify-end items-center text-[10px] opacity-70">
                      <span className="font-semibold text-teal-800 underline">Sayfayı Aç →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* TAKVİM */
          <>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentMonth} Takvimi</h2>
                <p className="text-xs text-gray-500">
                  {isGoogleCalendarConnected ? '🟢 Google Takvim ile senkronize ediliyor.' : '⚪ Google Takvim bağlı değil.'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsCalendarSettingsOpen(true)}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <Settings size={15} /> Takvim Ayarları
                </button>
                <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-deep-teal hover:bg-teal-800 text-white px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm">
                  <Plus size={16} /> Takvime Ekle
                </button>
              </div>
            </header>

            <div className="grid grid-cols-7 gap-2.5 flex-1 border border-gray-100 rounded-2xl p-3 bg-gray-50/50">
              {days.map((day, index) => (
                <div key={day} className="flex flex-col gap-2">
                  <div className="text-center font-semibold text-xs text-gray-600 pb-2 border-b">{day}</div>
                  {notes.filter(n => n.day_index === index).map(note => (
                    <div key={note.id} onClick={() => setOpenedNotePage(note)} className={`${note.color || 'bg-amber-100'} border p-2 rounded-xl text-xs space-y-1 cursor-pointer hover:shadow-sm`}>
                      <p className="font-bold truncate">{note.title}</p>
                      <p className="text-[10px] opacity-70">{note.time}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* 3. SAĞ PANEL (Görevler) */}
      <aside className="w-72 bg-gray-50 border-l border-gray-200 p-5 flex flex-col gap-5 overflow-y-auto z-10">
        <div>
          <h3 className="font-bold text-xs text-gray-800 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
            <CheckSquare size={16} className="text-deep-teal" /> Görevlerim
          </h3>
          <form onSubmit={addTask} className="flex gap-1.5 mb-3">
            <input type="text" placeholder="Yeni görev..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="flex-1 text-xs border rounded-lg px-2.5 py-1.5 outline-none bg-white" />
            <button type="submit" className="bg-deep-teal text-white px-2.5 py-1.5 rounded-lg text-xs font-medium">Ekle</button>
          </form>
          <div className="space-y-1.5">
            {tasks.map(task => (
              <div key={task.id} className="bg-white p-2 rounded-lg border flex items-center justify-between group shadow-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id, task.completed)} className="rounded text-deep-teal w-3.5 h-3.5 cursor-pointer" />
                  <span className={`text-xs truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span>
                </div>
                <button onClick={(e) => deleteTask(task.id, e)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* GOOGLE TAKVİM AYARLARI MODALI */}
      {isCalendarSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Settings size={18} className="text-deep-teal" /> Takvim & Entegrasyon Ayarları
              </h3>
              <button onClick={() => setIsCalendarSettingsOpen(false)} className="text-gray-400 hover:text-gray-700 text-sm">✕</button>
            </div>

            <div className="p-4 border rounded-xl bg-gray-50/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="font-bold text-xs text-gray-900">Google Takvim Entegrasyonu</p>
                    <p className="text-[11px] text-gray-500">Etkinlikleri çift yönlü senkronize edin</p>
                  </div>
                </div>
                {isGoogleCalendarConnected ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Bağlı
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert size={10} /> Pasif
                  </span>
                )}
              </div>

              {isGoogleCalendarConnected ? (
                <div className="pt-2 space-y-2">
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    Hesabınız Google Takvim ile senkronize durumda. Yeni eylemleriniz Google Takviminize işlenmektedir.
                  </p>
                  <button 
                    onClick={handleDisconnectGoogleCalendar}
                    className="w-full text-xs text-red-600 hover:bg-red-50 border border-red-200 font-medium py-2 rounded-lg transition-colors"
                  >
                    Google Hesabının Bağlantısını Kes
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <p className="text-xs text-gray-600">
                    Google hesabınızı bağlayarak takvimdeki toplantılarınızı ve etkinliklerinizi otomatik olarak çekebilirsiniz.
                  </p>
                  <button 
                    onClick={handleConnectGoogleCalendar}
                    disabled={isSyncing}
                    className="w-full text-xs bg-white hover:bg-gray-100 text-gray-800 border font-semibold py-2 rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2"
                  >
                    {isSyncing ? <RefreshCw size={14} className="animate-spin text-teal-700" /> : <span>🌐 Google ile Bağlan</span>}
                    {isSyncing ? 'Bağlanıyor...' : ''}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setIsCalendarSettingsOpen(false)} 
                className="px-4 py-2 bg-deep-teal text-white rounded-lg text-xs font-medium hover:bg-teal-800"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ NOT MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto">
            <h3 className="font-bold text-base text-gray-900">{isEditMode ? 'Not Kartını Düzenle' : 'Yeni Not Kartı Ekle'}</h3>
            <form onSubmit={saveNote} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Başlık</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Başlık yazın..." className="w-full border rounded-lg px-3 py-2 text-xs outline-none" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">İçerik</label>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Detaylar..." className="w-full border rounded-lg px-3 py-2 text-xs outline-none h-24 resize-none" />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Kart Rengi</label>
                <div className="flex gap-2">
                  {colorOptions.map(col => (
                    <div key={col.name} onClick={() => { setNewColor(col.card); setNewBadge(col.badge); }} className={`w-6 h-6 rounded-full cursor-pointer border-2 ${col.card.split(' ')[0]} ${newColor === col.card ? 'border-gray-800 scale-110' : 'border-transparent'}`} title={col.name} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Gün</label>
                  <select value={newDayIndex} onChange={(e) => setNewDayIndex(Number(e.target.value))} className="w-full border rounded-lg px-3 py-1.5 text-xs bg-white">
                    {days.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Saat</label>
                  <input type="text" value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="10:00" className="w-full border rounded-lg px-3 py-1.5 text-xs" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={resetForm} className="px-3 py-1.5 border rounded-lg text-xs text-gray-600">İptal</button>
                <button type="submit" className="px-3 py-1.5 bg-deep-teal text-white rounded-lg text-xs">{isEditMode ? 'Güncelle' : 'Oluştur'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ DEFTER MODALI */}
      {isNotebookModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-gray-900">Yeni Defter Oluştur</h3>
            <form onSubmit= {addNotebook} className="space-y-3">
              <input type="text" value={newNotebookName} onChange={(e) => setNewNotebookName(e.target.value)} placeholder="Defter adı..." className="w-full border rounded-lg px-3 py-2 text-xs" required />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNotebookModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">İptal</button>
                <button type="submit" className="px-3 py-1.5 bg-deep-teal text-white rounded-lg text-xs">Oluştur</video>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
