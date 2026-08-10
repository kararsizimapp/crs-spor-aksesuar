import React, { useState, useMemo } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { formatCurrency } from '../utils/formatters';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ShoppingBag,
  Download,
  Share2,
  Sparkles,
  Layers,
  Search,
  Check,
} from 'lucide-react';

export const FlipbookPage: React.FC = () => {
  const { products, categories, addToCart, setIsCartOpen } = useCatalog();

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Group products into pages (6 products per spread)
  const catalogPages = useMemo(() => {
    let filtered = products.filter(p => p.isPublished);
    if (selectedCategoryFilter) {
      filtered = filtered.filter(p => p.categoryId === selectedCategoryFilter);
    }

    const pages = [];
    
    // Page 0: Front Cover
    pages.push({
      type: 'cover',
      title: 'CRS SPOR',
      subtitle: '2026 DİJİTAL ANTRENMAN VE SPOR EKİPMANLARI KATALOĞU',
    });

    // Generate product pages (4 products per page)
    const ITEMS_PER_PAGE = 4;
    for (let i = 0; i < filtered.length; i += ITEMS_PER_PAGE) {
      const pageProducts = filtered.slice(i, i + ITEMS_PER_PAGE);
      const categoryId = pageProducts[0]?.categoryId;
      const catObj = categories.find(c => c.id === categoryId);

      pages.push({
        type: 'content',
        pageNumber: pages.length,
        categoryName: catObj ? catObj.name : 'Spor Ekipmanları',
        products: pageProducts,
      });
    }

    // Back Cover
    pages.push({
      type: 'back-cover',
      title: 'CRS SPOR İLETİŞİM',
      subtitle: 'Kaliteli Spor Malzemeleri ve Profesyonel Antrenman Çözümleri',
    });

    return pages;
  }, [products, categories, selectedCategoryFilter]);

  const totalPages = catalogPages.length;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const activePageData = catalogPages[currentPage] || catalogPages[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-red-500 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            İnteraktif E-Katalog & Flipbook
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            CRS SPOR Dijital Katalog
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Sayfaları çevirerek ürünleri inceleyebilir, doğrudan teklif sepetinize ekleyebilirsiniz.
          </p>
        </div>

        {/* Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Quick Filter */}
          <select
            value={selectedCategoryFilter || ''}
            onChange={(e) => {
              setSelectedCategoryFilter(e.target.value || null);
              setCurrentPage(0);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-800 text-xs font-bold rounded-xl text-white focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="">Tüm Kategoriler ({products.length} Ürün)</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.85))}
              className="p-2 text-slate-300 hover:text-white cursor-pointer"
              title="Uzaklaş"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-400 px-1">
              %{Math.round(zoomLevel * 100)}
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.4))}
              className="p-2 text-slate-300 hover:text-white cursor-pointer"
              title="Yakınlaş"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Teklif Sepetini Aç</span>
          </button>
        </div>
      </div>

      {/* Flipbook Container */}
      <div className="relative bg-slate-200/80 border border-slate-300 rounded-3xl p-4 sm:p-8 min-h-[600px] flex flex-col items-center justify-center overflow-hidden shadow-inner">
        
        {/* Navigation Floating Buttons */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer backdrop-blur-xs"
          title="Önceki Sayfa"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer backdrop-blur-xs"
          title="Sonraki Sayfa"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* The Catalog Book Page View */}
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden transition-transform duration-200 min-h-[520px] flex flex-col justify-between relative"
        >
          {/* Cover Page View */}
          {activePageData.type === 'cover' && (
            <div className="bg-slate-950 text-white min-h-[520px] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-6 relative z-10">
                <div className="flex items-center">
                  <span className="text-3xl font-black text-white font-sans tracking-tighter">CRS</span>
                  <span className="text-3xl font-black text-red-600 font-sans tracking-tight ml-2">SPOR</span>
                </div>
                <span className="bg-red-600 text-white font-mono font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  2026 BASKI
                </span>
              </div>

              <div className="my-auto py-12 space-y-4 relative z-10 max-w-2xl">
                <span className="text-red-500 font-mono font-bold text-xs uppercase tracking-widest block">
                  B2B DİJİTAL ÜRÜN KATALOĞU
                </span>
                <h2 className="text-3xl sm:text-5xl font-black leading-tight text-white uppercase tracking-tight">
                  Profesyonel Spor Ekipmanları
                </h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Futbol, basketbol, voleybol, antrenman huni ve slalom setleri, hakem ürünleri ve kulüp ekipmanlarında Türkiye'nin lider tedarikçisi.
                </p>
                <div className="pt-4 flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Kataloğu İncelemeye Başla</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 relative z-10">
                <span>www.crsspor.com.tr</span>
                <span>CRS SPOR Ekipmanları San. Tic. A.Ş.</span>
              </div>
            </div>
          )}

          {/* Catalog Content Page View */}
          {activePageData.type === 'content' && (
            <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[520px]">
              {/* Header Page Title */}
              <div className="border-b-2 border-slate-900 pb-3 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-black text-red-600 uppercase tracking-widest block">
                    CRS SPOR KATALOG
                  </span>
                  <h3 className="text-xl font-black text-slate-900 uppercase">
                    {activePageData.categoryName}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                  Sayfa {currentPage} / {totalPages - 2}
                </span>
              </div>

              {/* 4 Products Layout */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 flex-1">
                {activePageData.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-400 transition-all group"
                  >
                    <div>
                      <div className="aspect-4/3 bg-white rounded-xl overflow-hidden mb-2 border border-slate-200 p-2 flex items-center justify-center relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-2 left-2 bg-slate-950 text-red-400 font-mono font-black text-[10px] px-2 py-0.5 rounded shadow-2xs">
                          {product.sku}
                        </span>
                      </div>

                      {product.brand && (
                        <span className="text-[10px] font-black text-slate-900 uppercase">
                          {product.brand}
                        </span>
                      )}
                      <h4 className="font-black text-slate-900 text-xs line-clamp-2 uppercase leading-snug">
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-slate-900 font-mono">
                          {formatCurrency(product.vatIncludedPrice || product.price * 1.2)}
                        </div>
                        <span className="text-[9px] text-slate-500 block">KDV Dahil</span>
                      </div>

                      <button
                        onClick={() => addToCart(product, 1)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Page Footer */}
              <div className="border-t border-slate-200 pt-4 mt-6 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>CRS SPOR • Online Katalog</span>
                <span>Sayfa {currentPage}</span>
              </div>
            </div>
          )}

          {/* Back Cover View */}
          {activePageData.type === 'back-cover' && (
            <div className="bg-slate-900 text-white min-h-[520px] p-8 sm:p-12 flex flex-col justify-between">
              <div className="text-center py-12 space-y-4 my-auto">
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-black text-white tracking-tighter">CRS</span>
                  <span className="text-4xl font-black text-red-600 tracking-tight ml-2">SPOR</span>
                </div>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Tüm spor kulüpleri, okullar, belediyeler ve B2B toptan alımlarda özel iskonto ve fiyat teklifleri için satış ekibimizle iletişime geçebilirsiniz.
                </p>
                <div className="pt-6">
                  <button
                    onClick={() => setCurrentPage(0)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    Kapağa Dön
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Page Thumbnail Selector Bar */}
        <div className="mt-6 flex items-center justify-center gap-2 overflow-x-auto max-w-full p-2">
          {catalogPages.map((page, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currentPage === idx
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {page.type === 'cover' ? 'Kapak' : page.type === 'back-cover' ? 'Arka Kapak' : `S.${idx}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
