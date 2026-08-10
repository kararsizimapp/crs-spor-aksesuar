import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { X, ZoomIn } from 'lucide-react';

export const LightboxModal: React.FC = () => {
  const { lightboxImage, setLightboxImage } = useCatalog();

  if (!lightboxImage) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setLightboxImage(null)}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
        <button
          onClick={() => setLightboxImage(null)}
          className="absolute -top-12 right-0 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors cursor-pointer"
          title="Kapat"
        >
          <X className="w-6 h-6" />
        </button>

        <img
          src={lightboxImage}
          alt="Görsel Büyük Önizleme"
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-slate-700/50"
          onClick={e => e.stopPropagation()}
        />
      </div>
    </div>
  );
};
