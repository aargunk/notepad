'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Plus, CheckSquare, Calendar as CalendarIcon, 
  Trash2, Edit, ArrowLeft, Settings, RefreshCw, CheckCircle2, 
  ShieldAlert, Save, PenTool, Eraser, Mic, MicOff, GripVertical, 
  ChevronLeft, ChevronRight, Menu, X, Sparkles, Send, Bot, User, Lock, FileText,
  File, Paperclip, ExternalLink, Upload, Loader2
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
  const [pages, setPages] = useState<any[]>([]);
  const [activeNotebook, setActiveNotebook] = useState('Kişisel');
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'notes' | 'calendar'>('notes');

  // MOBİL MENÜ STATE'LERİ
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileTasksOpen, setIsMobileTasksOpen] = useState(false);

  // DİNAMİK TARİH VE MOD STATE'LERİ
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState<'day' | 'week' | 'month'>('month');

  const [openedNotePage, setOpenedNotePage] = useState<any>(null);

  // CANLI DÜZENLENEBİLİR & ÇİZİLEBİLİR DEFTER STATE'LERİ
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageFileUrl, setPageFileUrl] = useState('');
  const [pageFileType, setPageFileType] = useState('pdf');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const isDrawing = useRef(false);

  const draggedNotebookIndex = useRef<number | null>(null);

  // SPEECH TO TEXT
  const [isListening, setIsListening] = useState(false);
  const [listeningTarget, setListeningTarget] = useState<'modalTitle' | 'modalContent' | 'pageTitle' | 'pageContent' | null>(null);
  const recognitionRef = useRef<any>(null);

  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');

  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [notes, setNotes] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileType, setNewFileType] = useState('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [newDayIndex, setNewDayIndex] = useState(0);
  const [newTime, setNewTime] = useState('09:00');
  const [newColor, setNewColor] = useState('bg-[#e2f0d9] border-[#c5e1a5] text-emerald-950');
  const [newBadge, setNewBadge] = useState('bg-emerald-200 text-emerald-900');

  // GOOGLE & OUTLOOK CALENDAR
  const [userSession, setUserSession] = useState<any>(null);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<any[]>([]);
  const [outlookCalendarEvents, setOutlookCalendarEvents] = useState<any[]>([]);

  // GEMINI AI CHATBOT
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [geminiMessages, setGeminiMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Merhaba! Ben Gemini AI Asistanınız. Açık olan notunuz veya ekli dosyanız hakkında sorular sorabilir, özet isteyebilirsiniz.' }
  ]);
  const [geminiInput, setGeminiInput] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [geminiMessages]);

  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUserSession(session);

    if (session?.provider_token) {
      if (session.user.app_metadata.provider === 'azure') {
        fetchOutlookCalendarEvents(session.provider_token);
      } else {
        fetchGoogleCalendarEvents(session.provider_token);
      }
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      if (session?.provider_token) {
        if (session.user.app_metadata.provider === 'azure') {
          fetchOutlookCalendarEvents(session.provider_token);
        } else {
          fetchGoogleCalendarEvents(session.provider_token);
        }
      }
    });
  };

  const fetchGoogleCalendarEvents = async (providerToken: string) => {
    setIsSyncing(true);
    try {
      const timeMin = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
      const timeMax = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0, 23, 59, 59).toISOString();

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${timeMin}&timeMax=${timeMax}`, 
        { headers: { Authorization: `Bearer ${providerToken}` } }
      );

      const data = await res.json();
      if (data.items) {
        const events = data.items.map((item: any) => {
          const startDate = item.start?.dateTime ? new Date(item.start.dateTime) : (item.start?.date ? new Date(item.start.date) : new Date());
          return {
            id: 'gcal-' + item.id,
            title: '📅 ' + (item.summary || 'Google Etkinliği'),
            content: item.description || 'Google Calendar etkinliği.',
            date: startDate,
            dayNumber: startDate.getDate(),
            monthNumber: startDate.getMonth(),
            yearNumber: startDate.getFullYear(),
            time: item.start?.dateTime ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Tüm Gün',
            color: 'bg-sky-100 border-sky-300 text-sky-950',
            badge_color: 'bg-sky-200 text-sky-900',
            isGoogleEvent: true
          };
        });
        setGoogleCalendarEvents(events);
      }
    } catch (err) {
      console.error("Google Calendar verileri alınırken hata oluştu:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchOutlookCalendarEvents = async (providerToken: string) => {
    setIsSyncing(true);
    try {
      const timeMin = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
      const timeMax = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0, 23, 59, 59).toISOString();

      const res = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${timeMin}&endDateTime=${timeMax}`, 
        { headers: { Authorization: `Bearer ${providerToken}` } }
      );

      const data = await res.json();
      if (data.value) {
        const events = data.value.map((item: any) => {
          const startDate = new Date(item.start.dateTime + 'Z');
          return {
            id: 'outlook-' + item.id,
            title: '📫 ' + (item.subject || 'Outlook Etkinliği'),
            content: item.bodyPreview || 'Outlook Takvim Etkinliği',
            date: startDate,
            dayNumber: startDate.getDate(),
            monthNumber: startDate.getMonth(),
            yearNumber: startDate.getFullYear(),
            time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: 'bg-blue-100 border-blue-300 text-blue-950',
            badge_color: 'bg-blue-200 text-blue-900',
            isOutlookEvent: true
          };
        });
        setOutlookCalendarEvents(events);
      }
    } catch (err) {
      console.error("Outlook Calendar verileri alınırken hata oluştu:", err);
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
        queryParams: { access_type: 'offline', prompt: 'consent' },
        redirectTo: redirectToUrl,
      },
    });

    if (error) { alert("Google Login Hatası: " + error.message); setIsSyncing(false); }
  };

  const handleOutlookLogin = async () => {
    setIsSyncing(true);
    const redirectToUrl = typeof window !== 'undefined' ? window.location.origin : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'Calendars.Read Calendars.ReadWrite offline_access',
        redirectTo: redirectToUrl,
      },
    });

    if (error) { alert("Microsoft Login Hatası: " + error.message); setIsSyncing(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserSession(null);
    setGoogleCalendarEvents([]);
    setOutlookCalendarEvents([]);
  };

  // DOSYA YÜKLEME FONKSİYONU (SUPABASE STORAGE)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: 'modal' | 'inline') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      let detectedType = 'pdf';
      if (['doc', 'docx'].includes(fileExt || '')) detectedType = 'doc';
      if (['xls', 'xlsx'].includes(fileExt || '')) detectedType = 'xls';

      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('note-files')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        alert("Dosya yüklenirken hata oluştu: " + error.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('note-files').getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      if (target === 'modal') {
        setNewFileUrl(publicUrl);
        setNewFileType(detectedType);
      } else {
        setPageFileUrl(publicUrl);
        setPageFileType(detectedType);
      }
    } catch (err: any) {
      console.error("Yükleme hatası:", err);
      alert("Dosya yüklenemedi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendGemini = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || geminiInput;
    if (!promptToSend.trim() || isGeminiLoading) return;

    if (!userSession) {
      alert("Gemini AI Asistanını kullanabilmek için lütfen giriş yapın.");
      return;
    }

    const userMessage = { role: 'user' as const, text: promptToSend };
    setGeminiMessages(prev => [...prev, userMessage]);
    if (!overridePrompt) setGeminiInput('');
    setIsGeminiLoading(true);

    try {
      let contextText = '';
      if (openedNotePage) {
        contextText = `\n\n[ŞU ANDA AÇIK OLAN NOT]\nBaşlık: ${openedNotePage.title}\nİçerik: ${openedNotePage.content}\nDosya URL: ${openedNotePage.file_url || 'Yok'}\n\n`;
      }

      const fullPrompt = `Sen Notepad Pro uygulamasının akıllı AI asistanısın. Kullanıcıya Türkçe, nazik ve üretken bir şekilde yardımcı ol.${contextText}Kullanıcının sorusu / talebi: ${promptToSend}`;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setGeminiMessages(prev => [...prev, { role: 'model', text: `Hata: ${data.error || 'Yanıt alınamadı.'}` }]);
      } else {
        setGeminiMessages(prev => [...prev, { role: 'model', text: data.text }]);
      }
    } catch (err: any) {
      console.error("Gemini AI Hatası:", err);
      setGeminiMessages(prev => [...prev, { role: 'model', text: 'Sunucuya bağlanırken bir hata oluştu.' }]);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  const handlePrevPeriod = () => {
    const next = new Date(currentDate);
    if (calendarMode === 'day') next.setDate(next.getDate() - 1);
    else if (calendarMode === 'week') next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNextPeriod = () => {
    const next = new Date(currentDate);
    if (calendarMode === 'day') next.setDate(next.getDate() + 1);
    else if (calendarMode === 'week') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSelectDay = (dayNum: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    setCurrentDate(selectedDate);
    setCalendarMode('day');
  };

  const handleDragStart = (index: number) => { draggedNotebookIndex.current = index; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

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
        img.onload = () => { ctx?.drawImage(img, 0, 0, canvas.width, canvas.height); };
        img.src = openedNotePage.image_url;
      }
    }
  }, [isInlineEditing, isDrawingMode, openedNotePage]);

  const toggleListening = (target: 'modalTitle' | 'modalContent' | 'pageTitle' | 'pageContent') => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tarayıcınız ses tanıma özelliğini desteklemiyor.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setListeningTarget(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => { setIsListening(true); setListeningTarget(target); };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (target === 'modalTitle') setNewTitle(prev => (prev ? prev + ' ' + transcript : transcript));
      else if (target === 'modalContent') setNewContent(prev => (prev ? prev + ' ' + transcript : transcript));
      else if (target === 'pageTitle') setPageTitle(prev => (prev ? prev + ' ' + transcript : transcript));
      else if (target === 'pageContent') setPageContent(prev => (prev ? prev + '\n' + transcript : transcript));
    };

    recognition.onerror = () => { setIsListening(false); setListeningTarget(null); };
    recognition.onend = () => { setIsListening(false); setListeningTarget(null); };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const fetchData = async () => {
    const { data: nbs } = await supabase.from('notebooks').select('*').order('created_at', { ascending: true });
    if (nbs && nbs.length > 0) setNotebooks(nbs);
    else setNotebooks([{ id: 'mock-1', name: 'Kişisel' }]);

    const { data: pgs } = await supabase.from('pages').select('*').order('created_at', { ascending: true });
    if (pgs) setPages(pgs);

    const { data: tks } = await supabase.from('tasks').select('*').order('created_at', { ascending: true });
    if (tks) setTasks(tks);

    const { data: nts } = await supabase.from('notes').select('*').order('created_at', { ascending: true });
    if (nts) setNotes(nts);
  };

  const handleOpenPage = (note: any) => {
    setOpenedNotePage(note);
    setPageTitle(note.title);
    setPageContent(note.content);
    setPageFileUrl(note.file_url || '');
    setPageFileType(note.file_type || 'pdf');
    setIsInlineEditing(false);
    setIsDrawingMode(false);
  };

  const handleSaveInline = async () => {
    if (!openedNotePage) return;
    let drawingData = openedNotePage.image_url;

    if (canvasRef.current) drawingData = canvasRef.current.toDataURL();

    const updatedNote = {
      ...openedNotePage,
      title: pageTitle,
      content: pageContent,
      file_url: pageFileUrl,
      file_type: pageFileType,
      image_url: drawingData
    };

    const { data }: any = await supabase
      .from('notes')
      .update({ 
        title: pageTitle, 
        content: pageContent, 
        file_url: pageFileUrl,
        file_type: pageFileType,
        image_url: drawingData 
      })
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
    let clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    let clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
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

  const stopDrawing = () => { isDrawing.current = false; };
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

  const addPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;
    const { data }: any = await supabase.from('pages').insert([{ notebook_name: activeNotebook, title: newPageTitle.trim() }]).select();
    if (data && Array.isArray(data) && data.length > 0) {
      setPages([...pages, data[0]]);
      setActivePageId(data[0].id);
    } else {
      const newPg = { id: Date.now().toString(), notebook_name: activeNotebook, title: newPageTitle.trim() };
      setPages([...pages, newPg]);
      setActivePageId(newPg.id);
    }
    setNewPageTitle('');
    setIsPageModalOpen(false);
  };

  const deletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bu sayfayı ve içindeki notları silmek istediğinize emin misiniz?")) {
      await supabase.from('pages').delete().eq('id', pageId);
      await supabase.from('notes').delete().eq('page_id', pageId);
      setPages(pages.filter(p => p.id !== pageId));
      setNotes(notes.filter(n => n.page_id !== pageId));
      if (activePageId === pageId) setActivePageId(null);
    }
  };

  const deleteNotebook = async (nbName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notebooks.length <= 1) { alert('En az bir defter kalmalıdır!'); return; }
    if (confirm(`"${nbName}" defterini silmek istediğinize emin misiniz?`)) {
      await supabase.from('notebooks').delete().eq('name', nbName);
      await supabase.from('pages').delete().eq('notebook_name', nbName);
      await supabase.from('notes').delete().eq('notebook_name', nbName);
      const remainingNotebooks = notebooks.filter(nb => nb.name !== nbName);
      setNotebooks(remainingNotebooks);
      setPages(pages.filter(p => p.notebook_name !== nbName));
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
      page_id: activePageId,
      title: newTitle,
      content: newContent || 'İçerik girilmedi...',
      file_url: newFileUrl,
      file_type: newFileType,
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
    setNewFileUrl('');
    setNewFileType('pdf');
    setIsModalOpen(false);
  };

  const getEmbedViewerUrl = (url: string, type: string) => {
    if (!url) return '';
    if (type === 'pdf') return url;
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  };

  const notebookPages = pages.filter(p => p.notebook_name === activeNotebook);
  const filteredNotes = notes.filter(n => {
    if (n.notebook_name !== activeNotebook) return false;
    if (activePageId) return n.page_id === activePageId;
    return true;
  });

  const currentYearVal = currentDate.getFullYear();
  const currentMonthVal = currentDate.getMonth();
  const daysInMonth = new Date(currentYearVal, currentMonthVal + 1, 0).getDate();
  const firstDayOfMonthIndex = (new Date(currentYearVal, currentMonthVal, 1).getDay() + 6) % 7;

  const getWeekDays = (baseDate: Date) => {
    const days = [];
    const curr = new Date(baseDate);
    const dayOfWeek = (curr.getDay() + 6) % 7;
    curr.setDate(curr.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      days.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f4f5f7] text-gray-800 font-sans relative overflow-hidden">
      
      {/* MOBİL ÜST BAR */}
      <div className="md:hidden bg-teal-900 text-white px-4 py-3 flex items-center justify-between z-20 shadow-md">
        <button onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} className="p-1 rounded-lg hover:bg-white/10">
          <Menu size={22} />
        </button>
        <Logo size={28} showText={true} />
        <button onClick={() => setIsMobileTasksOpen(!isMobileTasksOpen)} className="p-1 rounded-lg hover:bg-white/10 text-teal-200">
          <CheckSquare size={20} />
        </button>
      </div>

      {/* 1. SOL KENAR ÇUBUĞU */}
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
                <div key={nb.id} className="space-y-1">
                  <div 
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onClick={() => { 
                      setActiveNotebook(nb.name); 
                      setActivePageId(null);
                      setActiveView('notes'); 
                      setOpenedNotePage(null);
                      setIsInlineEditing(false);
                      setIsDrawingMode(false);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing text-xs transition-all group ${activeView === 'notes' && activeNotebook === nb.name ? 'bg-white/20 font-medium text-white shadow-xs' : 'hover:bg-white/10 text-teal-100'}`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <GripVertical size={13} className="text-teal-400/60 group-hover:text-teal-200 shrink-0" />
                      <Book size={14} className="shrink-0" /> 
                      <span className="truncate">{nb.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); setActiveNotebook(nb.name); setIsPageModalOpen(true); }} className="text-teal-200 hover:text-white p-0.5" title="Sayfa Ekle">
                        <Plus size={12} />
                      </button>
                      {notebooks.length > 1 && (
                        <button onClick={(e) => deleteNotebook(nb.name, e)} className="text-teal-200 hover:text-red-300 p-0.5">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DEFTER İÇİ SAYFA LİSTESİ */}
                  {activeNotebook === nb.name && notebookPages.length > 0 && (
                    <div className="pl-6 space-y-1 my-1 border-l border-teal-700/50 ml-3">
                      {notebookPages.map(pg => (
                        <div 
                          key={pg.id}
                          onClick={() => { setActivePageId(pg.id); setActiveView('notes'); setOpenedNotePage(null); }}
                          className={`flex items-center justify-between px-2 py-1 rounded text-[11px] cursor-pointer group ${activePageId === pg.id ? 'bg-teal-800/80 text-white font-semibold' : 'text-teal-200 hover:text-white hover:bg-teal-800/40'}`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText size={12} className="shrink-0" />
                            <span className="truncate">{pg.title}</span>
                          </div>
                          <button onClick={(e) => deletePage(pg.id, e)} className="opacity-0 group-hover:opacity-100 text-teal-300 hover:text-red-300 p-0.5">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
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
                {userSession && <span className="w-2 h-2 rounded-full bg-emerald-400" title="Takvim Senkronize" />}
              </div>
            </div>
          </nav>
        </div>

        <div className="text-[10px] text-teal-300 border-t border-teal-800 pt-3 flex items-center justify-between">
          <span className="truncate max-w-[120px]">{userSession ? userSession.user.email : 'Oturum Yok'}</span>
          <span>🟢</span>
        </div>
      </aside>

      {/* 2. ORTA ALAN */}
      <main className="flex-1 p-3 md:p-6 bg-white overflow-y-auto flex flex-col relative w-full">
        
        {openedNotePage ? (
          /* CANLI DÜZENLENEBİLİR & ÇİZİLEBİLİR & DOKÜMAN ÖNİZLEMELİ DEFTER SAYFASI */
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
                      <Edit size={14}/> Düzenle / Çiz / Dosya Yükle
                    </button>
                    <button onClick={() => deleteNote(openedNotePage.id)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium">
                      <Trash2 size={14}/> Sil
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* DÜZENLEME MODUNDA DOSYA YÜKLEME ALANI */}
            {isInlineEditing && (
              <div className="mb-4 p-3.5 bg-teal-50/60 border border-teal-200 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-teal-900 flex items-center gap-1.5">
                  <Paperclip size={14} /> Ekli Doküman (PDF, Word, Excel)
                </p>
                <div className="flex gap-2 items-center flex-wrap">
                  <label className="cursor-pointer bg-teal-900 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium shadow-2xs">
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {isUploading ? 'Yükleniyor...' : 'Cihazdan Dosya Seç / Yükle'}
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.xls,.xlsx" 
                      onChange={(e) => handleFileUpload(e, 'inline')} 
                      className="hidden" 
                      disabled={isUploading}
                    />
                  </label>
                  <span className="text-gray-400 font-semibold">veya URL:</span>
                  <input 
                    type="url" 
                    value={pageFileUrl} 
                    onChange={(e) => setPageFileUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 border rounded-lg px-3 py-1.5 bg-white outline-none min-w-[200px]"
                  />
                </div>
              </div>
            )}

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

              <div className="flex-1 relative z-10 space-y-6">
                {isInlineEditing ? (
                  <textarea 
                    value={pageContent}
                    onChange={(e) => setPageContent(e.target.value)}
                    className="w-full h-full min-h-[200px] bg-transparent font-serif text-base text-gray-800 outline-none resize-none"
                    style={{ lineHeight: '28px' }}
                    placeholder="Sayfa üzerine yazın..."
                  />
                ) : (
                  <div className="text-base text-gray-800 whitespace-pre-wrap font-serif pt-2">
                    {openedNotePage.content}
                  </div>
                )}

                {/* DOKÜMAN (PDF, WORD, EXCEL) CANLI ÖNİZLEME PENCERESİ */}
                {openedNotePage.file_url && !isInlineEditing && (
                  <div className="mt-6 border border-teal-200 rounded-2xl overflow-hidden bg-white shadow-md">
                    <div className="bg-teal-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <File size={16} className="text-teal-300" />
                        <span>Ekli Doküman Önizlemesi ({openedNotePage.file_type ? openedNotePage.file_type.toUpperCase() : 'PDF'})</span>
                      </div>
                      <a 
                        href={openedNotePage.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-teal-200 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Ayrı Sekmede Aç / İndir <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="w-full h-[520px] bg-gray-100">
                      <iframe 
                        src={getEmbedViewerUrl(openedNotePage.file_url, openedNotePage.file_type || 'pdf')} 
                        className="w-full h-full border-none"
                        title="Doküman Önizleyici"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeView === 'notes' ? (
          /* DASHBOARD (DÜZELTİLMİŞ NOT KARTLARI DİZİLİMİ) */
          <>
            <header className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Book size={20} className="text-teal-900" /> {activeNotebook} Defteri
                </h2>
                <p className="text-xs text-gray-500">
                  {activePageId ? `Seçili Sayfa: ${pages.find(p => p.id === activePageId)?.title}` : 'Tüm Sayfalar Gösteriliyor'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsPageModalOpen(true)}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Plus size={15} /> Yeni Sayfa
                </button>
                <button 
                  onClick={() => { resetForm(); setIsModalOpen(true); }}
                  className="bg-teal-900 hover:bg-teal-800 text-white px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus size={16} /> Yeni Not Kartı
                </button>
              </div>
            </header>

            {/* SAYFA FİLTRELEME SEKMELERİ */}
            {notebookPages.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-gray-200 text-xs">
                <button 
                  onClick={() => setActivePageId(null)}
                  className={`px-3 py-1.5 rounded-lg shrink-0 font-medium transition-all ${activePageId === null ? 'bg-teal-900 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Tüm Notlar ({notes.filter(n => n.notebook_name === activeNotebook).length})
                </button>
                {notebookPages.map(pg => {
                  const count = notes.filter(n => n.page_id === pg.id).length;
                  return (
                    <button 
                      key={pg.id}
                      onClick={() => setActivePageId(pg.id)}
                      className={`px-3 py-1.5 rounded-lg shrink-0 font-medium flex items-center gap-1.5 transition-all ${activePageId === pg.id ? 'bg-teal-900 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      <FileText size={13} />
                      <span>{pg.title}</span>
                      <span className="opacity-70 text-[10px] bg-black/10 px-1.5 py-0.2 rounded-full">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* NOT KARTLARI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {filteredNotes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-12 col-span-full">Bu bölümde henüz not kartı bulunmuyor.</p>
              ) : (
                filteredNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => handleOpenPage(note)}
                    className={`${note.color || 'bg-amber-50'} p-5 rounded-2xl border border-black/10 shadow-xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between min-h-[210px] group relative`}
                  >
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center flex-wrap gap-1">
                        <span className={`${note.badge_color || 'bg-amber-200'} text-[10px] px-2.5 py-0.5 rounded-md font-bold tracking-wide shadow-2xs`}>
                          [{DAY_NAMES[note.day_index || 0]}] [{note.time || '09:00'}]
                        </span>
                        {note.file_url && (
                          <span className="text-[10px] bg-teal-800 text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <Paperclip size={10} /> {note.file_type ? note.file_type.toUpperCase() : 'DOSYA'}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-teal-950 transition-colors leading-snug">
                        {note.title}
                      </h3>
                      
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {note.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-black/10 flex justify-between items-center text-[11px] mt-auto">
                      <span className="text-gray-500 font-medium text-[10px]">Detaylı Not</span>
                      <span className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1">
                        Sayfayı Aç →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* TAKVİM */
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
                  {calendarMode === 'day' ? (
                    `${currentDate.getDate()} ${MONTH_NAMES[currentMonthVal]} ${currentYearVal}`
                  ) : calendarMode === 'week' ? (
                    `${weekDays[0].getDate()} ${MONTH_NAMES[weekDays[0].getMonth()]} - ${weekDays[6].getDate()} ${MONTH_NAMES[weekDays[6].getMonth()]} ${currentYearVal}`
                  ) : (
                    `${MONTH_NAMES[currentMonthVal]} ${currentYearVal}`
                  )}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-200/80 p-1 rounded-xl text-xs font-semibold text-gray-600">
                  <button onClick={() => setCalendarMode('day')} className={`px-3 py-1 rounded-lg transition-all ${calendarMode === 'day' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'}`}>Gün</button>
                  <button onClick={() => setCalendarMode('week')} className={`px-3 py-1 rounded-lg transition-all ${calendarMode === 'week' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'}`}>Hafta</button>
                  <button onClick={() => setCalendarMode('month')} className={`px-3 py-1 rounded-lg transition-all ${calendarMode === 'month' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'}`}>Ay</button>
                </div>

                <button onClick={() => setIsCalendarSettingsOpen(true)} className="border border-gray-300 hover:bg-gray-50 text-gray-700 p-2 rounded-xl text-xs font-medium shadow-2xs relative">
                  <Settings size={16} />
                  {userSession && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />}
                </button>
                <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-teal-900 hover:bg-teal-800 text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 shadow-sm">
                  <Plus size={16} /> Ekle
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {calendarMode === 'day' ? (
                <div className="flex flex-col h-full bg-white p-4 max-w-3xl mx-auto">
                  <div className="flex justify-between items-center pb-3 border-b mb-4">
                    <div>
                      <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">{DAY_NAMES[(currentDate.getDay() + 6) % 7]}</span>
                      <h3 className="text-xl font-extrabold text-gray-900">{currentDate.getDate()} {MONTH_NAMES[currentMonthVal]} {currentYearVal}</h3>
                    </div>
                    <button onClick={() => setCalendarMode('month')} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium text-gray-700">Aylık Görünüme Dön</button>
                  </div>

                  <div className="space-y-3 divide-y divide-gray-100 flex-1 overflow-y-auto pr-1">
                    {hours.map(hour => {
                      const dayOfWeekIndex = (currentDate.getDay() + 6) % 7;
                      const matchedNotes = notes.filter(n => n.day_index === dayOfWeekIndex && n.time === hour);
                      const matchedGoogleEvents = googleCalendarEvents.filter(
                        g => g.dayNumber === currentDate.getDate() && g.monthNumber === currentDate.getMonth() && g.yearNumber === currentDate.getFullYear() && (g.time === hour || g.time === 'Tüm Gün')
                      );
                      const matchedOutlookEvents = outlookCalendarEvents.filter(
                        o => o.dayNumber === currentDate.getDate() && o.monthNumber === currentDate.getMonth() && o.yearNumber === currentDate.getFullYear() && (o.time === hour || o.time === 'Tüm Gün')
                      );

                      return (
                        <div key={hour} className="pt-2 flex gap-4 items-start min-h-[60px]">
                          <span className="text-xs font-semibold text-gray-400 w-12 pt-1">{hour}</span>
                          <div className="flex-1 space-y-1.5">
                            {matchedNotes.map(note => (
                              <div key={note.id} onClick={() => handleOpenPage(note)} className={`${note.color || 'bg-amber-100'} p-2.5 rounded-xl border text-xs font-medium cursor-pointer shadow-2xs hover:shadow-xs flex justify-between items-center`}>
                                <div><p className="font-bold text-gray-900">{note.title}</p><p className="text-[11px] text-gray-700 line-clamp-1">{note.content}</p></div>
                                <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded font-bold">Not</span>
                              </div>
                            ))}
                            {matchedGoogleEvents.map(gEvent => (
                              <div key={gEvent.id} className={`${gEvent.color} p-2.5 rounded-xl border text-xs font-medium shadow-2xs flex justify-between items-center`}>
                                <div><p className="font-bold text-sky-950">{gEvent.title}</p><p className="text-[11px] text-sky-900">{gEvent.content}</p></div>
                                <span className="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded font-bold">Google</span>
                              </div>
                            ))}
                            {matchedOutlookEvents.map(oEvent => (
                              <div key={oEvent.id} className={`${oEvent.color} p-2.5 rounded-xl border text-xs font-medium shadow-2xs flex justify-between items-center`}>
                                <div><p className="font-bold text-blue-950">{oEvent.title}</p><p className="text-[11px] text-blue-900">{oEvent.content}</p></div>
                                <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold">Outlook</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : calendarMode === 'week' ? (
                <div className="flex flex-col min-w-[700px] h-full">
                  <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200 bg-gray-50 text-center sticky top-0 z-10">
                    <div className="py-2.5 text-[11px] font-bold text-gray-400 border-r border-gray-200">Saat</div>
                    {weekDays.map((wDay, idx) => {
                      const isToday = wDay.toDateString() === new Date().toDateString();
                      return (
                        <div key={idx} onClick={() => { setCurrentDate(wDay); setCalendarMode('day'); }} className={`py-2 text-xs cursor-pointer hover:bg-teal-50/50 border-r border-gray-200 ${isToday ? 'bg-teal-50 text-teal-900 font-bold' : 'text-gray-700'}`}>
                          <div>{DAY_NAMES[idx]}</div>
                          <div className={`text-sm font-extrabold mt-0.5 ${isToday ? 'text-teal-900' : 'text-gray-800'}`}>{wDay.getDate()}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
                    {hours.map((hour) => (
                      <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[55px]">
                        <div className="text-[11px] text-gray-400 font-medium text-center pt-1 border-r border-gray-200 bg-gray-50/30">{hour}</div>
                        {weekDays.map((wDay, dayIdx) => {
                          const matchedNotes = notes.filter(n => n.day_index === dayIdx && n.time === hour);
                          const matchedGoogleEvents = googleCalendarEvents.filter(g => g.dayNumber === wDay.getDate() && g.monthNumber === wDay.getMonth() && g.yearNumber === wDay.getFullYear() && (g.time === hour || g.time === 'Tüm Gün'));
                          const matchedOutlookEvents = outlookCalendarEvents.filter(o => o.dayNumber === wDay.getDate() && o.monthNumber === wDay.getMonth() && o.yearNumber === wDay.getFullYear() && (o.time === hour || o.time === 'Tüm Gün'));

                          return (
                            <div key={dayIdx} className="border-r border-gray-100 p-1 relative flex flex-col gap-1">
                              {matchedNotes.map(note => (<div key={note.id} onClick={() => handleOpenPage(note)} className={`${note.color || 'bg-teal-100'} p-1 rounded text-[10px] font-semibold border border-black/10 cursor-pointer truncate`}>{note.title}</div>))}
                              {matchedGoogleEvents.map(gEvent => (<div key={gEvent.id} className={`${gEvent.color} p-1 rounded text-[10px] font-semibold border border-sky-300 truncate`}>{gEvent.title}</div>))}
                              {matchedOutlookEvents.map(oEvent => (<div key={oEvent.id} className={`${oEvent.color} p-1 rounded text-[10px] font-semibold border border-blue-300 truncate`}>{oEvent.title}</div>))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-200 min-w-[500px] h-full">
                  {DAY_NAMES.map(d => <div key={d} className="bg-gray-50 text-center py-2 text-xs font-bold text-gray-600 border-b">{d}</div>)}
                  {Array.from({ length: firstDayOfMonthIndex }).map((_, i) => <div key={'empty-' + i} className="min-h-[85px] bg-gray-50/30 p-1" />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dayOfWeek = (i + firstDayOfMonthIndex) % 7;
                    const matchedNotes = notes.filter(n => (n.day_index % 7) === dayOfWeek);
                    const matchedGoogleEvents = googleCalendarEvents.filter(e => e.dayNumber === dayNum && e.monthNumber === currentMonthVal && e.yearNumber === currentYearVal);
                    const matchedOutlookEvents = outlookCalendarEvents.filter(o => o.dayNumber === dayNum && o.monthNumber === currentMonthVal && o.yearNumber === currentYearVal);
                    const isToday = new Date().getDate() === dayNum && new Date().getMonth() === currentMonthVal && new Date().getFullYear() === currentYearVal;

                    return (
                      <div key={i} onClick={() => handleSelectDay(dayNum)} className={`min-h-[85px] p-1.5 flex flex-col gap-1 overflow-hidden cursor-pointer group ${isToday ? 'bg-teal-50/40 hover:bg-teal-100/50' : 'bg-white hover:bg-teal-50/30'}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-teal-900 text-white' : 'text-gray-600'}`}>{dayNum}</span>
                          <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 font-semibold">Aç →</span>
                        </div>
                        <div className="flex flex-col gap-1 overflow-y-auto">
                          {matchedNotes.slice(0, 2).map(note => (<div key={note.id} onClick={(e) => { e.stopPropagation(); handleOpenPage(note); }} className={`${note.color || 'bg-amber-100'} px-1.5 py-0.5 rounded text-[10px] font-semibold truncate`}>{note.title}</div>))}
                          {matchedGoogleEvents.slice(0, 2).map(gEvent => (<div key={gEvent.id} className={`${gEvent.color} px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border border-sky-300`}>{gEvent.title}</div>))}
                          {matchedOutlookEvents.slice(0, 2).map(oEvent => (<div key={oEvent.id} className={`${oEvent.color} px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border border-blue-300`}>{oEvent.title}</div>))}
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

      {/* GEMINI AI ASİSTAN CHATBOT WIDGET'I (SAĞ ALT KÖŞE) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {isGeminiOpen && (
          <div className="mb-3 w-80 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col h-[480px] overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-black text-white p-3.5 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-tr from-rose-500 to-teal-400 p-1.5 rounded-lg">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1">
                    Gemini AI Asistan <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">3.7 Flash</span>
                  </h4>
                  <p className="text-[10px] text-teal-200">
                    {openedNotePage ? `Bağlam: "${openedNotePage.title}"` : 'Genel Asistan Modu'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsGeminiOpen(false)} className="text-teal-200 hover:text-white p-1"><X size={18} /></button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50/50 text-xs">
              {!userSession ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2 my-auto">
                  <Lock size={24} className="text-amber-600 mx-auto" />
                  <p className="font-bold text-gray-800">Hesap Girişi Gerekli</p>
                  <p className="text-[11px] text-gray-600">Gemini AI Asistanını kullanabilmek için lütfen Google veya Microsoft hesabınızla oturum açın.</p>
                  <div className="space-y-1.5 pt-1">
                    <button onClick={handleGoogleLogin} className="w-full bg-teal-900 text-white py-2 rounded-lg font-semibold text-xs shadow-sm">🌐 Google ile Giriş Yap</button>
                    <button onClick={handleOutlookLogin} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg font-semibold text-xs shadow-sm">📫 Microsoft ile Giriş Yap</button>
                  </div>
                </div>
              ) : (
                <>
                  {geminiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'model' && (
                        <div className="w-6 h-6 rounded-full bg-teal-900 text-white flex items-center justify-center shrink-0 mt-0.5"><Bot size={13} /></div>
                      )}
                      <div className={`p-2.5 rounded-2xl max-w-[82%] leading-relaxed ${msg.role === 'user' ? 'bg-teal-900 text-white rounded-br-none' : 'bg-white border text-gray-800 shadow-2xs rounded-bl-none whitespace-pre-wrap'}`}>
                        {msg.text}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center shrink-0 mt-0.5"><User size={13} /></div>
                      )}
                    </div>
                  ))}
                  {isGeminiLoading && (
                    <div className="flex gap-2 items-center text-gray-400 italic">
                      <Bot size={14} className="animate-spin text-teal-700" />
                      <span>Gemini düşünüyor...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </>
              )}
            </div>

            {userSession && openedNotePage && (
              <div className="px-2 py-1.5 bg-gray-100/80 border-t flex gap-1 overflow-x-auto text-[10px]">
                <button onClick={() => handleSendGemini("Bu notu ve ekli dokümanı 3 kısa maddede özetle.")} className="bg-white border hover:bg-teal-50 text-teal-900 px-2 py-1 rounded-md shrink-0 font-medium">📝 Notu Özetle</button>
                <button onClick={() => handleSendGemini("Bu nottaki imla hatalarını düzelt ve üslubu geliştirilmiş versiyonunu öner.")} className="bg-white border hover:bg-teal-50 text-teal-900 px-2 py-1 rounded-md shrink-0 font-medium">✍️ Yazımı Düzenle</button>
                <button onClick={() => handleSendGemini("Bu notun içinden yapılacak işleri listele.")} className="bg-white border hover:bg-teal-50 text-teal-900 px-2 py-1 rounded-md shrink-0 font-medium">📋 Görev Çıkar</button>
              </div>
            )}

            {userSession && (
              <div className="p-2 bg-white border-t flex gap-1.5 items-center">
                <input 
                  type="text" 
                  value={geminiInput} 
                  onChange={(e) => setGeminiInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendGemini()}
                  placeholder={openedNotePage ? "Notunuzla veya dokümanla ilgili bir şey sorun..." : "Gemini'ye sorun..."} 
                  className="flex-1 border rounded-xl px-3 py-2 text-xs outline-none bg-gray-50 focus:bg-white focus:border-teal-600 transition-colors"
                />
                <button onClick={() => handleSendGemini()} disabled={isGeminiLoading || !geminiInput.trim()} className="bg-teal-900 hover:bg-teal-800 disabled:opacity-40 text-white p-2 rounded-xl transition-all">
                  <Send size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={() => setIsGeminiOpen(!isGeminiOpen)}
          className="bg-gradient-to-r from-teal-950 via-teal-900 to-black hover:scale-105 text-white p-3.5 rounded-2xl shadow-xl border border-teal-500/40 flex items-center gap-2 font-bold text-xs transition-all group"
        >
          <div className="bg-gradient-to-tr from-rose-500 to-teal-400 p-1 rounded-lg">
            <Sparkles size={18} className="text-white animate-pulse" />
          </div>
          <span className="hidden md:inline">Gemini AI</span>
        </button>
      </div>

      {/* TAKVİM ENTEGRASYON MODALI */}
      {isCalendarSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Settings size={18} className="text-teal-900" /> Takvim Entegrasyonları
              </h3>
              <button onClick={() => setIsCalendarSettingsOpen(false)} className="text-gray-400 hover:text-gray-700 text-sm">✕</button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 border rounded-xl bg-gray-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🌐</span>
                  <div>
                    <p className="font-bold text-xs text-gray-900">Google Calendar</p>
                    <p className="text-[10px] text-gray-500">Google Etkinlik Senkronizasyonu</p>
                  </div>
                </div>
                <button onClick={handleGoogleLogin} disabled={isSyncing} className="text-xs bg-white hover:bg-gray-100 border text-gray-800 font-semibold px-3 py-1.5 rounded-lg shadow-2xs">Bağlan</button>
              </div>

              <div className="p-3.5 border rounded-xl bg-gray-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📫</span>
                  <div>
                    <p className="font-bold text-xs text-gray-900">Outlook Takvim</p>
                    <p className="text-[10px] text-gray-500">Microsoft Graph API Senkronizasyonu</p>
                  </div>
                </div>
                <button onClick={handleOutlookLogin} disabled={isSyncing} className="text-xs bg-blue-700 hover:bg-blue-800 text-white font-semibold px-3 py-1.5 rounded-lg shadow-2xs">Bağlan</button>
              </div>

              {userSession && (
                <div className="pt-2">
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">Oturum Açık: <b>{userSession.user.email}</b></p>
                  <button onClick={handleLogout} className="w-full mt-2 text-xs text-red-600 hover:bg-red-50 border border-red-200 font-medium py-2 rounded-lg">Oturumu Kapat / Bağlantıları Kes</button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setIsCalendarSettingsOpen(false)} className="px-4 py-2 bg-teal-900 text-white rounded-lg text-xs font-medium hover:bg-teal-800">Tamam</button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ SAYFA MODALI */}
      {isPageModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-gray-900">"{activeNotebook}" İçin Yeni Sayfa</h3>
            <form onSubmit={addPage} className="space-y-3">
              <input type="text" value={newPageTitle} onChange={(e) => setNewPageTitle(e.target.value)} placeholder="Sayfa başlığı..." className="w-full border rounded-lg px-3 py-2 text-xs outline-none" required />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPageModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">İptal</button>
                <button type="submit" className="px-3 py-1.5 bg-teal-900 text-white rounded-lg text-xs">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ NOT MODALI (CİHAZDAN DOSYA YÜKLEME BUTONLU) */}
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
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Başlık yazın..." className="w-full border rounded-lg px-3 py-2 text-xs outline-none" required />
                  <button type="button" onClick={() => toggleListening('modalTitle')} className={`p-2 rounded-lg border text-xs flex items-center justify-center ${isListening && listeningTarget === 'modalTitle' ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-50 text-gray-700'}`}><Mic size={16} /></button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 flex justify-between items-center mb-1">
                  <span>İçerik</span>
                  <span className="text-[10px] text-teal-700">🎙️ Sesle Konuşarak Ekle</span>
                </label>
                <div className="relative">
                  <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Detaylar..." className="w-full border rounded-lg px-3 py-2 text-xs outline-none h-24 resize-none pr-10" />
                  <button type="button" onClick={() => toggleListening('modalContent')} className={`absolute right-2 top-2 p-1.5 rounded-lg border text-xs ${isListening && listeningTarget === 'modalContent' ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 text-gray-700'}`}><Mic size={14} /></button>
                </div>
              </div>

              {/* CİHAZDAN DOSYA YÜKLEME ALANI */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Doküman Ekle (PDF / Word / Excel)</label>
                <div className="space-y-1.5">
                  <label className="cursor-pointer bg-teal-900 hover:bg-teal-800 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all shadow-2xs">
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {isUploading ? 'Dosya Yükleniyor...' : '📂 Bilgisayardan Dosya Seç'}
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.xls,.xlsx" 
                      onChange={(e) => handleFileUpload(e, 'modal')} 
                      className="hidden" 
                      disabled={isUploading}
                    />
                  </label>

                  {newFileUrl && (
                    <p className="text-[10px] text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200 truncate">
                      ✓ Yüklendi: {newFileUrl}
                    </p>
                  )}
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
                <button type="submit" disabled={isUploading} className="px-3 py-1.5 bg-teal-900 text-white rounded-lg text-xs disabled:opacity-50">
                  {isEditMode ? 'Güncelle' : 'Oluştur'}
                </button>
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
              <input type="text" value={newNotebookName} onChange={(e) => setNewNotebookName(e.target.value)} placeholder="Defter adı..." className="w-full border rounded-lg px-3 py-2 text-xs outline-none" required />
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
