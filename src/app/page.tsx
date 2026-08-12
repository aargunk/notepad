'use client';
import React, { useState } from 'react';
import { Book, Tag, Plus, CheckSquare, FileText, Calendar as CalendarIcon, Trash2, FolderOpen } from 'lucide-react';

export default function Home() {
  // Defterler listesi ve aktif seçilen defter
  const [notebooks, setNotebooks] = useState([
    { id: 1, name: 'Kişisel' },
    { id: 2, name: 'İş Projeleri' },
  ]);
  const [activeNotebook, setActiveNotebook] = useState('Kişisel');

  // Görevler listesi
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Final sunumunu hazırla', completed: false },
    { id: 2, title: 'Haftalık planı gözden geçir', completed: true },
  ]);

  // Notlar listesi (İçerikli)
  const [notes, setNotes] = useState([
    { id: 1, notebook: 'Kişisel', title: 'Q4 Strateji Taslağı', content: 'Bütçe ve pazarlama adımları gözden geçirilecek.' },
    { id: 2, notebook: 'İş Projeleri', title: 'Proje Alfa Fikirleri', content: 'Yeni özellikler için kullanıcı geri bildirimleri toplandı.' },
  ]);

  // Takvim etkinlikleri
  const [events, setEvents] = useState([
    { id: 1, dayIndex: 0, title: 'Proje Kick-off', time: '10:00', category: 'İş' }
  ]);

  // Form Input State'leri
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<any>(null); // Açılan not detayı için

  // Takvim modal state'i
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventDay, setNewEventDay] = useState(0);

  const days = ['Pzt 23', 'Sal 24', 'Çar 25', 'Per 26', 'Cum 27', 'Cmt 28', 'Paz 29'];

  // Fonksiyonlar
  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([...tasks, { id: Date.now(), title: newTaskTitle, completed: false }]);
    setNewTaskTitle('');
  };

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    const newNoteObj = { 
      id: Date.now(), 
      notebook: activeNotebook, 
      title: newNoteTitle, 
      content: newNoteContent || 'İçerik girilmedi...' 
    };
    setNotes([...notes, newNoteObj]);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    setEvents([...events, { id: Date.now(), dayIndex: Number(newEventDay), title: newEventTitle, time: newEventTime || '09:00', category: activeNotebook }]);
    setNewEventTitle('');
    setIsEventModalOpen(false);
  };

  // Aktif deftere ait notları filtrele
  const filteredNotes = notes.filter(n => n.notebook === activeNotebook);

  return (
    <div className="flex h-screen bg-soft-white text-gray-800 font-sans relative">
      
      {/* 1. SOL KENAR ÇUBUĞU (Defterler Arası Geçiş) */}
      <aside className="w-64 bg-deep-teal text-white p-6 flex flex-col justify-between shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-white/10 p-2 rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-wide">Notepad Pro</h1>
          </div>

          <nav className="space-y-6">
            <div className="space-y-3">
              <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider">Defterlerim</p>
              {notebooks.map(nb => (
                <div 
                  key={nb.id} 
                  onClick={() => { setActiveNotebook(nb.name); setSelectedNote(null); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeNotebook === nb.name ? 'bg-white/20 font-medium text-white' : 'hover:bg-white/5 text-teal-100'}`}
                >
                  <Book size={18} /> {nb.name}
                </div>
              ))}
            </div>
          </nav>
        </div>

        <div className="text-xs text-teal-300 border-t border-teal-800 pt-4">
          Bulut Senkronizasyonu: Aktif 🟢
        </div>
      </aside>

      {/* 2. ORTA ALAN (Takvim ve Etkinlikler) */}
      <main className="flex-1 p-8 bg-white overflow-y-auto flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Haftalık Takvim ({activeNotebook})</h2>
            <p className="text-sm text-gray-500">Ekim 23 - Ekim 29, 2026</p>
          </div>
          <button 
            onClick={() => setIsEventModalOpen(true)}
            className="bg-deep-teal hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus size={18} /> Takvime Etkinlik Ekle
          </button>
        </header>

        {/* Takvim Grid Yapısı */}
        <div className="grid grid-cols-7 gap-3 flex-1 border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
          {days.map((day, index) => (
            <div key={day} className="flex flex-col gap-2">
              <div className="text-center font-semibold text-sm text-gray-600 pb-2 border-b border-gray-200">
                {day}
              </div>
              
              {/* O güne ait etkinlikleri listele */}
              {events.filter(ev => ev.dayIndex === index).map(ev => (
                <div key={ev.id} className="bg-amber-50 border border-amber-200 p-3 rounded-xl shadow-xs text-xs space-y-1.5">
                  <span className="bg-amber-200 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">{ev.category}</span>
                  <p className="font-bold text-amber-900">{ev.title}</p>
                  <p className="text-amber-700">{ev.time}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>

      {/* 3. SAĞ PANEL (Defter Notları, Detayları ve Görevler) */}
      <aside className="w-80 bg-gray-50 border-l border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto">
        
        {/* Seçilen Not Detay Görünümü veya Not Listesi */}
        {selectedNote ? (
          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
            <button 
              onClick={() => setSelectedNote(null)}
              className="text-xs text-teal-700 font-semibold hover:underline mb-2 flex items-center gap-1"
            >
              ← Not Listesine Dön
            </button>
            <h3 className="font-bold text-gray-900 text-lg">{selectedNote.title}</h3>
            <p className="text-xs text-gray-400">Defter: {selectedNote.notebook}</p>
            <div className="border-t pt-2 text-sm text-gray-700 whitespace-pre-wrap">
              {selectedNote.content}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText size={18} className="text-deep-teal" /> {activeNotebook} Notları
              </h3>
            </div>

            {/* Not Ekleme Formu */}
            <form onSubmit={addNote} className="space-y-2 mb-4 bg-white p-3 rounded-xl border shadow-xs">
              <input 
                type="text" 
                placeholder="Not Başlığı..." 
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full text-xs border rounded-lg px-3 py-2 outline-none focus:border-teal-700"
              />
              <textarea 
                placeholder="Not içeriği yazın..." 
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full text-xs border rounded-lg px-3 py-2 outline-none focus:border-teal-700 resize-none h-16"
              />
              <button type="submit" className="w-full bg-deep-teal text-white py-1.5 rounded-lg text-xs font-medium hover:bg-teal-800">
                Not Ekle
              </button>
            </form>

            <div className="space-y-2.5">
              {filteredNotes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Bu defterde henüz not yok.</p>
              ) : (
                filteredNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => setSelectedNote(note)}
                    className="bg-white p-3 rounded-xl shadow-xs border border-gray-200 cursor-pointer hover:border-teal-600 transition-all"
                  >
                    <h4 className="font-semibold text-sm text-gray-800 mb-1">{note.title}</h4>
                    <p className="text-xs text-gray-500 truncate">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Görevler Bölümü */}
        <div className="border-t pt-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
            <CheckSquare size={18} className="text-deep-teal" /> Görevlerim
          </h3>
          
          <form onSubmit={addTask} className="flex gap-2 mb-3">
            <input 
              type="text" 
              placeholder="Yeni görev..." 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 text-xs border rounded-lg px-3 py-2 outline-none focus:border-teal-700 bg-white"
            />
            <button type="submit" className="bg-deep-teal text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-teal-800">
              Ekle
            </button>
          </form>

          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="bg-white p-2.5 rounded-lg border flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={() => toggleTask(task.id)}
                  className="rounded text-deep-teal focus:ring-deep-teal w-4 h-4 cursor-pointer" 
                />
                <span className={`text-xs ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>

      </aside>

      {/* TAKVİME ETKİNLİK EKLEME MODALI */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Takvime Etkinlik Ekle</h3>
            <form onSubmit={addEvent} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Etkinlik Başlığı</label>
                <input 
                  type="text" 
                  value={newEventTitle} 
                  onChange={(e) => setNewEventTitle(e.target.value)} 
                  placeholder="Örn: Müşteri Görüşmesi"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Gün Seçin</label>
                <select 
                  value={newEventDay} 
                  onChange={(e) => setNewEventDay(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700 bg-white"
                >
                  {days.map((d, idx) => (
                    <option key={d} value={idx}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Saat</label>
                <input 
                  type="text" 
                  value={newEventTime} 
                  onChange={(e) => setNewEventTime(e.target.value)} 
                  placeholder="Örn: 14:00"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-deep-teal text-white rounded-lg text-xs font-medium hover:bg-teal-800"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
