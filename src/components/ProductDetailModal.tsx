import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { formatPrice, generateWhatsappLink } from '../utils/formatters';
import {
  X,
  MessageSquare,
  Sparkles,
  Layers,
  Maximize2,
  CheckCircle2,
  Package,
  Info,
  ChevronRight,
  Share2,
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductDetail,
    setSelectedProductDetail,
    setQuoteModalProduct,
    setLightboxImage,
    products,
    categories,
    settings,
    showNotification,
  } = useCatalog();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!selectedProductDetail) return null;

  const product = selectedProductDetail;
  const isPriceVisible = settings.globalShowPrice && product.showPrice;
  const priceDisplay = formatPrice(product.price, product.currency, isPriceVisible);
  const isQuoteOnly = !product.price || !isPriceVisible;

  const categoryObj = categories.find(c => c.id === product.categoryId);
  const subcategoryObj = categoryObj?.subcategories.find(s => s.id === product.subcategoryId);

  // Gallery images list
  const allImages = Array.from(
    new Set([
      product.coverImage,
      ...(product.images || []),
      ...(product.variants?.map(v => v.image).filter(Boolean) as string[] || []),
    ])
  ).filter(Boolean);

  const currentImage = allImages[activeImageIndex] || product.coverImage;

  // Related products from same category
  const relatedProducts = products
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const whatsappUrl = generateWhatsappLink(
    settings.whatsappNumber,
    product.name,
    product.sku
  );

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

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={() => setSelectedProductDetail(null)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
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

        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Gallery Column */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Image View */}
              <div className="relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden aspect-4/3 group flex items-center justify-center p-2">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                />

                <button
                  onClick={() => setLightboxImage(currentImage)}
                  className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-lg backdrop-blur-xs transition-colors cursor-pointer shadow-md"
                  title="Görseli Büyüt"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">
                    YENİ
                  </span>
                )}
              </div>

              {/* Thumbnails Gallery */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 bg-slate-50 transition-all cursor-pointer ${
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

              {/* Package Content & Stock Note */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Stok Durumu:</span>
                  <span className="font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    {product.stockStatus}
                  </span>
                </div>
                {product.packageQuantity && (
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <span className="text-slate-500 font-medium">Paket Adedi:</span>
                    <span className="font-semibold text-slate-800">{product.packageQuantity}</span>
                  </div>
                )}
                {product.setContents && (
                  <div className="flex items-start justify-between border-t border-slate-200/60 pt-2">
                    <span className="text-slate-500 font-medium">Set İçeriği:</span>
                    <span className="font-semibold text-slate-800 text-right">{product.setContents}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Info Column */}
            <div className="lg:col-span-6 space-y-5">
              {/* Badges & SKU */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-teal-700 text-teal-50 font-mono font-bold text-xs px-3 py-1 rounded-md shadow-2xs">
                    {product.sku}
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                    {categoryObj?.name}
                  </span>
                </div>

                <h1 className="text-2xl font-black text-slate-900 leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price Banner */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                    B2B Kataloğu Satış / Fiyat Bilgisi
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`font-black text-xl ${isQuoteOnly ? 'text-slate-200' : 'text-red-500'}`}>
                      {priceDisplay}
                    </span>
                    {product.price && isPriceVisible && (
                      <span className="text-xs text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded">
                        {product.priceType}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-md">
                  {product.taxStatus}
                </span>
              </div>

              {/* Short & Long Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-teal-600" /> Ürün Açıklaması
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  {product.description || product.shortDescription}
                </p>
              </div>

              {/* Variants Section (if any) */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Renk ve Model Varyantları ({product.variants.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white hover:border-teal-500 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0"
                            style={{ backgroundColor: variant.color }}
                          />
                          <span className="text-xs font-semibold text-slate-800">{variant.name}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {variant.sku}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Teknik Özellikler
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {product.specifications.map((spec) => (
                      <div key={spec.id} className="grid grid-cols-12 p-2.5 bg-white hover:bg-slate-50">
                        <span className="col-span-5 font-semibold text-slate-600">{spec.title}</span>
                        <span className="col-span-7 font-bold text-slate-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTAs: Quote & WhatsApp */}
              <div className="pt-4 space-y-2.5">
                <button
                  onClick={() => {
                    setSelectedProductDetail(null);
                    setQuoteModalProduct(product);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Kurumsal Fiyat Teklifi Al
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  WhatsApp ile Doğrudan Bilgi Al
                </a>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-600" />
                Benzer Antrenman Ürünleri
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setSelectedProductDetail(rel);
                      setActiveImageIndex(0);
                    }}
                    className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 cursor-pointer hover:border-teal-500 hover:shadow-md transition-all group"
                  >
                    <img
                      src={rel.coverImage}
                      alt={rel.name}
                      className="w-full h-24 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform"
                    />
                    <span className="bg-teal-700 text-teal-50 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-block mb-1">
                      {rel.sku}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-700">
                      {rel.name}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
