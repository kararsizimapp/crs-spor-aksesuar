import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { Layers, ChevronRight, PackageCheck } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, products, setSelectedCategory, setSelectedSubcategory, setActiveTab } = useCatalog();

  const handleSelectSub = (catId: string, subId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(subId);
    setActiveTab('products');
  };

  const handleSelectCat = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(null);
    setActiveTab('products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white p-8 rounded-2xl border border-slate-800 shadow-md">
        <span className="text-red-500 text-xs font-mono font-bold uppercase tracking-wider">
          Ürün Hiyerarşisi
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Kategoriler ve Alt Kategoriler
        </h1>
        <p className="text-slate-400 text-xs mt-2 max-w-2xl leading-relaxed">
          Saha antrenmanı, koordinasyon, hakemlik, kaleci ve genel spor malzemeleri kategorilerimizi detaylı olarak inceleyebilir, istediğiniz gruba filtreleyebilirsiniz.
        </p>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const categoryProducts = products.filter(p => p.categoryId === cat.id && p.status === 'Yayında');

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Category Image Header */}
                <div 
                  onClick={() => handleSelectCat(cat.id)}
                  className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1517649763962-0c6232661a0b?auto=format&fit=crop&w=600&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="bg-slate-900/90 backdrop-blur-md text-teal-400 text-[11px] font-black px-3 py-1 rounded-full border border-slate-700 shadow-md flex items-center gap-1">
                      <PackageCheck className="w-3.5 h-3.5 text-teal-400" /> {categoryProducts.length} Ürün
                    </span>
                  </div>
                </div>

                {/* Category Body */}
                <div className="p-5">
                  <h3
                    onClick={() => handleSelectCat(cat.id)}
                    className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors cursor-pointer mb-2"
                  >
                    {cat.name}
                  </h3>

                  {cat.description && (
                    <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                      {cat.description}
                    </p>
                  )}

                  {/* Subcategories List */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Alt Kategoriler
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSelectSub(cat.id, sub.id)}
                            className="bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-teal-300 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>{sub.name}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                <button
                  onClick={() => handleSelectCat(cat.id)}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-teal-600 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Kategorideki Tüm Ürünleri İncele
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
