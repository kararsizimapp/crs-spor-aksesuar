import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { formatPrice, calculateTaxPrices } from '../utils/formatters';
import {
  X,
  Maximize2,
  Info,
  ChevronRight,
  Share2,
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductDetail,
    setSelectedProductDetail,
    setLightboxImage,
    categories,
    settings,
    showNotification,
  } = useCatalog();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedProductDetail) return null;

  const product = selectedProductDetail;
  const isPriceVisible = settings.globalShowPrice && product.showPrice;

  const categoryObj = categories.find(c => c.id === product.categoryId);
  const subcategoryObj = categoryObj?.subcategories?.find(s => s.id === product.subcategoryId);

  // Gallery images list
  const allImages = Array.from(
    new Set([
      product.coverImage,
      ...(product.images || []),
      ...(product.variants?.map(v => v.image).filter(Boolean) as string[] || []),
    ])
  ).filter(Boolean);

  const currentImage = allImages[activeImageIndex] || product.coverImage;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `${product.name} - ${product.sku}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification('Ürün bağlantısı panoya kopyalandı.');
    }
  };

  // Tax calculations
  const effectiveVatRate = product.vatRate !== undefined && !isNaN(product.vatRate) ? product.vatRate : 20;
  const taxInfo = calculateTaxPrices(product.price, product.taxStatus, effectiveVatRate);

  const exVatText = taxInfo.exVat !== null ? formatPrice(taxInfo.exVat, product.currency, isPriceVisible) : '—';
  const incVatText = taxInfo.incVat !== null ? formatPrice(taxInfo.incVat, product.currency, isPriceVisible) : '—';

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      onClick={() => setSelectedProductDetail(null)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-slate-950 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400 truncate font-bold">
            <span>{categoryObj?.name || 'Ürün Kataloğu'}</span>
            {subcategoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-teal-400">{subcategoryObj.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              title="Paylaş"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedProductDetail(null)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body - Single Screen Layout */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            
            {/* LEFT COLUMN: Image & Gallery */}
            <div className="space-y-3">
              {/* Main Image */}
              <div className="relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden aspect-square max-h-72 w-full group flex items-center justify-center p-3">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                />

                <button
                  onClick={() => setLightboxImage(currentImage)}
                  className="absolute bottom-2.5 right-2.5 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-lg backdrop-blur-xs transition-colors cursor-pointer shadow-md"
                  title="Görseli Büyüt"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {product.isNew && (
                  <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                    YENİ
                  </span>
                )}
              </div>

              {/* Thumbnails Gallery */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg border-2 overflow-hidden flex-shrink-0 bg-slate-50 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-teal-600 ring-2 ring-teal-600/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt={`Önizleme ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Info, Price, Description, Variants & Specs */}
            <div className="space-y-3">
              {/* SKU & Title */}
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="bg-teal-700 text-teal-50 font-mono font-bold text-[11px] px-2.5 py-0.5 rounded">
                    {product.sku}
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                    {categoryObj?.name}
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price Box */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  ÜRÜN FİYATI
                </div>

                {product.price && isPriceVisible ? (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                    {/* KDV Hariç Fiyat */}
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">KDV HARİÇ FİYAT</span>
                      <span className="text-base sm:text-lg font-black text-teal-400">
                        {exVatText}
                      </span>
                    </div>

                    {/* KDV Dahil Fiyat */}
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-slate-400 font-semibold block">KDV DAHİL FİYAT</span>
                        <span className="bg-emerald-950 text-emerald-400 text-[9px] font-bold px-1 py-0.2 rounded border border-emerald-800/80">
                          %{effectiveVatRate} KDV
                        </span>
                      </div>
                      <span className="text-base sm:text-lg font-black text-emerald-400">
                        {incVatText}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-300 font-bold text-sm py-1">
                    Fiyat için iletişime geçiniz
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3 text-teal-600" /> Ürün Açıklaması
                </h4>
                <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {product.description || product.shortDescription}
                </p>
              </div>

              {/* Color / Model Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                    Renk / Model Varyantları ({product.variants.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between p-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0"
                            style={{ backgroundColor: variant.color }}
                          />
                          <span className="text-[11px] font-semibold text-slate-800 truncate">{variant.name}</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                          {variant.sku}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications Table */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                    Teknik Özellikler
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                    {product.specifications.map((spec) => (
                      <div key={spec.id} className="grid grid-cols-12 p-1.5 bg-white hover:bg-slate-50">
                        <span className="col-span-5 font-semibold text-slate-600">{spec.title}</span>
                        <span className="col-span-7 font-bold text-slate-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
