import React from 'react';
import { Product } from '../types';
import { formatPrice, calculateTaxPrices } from '../utils/formatters';
import { useCatalog } from '../context/CatalogContext';
import { ArrowRight, Award } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const { setSelectedProductDetail, settings } = useCatalog();

  const isPriceVisible = settings.globalShowPrice && product.showPrice;
  const priceDisplay = formatPrice(product.price, product.currency, isPriceVisible);
  const isQuoteOnly = !product.price || !isPriceVisible;

  const vatPercent = product.vatRate ?? product.taxRate ?? 20;
  const taxPrices = calculateTaxPrices(product.price, product.taxStatus, vatPercent);
  const exVatPriceStr = formatPrice(taxPrices.exVat, product.currency, isPriceVisible);
  const incVatPriceStr = formatPrice(taxPrices.incVat, product.currency, isPriceVisible);

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
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand (left) and SKU (right) above Title */}
            <div className="flex items-center justify-between gap-2 mb-2">
              {product.brand ? (
                <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                  {product.brand}
                </span>
              ) : <div />}
              <span className="bg-slate-950 text-teal-300 font-mono font-black text-xs px-2.5 py-1 rounded-md border border-slate-800 shadow-xs tracking-wider shrink-0">
                {product.sku}
              </span>
            </div>

            {/* Product Title */}
            <h3 
              onClick={() => setSelectedProductDetail(product)}
              className="text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-600 cursor-pointer transition-colors line-clamp-2 leading-snug mb-3 uppercase"
              title={product.name}
            >
              {product.name}
            </h3>

            {/* Corporate Price Box */}
            <div className="mb-4 max-w-md">
              {isQuoteOnly ? (
                <span className="inline-block font-bold text-xs px-3 py-1.5 rounded-xl border bg-slate-100 text-slate-700 border-slate-200">
                  {priceDisplay}
                </span>
              ) : (
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 shadow-xs space-y-1.5 min-w-[240px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">KDV Hariç Fiyat</span>
                    <span className="font-mono font-bold text-slate-200">{exVatPriceStr}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
                    <span className="text-xs font-black text-emerald-400">KDV Dahil (%{vatPercent})</span>
                    <span className="font-mono font-black text-base text-emerald-400 tracking-tight">{incVatPriceStr}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-slate-100 mt-2">
            <button
              onClick={() => setSelectedProductDetail(product)}
              className="px-5 py-2.5 text-xs font-black rounded-xl bg-slate-900 text-white hover:bg-teal-600 transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
            >
              <span>Ürünü İncele</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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
          {/* Corporate Price Badges */}
          <div className="mb-3">
            {isQuoteOnly ? (
              <span className="inline-block font-bold text-xs px-2.5 py-1 rounded-lg shadow-2xs border bg-slate-100 text-slate-600 border-slate-200">
                {priceDisplay}
              </span>
            ) : (
              <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">KDV Hariç</span>
                  <span className="font-mono font-bold text-slate-200 text-xs">{exVatPriceStr}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-xs font-black text-emerald-400">KDV Dahil (%{vatPercent})</span>
                  <span className="font-mono font-black text-sm text-emerald-400 tracking-tight">{incVatPriceStr}</span>
                </div>
              </div>
            )}
          </div>

          {/* Brand (top-left) & SKU Code (top-right) above Title */}
          <div className="mb-2">
            <div className="flex items-center justify-between gap-1.5 mb-1">
              {product.brand ? (
                <span className="text-[11px] font-black text-amber-600 uppercase tracking-wider truncate">
                  {product.brand}
                </span>
              ) : <div />}
              <span className="bg-slate-950 text-teal-300 font-mono font-black text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md border border-slate-800 shadow-2xs tracking-wider shrink-0">
                {product.sku}
              </span>
            </div>
            <div className="min-h-[2.5rem] flex items-center">
              <h3 
                onClick={() => setSelectedProductDetail(product)}
                className="text-xs sm:text-sm font-black text-slate-900 hover:text-teal-600 cursor-pointer transition-colors line-clamp-2 leading-snug uppercase tracking-tight"
                title={product.name}
              >
                {product.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-100 mt-auto">
          <button
            onClick={() => setSelectedProductDetail(product)}
            className="w-full py-2.5 px-3 text-xs font-black rounded-xl bg-slate-900 hover:bg-teal-600 text-white transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer group-hover:bg-teal-600"
          >
            <span>Ürünü İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

