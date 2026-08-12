import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import {
  Award,
  Package,
  Layers,
  ChevronRight,
  Filter,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export const BrandShowcase: React.FC = () => {
  const { products, categories, setSelectedCategory, setActiveTab } = useCatalog();

  // Extract all unique brands from published products
  const publishedProducts = products.filter((p) => p.status !== 'Pasif');

  const brandStatsMap: { [brandName: string]: { count: number; products: Product[]; categories: Set<string> } } = {};

  publishedProducts.forEach((p) => {
    const brandName = p.brand?.trim() || 'Diğer Markalar';
    if (!brandStatsMap[brandName]) {
      brandStatsMap[brandName] = {
        count: 0,
        products: [],
        categories: new Set(),
      };
    }
    brandStatsMap[brandName].count += 1;
    brandStatsMap[brandName].products.push(p);
    if (p.categoryId) {
      brandStatsMap[brandName].categories.add(p.categoryId);
    }
  });

  const allBrandNames = Object.keys(brandStatsMap).sort((a, b) => brandStatsMap[b].count - brandStatsMap[a].count);

  const [selectedBrand, setSelectedBrand] = useState<string | null>(allBrandNames[0] || null);
  const [brandSearch, setBrandSearch] = useState<string>('');

  const currentBrandData = selectedBrand ? brandStatsMap[selectedBrand] : null;

  // Filter current brand's products
  const displayProducts = currentBrandData
    ? currentBrandData.products.filter((p) =>
        brandSearch ? p.name.toLowerCase().includes(brandSearch.toLowerCase()) || p.sku.toLowerCase().includes(brandSearch.toLowerCase()) : true
      )
    : [];

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/30 rounded-full text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-red-400" />
            <span>Marka Vitrini ve Ekipman Kataloğu</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            CRS SPOR Marka Vitrinleri
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Antrenman ekipmanları, kulüp gereçleri ve spor aksesuarlarında öncü markaların orijinal ürünlerini inceleyin, toplu teklif sepetinize tek tıkla ekleyin.
          </p>
        </div>
      </div>

      {/* Brand Selection Tabs / Pills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-red-600" />
            <span>Katalogdaki Markalar ({allBrandNames.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Markaya tıklayarak ürünlerini süzün</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {allBrandNames.map((bName) => {
            const stats = brandStatsMap[bName];
            const isSelected = selectedBrand === bName;

            return (
              <button
                key={bName}
                onClick={() => setSelectedBrand(bName)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-800 shadow-lg ring-2 ring-red-500/50'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-red-400' : 'text-slate-900'}`}>
                    {bName}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-teal-400" />}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                    {stats.count} Çeşit Ürün
                  </span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${isSelected ? 'bg-slate-800 text-teal-300' : 'bg-slate-100 text-slate-700'}`}>
                    {stats.categories.size} Kategori
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Brand Header & Search */}
      {selectedBrand && currentBrandData && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-xs font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider">
                  MARKA VİTRİNİ
                </span>
                <h3 className="text-2xl font-black text-slate-900">{selectedBrand}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Bu markaya ait toplam <strong>{currentBrandData.count} adet</strong> kayıtlı ürün bulunmaktadır.
              </p>
            </div>

            {/* Internal Brand Search Bar */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder={`${selectedBrand} içinde ara...`}
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-red-600 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Products Grid */}
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Aramanıza uygun ürün bulunamadı.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
