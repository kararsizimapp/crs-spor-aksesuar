import React, { useState, useMemo, useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { formatCurrency, getProductImage } from '../utils/formatters';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Download,
  Sparkles,
  Layers,
  MapPin,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';

export const FlipbookPage: React.FC = () => {
  const { products, categories, addToCart } = useCatalog();

  const [currentPage, setCurrentPage] = useState<number>(0);

  // Filter published products
  const publishedProducts = useMemo(() => {
    return products.filter(p => p.isPublished !== false);
  }, [products]);

  // Group products into pages (9 products per page - 3x3 grid with large clear images)
  const ITEMS_PER_PAGE = 9;

  const catalogPages = useMemo(() => {
    const pages = [];
    
    // Page 0: Front Cover
    pages.push({
      type: 'cover' as const,
      title: 'CRS SPOR',
      subtitle: '2026 DİJİTAL ANTRENMAN VE SPOR EKİPMANLARI KATALOĞU',
    });

    if (publishedProducts.length === 0) {
      pages.push({
        type: 'empty' as const,
        pageNumber: 1,
        categoryName: 'Ürün Bulunamadı',
        products: [],
      });
    } else {
      for (let i = 0; i < publishedProducts.length; i += ITEMS_PER_PAGE) {
        const pageProducts = publishedProducts.slice(i, i + ITEMS_PER_PAGE);
        const categoryId = pageProducts[0]?.categoryId;
        const catObj = categories.find(c => c.id === categoryId);

        pages.push({
          type: 'content' as const,
          pageNumber: pages.length,
          categoryName: catObj ? catObj.name : 'Spor Ekipmanları & Antrenman Malzemeleri',
          products: pageProducts,
        });
      }
    }

    // Back Cover
    pages.push({
      type: 'back-cover' as const,
      title: 'CRS SPOR İLETİŞİM',
      subtitle: 'Kaliteli Spor Malzemeleri ve Profesyonel Antrenman Çözümleri',
    });

    return pages;
  }, [publishedProducts, categories]);

  const totalPages = catalogPages.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentPage(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages]);

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

  // Export & Download Full Catalog as Printable PDF (9 items per page - 3x3 grid with large clear images)
  const handleDownloadPdfCatalog = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const catalogItems = publishedProducts;
    const pagesHtml = [];

    // Group items 9 per page (3 columns x 3 rows) for optimal image size & clarity on A4
    const chunkSize = 9;
    for (let i = 0; i < catalogItems.length; i += chunkSize) {
      const pageProducts = catalogItems.slice(i, i + chunkSize);
      const pageNum = Math.floor(i / chunkSize) + 1;
      const catName = categories.find(c => c.id === pageProducts[0]?.categoryId)?.name || 'Spor Ekipmanları';

      const itemsGridHtml = pageProducts.map(product => `
        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; background: #fafafa; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; height: 78mm;">
          <div>
            <div style="height: 98px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 6px; padding: 4px;">
              <img src="${getProductImage(product)}" style="max-height: 90px; max-width: 100%; object-fit: contain;" />
            </div>
            <div style="font-family: monospace; font-size: 8.5px; font-weight: 800; color: #dc2626; background: #fee2e2; display: inline-block; padding: 2px 6px; border-radius: 3px; margin-bottom: 3px;">KOD: ${product.sku}</div>
            <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 2px; line-height: 1.25; height: 28px; overflow: hidden;">${product.name}</div>
            ${product.brand ? `<div style="font-size: 8.5px; font-weight: 800; color: #475569; text-transform: uppercase;">${product.brand}</div>` : ''}
          </div>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 12px; font-weight: 900; color: #0f172a; font-family: monospace;">${formatCurrency(product.vatIncludedPrice || product.price * 1.2)}</div>
              <div style="font-size: 8px; font-weight: 600; color: #64748b;">KDV Dahil</div>
            </div>
          </div>
        </div>
      `).join('');

      pagesHtml.push(`
        <div class="page" style="page-break-after: always; padding: 18px 20px; background: #fff; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; height: 275mm;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 12px;">
              <div>
                <span style="font-size: 8.5px; font-weight: 800; color: #dc2626; letter-spacing: 1px;">CRS SPOR DİJİTAL KATALOG</span>
                <h2 style="margin: 0; font-size: 15px; font-weight: 900; color: #0f172a; text-transform: uppercase;">${catName}</h2>
              </div>
              <span style="font-size: 10px; font-weight: 700; color: #64748b; font-family: monospace;">Sayfa ${pageNum}</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              ${itemsGridHtml}
            </div>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 8.5px; color: #64748b; font-weight: 600;">
            <span>CRS Spor Tekstil Sanayi Ticaret Limited Şirketi</span>
            <span>Tel: 0 850 360 00 55 | kurumsal@crsspor.com | www.crsspor.com.tr</span>
          </div>
        </div>
      `);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CRS SPOR 2026 Ürün Kataloğu</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #fff; color: #0f172a; }
          .cover-page { page-break-after: always; padding: 40px; background: #090d16; color: #fff; height: 275mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
          .back-cover-page { page-break-after: avoid; padding: 40px; background: #090d16; color: #fff; height: 275mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- Front Cover -->
        <div class="cover-page">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #334155; padding-bottom: 15px;">
            <div style="font-size: 32px; font-weight: 900; letter-spacing: -1px;">CRS <span style="color: #dc2626;">SPOR</span></div>
            <span style="background: #dc2626; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px;">2026 BASKI</span>
          </div>

          <div style="margin: auto 0; padding: 30px 0;">
            <div style="color: #ef4444; font-size: 12px; font-weight: 800; letter-spacing: 2px; margin-bottom: 8px;">RESMİ ÜRÜN KATALOĞU</div>
            <h1 style="font-size: 38px; font-weight: 900; margin: 0 0 12px 0; text-transform: uppercase; line-height: 1.1;">ANTRENMAN VE SPOR EKİPMANLARI</h1>
            <p style="color: #94a3b8; font-size: 13.5px; max-width: 550px; line-height: 1.5;">Futbol, basketbol, voleybol, antrenman huni ve slalom setleri, hakem malzemeleri ve kulüp ekipmanlarında Türkiye'nin güvenilir markası.</p>
          </div>

          <div style="border-top: 1px solid #1e293b; padding-top: 15px; font-size: 10.5px; color: #64748b; display: flex; justify-content: space-between;">
            <span>CRS Spor Tekstil Sanayi Ticaret Limited Şirketi</span>
            <span>Şabanoğlu Mah. Atatürk Bulv. No: 186 Tekkeköy/SAMSUN</span>
          </div>
        </div>

        <!-- Product Pages -->
        ${pagesHtml.join('')}

        <!-- Back Cover -->
        <div class="back-cover-page">
          <div style="text-align: center; margin: auto 0;">
            <div style="font-size: 36px; font-weight: 900; margin-bottom: 10px;">CRS <span style="color: #dc2626;">SPOR</span></div>
            <p style="color: #cbd5e1; font-size: 13.5px; max-width: 480px; margin: 0 auto 25px auto;">Kulübünüz, okulunuz veya spor organizasyonunuz için özel fiyat teklifleri almak üzere satış temsilcilerimizle iletişime geçebilirsiniz.</p>

            <div style="background: #1e293b; padding: 22px; border-radius: 12px; display: inline-block; text-align: left; max-width: 420px; width: 100%; border: 1px solid #334155;">
              <div style="font-size: 13.5px; font-weight: 800; color: #fff; margin-bottom: 8px;">CRS Spor Tekstil San. Tic. Ltd. Şti.</div>
              <div style="font-size: 11.5px; color: #cbd5e1; margin-bottom: 5px;">📍 Şabanoğlu Mah. Atatürk Bulv. No: 186 Tekkeköy / SAMSUN</div>
              <div style="font-size: 11.5px; color: #cbd5e1; margin-bottom: 5px;">📞 0 850 360 00 55</div>
              <div style="font-size: 11.5px; color: #cbd5e1; margin-bottom: 5px;">✉️ kurumsal@crsspor.com</div>
              <div style="font-size: 11.5px; color: #cbd5e1;">🏢 19 Mayıs V.D. - 2150601373</div>
            </div>
          </div>

          <div style="text-align: center; font-size: 10.5px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 12px;">
            www.crsspor.com.tr • Tüm Hakları Saklıdır © 2026
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Clean Control Bar */}
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
            Sayfaları çevirerek ürünleri inceleyebilir, doğrudan teklif sepetinize ekleyebilir veya kataloğu bilgisayarınıza indirip yazdırabilirsiniz.
          </p>
        </div>

        {/* Clean Header Action Bar */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-black rounded-xl text-slate-300">
            Tüm Kategoriler ({publishedProducts.length} Ürün)
          </div>

          {/* Download PDF / Print Catalog Button */}
          <button
            onClick={handleDownloadPdfCatalog}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            title="Kataloğu PDF İndir veya Yazdır"
          >
            <Download className="w-4 h-4" />
            <span>Kataloğu PDF İndir</span>
          </button>
        </div>
      </div>

      {/* Flipbook Container */}
      <div className="relative bg-slate-200/80 border border-slate-300 rounded-3xl p-4 sm:p-8 min-h-[620px] flex flex-col items-center justify-center overflow-hidden shadow-inner">
        
        {/* Navigation Floating Buttons */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer backdrop-blur-xs"
          title="Önceki Sayfa (Sol Yön Tuşu)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer backdrop-blur-xs"
          title="Sonraki Sayfa (Sağ Yön Tuşu)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* The Catalog Book Page View */}
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden min-h-[580px] flex flex-col justify-between relative">
          
          {/* Cover Page View */}
          {activePageData.type === 'cover' && (
            <div className="bg-slate-950 text-white min-h-[580px] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
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
                <span className="text-red-500 font-mono font-bold text-xs uppercase tracking-widest block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  DİJİTAL ÜRÜN KATALOĞU
                </span>
                <h2 className="text-3xl sm:text-5xl font-black leading-tight text-white uppercase tracking-tight">
                  Profesyonel Spor Ekipmanları
                </h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Futbol, basketbol, voleybol, antrenman huni ve slalom setleri, hakem ürünleri ve kulüp ekipmanlarında Türkiye'nin lider tedarikçisi.
                </p>
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Kataloğu İncelemeye Başla</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleDownloadPdfCatalog}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-red-400" />
                    <span>PDF Olarak İndir / Yazdır</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 relative z-10">
                <span>www.crsspor.com.tr</span>
                <span>CRS Spor Tekstil San. Tic. Ltd. Şti.</span>
              </div>
            </div>
          )}

          {/* Empty Page View */}
          {activePageData.type === 'empty' && (
            <div className="p-12 text-center my-auto space-y-4">
              <Layers className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">Katalogda Ürün Bulunamadı</h3>
            </div>
          )}

          {/* Catalog Content Page View (9 products grid - 3x3 layout with large clear images) */}
          {activePageData.type === 'content' && (
            <div className="p-6 sm:p-8 flex flex-col justify-between min-h-[580px]">
              {/* Header Page Title */}
              <div className="border-b-2 border-slate-900 pb-3 mb-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-black text-red-600 uppercase tracking-widest block">
                    CRS SPOR KATALOG
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
                    {activePageData.categoryName}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200">
                  Sayfa {currentPage} / {totalPages - 2}
                </span>
              </div>

              {/* 9 Products Grid Layout (3 columns x 3 rows) with large images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                {activePageData.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between hover:border-slate-400 transition-all group shadow-2xs"
                  >
                    <div>
                      {/* Large image container */}
                      <div className="h-36 sm:h-40 bg-white rounded-xl overflow-hidden mb-2.5 border border-slate-200 p-2.5 flex items-center justify-center relative shadow-2xs">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                        <span className="absolute top-2 left-2 bg-slate-950 text-red-400 font-mono font-black text-[10px] px-2 py-0.5 rounded shadow-2xs">
                          KOD: {product.sku}
                        </span>
                      </div>

                      {product.brand && (
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">
                          {product.brand}
                        </span>
                      )}
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-2 uppercase leading-snug" title={product.name}>
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                          {formatCurrency(product.vatIncludedPrice || product.price * 1.2)}
                        </div>
                        <span className="text-[9px] text-slate-500 font-medium block">KDV Dahil</span>
                      </div>

                      <button
                        onClick={() => addToCart(product, 1)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Page Footer */}
              <div className="border-t border-slate-200 pt-4 mt-5 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>CRS SPOR • Dijital Ürün Kataloğu</span>
                <span className="font-mono font-bold text-slate-600">Sayfa {currentPage}</span>
              </div>
            </div>
          )}

          {/* Back Cover View */}
          {activePageData.type === 'back-cover' && (
            <div className="bg-slate-950 text-white min-h-[580px] p-8 sm:p-12 flex flex-col justify-between">
              <div className="text-center py-8 space-y-4 my-auto">
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-black text-white tracking-tighter">CRS</span>
                  <span className="text-4xl font-black text-red-600 tracking-tight ml-2">SPOR</span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  Tüm spor kulüpleri, okullar, belediyeler ve B2B toptan alımlarda özel iskonto ve fiyat teklifleri için satış ekibimizle iletişime geçebilirsiniz.
                </p>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-md mx-auto text-left space-y-2 text-xs text-slate-300">
                  <p className="font-black text-white text-sm">CRS Spor Tekstil Sanayi Ticaret Ltd. Şti.</p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Şabanoğlu Mah. Atatürk Bulv. No: 186 Tekkeköy/SAMSUN</span>
                  </p>
                  <p className="flex items-center gap-2 font-mono">
                    <Phone className="w-4 h-4 text-red-500 shrink-0" />
                    <span>0 850 360 00 55</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-red-500 shrink-0" />
                    <span>kurumsal@crsspor.com</span>
                  </p>
                  <p className="flex items-center gap-2 font-mono text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>19 Mayıs V.D - 2150601373</span>
                  </p>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={handleDownloadPdfCatalog}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Kataloğu İndir / Yazdır</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage(0)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    Kapağa Dön
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Page Selector Bar with Smooth Horizontal Scrolling Controls */}
        <div className="mt-6 w-full max-w-3xl mx-auto flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <button
            onClick={() => {
              const el = document.getElementById('catalog-page-scroll-container');
              if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl shrink-0 cursor-pointer transition-colors shadow-xs"
            title="Sayfaları Sola Kaydır"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            id="catalog-page-scroll-container"
            className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-1 flex-1 min-w-0"
            style={{ scrollbarWidth: 'thin' }}
          >
            {catalogPages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  currentPage === idx
                    ? 'bg-red-600 text-white shadow-md scale-105'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {page.type === 'cover' ? 'Kapak' : page.type === 'back-cover' ? 'Arka Kapak' : `S.${idx}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('catalog-page-scroll-container');
              if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl shrink-0 cursor-pointer transition-colors shadow-xs"
            title="Sayfaları Sağa Kaydır"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

