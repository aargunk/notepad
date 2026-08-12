'use client';
import React, { useState } from 'react';
import { Book, Tag, Plus, CheckSquare, FileText } from 'lucide-react';

export default function Home() {
  const [tasks] = useState([
    { id: 1, title: 'Final sunumunu hazırla', completed: false },
    { id: 2, title: 'Haftalık planı gözden geçir', completed: true },
    { id: 3, title: 'Müşteri toplantısı notlarını düzenle', completed: false },
  ]);

  const [notes] = useState([
    { id: 1, title: 'Q4 Strateji Taslağı', preview: 'Bütçe ve pazarlama adımları...' },
    { id: 2, title: 'Proje Alfa Fikirleri', preview: 'Yeni özellikler için notlar...' },
  ]);

  const days = ['Pzt 23', 'Sal 24', 'Çar 25', 'Per 26', 'Cum 27', 'Cmt 28', 'Paz 29'];

  return (
    <div className="flex h-screen bg-soft-white text-gray-800 font-sans">
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
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 cursor-pointer text-white font-medium">
                <Book size={18} /> Kişisel
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer text-teal-100 transition-colors">
                <Book size={18} /> İş Projeleri
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider">Etiketler</p>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer text-teal-100 transition-colors">
                <Tag size={18} /> Acil
              </div>
            </div>
          </nav>
        </div>
        <div className="text-xs text-teal-300 border-t border-teal-800 pt-4">
          Bulut Senkronizasyonu: Hazır 🟢
        </div>
      </aside>

      <main className="flex-1 p-8 bg-white overflow-y-auto flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Haftalık Takvim</h2>
            <p className="text-sm text-gray-500">Ekim 23 - Ekim 29, 2026</p>
          </div>
          <button className="bg-deep-teal hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all">
            <Plus size={18} /> Yeni Etkinlik / Not
          </button>
        </header>
        <div className="grid grid-cols-7 gap-3 flex-1 border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
          {days.map((day, index) => (
            <div key={day} className="flex flex-col gap-2">
              <div className="text-center font-semibold text-sm text-gray-600 pb-2 border-b border-gray-200">
                {day}
              </div>
              {index === 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl shadow-xs text-xs space-y-1.5">
                  <span className="bg-amber-200 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">İş</span>
                  <p className="font-bold text-amber-900">Proje Kick-off</p>
                  <p className="text-amber-700">10:00</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <aside className="w-80 bg-gray-50 border-l border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckSquare size={18} className="text-deep-teal" /> Görevlerim
            </h3>
          </div>
          <div className="space-y-2.5">
            {tasks.map(task => (
              <div key={task.id} className="bg-white p-3 rounded-xl shadow-xs border border-gray-200 flex items-center gap-3">
                <input type="checkbox" defaultChecked={task.completed} className="rounded text-deep-teal focus:ring-deep-teal w-4 h-4 cursor-pointer" />
                <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-deep-teal" /> Son Notlar
            </h3>
          </div>
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-200">
                <h4 className="font-semibold text-sm text-gray-800 mb-1">{note.title}</h4>
                <p className="text-xs text-gray-500 truncate">{note.preview}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
