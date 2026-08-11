import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { formatPrice, calculateTaxPrices, getProductImage } from '../utils/formatters';
import {
  X,
  Maximize2,
  Info,
  ChevronRight,
  Share2,
  ShoppingBag,
  Plus,
  Minus,
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductDetail,
    setSelectedProductDetail,
    setLightboxImage,
    categories,
    settings,
    showNotification,
    addToCart,
    setIsCartOpen,
  } = useCatalog();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalQty, setModalQty] = useState(1);

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

  const currentImage = allImages[activeImageIndex] || getProductImage(product);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:items-stretch">
            
            {/* LEFT COLUMN: Main Image */}
            <div className="h-full flex flex-col">
              {/* Main Image Container (expands vertically with right column) */}
              <div className="relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden min-h-[280px] h-full flex-1 w-full group flex items-center justify-center p-4">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full max-h-[500px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                />

                <button
                  onClick={() => setLightboxImage(currentImage)}
                  className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-xl backdrop-blur-xs transition-colors cursor-pointer shadow-md"
                  title="Görseli Büyüt"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Info, Price, Description, Variants */}
            <div className="space-y-3">
              {/* Brand, SKU & Title */}
              <div>
                {/* Brand Name (small text, top-left of title) */}
                {product.brand && (
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider mb-0.5">
                    {product.brand}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
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
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 shadow-sm space-y-2">
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center justify-between">
                  <span>ÜRÜN FİYAT DETAYI</span>
                  <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800/80">
                    %{effectiveVatRate} KDV
                  </span>
                </div>

                {product.price && isPriceVisible ? (
                  <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-800/80">
                    {/* KDV Hariç Fiyat */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5 uppercase tracking-wider">KDV HARİÇ</span>
                      <span className="text-base sm:text-lg font-mono font-black text-slate-200">
                        {exVatText}
                      </span>
                    </div>

                    {/* KDV Dahil Fiyat */}
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-emerald-400 font-bold block mb-0.5 uppercase tracking-wider">KDV DAHİL</span>
                      <span className="text-base sm:text-xl font-mono font-black text-emerald-400">
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

              {/* Add to Quote Basket Bar */}
              <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border-2 border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => setModalQty(prev => Math.max(prev - 1, 1))}
                      className="p-2 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer rounded-l-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-black text-xs text-slate-900 font-mono">
                      {modalQty}
                    </span>
                    <button
                      onClick={() => setModalQty(prev => prev + 1)}
                      className="p-2 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer rounded-r-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(product, modalQty);
                      setSelectedProductDetail(null);
                      setIsCartOpen(true);
                    }}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Teklif Sepetine Ekle ({modalQty} Adet)</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
