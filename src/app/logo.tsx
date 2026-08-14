'use client';
import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 32, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none cursor-pointer group">
      {/* NETFLIX & FUTURISTIC ESİNTİLİ 3D 'N' SVG LOGOSU */}
      <div 
        style={{ width: size, height: size }} 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-950 via-teal-950 to-black p-1.5 shadow-lg shadow-teal-950/40 border border-teal-500/30 group-hover:border-teal-400/60 group-hover:shadow-teal-500/20 transition-all duration-300"
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        >
          <defs>
            {/* Sol Şerit Gradyanı */}
            <linearGradient id="leftBar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#042f2e" />
            </linearGradient>

            {/* Orta Çapraz Netflix Şeridi Gradyanı */}
            <linearGradient id="diagonalBar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff2a5f" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>

            {/* Sağ Şerit Gradyanı */}
            <linearGradient id="rightBar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>

            {/* Derinlik Gölgesi (Netflix Katman Efekti) */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="-2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Sol Dikey Şerit */}
          <rect x="18" y="15" width="20" height="70" rx="4" fill="url(#leftBar)" />

          {/* Sağ Dikey Şerit */}
          <rect x="62" y="15" width="20" height="70" rx="4" fill="url(#rightBar)" />

          {/* Orta Çapraz Şerit (Netflix 3D Katman Efekti) */}
          <path 
            d="M18 19 C18 16.5 20.5 15 22.5 16.5 L79.5 81 C81.5 82.5 82 85 82 85 L62 85 L18 32 Z" 
            fill="url(#diagonalBar)" 
            filter="url(#shadow)"
          />

          {/* Futuristik Parlama Çizgisi (Gelecek Vurgusu) */}
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