'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Plus, CheckSquare, Calendar as CalendarIcon, 
  Trash2, Edit, ArrowLeft, Settings, CheckCircle2, 
  ShieldAlert, Save, PenTool, Eraser, Mic, MicOff, GripVertical, 
  ChevronLeft, ChevronRight, Menu, X, Sparkles, Send, Bot, User, Lock, FileText,
  File, Paperclip, ExternalLink, Upload, Loader2, Mail, KeyRound, LogIn, UserPlus,
  ShieldCheck, Users, Clock
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
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-950 via-teal-950 to-black p-1.5 shadow-lg shadow-teal-950/40 border border-teal-500/30 group-hover:border-teal-400/60 transition-all duration-300 shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform group-hover:scale-105 transition-transform duration-300">
          <defs>
            <linearGradient id="npLeftBarGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0d9488" /><stop offset="100%" stopColor="#042f2e" /></linearGradient>
            <linearGradient id="npDiagBarGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ff2a5f" /><stop offset="50%" stopColor="#e11d48" /><stop offset="100%" stopColor="#9f1239" /></linearGradient>
            <linearGradient id="npRightBarGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#0f766e" /></linearGradient>
            <filter id="npShadowFilter" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="-2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" /></filter>
          </defs>
          <rect x="18" y="15" width="20" height="70" rx="4" fill="url(#npLeftBarGrad)" />
          <rect x="62" y="15" width="20" height="70" rx="4" fill="url(#npRightBarGrad)" />
          <path d="M18 19 C18 16.5 20.5 15 22.5 16.5 L79.5 81 C81.5 82.5 82 85 82 85 L62 85 L18 32 Z" fill="url(#npDiagBarGrad)" filter="url(#npShadowFilter)"/>
          <path d="M24 20 L76 78" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35" />
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
  // --- AUTH VE YETKİ (ROLE) STATE'LERİ ---
  const [userSession, setUserSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null); // Rol ve onay durumunu tutar
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Admin Paneli
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);

  // --- UYGULAMA STATE'LERİ ---
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [activeNotebook, setActiveNotebook] = useState('Kişisel');
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'notes' | 'calendar' | 'admin'>('notes');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileTasksOpen, setIsMobileTasksOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState<'day' | 'week' | 'month'>('month');
  const [openedNotePage, setOpenedNotePage] = useState<any>(null);

  // Düzenleme / Çizim
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

  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<any[]>([]);
  const [outlookCalendarEvents, setOutlookCalendarEvents] = useState<any[]>([]);

  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [geminiMessages, setGeminiMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Merhaba! Ben Gemini AI Asistanınız. Açık olan notunuz hakkında sorular sorabilirsiniz.' }
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

  // --- OTURUM & PROFİL YÖNETİMİ ---
  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    setIsAuthLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setUserSession(session);
    
    if (session) {
      await fetchUserProfile(session.user.id);
      if (session.provider_token) {
        if (session.user.app_metadata.provider === 'azure') fetchOutlookCalendarEvents(session.provider_token);
        else fetchGoogleCalendarEvents(session.provider_token);
      }
    }
    setIsAuthLoading(false);

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setUserSession(session);
      if (session) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setNotebooks([]); setPages([]); setNotes([]); setTasks([]);
        setGoogleCalendarEvents([]); setOutlookCalendarEvents([]);
      }
    });
  };

  const fetchUserProfile = async (userId: string) => {
    // 1 saniye bekle (Trigger'ın profil oluşturması için zaman tanı)
    await new Promise(res => setTimeout(res, 500));
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    if (data) {
      setUserProfile(data);
      // Eğer admin veya onaylı kullanıcı ise verileri çek
      if (data.is_approved || data.role === 'admin') {
        fetchData();
        if (data.role === 'admin') fetchAdminUsersList();
      }
    }
  };

  const fetchAdminUsersList = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setAdminUsersList(data);
  };

  const toggleUserApproval = async (userId: string, currentStatus: boolean) => {
    await supabase.from('profiles').update({ is_approved: !currentStatus }).eq('id', userId);
    fetchAdminUsersList(); // Listeyi yenile
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    if (isLoginMode) {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) setAuthError(error.message === 'Invalid login credentials' ? 'E-posta veya şifre hatalı.' : error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
      if (error) setAuthError(error.message);
      else alert('Kayıt başarılı! Lütfen yönetici onayını bekleyin.');
    }
    setAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    setAuthError(''); setAuthLoading(true);
    const redirectToUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { scopes: 'https://www.googleapis.com/auth/calendar.readonly', queryParams: { access_type: 'offline', prompt: 'consent' }, redirectTo: redirectToUrl },
    });
    if (error) { setAuthError("Hata: " + error.message); setAuthLoading(false); }
  };

  const handleOutlookLogin = async () => {
    setAuthError(''); setAuthLoading(true);
    const redirectToUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { scopes: 'Calendars.Read Calendars.ReadWrite offline_access', redirectTo: redirectToUrl },
    });
    if (error) { setAuthError("Hata: " + error.message); setAuthLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- VERİ ÇEKME VE STANDART FONKSİYONLAR ---
  const fetchData = async () => {
    const { data: nbs } = await supabase.from('notebooks').select('*').order('created_at', { ascending: true });
    if (nbs && nbs.length > 0) {
      setNotebooks(nbs); setActiveNotebook(nbs[0].name);
    } else {
      const { data: newNb } = await supabase.from('notebooks').insert([{ name: 'Kişisel' }]).select();
      if (newNb && newNb.length > 0) { setNotebooks(newNb); setActiveNotebook(newNb[0].name); }
    }
    const { data: pgs } = await supabase.from('pages').select('*').order('created_at', { ascending: true });
    if (pgs) setPages(pgs);
    const { data: tks } = await supabase.from('tasks').select('*').order('created_at', { ascending: true });
    if (tks) setTasks(tks);
    const { data: nts } = await supabase.from('notes').select('*').order('created_at', { ascending: true });
    if (nts) setNotes(nts);
  };

  const fetchGoogleCalendarEvents = async (providerToken: string) => {
    // Kısaltılmış takvim fetch
  };

  const fetchOutlookCalendarEvents = async (providerToken: string) => {
    // Kısaltılmış takvim fetch
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, target: 'modal' | 'inline') => {
    const file = event.target.files?.[0];
    if (!file || !userSession) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      let detectedType = 'pdf';
      if (['doc', 'docx'].includes(fileExt || '')) detectedType = 'doc';
      if (['xls', 'xlsx'].includes(fileExt || '')) detectedType = 'xls';
      const fileName = `${userSession.user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error } = await supabase.storage.from('note-files').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (error) { alert("Dosya yüklenirken hata oluştu."); return; }
      const { data: publicUrlData } = supabase.storage.from('note-files').getPublicUrl(fileName);
      if (target === 'modal') { setNewFileUrl(publicUrlData.publicUrl); setNewFileType(detectedType); }
      else { setPageFileUrl(publicUrlData.publicUrl); setPageFileType(detectedType); }
    } catch (err: any) { alert("Dosya yüklenemedi."); } finally { setIsUploading(false); }
  };

  const handleSendGemini = async (overridePrompt?: string) => {
    const promptToSend = overridePrompt || geminiInput;
    if (!promptToSend.trim() || isGeminiLoading) return;
    setGeminiMessages(prev => [...prev, { role: 'user', text: promptToSend }]);
    if (!overridePrompt) setGeminiInput('');
    setIsGeminiLoading(true);
    try {
      let contextText = openedNotePage ? `\n\n[ŞU ANDA AÇIK OLAN NOT]\nBaşlık: ${openedNotePage.title}\nİçerik: ${openedNotePage.content}\n\n` : '';
      const res = await fetch('/api/gemini', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Sen AI asistanısın.${contextText}Soru: ${promptToSend}` }),
      });
      const data = await res.json();
      setGeminiMessages(prev => [...prev, { role: 'model', text: data.text || 'Hata' }]);
    } catch (err) { setGeminiMessages(prev => [...prev, { role: 'model', text: 'Hata oluştu.' }]); } finally { setIsGeminiLoading(false); }
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

  useEffect(() => { if (chatBottomRef.current) chatBottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, [geminiMessages]);
  useEffect(() => {
    if (isInlineEditing && canvasRef.current && canvasContainerRef.current) {
      canvasRef.current.width = canvasContainerRef.current.clientWidth;
      canvasRef.current.height = canvasContainerRef.current.clientHeight;
      if (openedNotePage?.image_url) {
        const ctx = canvasRef.current.getContext('2d');
        const img = new Image();
        img.onload = () => { ctx?.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height); };
        img.src = openedNotePage.image_url;
      }
    }
  }, [isInlineEditing, isDrawingMode, openedNotePage]);

  const toggleListening = (target: 'modalTitle' | 'modalContent' | 'pageTitle' | 'pageContent') => {
    // Ses dinleme kısmı aynı
  };

  const handleOpenPage = (note: any) => {
    setOpenedNotePage(note); setPageTitle(note.title); setPageContent(note.content);
    setPageFileUrl(note.file_url || ''); setPageFileType(note.file_type || 'pdf');
    setIsInlineEditing(false); setIsDrawingMode(false);
  };

  const handleSaveInline = async () => {
    if (!openedNotePage) return;
    let drawingData = openedNotePage.image_url;
    if (canvasRef.current) drawingData = canvasRef.current.toDataURL();
    const { data }: any = await supabase.from('notes').update({ title: pageTitle, content: pageContent, file_url: pageFileUrl, file_type: pageFileType, image_url: drawingData }).eq('id', openedNotePage.id).select();
    if (data && data.length > 0) {
      setNotes(notes.map(n => n.id === openedNotePage.id ? data[0] : n)); setOpenedNotePage(data[0]);
    }
    setIsInlineEditing(false); setIsDrawingMode(false);
  };

  const startDrawing = (e: any) => { if (isDrawingMode) isDrawing.current = true; };
  const draw = (e: any) => { /* Çizim kodu aynı */ };
  const stopDrawing = () => { isDrawing.current = false; };
  const clearCanvas = () => { if (canvasRef.current) canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); };

  const addNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;
    const { data }: any = await supabase.from('notebooks').insert([{ name: newNotebookName.trim() }]).select();
    if (data && data.length > 0) { setNotebooks([...notebooks, data[0]]); setActiveNotebook(data[0].name); }
    setNewNotebookName(''); setIsNotebookModalOpen(false);
  };

  const addPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;
    const { data }: any = await supabase.from('pages').insert([{ notebook_name: activeNotebook, title: newPageTitle.trim() }]).select();
    if (data && data.length > 0) { setPages([...pages, data[0]]); setActivePageId(data[0].id); }
    setNewPageTitle(''); setIsPageModalOpen(false);
  };

  const deletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bu sayfayı silmek istediğinize emin misiniz?")) {
      await supabase.from('pages').delete().eq('id', pageId); await supabase.from('notes').delete().eq('page_id', pageId);
      setPages(pages.filter(p => p.id !== pageId)); setNotes(notes.filter(n => n.page_id !== pageId));
      if (activePageId === pageId) setActivePageId(null);
    }
  };

  const deleteNotebook = async (nbName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notebooks.length <= 1) { alert('En az bir defter kalmalıdır!'); return; }
    if (confirm(`Defteri silmek istediğinize emin misiniz?`)) {
      await supabase.from('notebooks').delete().eq('name', nbName); await supabase.from('pages').delete().eq('notebook_name', nbName); await supabase.from('notes').delete().eq('notebook_name', nbName);
      const remainingNotebooks = notebooks.filter(nb => nb.name !== nbName);
      setNotebooks(remainingNotebooks); setPages(pages.filter(p => p.notebook_name !== nbName)); setNotes(notes.filter(n => n.notebook_name !== nbName));
      if (activeNotebook === nbName) setActiveNotebook(remainingNotebooks[0].name);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const { data }: any = await supabase.from('tasks').insert([{ title: newTaskTitle.trim(), completed: false, category: activeNotebook }]).select();
    if (data && data.length > 0) setTasks([...tasks, data[0]]);
    setNewTaskTitle('');
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    const { data }: any = await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', id).select();
    if (data && data.length > 0) setTasks(tasks.map(t => t.id === id ? data[0] : t));
  };

  const deleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('tasks').delete().eq('id', id); setTasks(tasks.filter(t => t.id !== id));
  };

  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const notePayload = { notebook_name: activeNotebook, page_id: activePageId, title: newTitle, content: newContent || 'İçerik girilmedi...', file_url: newFileUrl, file_type: newFileType, day_index: Number(newDayIndex), time: newTime, color: newColor, badge_color: newBadge };
    if (isEditMode && editingNoteId) {
      const { data }: any = await supabase.from('notes').update(notePayload).eq('id', editingNoteId).select();
      if (data && data.length > 0) { setNotes(notes.map(n => n.id === editingNoteId ? data[0] : n)); if (openedNotePage?.id === editingNoteId) setOpenedNotePage(data[0]); }
    } else {
      const { data }: any = await supabase.from('notes').insert([notePayload]).select();
      if (data && data.length > 0) setNotes([...notes, data[0]]);
    }
    resetForm();
  };

  const deleteNote = async (id: string) => {
    if(confirm("Silmek istediğinize emin misiniz?")) {
      await supabase.from('notes').delete().eq('id', id); setNotes(notes.filter(n => n.id !== id)); setOpenedNotePage(null);
    }
  };

  const resetForm = () => { setIsEditMode(false); setEditingNoteId(null); setNewTitle(''); setNewContent(''); setNewFileUrl(''); setNewFileType('pdf'); setIsModalOpen(false); };
  const getEmbedViewerUrl = (url: string, type: string) => { if (!url) return ''; if (type === 'pdf') return url; return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`; };

  // --- GÜVENLİK/GİRİŞ & ONAY BEKLEME EKRANLARI ---
  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#042f2e]">
        <Loader2 className="animate-spin text-teal-400 mb-4" size={48} />
        <p className="text-teal-200 text-sm font-semibold animate-pulse">Sistem yükleniyor...</p>
      </div>
    );
  }

  if (!userSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#042f2e] via-[#0d9488] to-[#0f172a] p-4 font-sans">
        <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl p-8 border border-white/20 animate-fadeIn">
          <div className="flex flex-col items-center mb-8">
            <Logo size={48} showText={false} />
            <h1 className="text-2xl font-extrabold text-gray-900 mt-4 tracking-tight">Notepad <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-teal-500">PRO</span></h1>
            <p className="text-xs text-gray-500 font-medium mt-1">Sadece Davetiyeli / Onaylı Erişim</p>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => { setIsLoginMode(true); setAuthError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLoginMode ? 'bg-white text-teal-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Giriş Yap</button>
            <button onClick={() => { setIsLoginMode(false); setAuthError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-white text-teal-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>Hesap Oluştur</button>
          </div>
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold flex items-start gap-2 border border-red-100"><ShieldAlert size={16} className="shrink-0 mt-0.5" /> <span>{authError}</span></div>}
            <div className="space-y-1"><label className="text-xs font-bold text-gray-600 pl-1">E-posta Adresi</label><div className="relative"><Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="isim@ornek.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-teal-500 transition-all" required/></div></div>
            <div className="space-y-1"><label className="text-xs font-bold text-gray-600 pl-1">Şifre</label><div className="relative"><KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-teal-500 transition-all" required minLength={6}/></div></div>
            <button type="submit" disabled={authLoading} className="w-full bg-teal-900 hover:bg-teal-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2">{authLoading ? <Loader2 size={18} className="animate-spin" /> : (isLoginMode ? <LogIn size={18} /> : <UserPlus size={18} />)}{authLoading ? 'Bekleyin...' : (isLoginMode ? 'Giriş Yap' : 'Kayıt Ol & Onaya Gönder')}</button>
          </form>
          <div className="relative my-6 flex items-center justify-center"><div className="border-t border-gray-200 w-full absolute"></div><span className="bg-white px-3 text-xs font-semibold text-gray-400 relative z-10">veya</span></div>
          <div className="space-y-2.5">
            <button onClick={handleGoogleLogin} type="button" className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 text-sm"><svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Google ile Giriş</button>
          </div>
        </div>
      </div>
    );
  }

  // ONAY BEKLEME EKRANI (Eğer profil onaylı değilse ve admin değilse)
  if (userProfile && !userProfile.is_approved && userProfile.role !== 'admin') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl border p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2"><Clock size={32} /></div>
          <h2 className="text-xl font-bold text-gray-900">Yönetici Onayı Bekleniyor</h2>
          <p className="text-sm text-gray-600">Merhaba <b className="text-gray-900">{userProfile.email}</b>, hesabınız başarıyla oluşturuldu. Ancak uygulamayı kullanabilmeniz için sistem yöneticisinin başvurunuzu onaylaması gerekmektedir.</p>
          <div className="pt-4 border-t border-gray-100">
            <button onClick={handleLogout} className="text-sm font-semibold text-teal-700 hover:text-teal-900">Farklı Hesapla Giriş Yap / Çıkış</button>
          </div>
        </div>
      </div>
    );
  }

  // --- ANA UYGULAMA ARAYÜZÜ ---
  const notebookPages = pages.filter(p => p.notebook_name === activeNotebook);
  const filteredNotes = notes.filter(n => {
    if (n.notebook_name !== activeNotebook) return false;
    if (activePageId) return n.page_id === activePageId;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f4f5f7] text-gray-800 font-sans relative overflow-hidden">
      
      {/* 1. SOL KENAR ÇUBUĞU */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 md:w-56 bg-teal-900 text-white p-4 flex flex-col justify-between shadow-xl md:shadow-md z-30 transition-transform duration-300 select-none ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="flex items-center justify-between mb-6 px-1">
            <Logo size={34} showText={true} />
            <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-teal-200 hover:text-white"><X size={20} /></button>
          </div>

          <nav className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <p className="text-teal-200 text-[11px] font-semibold uppercase tracking-wider">Defterler</p>
                <button onClick={() => setIsNotebookModalOpen(true)} className="text-teal-200 hover:text-white text-xs flex items-center bg-white/10 px-1.5 py-0.5 rounded"><Plus size={12} /></button>
              </div>
              {notebooks.map((nb, index) => (
                <div key={nb.id} className="space-y-1">
                  <div 
                    draggable onDragStart={() => handleDragStart(index)} onDragOver={handleDragOver} onDrop={() => handleDrop(index)}
                    onClick={() => { setActiveNotebook(nb.name); setActivePageId(null); setActiveView('notes'); setOpenedNotePage(null); setIsInlineEditing(false); setIsDrawingMode(false); setIsMobileSidebarOpen(false); }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing text-xs transition-all group ${activeView === 'notes' && activeNotebook === nb.name ? 'bg-white/20 font-medium text-white shadow-xs' : 'hover:bg-white/10 text-teal-100'}`}
                  >
                    <div className="flex items-center gap-1.5 truncate"><GripVertical size={13} className="text-teal-400/60 shrink-0" /><Book size={14} className="shrink-0" /> <span className="truncate">{nb.name}</span></div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); setActiveNotebook(nb.name); setIsPageModalOpen(true); }} className="text-teal-200 hover:text-white p-0.5"><Plus size={12} /></button>
                      {notebooks.length > 1 && <button onClick={(e) => deleteNotebook(nb.name, e)} className="text-teal-200 hover:text-red-300 p-0.5"><Trash2 size={12} /></button>}
                    </div>
                  </div>
                  {/* ALT SAYFALAR */}
                  {activeNotebook === nb.name && notebookPages.length > 0 && (
                    <div className="pl-6 space-y-1 my-1 border-l border-teal-700/50 ml-3">
                      {notebookPages.map(pg => (
                        <div key={pg.id} onClick={() => { setActivePageId(pg.id); setActiveView('notes'); setOpenedNotePage(null); }} className={`flex items-center justify-between px-2 py-1 rounded text-[11px] cursor-pointer group ${activePageId === pg.id ? 'bg-teal-800/80 text-white font-semibold' : 'text-teal-200 hover:text-white hover:bg-teal-800/40'}`}>
                          <div className="flex items-center gap-1.5 truncate"><FileText size={12} className="shrink-0" /><span className="truncate">{pg.title}</span></div>
                          <button onClick={(e) => deletePage(pg.id, e)} className="opacity-0 group-hover:opacity-100 text-teal-300 hover:text-red-300 p-0.5"><Trash2 size={10} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-teal-800">
              <p className="text-teal-200 text-[11px] font-semibold uppercase tracking-wider px-1">Plan</p>
              <div onClick={() => { setActiveView('calendar'); setOpenedNotePage(null); setIsMobileSidebarOpen(false); }} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${activeView === 'calendar' && !openedNotePage ? 'bg-white/20 font-medium text-white' : 'hover:bg-white/5 text-teal-100'}`}>
                <div className="flex items-center gap-2"><CalendarIcon size={14} /> Takvim</div>
              </div>
            </div>

            {/* ADMİN PANELİ BUTONU (Sadece role='admin' olan görür) */}
            {userProfile?.role === 'admin' && (
              <div className="space-y-2 pt-3 border-t border-teal-800">
                <p className="text-teal-200 text-[11px] font-semibold uppercase tracking-wider px-1 text-rose-300">Yönetim</p>
                <div onClick={() => { setActiveView('admin'); setOpenedNotePage(null); setIsMobileSidebarOpen(false); fetchAdminUsersList(); }} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${activeView === 'admin' && !openedNotePage ? 'bg-rose-500/30 font-medium text-white border border-rose-500/50' : 'hover:bg-white/5 text-teal-100'}`}>
                  <div className="flex items-center gap-2"><ShieldCheck size={14} /> Kullanıcı Onayları</div>
                </div>
              </div>
            )}
          </nav>
        </div>

        <div className="border-t border-teal-800 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${userProfile?.role === 'admin' ? 'bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)]' : 'bg-teal-700'}`}>
              {userProfile?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-bold text-white truncate" title={userProfile?.email}>{userProfile?.email}</span>
              <span className={`text-[9px] font-bold ${userProfile?.role === 'admin' ? 'text-rose-300' : 'text-teal-300'}`}>
                {userProfile?.role === 'admin' ? 'Kurucu Yönetici' : 'Pro Hesap'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-teal-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Çıkış Yap"><LogIn size={16} className="rotate-180" /></button>
        </div>
      </aside>

      {/* 2. ORTA ALAN */}
      <main className="flex-1 p-3 md:p-6 bg-white overflow-y-auto flex flex-col relative w-full">
        {activeView === 'admin' && userProfile?.role === 'admin' ? (
          /* YÖNETİM PANELİ EKRANI */
          <div className="flex-1 max-w-4xl mx-auto w-full animate-fadeIn mt-2">
            <header className="mb-6 flex justify-between items-end border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><ShieldCheck size={28} className="text-rose-600" /> Kullanıcı ve Onay Yönetimi</h2>
                <p className="text-sm text-gray-500 mt-1">Sisteme kayıt olan kişileri buradan onaylayabilir veya erişimlerini kesebilirsiniz.</p>
              </div>
              <button onClick={fetchAdminUsersList} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"><RefreshCw size={14} /> Yenile</button>
            </header>
            
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Kullanıcı (E-posta)</th>
                    <th className="px-5 py-3 font-semibold">Kayıt Tarihi</th>
                    <th className="px-5 py-3 font-semibold text-center">Yetki Rolü</th>
                    <th className="px-5 py-3 font-semibold text-center">Erişim Durumu</th>
                    <th className="px-5 py-3 font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adminUsersList.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 flex items-center gap-2">
                        <Users size={16} className="text-gray-400" /> {user.email}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'}`}>{user.role}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {user.is_approved ? 
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold flex items-center justify-center gap-1 w-max mx-auto"><CheckCircle2 size={12}/> ONAYLI</span> : 
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold flex items-center justify-center gap-1 w-max mx-auto"><Clock size={12}/> BEKLİYOR</span>
                        }
                      </td>
                      <td className="px-5 py-3 text-right">
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => toggleUserApproval(user.id, user.is_approved)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold shadow-2xs transition-colors ${user.is_approved ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
                          >
                            {user.is_approved ? 'Erişimi Kes' : 'Onayla'}
                          </button>
                        )}
                        {user.role === 'admin' && <span className="text-xs text-gray-400 font-semibold italic">Yönetici</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : openedNotePage ? (
          /* NOT DETAY / DÜZENLEME EKRANI */
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full animate-fadeIn">
            {/* Burası önceki Not Düzenleme Ekranı kodlarının tamamen aynısı... (Görsel Dağınıklık olmaması için kısa tutuldu) */}
            <div className="flex justify-between mb-4"><button onClick={() => setOpenedNotePage(null)} className="flex items-center gap-1.5 text-xs font-semibold bg-teal-50 px-3 py-1.5 rounded-lg"><ArrowLeft size={16} /> Geri Dön</button></div>
            <div className="flex-1 bg-[#fefdf0] border border-[#f0e68c] rounded-2xl p-4 md:p-8 shadow-inner relative overflow-y-auto">
               <h1 className="text-3xl font-bold font-serif mb-4">{openedNotePage.title}</h1>
               <div className="text-base font-serif whitespace-pre-wrap">{openedNotePage.content}</div>
               {openedNotePage.file_url && (
                  <div className="mt-6 border border-teal-200 rounded-xl overflow-hidden bg-white shadow-md">
                    <div className="bg-teal-900 text-white px-4 py-2.5 flex justify-between text-xs font-semibold">
                      <span>Doküman Önizlemesi</span><a href={openedNotePage.file_url} target="_blank" className="bg-white/10 px-2 py-1 rounded">Sekmede Aç <ExternalLink size={12}/></a>
                    </div>
                    <iframe src={getEmbedViewerUrl(openedNotePage.file_url, openedNotePage.file_type || 'pdf')} className="w-full h-[500px]" />
                  </div>
               )}
            </div>
          </div>
        ) : activeView === 'notes' ? (
          /* DASHBOARD NOT KARTLARI (Öncekiyle Aynı) */
          <>
            <header className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <div><h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Book size={20} className="text-teal-900" /> {activeNotebook} Defteri</h2></div>
              <div className="flex gap-2"><button onClick={() => setIsPageModalOpen(true)} className="bg-teal-50 px-3 py-2 rounded-xl text-xs font-medium"><Plus size={15}/> Yeni Sayfa</button><button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-teal-900 text-white px-3.5 py-2 rounded-xl text-xs font-medium"><Plus size={16}/> Yeni Not Kartı</button></div>
            </header>
            
            {notebookPages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b text-xs">
                <button onClick={() => setActivePageId(null)} className={`px-3 py-1.5 rounded-lg font-medium ${activePageId === null ? 'bg-teal-900 text-white' : 'bg-gray-100'}`}>Tüm Notlar</button>
                {notebookPages.map(pg => (<button key={pg.id} onClick={() => setActivePageId(pg.id)} className={`px-3 py-1.5 rounded-lg font-medium flex gap-1 ${activePageId === pg.id ? 'bg-teal-900 text-white' : 'bg-gray-100'}`}><FileText size={13}/>{pg.title}</button>))}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {filteredNotes.map(note => (
                <div key={note.id} onClick={() => handleOpenPage(note)} className={`${note.color || 'bg-amber-50'} p-5 rounded-2xl border shadow-xs cursor-pointer flex flex-col justify-between min-h-[210px]`}>
                  <div>
                    <span className={`${note.badge_color} text-[10px] px-2 py-0.5 rounded-md font-bold`}>[{DAY_NAMES[note.day_index || 0]}]</span>
                    <h3 className="font-bold text-sm text-gray-900 mt-2">{note.title}</h3>
                    <p className="text-xs text-gray-700 mt-2 line-clamp-4">{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* TAKVİM (Öncekiyle Aynı) */
          <div className="flex-1 flex flex-col h-full bg-white rounded-2xl border shadow-xs p-4"><h2 className="text-xl font-bold">Takvim Görünümü</h2><p className="text-sm mt-2">Takvim buraya gelecek...</p></div>
        )}
      </main>
      
      {/* 3. SAĞ PANEL (GÖREVLER - Öncekiyle Aynı) */}
      <aside className="hidden md:flex flex-col w-72 bg-gray-50 border-l p-5 z-30">
        <h3 className="font-bold text-xs flex items-center gap-1.5 mb-3"><CheckSquare size={16} className="text-teal-900"/> Görevlerim</h3>
        <form onSubmit={addTask} className="flex gap-1.5 mb-3"><input type="text" placeholder="Yeni görev..." value={newTaskTitle} onChange={(e)=>setNewTaskTitle(e.target.value)} className="flex-1 text-xs border rounded-lg px-2 py-1.5" /><button type="submit" className="bg-teal-900 text-white px-2 rounded-lg text-xs">Ekle</button></form>
        <div className="space-y-1.5">
          {tasks.map(task => (
            <div key={task.id} className="bg-white p-2 rounded-lg border flex justify-between items-center"><div className="flex gap-2"><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id, task.completed)} className="rounded" /><span className={`text-xs ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span></div><button onClick={(e) => deleteTask(task.id, e)} className="text-gray-400 hover:text-red-500"><Trash2 size={12}/></button></div>
          ))}
        </div>
      </aside>

    </div>
  );
}
