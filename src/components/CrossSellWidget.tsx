import React from 'react';
import { Product } from '../types';
import { useCatalog } from '../context/CatalogContext';
import { formatPrice, getProductImage, DEFAULT_FALLBACK_IMAGE } from '../utils/formatters';
import { ShoppingBag, ChevronRight, Sparkles, Tag, Plus } from 'lucide-react';

interface CrossSellWidgetProps {
  currentProduct: Product;
  onSelectProduct?: (product: Product) => void;
  title?: string;
}

export const CrossSellWidget: React.FC<CrossSellWidgetProps> = ({
  currentProduct,
  onSelectProduct,
  title = 'Tamamlayıcı & Benzer Ürün Önerileri',
}) => {
  const { products, addToCart, setIsCartOpen, settings } = useCatalog();

  if (!currentProduct) return null;

  const isGlobalPriceVisible = settings.globalShowPrice !== false;

  // Filter cross-sell candidate products
  // 1. Same category / subcategory
  // 2. Same brand
  // 3. Exclude current product
  const relatedProducts = products.filter((p) => {
    if (p.id === currentProduct.id) return false;
    if (p.status === 'Pasif') return false;

    const isSameCategory = p.categoryId === currentProduct.categoryId;
    const isSameSubcategory =
      currentProduct.subcategoryId && p.subcategoryId === currentProduct.subcategoryId;
    const isSameBrand = currentProduct.brand && p.brand === currentProduct.brand;

    return isSameSubcategory || isSameCategory || isSameBrand;
  });

  // If not enough related products, pick featured published products
  let finalRecommendations = relatedProducts.slice(0, 4);
  if (finalRecommendations.length < 3) {
    const backupProducts = products
      .filter((p) => p.id !== currentProduct.id && p.status !== 'Pasif')
      .slice(0, 4 - finalRecommendations.length);
    finalRecommendations = [...finalRecommendations, ...backupProducts];
  }

  if (finalRecommendations.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">{title}</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {finalRecommendations.length} Öneri
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {finalRecommendations.map((prod) => {
          const img = getProductImage(prod);
          const itemPriceVisible = isGlobalPriceVisible && (prod.showPrice !== false);
          const priceDisplay = formatPrice(prod.price, prod.currency, itemPriceVisible);

          return (
            <div
              key={prod.id}
              className="bg-slate-950 border border-slate-800/90 rounded-xl p-2 flex flex-col justify-between hover:border-teal-500/60 transition-all group cursor-pointer"
              onClick={() => onSelectProduct && onSelectProduct(prod)}
            >
              <div>
                <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden mb-2 relative flex items-center justify-center p-1 border border-slate-800">
                  <img
                    src={img}
                    alt={prod.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                  />
                  <span className="absolute top-1 left-1 bg-slate-900/90 text-teal-400 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-slate-700">
                    {prod.sku}
                  </span>
                </div>

                <h4 className="font-bold text-[11px] text-slate-200 line-clamp-2 leading-tight group-hover:text-teal-300 transition-colors">
                  {prod.name}
                </h4>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                <span className="text-[11px] font-mono font-black text-emerald-400">
                  {priceDisplay}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(prod, 1);
                    setIsCartOpen(true);
                  }}
                  className="p-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Sepete Ekle"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
