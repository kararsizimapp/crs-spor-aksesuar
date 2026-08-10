import React, { useState, useMemo, useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { ProductCard } from '../components/ProductCard';
import {
  Search,
  Filter,
  Grid,
  List,
  RotateCcw,
  SlidersHorizontal,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    searchQuery,
    setSearchQuery,
  } = useCatalog();

  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [priceTypeFilter, setPriceTypeFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [onlyNew, setOnlyNew] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('default');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(20000);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 24;

  // Collect unique colors across products
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      (p.colors || []).forEach(c => set.add(c));
    });
    return Array.from(set);
  }, [products]);

  // Selected Category Object
  const currentCategoryObj = useMemo(() => {
    return categories.find(c => c.id === selectedCategory);
  }, [categories, selectedCategory]);

  // Available Subcategories
  const currentSubcategories = useMemo(() => {
    if (!currentCategoryObj) return [];
    return currentCategoryObj.subcategories || [];
  }, [currentCategoryObj]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'Yayında') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSku = p.sku.toLowerCase().includes(query);
        if (!matchName && !matchSku) return false;
      }

      if (selectedCategory && p.categoryId !== selectedCategory) return false;
      if (selectedSubcategory && p.subcategoryId !== selectedSubcategory) return false;
      if (priceTypeFilter !== 'all' && p.priceType !== priceTypeFilter) return false;
      if (stockFilter !== 'all' && p.stockStatus !== stockFilter) return false;
      if (selectedColor !== 'all' && !p.colors?.includes(selectedColor)) return false;
      if (onlyFeatured && !p.featured) return false;
      if (onlyNew && !p.isNew) return false;
      if (p.price && p.price > maxPriceLimit) return false;

      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortOption === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name, 'tr');
      if (sortOption === 'sku-asc') return a.sku.localeCompare(b.sku, 'tr');
      return a.sortOrder - b.sortOrder;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    priceTypeFilter,
    stockFilter,
    selectedColor,
    onlyFeatured,
    onlyNew,
    maxPriceLimit,
    sortOption,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    priceTypeFilter,
    stockFilter,
    selectedColor,
    onlyFeatured,
    onlyNew,
    maxPriceLimit,
    sortOption,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
    setPriceTypeFilter('all');
    setStockFilter('all');
    setSelectedColor('all');
    setOnlyFeatured(false);
    setOnlyNew(false);
    setMaxPriceLimit(20000);
    setSortOption('default');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Page Header */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-red-500 text-xs font-mono font-bold uppercase tracking-wider">
            Ürün Kataloğu
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            {currentCategoryObj ? currentCategoryObj.name : 'Tüm Antrenman Ekipmanları'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Toplam <strong className="text-white font-black">{filteredProducts.length}</strong> ürün listeleniyor.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Ürün adı, Stok Kodu (SKU) veya kategori ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Subcategory Pills */}
      {currentSubcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedSubcategory(null)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              selectedSubcategory === null
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Tüm Alt Kategoriler
          </button>
          {currentSubcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubcategory(sub.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                selectedSubcategory === sub.id
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Control Bar: View Toggle, Sort, Mobile Filter Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-4 h-4 text-slate-600" />
            Filtrele
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                layoutMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Görünümü"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                layoutMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Liste Görünümü"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Görünüm
          </span>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-2 ml-auto">
          <label htmlFor="sortSelect" className="text-xs font-bold text-slate-600">Sıralama:</label>
          <select
            id="sortSelect"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 py-2 pl-3 pr-8 focus:outline-none focus:border-teal-500"
          >
            <option value="default">Varsayılan Sıralama</option>
            <option value="newest">En Yeni</option>
            <option value="price-asc">Fiyat: Artan (En Düşük)</option>
            <option value="price-desc">Fiyat: Azalan (En Yüksek)</option>
            <option value="name-asc">Ürün Adına Göre (A-Z)</option>
            <option value="sku-asc">Ürün Koduna Göre (SCX A-Z)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className={`lg:col-span-3 space-y-6 ${
          mobileFilterOpen ? 'block' : 'hidden lg:block'
        }`}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                Detaylı Filtreler
              </h3>
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-teal-600 flex items-center gap-1 cursor-pointer"
                title="Sıfırla"
              >
                <RotateCcw className="w-3 h-3" />
                Sıfırla
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Kategori
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value || null);
                  setSelectedSubcategory(null);
                }}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 p-2.5 focus:outline-none focus:border-teal-500"
              >
                <option value="">Tüm Kategoriler ({products.length})</option>
                {categories.map((c) => {
                  const count = products.filter(p => p.categoryId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Price Type Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Fiyat Türü
              </label>
              <div className="space-y-1.5 text-xs font-medium">
                {['all', 'Tek Fiyatı', 'Set Fiyatı', 'Paket Fiyatı'].map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer text-slate-600 hover:text-slate-900">
                    <input
                      type="radio"
                      name="priceType"
                      checked={priceTypeFilter === type}
                      onChange={() => setPriceTypeFilter(type)}
                      className="accent-teal-600"
                    />
                    <span>{type === 'all' ? 'Tümü' : type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Maksimum Fiyat
                </label>
                <span className="text-xs font-black text-teal-700 font-mono bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {maxPriceLimit.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={20000}
                step={50}
                value={maxPriceLimit}
                onChange={(e) => setMaxPriceLimit(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            {/* Stock Status Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Stok Durumu
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 p-2.5 focus:outline-none focus:border-teal-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="Stokta Var">Stokta Var</option>
                <option value="Sınırlı Stok">Sınırlı Stok</option>
                <option value="Sipariş Üzerine">Sipariş Üzerine</option>
              </select>
            </div>

            {/* Color Filter Pills */}
            {availableColors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Renk Seçeneği
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedColor('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer border ${
                      selectedColor === 'all'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Tümü
                  </button>
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer border ${
                        selectedColor === color
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Featured / New Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-medium">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyFeatured}
                  onChange={(e) => setOnlyFeatured(e.target.checked)}
                  className="rounded accent-teal-600"
                />
                <span>Sadece Öne Çıkan Ürünler</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyNew}
                  onChange={(e) => setOnlyNew(e.target.checked)}
                  className="rounded accent-teal-600"
                />
                <span>Sadece Yeni Eklenen Ürünler</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid / List Section */}
        <main className="lg:col-span-9 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <PackageSearch className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Aradığınız Ürün Bulunamadı</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                Seçmiş olduğunuz filtre kriterlerine veya arama terimine uygun ürün bulunamadı. Filtreleri temizleyerek tekrar deneyebilirsiniz.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-5 py-2.5 bg-slate-900 hover:bg-teal-600 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <>
              <div
                className={
                  layoutMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} layout={layoutMode} />
                ))}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="text-xs font-semibold text-slate-500">
                    Toplam <span className="font-bold text-slate-900">{filteredProducts.length}</span> üründen{' '}
                    <span className="font-bold text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> -{' '}
                    <span className="font-bold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> arası gösteriliyor
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Önceki Sayfa"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Only show current, first, last, and near pages for clean UI
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 text-xs font-black rounded-xl transition-all cursor-pointer ${
                              currentPage === page
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        (page === 2 && currentPage > 3) ||
                        (page === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <span key={page} className="px-1 text-slate-400 font-bold text-xs">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Sonraki Sayfa"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
