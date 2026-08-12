'use client';
import React, { useState } from 'react';
import { Book, Tag, Plus, CheckSquare, FileText, Calendar as CalendarIcon, ExternalLink, X, Palette } from 'lucide-react';

export default function Home() {
  const [notebooks] = useState([
    { id: 1, name: 'Kişisel' },
    { id: 2, name: 'İş Projeleri' },
  ]);
  const [activeNotebook, setActiveNotebook] = useState('Kişisel');
  const [activeView, setActiveView] = useState<'notes' | 'calendar'>('notes');

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Final sunumunu hazırla', completed: false },
    { id: 2, title: 'Haftalık planı gözden geçir', completed: true },
  ]);

  // Keep tarzı renkli ve kompakt notlar
  const [notes, setNotes] = useState([
    { 
      id: 1, 
      notebook: 'Kişisel', 
      title: 'Q4 Strateji Taslağı', 
      content: 'Bütçe ve pazarlama adımları gözden geçirilecek.', 
      dayIndex: 0, 
      time: '10:00',
      color: 'bg-amber-50 border-amber-200 text-amber-950',
      badgeColor: 'bg-amber-200 text-amber-900',
      fileName: 'butce_plani.pdf',
      fileUrl: '#'
    },
    { 
      id: 2, 
      notebook: 'İş Projeleri', 
      title: 'Proje Alfa Fikirleri', 
      content: 'Yeni özellikler için kullanıcı geri bildirimleri toplandı.', 
      dayIndex: 2, 
      time: '14:30',
      color: 'bg-purple-50 border-purple-200 text-purple-950',
      badgeColor: 'bg-purple-200 text-purple-900',
      fileName: null,
      fileUrl: null
    },
    { 
      id: 3, 
      notebook: 'Kişisel', 
      title: 'Yatırım Planlaması', 
      content: 'Hisse senedi ve fon dağılımlarının güncellenmesi.', 
      dayIndex: 4, 
      time: '11:00',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      badgeColor: 'bg-emerald-200 text-emerald-900',
      fileName: 'yatirim.pdf',
      fileUrl: '#'
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDayIndex, setNewDayIndex] = useState(0);
  const [newTime, setNewTime] = useState('09:00');
  const [newColor, setNewColor] = useState('bg-amber-50 border-amber-200 text-amber-950');
  const [newBadge, setNewBadge] = useState('bg-amber-200 text-amber-900');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  const days = ['Pzt 23', 'Sal 24', 'Çar 25', 'Per 26', 'Cum 27', 'Cmt 28', 'Paz 29'];

  const colorOptions = [
    { name: 'Sarı', card: 'bg-amber-50 border-amber-200 text-amber-950', badge: 'bg-amber-200 text-amber-900' },
    { name: 'Mor', card: 'bg-purple-50 border-purple-200 text-purple-950', badge: 'bg-purple-200 text-purple-900' },
    { name: 'Yeşil', card: 'bg-emerald-50 border-emerald-200 text-emerald-950', badge: 'bg-emerald-200 text-emerald-900' },
    { name: 'Mavi', card: 'bg-sky-50 border-sky-200 text-sky-950', badge: 'bg-sky-200 text-sky-900' },
  ];

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0].name);
    }
  };

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newNote = {
      id: Date.now(),
      notebook: activeNotebook,
      title: newTitle,
      content: newContent || 'İçerik girilmedi...',
      dayIndex: Number(newDayIndex),
      time: newTime,
      color: newColor,
      badgeColor: newBadge,
      fileName: attachedFile,
      fileUrl: attachedFile ? '#' : null
    };

    setNotes([...notes, newNote]);
    setNewTitle('');
    setNewContent('');
    setAttachedFile(null);
    setIsModalOpen(false);
  };

  const filteredNotes = notes.filter(n => n.notebook === activeNotebook);

  return (
    <div className="flex h-screen bg-soft-white text-gray-800 font-sans relative">
      
      {/* 1. SOL KENAR ÇUBUĞU */}
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
                  onClick={() => { setActiveNotebook(nb.name); setActiveView('notes'); setSelectedNote(null); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeView === 'notes' && activeNotebook === nb.name ? 'bg-white/20 font-medium text-white' : 'hover:bg-white/5 text-teal-100'}`}
                >
                  <Book size={18} /> {nb.name}
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-teal-800">
              <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider">Planlayıcı</p>
              <div 
                onClick={() => { setActiveView('calendar'); setSelectedNote(null); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeView === 'calendar' ? 'bg-white/20 font-medium text-white' : 'hover:bg-white/5 text-teal-100'}`}
              >
                <CalendarIcon size={18} dev-id="cal" /> Takvim Sayfası
              </div>
            </div>
          </nav>
        </div>

        <div className="text-xs text-teal-300 border-t border-teal-800 pt-4">
          Google Keep & Bulut: Senkronize 🟢
        </div>
      </aside>

      {/* 2. ORTA ALAN (Keep Tarzı Çoklu Sütunlu Renkli Kartlar) */}
      <main className="flex-1 p-8 bg-white overflow-y-auto flex flex-col">
        {activeView === 'notes' ? (
          <>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{activeNotebook} Defteri</h2>
                <p className="text-sm text-gray-500">Google Keep tarzı esnek not kartları</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-deep-teal hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={18} /> Not Ekle
              </button>
            </header>

            {/* Keep Tarzı Çoklu Sütun (Grid) Yapısı */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.length === 0 ? (
                <p className="text-sm text-gray-400 col-span-3 text-center py-10">Bu defterde henüz not bulunmuyor.</p>
              ) : (
                filteredNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => setSelectedNote(note)}
                    className={`${note.color} p-4 rounded-2xl shadow-xs border cursor-pointer hover:shadow-md transition-all flex flex-col justify-between min-h-[160px]`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`${note.badgeColor} text-[10px] px-2 py-0.5 rounded-md font-bold`}>Sticker</span>
                        <span className="text-[10px] opacity-70">{days[note.dayIndex]} - {note.time}</span>
                      </div>
                      <h3 className="font-bold text-sm mb-1">{note.title}</h3>
                      <p className="text-xs opacity-90 line-clamp-3">{note.content}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-black/5 flex justify-between items-center text-[10px] opacity-80">
                      <span>{note.fileName ? `📎 ${note.fileName}` : ''}</span>
                      <span className="font-semibold underline">İncele →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Haftalık Takvim Görünümü</h2>
                <p className="text-sm text-gray-500">Ekim 23 - Ekim 29, 2026</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-deep-teal hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={18} /> Takvime Not Ekle
              </button>
            </header>

            <div className="grid grid-cols-7 gap-3 flex-1 border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
              {days.map((day, index) => (
                <div key={day} className="flex flex-col gap-2">
                  <div className="text-center font-semibold text-sm text-gray-600 pb-2 border-b border-gray-200">
                    {day}
                  </div>
                  
                  {notes.filter(n => n.dayIndex === index).map(note => (
                    <div 
                      key={note.id} 
                      onClick={() => setSelectedNote(note)}
                      className={`${note.color} border p-2.5 rounded-xl shadow-xs text-xs space-y-1 cursor-pointer transition-all`}
                    >
                      <span className={`${note.badgeColor} text-[9px] px-1.5 py-0.5 rounded font-bold`}>{note.notebook}</span>
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
      <aside className="w-80 bg-gray-50 border-l border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
            <CheckSquare size={18} className="text-deep-teal" /> Görevlerim
          </h3>
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

      {/* NOT DETAY MODALI */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setSelectedNote(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700"
            >
              <X size={22} />
            </button>

            <div>
              <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-1 rounded-md">
                Defter: {selectedNote.notebook}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">{selectedNote.title}</h2>
              <p className="text-xs text-gray-400 mt-1">Zaman: {days[selectedNote.dayIndex]} - {selectedNote.time}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border text-gray-700 text-sm whitespace-pre-wrap min-h-[120px]">
              {selectedNote.content}
            </div>

            {selectedNote.fileName && (
              <div className="flex items-center justify-between bg-teal-50 border border-teal-200 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-teal-900 font-medium">
                  <FileText size={18} className="text-teal-700" />
                  {selectedNote.fileName} (Google Drive / Keep Senkronize)
                </div>
                <a 
                  href={selectedNote.fileUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs bg-teal-700 text-white px-3 py-1.5 rounded-lg hover:bg-teal-800 flex items-center gap-1"
                >
                  <ExternalLink size={14} /> Görüntüle / İndir
                </a>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <button 
                onClick={() => setSelectedNote(null)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-xl text-xs font-medium hover:bg-gray-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ NOT EKLEME MODALI (Renk Seçenekli) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Google Keep Tarzı Not Ekle</h3>
            <form onSubmit={addNote} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Not Başlığı</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="Başlık yazın..."
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Not İçeriği</label>
                <textarea 
                  value={newContent} 
                  onChange={(e) => setNewContent(e.target.value)} 
                  placeholder="Not alın..."
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700 h-20 resize-none"
                />
              </div>

              {/* Renk Seçimi */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Kart Rengi</label>
                <div className="flex gap-2">
                  {colorOptions.map(col => (
                    <div 
                      key={col.name}
                      onClick={() => { setNewColor(col.card); setNewBadge(col.badge); }}
                      className={`w-6 h-6 rounded-full cursor-pointer border-2 ${col.card.split(' ')[0]} ${newColor === col.card ? 'border-teal-700 scale-110' : 'border-transparent'}`}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Gün</label>
                  <select 
                    value={newDayIndex} 
                    onChange={(e) => setNewDayIndex(Number(e.target.value))}
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
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)} 
                    placeholder="10:00"
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Dosya Ekle (Google Drive)</label>
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
                {attachedFile && <p className="text-[10px] text-teal-600 mt-1">Seçilen dosya: {attachedFile}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
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
