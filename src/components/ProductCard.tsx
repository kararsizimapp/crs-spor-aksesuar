import React from 'react';
import { Product } from '../types';
import { formatPrice, calculateTaxPrices } from '../utils/formatters';
import { useCatalog } from '../context/CatalogContext';
import { MessageSquare, ArrowRight, Layers, Award } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const { setSelectedProductDetail, setQuoteModalProduct, settings } = useCatalog();

  const isPriceVisible = settings.globalShowPrice && product.showPrice;
  const priceDisplay = formatPrice(product.price, product.currency, isPriceVisible);
  const isQuoteOnly = !product.price || !isPriceVisible;

  if (layout === 'list') {
    return (
      <div className="bg-white rounded-2xl shadow-xs hover:shadow-md border border-slate-200 text-slate-900 overflow-hidden transition-all duration-200 flex flex-col sm:flex-row group">
        {/* Cover Image */}
        <div 
          onClick={() => setSelectedProductDetail(product)}
          className="relative w-full sm:w-64 h-48 sm:h-auto bg-slate-100 overflow-hidden flex-shrink-0 cursor-pointer"
        >
          <img
            src={product.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c6232661a0b?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {product.isNew && (
            <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs">
              YENİ
            </span>
          )}
          {product.featured && (
            <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-black px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
              <Award className="w-3 h-3" /> ÖNE ÇIKAN
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Product SKU in Dark Tag */}
              <span className="bg-slate-900 text-white font-mono font-black text-xs px-2.5 py-1 rounded-md shadow-xs tracking-wide">
                {product.sku}
              </span>
              {/* Price Tag */}
              {isQuoteOnly ? (
                <span className="font-bold text-xs px-2.5 py-1 rounded-md border bg-slate-100 text-slate-700 border-slate-200">
                  {priceDisplay}
                </span>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5 font-bold text-xs">
                  <span className="px-2.5 py-1 rounded-md border bg-teal-50 text-teal-800 border-teal-200">
                    {formatPrice(calculateTaxPrices(product.price, product.taxStatus, product.vatRate ?? 20).exVat, product.currency, isPriceVisible)} (KDV Hariç)
                  </span>
                  <span className="px-2.5 py-1 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200">
                    {formatPrice(calculateTaxPrices(product.price, product.taxStatus, product.vatRate ?? 20).incVat, product.currency, isPriceVisible)} (KDV Dahil)
                  </span>
                </div>
              )}
            </div>

            <h3 
              onClick={() => setSelectedProductDetail(product)}
              className="text-lg font-black text-slate-900 group-hover:text-teal-600 cursor-pointer transition-colors line-clamp-1 mb-2"
            >
              {product.name}
            </h3>

            <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed">
              {product.shortDescription}
            </p>

            {product.specifications && product.specifications.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mb-3">
                {product.specifications.slice(0, 3).map((spec, idx) => (
                  <span key={idx} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    <strong className="text-slate-800">{spec.title}:</strong> {spec.value}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              {product.stockStatus}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuoteModalProduct(product)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                Teklif Al
              </button>
              <button
                onClick={() => setSelectedProductDetail(product)}
                className="px-3.5 py-1.5 text-xs font-black rounded-xl bg-slate-900 text-white hover:bg-teal-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                İncele
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 text-slate-900 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden">
      {/* Product Image Focal Point */}
      <div 
        onClick={() => setSelectedProductDetail(product)}
        className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer flex items-center justify-center p-2"
      >
        <img
          src={product.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c6232661a0b?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
          loading="lazy"
        />

        {/* Product SKU in Dark Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-slate-950 text-white text-xs font-mono font-black px-2.5 py-1 rounded-lg shadow-md border border-slate-800">
            {product.sku}
          </span>
        </div>

        {/* Product Badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {product.isNew && (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              YENİ
            </span>
          )}
          {product.featured && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 uppercase tracking-wider">
              Öne Çıkan
            </span>
          )}
        </div>

        {/* Overlay hover effect */}
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-slate-900 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-lg">
            Hızlı İncele
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          {/* Product Price Tag (Badge) */}
          <div className="mb-2">
            {isQuoteOnly ? (
              <span className="inline-block font-bold text-xs px-2.5 py-1 rounded-md shadow-2xs border bg-slate-100 text-slate-600 border-slate-200">
                {priceDisplay}
              </span>
            ) : (
              <div className="flex flex-col gap-1 text-[11px] font-bold">
                <span className="inline-block px-2 py-0.5 rounded-md border bg-teal-50 text-teal-800 border-teal-200/80">
                  {formatPrice(calculateTaxPrices(product.price, product.taxStatus, product.vatRate ?? 20).exVat, product.currency, isPriceVisible)} (KDV Hariç)
                </span>
                <span className="inline-block px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200/80">
                  {formatPrice(calculateTaxPrices(product.price, product.taxStatus, product.vatRate ?? 20).incVat, product.currency, isPriceVisible)} (KDV Dahil)
                </span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => setSelectedProductDetail(product)}
            className="text-base font-extrabold text-slate-900 hover:text-teal-600 cursor-pointer transition-colors line-clamp-1 mb-1.5"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-slate-500 text-xs line-clamp-2 mb-3 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <button
            onClick={() => setQuoteModalProduct(product)}
            className="flex-1 py-2 px-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            Teklif Al
          </button>
          <button
            onClick={() => setSelectedProductDetail(product)}
            className="py-2 px-3 text-xs font-black rounded-xl bg-slate-900 text-white hover:bg-teal-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            Detay
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
