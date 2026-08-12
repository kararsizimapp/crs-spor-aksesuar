import React, { useRef, useState, useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { DEFAULT_SETTINGS } from '../data/initialData';
import { DEFAULT_FALLBACK_IMAGE } from '../utils/formatters';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Tag } from 'lucide-react';

export const PromoBannerSlider: React.FC = () => {
  const { settings, setActiveTab, setSelectedCategory } = useCatalog();
  const banners = (settings.promoBanners || DEFAULT_SETTINGS.promoBanners || []).filter(
    (b) => b.active !== false
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!banners || banners.length === 0) return null;

  const scrollToBanner = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const bannerWidth = container.clientWidth;
    container.scrollTo({
      left: index * bannerWidth,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const newIdx = activeIndex === 0 ? banners.length - 1 : activeIndex - 1;
    scrollToBanner(newIdx);
  };

  const handleNext = () => {
    const newIdx = activeIndex === banners.length - 1 ? 0 : activeIndex + 1;
    scrollToBanner(newIdx);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    if (index !== activeIndex && index >= 0 && index < banners.length) {
      setActiveIndex(index);
    }
  };

  // Auto-slide every 6 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev === banners.length - 1 ? 0 : prev + 1;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: next * scrollRef.current.clientWidth,
            behavior: 'smooth',
          });
        }
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative group my-8">
      {/* Slider Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center border border-red-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-red-600 text-[10px] font-mono font-bold uppercase tracking-wider block leading-none">
              Öne Çıkan Kampanyalar & Duyurular
            </span>
            <h3 className="text-lg font-black text-slate-900 leading-tight">Fırsat ve Katalog Bannerları</h3>
          </div>
        </div>

        {/* Arrow Navigation */}
        {banners.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Önceki Banner"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Sonraki Banner"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-3xl border border-slate-800 shadow-xl bg-slate-950"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
      >
        {banners.map((banner, idx) => (
          <div
            key={banner.id || idx}
            className="w-full flex-shrink-0 snap-start relative min-h-[220px] sm:min-h-[280px] flex items-center overflow-hidden"
          >
            {/* Background Image & Overlay */}
            <img
              src={banner.imageUrl || DEFAULT_FALLBACK_IMAGE}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-3">
              {banner.badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Tag className="w-3 h-3" />
                  <span>{banner.badge}</span>
                </div>
              )}

              <h3 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {banner.title}
              </h3>

              {banner.subtitle && (
                <p className="text-slate-300 text-xs sm:text-sm font-medium line-clamp-2 max-w-xl">
                  {banner.subtitle}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (banner.categoryId) {
                      setSelectedCategory(banner.categoryId);
                      setActiveTab('products');
                    } else if (banner.linkTab) {
                      setActiveTab(banner.linkTab);
                    } else {
                      setActiveTab('products');
                    }
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 border border-red-400 group/btn"
                >
                  <span>{banner.buttonText || 'Hemen İncele'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToBanner(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeIndex === idx ? 'w-6 bg-red-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
