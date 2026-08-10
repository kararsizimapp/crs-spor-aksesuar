import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    products,
    categories,
    setActiveTab,
    setSelectedCategory,
  } = useCatalog();

  const featuredProducts = products.filter(p => p.featured && p.status === 'Yayında').slice(0, 8);
  const newProducts = products.filter(p => p.isNew && p.status === 'Yayında').slice(0, 4);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setActiveTab('products');
  };

  return (
    <div className="space-y-12 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* POPULAR CATEGORIES */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-red-600 text-xs font-mono font-bold uppercase tracking-wider">
                Ürün Gruplarımız
              </span>
              <h2 className="text-2xl font-black text-slate-900">Popüler Kategoriler</h2>
            </div>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              Tüm Kategorileri Gör
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => {
              const productCount = products.filter(p => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs hover:shadow-md hover:border-red-500 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-2.5 relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs group-hover:text-red-600 truncate">
                      {cat.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {productCount} Ürün
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURED PRODUCTS (ÖNE ÇIKAN ÜRÜNLER) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-red-600 text-xs font-mono font-bold uppercase tracking-wider">
                Seçkin Ekipmanlar
              </span>
              <h2 className="text-2xl font-black text-slate-900">Öne Çıkan Ürünler</h2>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              Kataloğa Git
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* NEW ARRIVALS (YENİ EKLENEN ÜRÜNLER) */}
        {newProducts.length > 0 && (
          <section className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
              <div>
                <span className="text-teal-400 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Yeni Koleksiyon
                </span>
                <h2 className="text-2xl font-black text-white">Yeni Eklenen Ürünler</h2>
              </div>
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                Tümünü İncele
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
