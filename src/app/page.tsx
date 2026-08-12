'use client';
import React, { useState } from 'react';
import { Book, Plus, CheckSquare, FileText, Calendar as CalendarIcon, ExternalLink, X, Trash2, Repeat, Edit, Image as ImageIcon, Mail, RefreshCw } from 'lucide-react';

export default function Home() {
  const [notebooks, setNotebooks] = useState([
    { id: 1, name: 'Kişisel' },
    { id: 2, name: 'İş Projeleri' },
  ]);
  const [activeNotebook, setActiveNotebook] = useState('Kişisel');
  const [activeView, setActiveView] = useState<'notes' | 'calendar'>('notes');

  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Final sunumunu hazırla', completed: false, category: 'Kişisel' },
    { id: 2, title: 'Haftalık planı gözden geçir', completed: true, category: 'İş Projeleri' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

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
      fileUrl: '#',
      imageUrl: null,
      isRecurring: false,
      recurrenceInfo: ''
    },
    { 
      id: 2, 
      notebook: 'İş Projeleri', 
      title: 'Haftalık Ekip Toplantısı', 
      content: 'Her pazartesi düzenli durum değerlendirmesi.', 
      dayIndex: 0, 
      time: '14:30',
      color: 'bg-purple-50 border-purple-200 text-purple-950',
      badgeColor: 'bg-purple-200 text-purple-900',
      fileName: null,
      fileUrl: null,
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=60',
      isRecurring: true,
      recurrenceInfo: '12 Ocak tarihine kadar her Pazartesi'
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  
  // Form State'leri
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDayIndex, setNewDayIndex] = useState(0);
  const [newTime, setNewTime] = useState('09:00');
  const [newColor, setNewColor] = useState('bg-amber-50 border-amber-200 text-amber-950');
  const [newBadge, setNewBadge] = useState('bg-amber-200 text-amber-900');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceText, setRecurrenceText] = useState('Her Pazartesi (12 Ocak tarihine kadar)');

  // Outlook Entegrasyon State'i
  const [isOutlookSynced, setIsOutlookSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Takvim Ayarları Güncellendi (Ağustos 2026)
  const currentMonth = "Ağustos 2026";
  const currentWeek = "10 Ağustos - 16 Ağustos, 2026";
  const days = ['Pzt 10', 'Sal 11', 'Çar 12', 'Per 13', 'Cum 14', 'Cmt 15', 'Paz 16'];

  const colorOptions = [
    { name: 'Sarı', card: 'bg-amber-50 border-amber-200 text-amber-950', badge: 'bg-amber-200 text-amber-900' },
    { name: 'Mor', card: 'bg-purple-50 border-purple-200 text-purple-950', badge: 'bg-purple-200 text-purple-900' },
    { name: 'Yeşil', card: 'bg-emerald-50 border-emerald-200 text-emerald-950', badge: 'bg-emerald-200 text-emerald-900' },
    { name: 'Mavi', card: 'bg-sky-50 border-sky-200 text-sky-950', badge: 'bg-sky-200 text-sky-900' },
    { name: 'Pembe', card: 'bg-rose-50 border-rose-200 text-rose-950', badge: 'bg-rose-200 text-rose-900' },
  ];

  // Outlook Senkronizasyon Simülasyonu
  const handleOutlookSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      alert("Microsoft Graph API'ye bağlanılıyor...\n\nCanlı ortamda burada Microsoft Login sayfası açılacak ve izin onaylandıktan sonra Outlook takvim etkinlikleri projeye aktarılacaktır.");
      setIsOutlookSynced(true);
      setIsSyncing(false);
    }, 1500);
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([...tasks, { id: Date.now(), title: newTaskTitle.trim(), completed: false, category: activeNotebook }]);
    setNewTaskTitle('');
  };

  const deleteTask = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0].name);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAttachedImage(url);
    }
  };

  const saveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (isEditMode && editingNoteId) {
      setNotes(notes.map(n => n.id === editingNoteId ? {
        ...n,
        title: newTitle,
        content: newContent,
        dayIndex: Number(newDayIndex),
        time: newTime,
        color: newColor,
        badgeColor: newBadge,
        fileName: attachedFile,
        imageUrl: attachedImage,
        isRecurring: isRecurring,
        recurrenceInfo: isRecurring ? recurrenceText : ''
      } : n));
    } else {
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
        fileUrl: attachedFile ? '#' : null,
        imageUrl: attachedImage,
        isRecurring: isRecurring,
        recurrenceInfo: isRecurring ? recurrenceText : ''
      };
      setNotes([...notes, newNote]);
    }
    resetForm();
  };

  const openEditModal = (note: any) => {
    setIsEditMode(true);
    setEditingNoteId(note.id);
    setNewTitle(note.title);
    setNewContent(note.content);
    setNewDayIndex(note.dayIndex);
    setNewTime(note.time);
    setNewColor(note.color);
    setNewBadge(note.badgeColor);
    setAttachedFile(note.fileName);
    setAttachedImage(note.imageUrl);
    setIsRecurring(note.isRecurring);
    setRecurrenceText(note.recurrenceInfo || '');
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingNoteId(null);
    setNewTitle('');
    setNewContent('');
    setAttachedFile(null);
    setAttachedImage(null);
    setIsRecurring(false);
    setIsModalOpen(false);
  };

  const deleteNote = (id: number) => {
    if(confirm("Bu notu silmek istediğinize emin misiniz?")) {
      setNotes(notes.filter(n => n.id !== id));
      setSelectedNote(null);
    }
  };

  const addNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;
    const newNb = { id: Date.now(), name: newNotebookName.trim() };
    setNotebooks([...notebooks, newNb]);
    setActiveNotebook(newNb.name);
    setNewNotebookName('');
    setIsNotebookModalOpen(false);
  };

  const filteredNotes = notes.filter(n => n.notebook === activeNotebook);

  return (
    <div className="flex h-screen bg-soft-white text-gray-800 font-sans relative">
      
      {/* 1. SOL KENAR ÇUBUĞU */}
      <aside className="w-64 bg-deep-teal text-white p-6 flex flex-col justify-between shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-white/10 p-2 rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-wide">Notepad Pro</h1>
          </div>

          <nav className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider">Defterlerim</p>
                <button 
                  onClick={() => setIsNotebookModalOpen(true)}
                  className="text-teal-200 hover:text-white text-xs flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded transition-all"
                >
                  <Plus size={14} /> Yeni
                </button>
              </div>

              {notebooks.map(nb => (
                <div 
                  key={nb.id} 
                  onClick={() => { setActiveNotebook(nb.name); setActiveView('notes'); setSelectedNote(null); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeView === 'notes' && activeNotebook === nb.name ? 'bg-white/20 font-medium text-white' : 'hover:bg-white/5 text-teal-100'}`}
                >
                  <Book size={18} /> <span className="truncate">{nb.name}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-teal-800">
              <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider">Planlayıcı</p>
              <div 
                onClick={() => { setActiveView('calendar'); setSelectedNote(null); }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeView === 'calendar' ? 'bg-white/20 font-medium text-white' : 'hover:bg-white/5 text-teal-100'}`}
              >
                <div className="flex items-center gap-3">
                  <CalendarIcon size={18} /> Takvim
                </div>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">{currentMonth}</span>
              </div>
            </div>
          </nav>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-teal-300 border-t border-teal-800 pt-4 flex items-center justify-between">
            <span>Google Drive / Keep:</span> <span>🟢</span>
          </div>
          <div className="text-xs text-teal-300 flex items-center justify-between">
            <span>Microsoft Outlook:</span>
            {isOutlookSynced ? (
              <span>🟢</span>
            ) : (
              <button 
                onClick={handleOutlookSync}
                disabled={isSyncing}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-all disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw size={12} className="animate-spin" /> : <Mail size={12} />} 
                {isSyncing ? 'Bağlanıyor...' : 'Bağla'}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. ORTA ALAN */}
      <main className="flex-1 p-8 bg-white overflow-y-auto flex flex-col">
        {activeView === 'notes' ? (
          <>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{activeNotebook} Defteri</h2>
                <p className="text-sm text-gray-500">Google Keep tarzı esnek not kartları</p>
              </div>
              <button 
                onClick={openCreateModal}
                className="bg-deep-teal hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={18} /> Not / Eylem Ekle
              </button>
            </header>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {filteredNotes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10 w-full col-span-full">Bu defterde henüz not bulunmuyor.</p>
              ) : (
                filteredNotes.map(note => (
                  <div key={note.id} onClick={() => setSelectedNote(note)} className={`${note.color} rounded-2xl shadow-xs border cursor-pointer hover:shadow-md transition-all flex flex-col overflow-hidden break-inside-avoid`}>
                    {note.imageUrl && (
                      <div className="w-full h-32 overflow-hidden border-b border-black/5">
                        <img src={note.imageUrl} alt="Not Görseli" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`${note.badgeColor} text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1`}>
                          {note.isRecurring && <Repeat size={10} />} Sticker
                        </span>
                        <span className="text-[10px] opacity-70">{currentMonth} / {days[note.dayIndex].split(' ')[1]} - {note.time}</span>
                      </div>
                      <h3 className="font-bold text-sm mb-1">{note.title}</h3>
                      <p className="text-xs opacity-90 line-clamp-3">{note.content}</p>
                      
                      {note.isRecurring && (
                        <p className="text-[10px] font-semibold mt-2 opacity-80 flex items-center gap-1 text-purple-800">
                          <Repeat size={10} /> {note.recurrenceInfo}
                        </p>
                      )}

                      <div className="pt-3 mt-3 border-t border-black/5 flex justify-between items-center text-[10px] opacity-80">
                        <span className="flex items-center gap-1">
                          {note.fileName && <span>📎 Dosya</span>}
                          {note.imageUrl && <span className="ml-1">🖼️ Görsel</span>}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(note); }} className="font-semibold underline hover:text-teal-700">Düzenle</button>
                      </div>
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
                <h2 className="text-2xl font-bold text-gray-900">{currentMonth} Takvimi</h2>
                <p className="text-sm text-gray-500">{currentWeek}</p>
              </div>
              <div className="flex items-center gap-3">
                {!isOutlookSynced && (
                  <button 
                    onClick={handleOutlookSync}
                    className="border border-blue-600 text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all text-sm"
                  >
                    <Mail size={16} /> Outlook'u Bağla
                  </button>
                )}
                <button 
                  onClick={openCreateModal}
                  className="bg-deep-teal hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus size={18} /> Takvime Eylem Ekle
                </button>
              </div>
            </header>

            <div className="grid grid-cols-7 gap-3 flex-1 border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
              {days.map((day, index) => (
                <div key={day} className="flex flex-col gap-2">
                  <div className="text-center font-semibold text-sm text-gray-600 pb-2 border-b border-gray-200">{day}</div>
                  {notes.filter(n => n.dayIndex === index).map(note => (
                    <div key={note.id} onClick={() => setSelectedNote(note)} className={`${note.color} border p-2.5 rounded-xl shadow-xs text-xs space-y-1 cursor-pointer transition-all`}>
                      <span className={`${note.badgeColor} text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 w-max`}>
                        {note.isRecurring && <Repeat size={8} />} {note.notebook}
                      </span>
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
          <form onSubmit={addTask} className="flex gap-2 mb-3">
            <input type="text" placeholder="Yeni görev ekle..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="flex-1 text-xs border rounded-lg px-3 py-2 outline-none focus:border-teal-700 bg-white" />
            <button type="submit" className="bg-deep-teal text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-teal-800">Ekle</button>
          </form>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="bg-white p-2.5 rounded-lg border flex items-center justify-between group shadow-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="rounded text-deep-teal focus:ring-deep-teal w-4 h-4 cursor-pointer" />
                  <span className={`text-xs truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span>
                </div>
                <button onClick={(e) => deleteTask(task.id, e)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* NOT DETAY MODALI */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl space-y-6 relative overflow-y-auto max-h-[90vh]">
            <div className="absolute top-6 right-6 flex gap-2">
              <button onClick={() => openEditModal(selectedNote)} className="text-gray-400 hover:text-teal-600 bg-gray-100 p-2 rounded-full"><Edit size={18} /></button>
              <button onClick={() => deleteNote(selectedNote.id)} className="text-gray-400 hover:text-red-600 bg-gray-100 p-2 rounded-full"><Trash2 size={18} /></button>
              <button onClick={() => setSelectedNote(null)} className="text-gray-400 hover:text-gray-900 bg-gray-100 p-2 rounded-full"><X size={18} /></button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-1 rounded-md">Defter: {selectedNote.notebook}</span>
                {selectedNote.isRecurring && <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded-md flex items-center gap-1"><Repeat size={12} /> {selectedNote.recurrenceInfo}</span>}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 pr-24">{selectedNote.title}</h2>
              <p className="text-xs text-gray-400 mt-1">Zaman: {currentMonth} / {days[selectedNote.dayIndex].split(' ')[1]} - {selectedNote.time}</p>
            </div>

            {selectedNote.imageUrl && (
              <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200">
                <img src={selectedNote.imageUrl} alt="Not Görseli" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl border text-gray-700 text-sm whitespace-pre-wrap min-h-[100px]">
              {selectedNote.content}
            </div>

            {selectedNote.fileName && (
              <div className="flex items-center justify-between bg-teal-50 border border-teal-200 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-teal-900 font-medium"><FileText size={18} className="text-teal-700" /> {selectedNote.fileName}</div>
                <a href={selectedNote.fileUrl} target="_blank" rel="noreferrer" className="text-xs bg-teal-700 text-white px-3 py-1.5 rounded-lg hover:bg-teal-800 flex items-center gap-1"><ExternalLink size={14} /> Görüntüle</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* YENİ NOT EKLEME / DÜZENLEME MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto relative">
            <h3 className="font-bold text-lg text-gray-900">{isEditMode ? 'Notu Düzenle' : 'Not / Seri Eylem Ekle'}</h3>
            <form onSubmit={saveNote} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Başlık</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Başlık yazın..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">İçerik / Detay</label>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Not alın..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700 h-20 resize-none" />
              </div>

              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="rounded text-purple-700 focus:ring-purple-700 w-4 h-4" />
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1"><Repeat size={14} /> Seri / Devam Eden Eylem</span>
                </label>
                {isRecurring && <input type="text" value={recurrenceText} onChange={(e) => setRecurrenceText(e.target.value)} className="w-full text-xs border border-purple-300 rounded-lg px-3 py-1.5 outline-none bg-white" />}
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
                  <label className="text-xs text-gray-500 block mb-1">Gün ({currentMonth})</label>
                  <select value={newDayIndex} onChange={(e) => setNewDayIndex(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700 bg-white">
                    {days.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Saat</label>
                  <input type="text" value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="10:00" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700" />
                </div>
              </div>

              <div className="space-y-2 border-t pt-2 mt-2">
                <div>
                  <label className="text-xs text-gray-500 flex items-center gap-1 mb-1"><ImageIcon size={14}/> Görsel / Resim Ekle</label>
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gray-100 hover:file:bg-gray-200" />
                    {attachedImage && <button type="button" onClick={() => setAttachedImage(null)} className="text-red-500 text-xs font-bold px-2 py-1 bg-red-50 rounded">Kaldır</button>}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 flex items-center gap-1 mb-1"><FileText size={14}/> Belge Ekle (PDF/Word)</label>
                  <div className="flex items-center gap-2">
                    <input type="file" onChange={handleFileUpload} className="w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gray-100 hover:file:bg-gray-200" />
                    {attachedFile && <button type="button" onClick={() => setAttachedFile(null)} className="text-red-500 text-xs font-bold px-2 py-1 bg-red-50 rounded">Kaldır</button>}
                  </div>
                  {attachedFile && <p className="text-[10px] text-teal-600 mt-1 truncate">Ekli Dosya: {attachedFile}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">İptal</button>
                <button type="submit" className="px-4 py-2 bg-deep-teal text-white rounded-lg text-xs font-medium hover:bg-teal-800">{isEditMode ? 'Güncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ DEFTER EKLEME MODALI */}
      {isNotebookModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Yeni Defter Oluştur</h3>
            <form onSubmit={addNotebook} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Defter Adı</label>
                <input type="text" value={newNotebookName} onChange={(e) => setNewNotebookName(e.target.value)} placeholder="Örn: Seyahat Planları" className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-700" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNotebookModalOpen(false)} className="px-4 py-2 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">İptal</button>
                <button type="submit" className="px-4 py-2 bg-deep-teal text-white rounded-lg text-xs font-medium hover:bg-teal-800">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
