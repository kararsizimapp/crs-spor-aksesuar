import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Yukarı Çık"
      title="Sayfa Başına Dön"
      className="fixed bottom-6 right-6 z-40 p-3 bg-slate-900 hover:bg-red-600 text-white rounded-2xl shadow-xl border border-slate-700/80 hover:border-red-500 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group"
    >
      <ChevronUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-[11px] font-extrabold font-mono pl-0 group-hover:pl-2">
        Yukarı Çık
      </span>
    </button>
  );
};
