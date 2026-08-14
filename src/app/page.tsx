'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Plus, CheckSquare, Calendar as CalendarIcon, 
  Trash2, Edit, ArrowLeft, Settings, RefreshCw, CheckCircle2, 
  ShieldAlert, Save, PenTool, Eraser, Mic, MicOff, GripVertical, 
  ChevronLeft, ChevronRight, Menu, X 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];
const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

// NETFLIX & FUTURISTIC ESİNTİLİ 3D 'N' LOGOSU BİLEŞENİ
function Logo({ size = 32, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none cursor-pointer group">
      <div 
        style={{ width: size, height: size }} 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-950 via-teal-950 to-black p-1.5 shadow-lg shadow-teal-950/40 border border-teal-500/30 group-hover:border-teal-400/60 group-hover:shadow-teal-500/20 transition-all duration-300 shrink-0"
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        >
          <defs>
            <linearGradient id="leftBar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#042f2e" />
            </linearGradient>

            <linearGradient id="diagonalBar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff2a5f" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>

            <linearGradient id="rightBar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>

            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="-2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
            </filter>
          </defs>

          <rect x="18" y="15" width="20" height="70" rx="4" fill="url(#leftBar)" />
          <rect x="62" y="15" width="20" height="70" rx="4" fill="url(#rightBar)" />
          <path 
            d="M18 19 C18 16.5 20.5 15 22.5 16.5 L79.5 81 C81.5 82.5 82 85 82 85 L62 85 L18 32 Z" 
            fill="url(#diagonalBar)" 
            filter="url(#shadow)"
          />
          <path 
            d="M24 20 L76 78" 
            stroke="#ffffff" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeOpacity="0.35" 
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-base tracking-tight text-white font-sans">Notepad</span>
            <span className="font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-teal-400">PRO</span>
          </div>
          <span className="text-[9px] font-semibold text-teal-300 tracking-widest uppercase -mt-1 opacity-80">AI Edition</span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [activeNotebook, setActiveNotebook] = useState('Kişisel');
  const [activeView, setActiveView] = useState<'notes' | 'calendar'>('notes');

  // MOBİL MENÜ STATE'LERİ
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileTasksOpen, setIsMobileTasksOpen] = useState(false);

  // DİNAMİK TARİH STATE'LERİ
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('week');

  const [openedNotePage, setOpenedNotePage] = useState<any>(null);

  // CANLI DÜZENLENEBİLİR & ÇİZİLEBİLİR DEFTER STATE'LERİ
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const isDrawing = useRef(false);

  // DRAG & DROP
  const draggedNotebookIndex = useRef<number | null>(null);

  // SPEECH TO TEXT
  const [isListening, setIsListening] = useState(false);
  const [listeningTarget, setListeningTarget] = useState<'modalTitle' | 'modalContent' | 'pageTitle' | 'pageContent' | null>(null);
  const recognitionRef = useRef<any>(null);

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

  // GOOGLE OAUTH
  const [userSession, setUserSession] = useState<any>(null);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const colorOptions = [
    { name: 'Yeşil', card: 'bg-[#e2f0d9] border-[#c5e1a5] text-emerald-950', badge: 'bg-emerald-200 text-emerald-900' },
    { name: 'Bej/Sarı', card: 'bg-[#fef9e7] border-[#fdebd0] text-amber-950', badge: 'bg-amber-200 text-amber-900' },
    { name: 'Mor', card: 'bg-[#f4ecf7] border-[#d7bde2] text-purple-950', badge: 'bg-purple-200 text-purple-900' },
    { name: 'Mavi', card: 'bg-[#ebf5fb] border-[#aed6f1] text-sky-950', badge: 'bg-sky-200 text-sky-900' },
  ];

  useEffect(() => {
    fetchData();
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUserSession(session);

    if (session?.provider_token) {
      fetchGoogleCalendarEvents(session.provider_token);
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      if (session?.provider_token) {
        fetchGoogleCalendarEvents(session.provider_token);
      }
    });
  };

  const fetchGoogleCalendarEvents = async (providerToken: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=25&orderBy=startTime&singleEvents=true&timeMin=' + new Date().toISOString(), {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });
      const data = await res.json();
      if (data.items) {
        const fetchedGoogleEvents = data.items.map((event: any, idx: number) => ({
          id: 'gcal-' + (event.id || idx),
          notebook_name: activeNotebook,
          title: '📅 ' + (event.summary || 'Google Etkinliği'),
          content: event.description || 'Google Calendar üzerinden senkronize edildi.',
          day_index: event.start?.dateTime ? (new Date(event.start.dateTime).getDay() + 6) % 7 : 0,
          time: event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00',
          color: 'bg-sky-50 border-sky-200 text-sky-950',
          badge_color: 'bg-sky-200 text-sky-900',
        }));

        setNotes(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueEvents = fetchedGoogleEvents.filter((g: any) => !existingIds.has(g.id));
          return [...prev, ...uniqueEvents];
        });
      }
    } catch (err) {
      console.error("Google Calendar verileri çekilemedi:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSyncing(true);
    const redirectToUrl = typeof window !== 'undefined' ? window.location.origin : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
        redirectTo: redirectToUrl,
      },
    });

    if (error) {
      alert("Google Login Hatası: " + error.message);
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserSession(null);
  };

  const handlePrevPeriod = () => {
    const next = new Date(currentDate);
    if (calendarMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setMonth(next.getMonth() - 1);
    }
    setCurrentDate(next);
  };

  const handleNextPeriod = () => {
    const next = new Date(currentDate);
    if (calendarMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragStart = (index: number) => {
    draggedNotebookIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedNotebookIndex.current === null || draggedNotebookIndex.current === dropIndex) return;
    const reordered = [...notebooks];
    const [draggedItem] = reordered.splice(draggedNotebookIndex.current, 1);
    reordered.splice(dropIndex, 0, draggedItem);
    setNotebooks(reordered);
    draggedNotebookIndex.current = null;
  };

  useEffect(() => {
    if (isInlineEditing && canvasRef.current && canvasContainerRef.current) {
      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      if (openedNotePage?.image_url) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = openedNotePage.image_url;
      }
    }
  }, [isInlineEditing, isDrawingMode, openedNotePage]);

  const toggleListening = (target: 'modalTitle' | 'modalContent' | 'pageTitle' | 'pageContent') => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Chrome, Edge veya Safari kullanın.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setListeningTarget(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setListeningTarget(target);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      if (target === 'modalTitle') {
        setNewTitle(prev => (prev ? prev + ' ' + transcript : transcript));
      } else if (target === 'modalContent') {
        setNewContent(prev => (prev ? prev + ' ' + transcript : transcript));
      } else if (target === 'pageTitle') {
        setPageTitle(prev => (prev ? prev + ' ' + transcript : transcript));
      } else if (target === 'pageContent') {
        setPageContent(prev => (prev ? prev + '\n' + transcript : transcript));
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Ses tanıma hatası:", event.error);
      setIsListening(false);
      setListeningTarget(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setListeningTarget(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const fetchData = async () => {
    const { data: nbs } = await supabase.from('notebooks').select('*').order('created_at', { ascending: true });
    if (nbs && nbs.length > 0) setNotebooks(nbs);
    else setNotebooks([{ id: 'mock-1', name: 'Kişisel' }]);

    const { data: tks } = await supabase.from('tasks').select('*').order('created_at', { ascending: true });
    if (tks) setTasks(tks);

    const { data: nts } = await supabase.from('notes').select('*').order('created_at', { ascending: true });
    if (nts) setNotes(nts);
  };

  const handleOpenPage = (note: any) => {
    setOpenedNotePage(note);
    setPageTitle(note.title);
    setPageContent(note.content);
    setIsInlineEditing(false);
    setIsDrawingMode(false);
  };

  const handleSaveInline = async () => {
    if (!openedNotePage) return;
    let drawingData = openedNotePage.image_url;

    if (canvasRef.current) {
      drawingData = canvasRef.current.toDataURL();
    }

    const updatedNote = {
      ...openedNotePage,
      title: pageTitle,
      content: pageContent,
      image_url: drawingData
    };

    const { data }: any = await supabase
      .from('notes')
      .update({ title: pageTitle, content: pageContent, image_url: drawingData })
      .eq('id', openedNotePage.id)
      .select();

    if (data && Array.isArray(data) && data.length > 0) {
      setNotes(notes.map(n => n.id === openedNotePage.id ? data[0] : n));
      setOpenedNotePage(data[0]);
    } else {
      setNotes(notes.map(n => n.id === openedNotePage.id ? updatedNote : n));
      setOpenedNotePage(updatedNote);
    }
    setIsInlineEditing(false);
    setIsDrawingMode(false);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    isDrawing.current = true;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !isDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const addNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;
    const { data }: any = await supabase.from('notebooks').insert([{ name: newNotebookName.trim() }]).select();
    if (data && Array.isArray(data) && data.length > 0) {
      setNotebooks([...notebooks, data[0]]);
      setActiveNotebook(data[0].name);
    } else {
      const newNb = { id: Date.now().toString(), name: newNotebookName.trim() };
      setNotebooks([...notebooks, newNb]);
      setActiveNotebook(newNb.name);
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
    const { data }: any = await supabase.from('tasks').insert([{ title: newTaskTitle.trim(), completed: false, category: activeNotebook }]).select();
    if (data && Array.isArray(data) && data.length > 0) setTasks([...tasks, data[0]]);
    else setTasks([...tasks, { id: Date.now().toString(), title: newTaskTitle.trim(), completed: false }]);
    setNewTaskTitle('');
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    const { data }: any = await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', id).select();
    if (data && Array.isArray(data) && data.length > 0) setTasks(tasks.map(t => t.id === id ? data[0] : t));
    else setTasks(tasks.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
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
    };

    if (isEditMode && editingNoteId) {
      const { data }: any = await supabase.from('notes').update(notePayload).eq('id', editingNoteId).select();
      if (data && Array.isArray(data) && data.length > 0) {
        setNotes(notes.map(n => n.id === editingNoteId ? data[0] : n));
        if (openedNotePage?.id === editingNoteId) setOpenedNotePage(data[0]);
      }
    } else {
      const { data }: any = await supabase.from('notes').insert([notePayload]).select();
      if (data && Array.isArray(data) && data.length > 0) setNotes([...notes, data[0]]);
      else setNotes([...notes, { ...notePayload, id: Date.now().toString() }]);
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

  const resetForm = () => {
    setIsEditMode(false);
    setEditingNoteId(null);
    setNewTitle('');
    setNewContent('');
    setIsModalOpen(false);
  };

  const filteredNotes = notes.filter(n => n.notebook_name === activeNotebook);

  const currentYearVal = currentDate.getFullYear();
  const currentMonthVal = currentDate.getMonth();
  const daysInMonth = new Date(currentYearVal, currentMonthVal + 1, 0).getDate();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f4f5f7] text-gray-800 font-sans relative overflow-hidden">
      
      {/* MOBİL ÜST BAR (YENİ LOGO ENTEGRELİ) */}
      <div className="md:hidden bg-teal-900 text-white px-4 py-3 flex items-center justify-between z-20 shadow-md">
        <button onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} className="p-1 rounded-lg hover:bg-white/10">
          <Menu size={22} />
        </button>
        <Logo size={28} showText={true} />
        <button onClick={() => setIsMobileTasksOpen(!isMobileTasksOpen)} className="p-1 rounded-lg hover:bg-white/10 text-teal-200">
          <CheckSquare size={20} />
        </button>
      </div>

      {/* 1. SOL KENAR ÇUBUĞU (YENİ LOGO ENTEGRELİ) */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 md:w-56 bg-teal-900 text-white p-4 flex flex-col justify-between shadow-xl md:shadow-md z-30 transition-transform duration-300 select-none ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <Logo size={34} showText={true} />
            <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-teal-200 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <p className="text-teal-200 text-[11px] font-semibold uppercase tracking-wider">Defterler</p>
                <button onClick={() => setIsNotebookModalOpen(true)} className="text-teal-200 hover:text-white text-xs flex items-center bg-white/10 px-1.5 py-0.5 rounded">
                  <Plus size={12} />
                </button>
              </div>

              {notebooks.map((nb, index) => (
                <div 
                  key={nb.id} 
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  onClick={() => { 
                    setActiveNotebook(nb.name); 
                    setActiveView('notes'); 
                    setOpenedNotePage(null);
                    setIsInlineEditing(false);
                    setIsDrawingMode(false);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing text-xs transition-all group ${activeView === 'notes' && activeNotebook === nb.name && !openedNotePage ? 'bg-white/20 font-medium text-white shadow-xs' : 'hover:bg-white/10 text-teal-100'}`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <GripVertical size={13} className="text-teal-400/60 group-hover:text-teal-200 shrink-0" />
                    <Book size={14} className="shrink-0" /> 
                    <span className="truncate">{nb.name}</span>
                  </div>
                  {notebooks.length > 1 && (
                    <button onClick={(e) => deleteNotebook(nb.name, e)} className="opacity-0 group-hover:opacity-100 text-teal-200 hover:text-red-300 p-0.5 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-teal-800">
              <p className="text-teal-200 text-[11px] font-semibold uppercase tracking-wider px-1">Plan</p>
              <div 
                onClick={() => { 
                  setActiveView('calendar'); 
                  setOpenedNotePage(null);
                  setIsInlineEditing(false);
                  setIsDrawingMode(false);
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${activeView === 'calendar' && !openedNotePage ? 'bg-white/20 font-medium text-white' : 'hover:bg-white/5 text-teal-100'}`}
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} /> Takvim
                </div>
                {userSession && <span className="w-2 h-2 rounded-full bg-emerald-400" title="Google Bağlı" />}
              </div>
            </div>
          </nav>
        </div>

        <div className="text-[10px] text-teal-300 border-t border-teal-800 pt-3 flex items-center justify-between">
          <span>{userSession ? userSession.user.email.split('@')[0] : 'Oturum Yok'}</span>
          <span>🟢</span>
        </div>
      </aside>

      {/* 2. ORTA ALAN */}
      <main className="flex-1 p-3 md:p-6 bg-white overflow-y-auto flex flex-col relative w-full">
        
        {openedNotePage ? (
          /* CANLI DÜZENLENEBİLİR & ÇİZİLEBİLİR DEFTER SAYFASI */
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-2 border-b flex-wrap gap-2">
              <button 
                onClick={() => setOpenedNotePage(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} /> Dashboard'a Dön
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {isInlineEditing ? (
                  <>
                    <button 
                      onClick={() => toggleListening('pageContent')} 
                      className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${isListening && listeningTarget === 'pageContent' ? 'bg-red-600 text-white animate-pulse' : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'}`}
                    >
                      {isListening && listeningTarget === 'pageContent' ? <MicOff size={14} /> : <Mic size={14} />}
                      {isListening && listeningTarget === 'pageContent' ? 'Dinleniyor...' : '🎙️ Sesle Yazdır'}
                    </button>

                    <button 
                      onClick={() => setIsDrawingMode(!isDrawingMode)} 
                      className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors ${isDrawingMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    >
                      <PenTool size={14} /> {isDrawingMode ? 'Metin Modu' : '✏️ Çizim Yap'}
                    </button>

                    {isDrawingMode && (
                      <button onClick={clearCanvas} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                        <Eraser size={14} /> Temizle
                      </button>
                    )}

                    <button onClick={handleSaveInline} className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold shadow-xs">
                      <Save size={14} /> Kaydet
                    </button>
                    <button onClick={() => { setIsInlineEditing(false); setIsDrawingMode(false); }} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">İptal</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsInlineEditing(true)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                      <Edit size={14}/> Düzenle / Çiz
                    </button>
                    <button onClick={() => deleteNote(openedNotePage.id)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium">
                      <Trash2 size={14}/> Sil
                    </button>
                  </>
                )}
              </div>
            </div>

            <div 
              ref={canvasContainerRef}
              className="flex-1 bg-[#fefdf0] border border-[#f0e68c] rounded-2xl p-4 md:p-8 shadow-inner relative overflow-y-auto flex flex-col min-h-[450px]"
              style={{
                backgroundImage: 'repeating-linear-gradient(white, white 27px, #e8f0fe 28px)',
                lineHeight: '28px'
              }}
            >
              {isInlineEditing && (
                <canvas 
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className={`absolute inset-0 z-20 ${isDrawingMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
                />
              )}

              <div className="flex justify-between items-start mb-4 relative z-10 flex-wrap gap-2">
                {isInlineEditing ? (
                  <div className="flex items-center gap-2 w-full md:w-2/3">
                    <input 
                      type="text" 
                      value={pageTitle} 
                      onChange={(e) => setPageTitle(e.target.value)}
                      className="text-2xl md:text-3xl font-bold text-gray-900 font-serif bg-white/70 border border-teal-300 rounded px-2 py-1 outline-none flex-1"
                    />
                    <button 
                      type="button" 
                      onClick={() => toggleListening('pageTitle')} 
                      className={`p-2 rounded-lg border text-xs transition-colors ${isListening && listeningTarget === 'pageTitle' ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                ) : (
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight font-serif">{openedNotePage.title}</h1>
                )}
                <span className="text-xs bg-amber-200 text-amber-900 px-2.5 py-1 rounded font-bold">
                  {MONTH_NAMES[currentMonthVal]} {currentYearVal}
                </span>
              </div>

              {openedNotePage.image_url && !isInlineEditing && (
                <div className="my-4 max-w-md rounded-xl overflow-hidden border shadow-sm relative z-10">
                  <img src={openedNotePage.image_url} alt="Çizim Görseli" className="w-full object-cover" />
                </div>
              )}

              <div className="flex-1 relative z-10">
                {isInlineEditing ? (
                  <textarea 
                    value={pageContent}
                    onChange={(e) => setPageContent(e.target.value)}
                    className="w-full h-full min-h-[250px] bg-transparent font-serif text-base text-gray-800 outline-none resize-none"
                    style={{ lineHeight: '28px' }}
                    placeholder="Sayfa üzerine yazın..."
                  />
                ) : (
                  <div className="text-base text-gray-800 whitespace-pre-wrap font-serif pt-2">
                    {openedNotePage.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeView === 'notes' ? (
          /* DASHBOARD */
          <>
            <header className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeNotebook} Defteri</h2>
                <p className="text-xs text-gray-500">Not kartlarına tıklayarak detay sayfasına ulaşabilirsiniz.</p>
              </div>
              <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-teal-900 hover:bg-teal-800 text-white px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus size={16} /> Yeni Not Kartı
              </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-12 col-span-full">Bu defterde henüz not kartı yok.</p>
              ) : (
                filteredNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => handleOpenPage(note)}
                    className={`${note.color || 'bg-amber-50'} p-5 rounded-2xl border shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between relative group min-h-[140px] max-h-[320px] overflow-hidden`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`${note.badge_color || 'bg-amber-200'} text-[10px] px-2 py-0.5 rounded font-bold`}>
                          [{DAY_NAMES[note.day_index || 0]}] [{note.time || '09:00'}]
                        </span>
                      </div>
                      <h3 className="font-bold text-sm mb-1.5 text-gray-900">{note.title}</h3>
                      <p className="text-xs opacity-90 leading-relaxed whitespace-pre-wrap line-clamp-4">{note.content}</p>
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
          /* DİNAMİK TAKVİM */
          <div className="flex-1 flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <header className="flex justify-between items-center px-4 md:px-6 py-3.5 border-b border-gray-200 bg-gray-50/50 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <button onClick={handleToday} className="px-3 py-1.5 border rounded-lg text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 shadow-2xs">
                  Bugün
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={handlePrevPeriod} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"><ChevronLeft size={18} /></button>
                  <button onClick={handleNextPeriod} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"><ChevronRight size={18} /></button>
                </div>
                <h2 className="text-base md:text-lg font-bold text-gray-900 tracking-tight">
                  {MONTH_NAMES[currentMonthVal]} {currentYearVal}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-200/80 p-1 rounded-xl text-xs font-semibold text-gray-600">
                  <button 
                    onClick={() => setCalendarMode('week')}
                    className={`px-3 py-1 rounded-lg transition-all ${calendarMode === 'week' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'}`}
                  >
                    Hafta
                  </button>
                  <button 
                    onClick={() => setCalendarMode('month')}
                    className={`px-3 py-1 rounded-lg transition-all ${calendarMode === 'month' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'}`}
                  >
                    Ay
                  </button>
                </div>

                <button 
                  onClick={() => setIsCalendarSettingsOpen(true)}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 p-2 rounded-xl text-xs font-medium shadow-2xs"
                >
                  <Settings size={16} />
                </button>
                <button 
                  onClick={() => { resetForm(); setIsModalOpen(true); }} 
                  className="bg-teal-900 hover:bg-teal-800 text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 shadow-sm"
                >
                  <Plus size={16} /> Ekle
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {calendarMode === 'week' ? (
                <div className="flex flex-col min-w-[650px]">
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200 bg-gray-50 text-center sticky top-0 z-10">
                    <div className="py-2.5 text-[11px] font-bold text-gray-400 border-r border-gray-200">Saat</div>
                    {DAY_NAMES.map((day, idx) => (
                      <div key={day} className={`py-2.5 text-xs font-bold border-r border-gray-200 ${idx === 3 ? 'bg-teal-50 text-teal-900' : 'text-gray-700'}`}>
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="divide-y divide-gray-100">
                    {hours.map((hour) => (
                      <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[50px]">
                        <div className="text-[11px] text-gray-400 font-medium text-center pt-1 border-r border-gray-200 bg-gray-50/30">
                          {hour}
                        </div>
                        {DAY_NAMES.map((_, dayIdx) => {
                          const matchedNotes = notes.filter(n => n.day_index === dayIdx && n.time === hour);
                          return (
                            <div key={dayIdx} className="border-r border-gray-100 p-1 relative hover:bg-teal-50/20 transition-colors">
                              {matchedNotes.map(note => (
                                <div 
                                  key={note.id} 
                                  onClick={() => handleOpenPage(note)}
                                  className={`${note.color || 'bg-teal-100'} p-1.5 rounded-md text-[11px] font-semibold border border-black/10 cursor-pointer shadow-xs truncate`}
                                >
                                  {note.title}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-200 min-w-[500px] h-full">
                  {DAY_NAMES.map(d => (
                    <div key={d} className="bg-gray-50 text-center py-2 text-xs font-bold text-gray-600 border-b">
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const matchedNotes = notes.filter(n => (n.day_index % 7) === (i % 7));
                    return (
                      <div key={i} className="min-h-[85px] p-1 bg-white hover:bg-gray-50/50 transition-colors flex flex-col gap-1 overflow-hidden">
                        <span className="text-xs font-bold text-gray-500 w-5 h-5 flex items-center justify-center rounded-full">
                          {dayNum}
                        </span>
                        <div className="flex flex-col gap-1 overflow-y-auto">
                          {matchedNotes.slice(0, 3).map(note => (
                            <div 
                              key={note.id} 
                              onClick={() => handleOpenPage(note)}
                              className={`${note.color || 'bg-amber-100'} px-1.5 py-0.5 rounded text-[10px] font-semibold truncate cursor-pointer`}
                            >
                              {note.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* 3. SAĞ PANEL (GÖREVLER) */}
      <aside className={`fixed md:relative inset-y-0 right-0 w-72 bg-gray-50 border-l border-gray-200 p-5 flex flex-col gap-5 overflow-y-auto z-30 transition-transform duration-300 ${isMobileTasksOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="flex justify-between items-center md:hidden pb-2 border-b">
          <h3 className="font-bold text-xs text-gray-800">Görevler</h3>
          <button onClick={() => setIsMobileTasksOpen(false)} className="text-gray-500"><X size={18} /></button>
        </div>

        <div>
          <h3 className="font-bold text-xs text-gray-800 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
            <CheckSquare size={16} className="text-teal-900" /> Görevlerim
          </h3>
          <form onSubmit={addTask} className="flex gap-1.5 mb-3">
            <input type="text" placeholder="Yeni görev..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="flex-1 text-xs border rounded-lg px-2.5 py-1.5 outline-none bg-white" />
            <button type="submit" className="bg-teal-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium">Ekle</button>
          </form>
          <div className="space-y-1.5">
            {tasks.map(task => (
              <div key={task.id} className="bg-white p-2 rounded-lg border flex items-center justify-between group shadow-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id, task.completed)} className="rounded text-teal-900 w-3.5 h-3.5 cursor-pointer" />
                  <span className={`text-xs truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span>
                </div>
                <button onClick={(e) => deleteTask(task.id, e)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* GOOGLE OAUTH MODALI */}
      {isCalendarSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Settings size={18} className="text-teal-900" /> Google Takvim Entegrasyonu
              </h3>
              <button onClick={() => setIsCalendarSettingsOpen(false)} className="text-gray-400 hover:text-gray-700 text-sm">✕</button>
            </div>

            <div className="p-4 border rounded-xl bg-gray-50/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌐</span>
                  <div>
                    <p className="font-bold text-xs text-gray-900">Google Hesabı</p>
                    <p className="text-[11px] text-gray-500">Google Calendar ile senkronizasyon</p>
                  </div>
                </div>
                {userSession ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} /> Bağlı
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert size={10} /> Pasif
                  </span>
                )}
              </div>

              {userSession ? (
                <div className="pt-2 space-y-2">
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    Oturum Açıldı: <b>{userSession.user.email}</b>
                  </p>
                  <button onClick={handleLogout} className="w-full text-xs text-red-600 hover:bg-red-50 border border-red-200 font-medium py-2 rounded-lg transition-colors">
                    Oturumu Kapat
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <button onClick={handleGoogleLogin} disabled={isSyncing} className="w-full text-xs bg-white hover:bg-gray-100 text-gray-800 border font-semibold py-2 rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2">
                    {isSyncing ? <RefreshCw size={14} className="animate-spin text-teal-700" /> : <span>🌐 Google ile Giriş Yap</span>}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setIsCalendarSettingsOpen(false)} className="px-4 py-2 bg-teal-900 text-white rounded-lg text-xs font-medium hover:bg-teal-800">Tamam</button>
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
                <label className="text-xs text-gray-500 flex justify-between items-center mb-1">
                  <span>Başlık</span>
                  <span className="text-[10px] text-teal-700">🎙️ Sesle Söyle</span>
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="Başlık yazın..." 
                    className="w-full border rounded-lg px-3 py-2 text-xs outline-none" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => toggleListening('modalTitle')} 
                    className={`p-2 rounded-lg border text-xs transition-colors flex items-center justify-center ${isListening && listeningTarget === 'modalTitle' ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                  >
                    <Mic size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 flex justify-between items-center mb-1">
                  <span>İçerik</span>
                  <span className="text-[10px] text-teal-700">🎙️ Sesle Konuşarak Ekle</span>
                </label>
                <div className="relative">
                  <textarea 
                    value={newContent} 
                    onChange={(e) => setNewContent(e.target.value)} 
                    placeholder="Detaylar..." 
                    className="w-full border rounded-lg px-3 py-2 text-xs outline-none h-28 resize-none pr-10" 
                  />
                  <button 
                    type="button" 
                    onClick={() => toggleListening('modalContent')} 
                    className={`absolute right-2 top-2 p-1.5 rounded-lg border text-xs transition-colors ${isListening && listeningTarget === 'modalContent' ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                  >
                    <Mic size={14} />
                  </button>
                </div>
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
                    {DAY_NAMES.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Saat</label>
                  <select value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-xs bg-white">
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={resetForm} className="px-3 py-1.5 border rounded-lg text-xs text-gray-600">İptal</button>
                <button type="submit" className="px-3 py-1.5 bg-teal-900 text-white rounded-lg text-xs">{isEditMode ? 'Güncelle' : 'Oluştur'}</button>
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
            <form onSubmit={addNotebook} className="space-y-3">
              <input type="text" value={newNotebookName} onChange={(e) => setNewNotebookName(e.target.value)} placeholder="Defter adı..." className="w-full border rounded-lg px-3 py-2 text-xs" required />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNotebookModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">İptal</button>
                <button type="submit" className="px-3 py-1.5 bg-teal-900 text-white rounded-lg text-xs">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
