import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types';
import { useCatalog } from '../../context/CatalogContext';
import { getProductImage, formatPrice, DEFAULT_FALLBACK_IMAGE } from '../../utils/formatters';
import { matchProduct } from '../../utils/searchUtils';
import {
  X,
  Save,
  ArrowUpDown,
  Search,
  FolderTree,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Hash,
  ArrowDownAZ,
  ArrowUpZA,
  DollarSign,
  Calendar,
  Loader2,
} from 'lucide-react';

interface AdminQuickSortModalProps {
  initialCategoryId?: string | null;
  onClose: () => void;
}

export const AdminQuickSortModal: React.FC<AdminQuickSortModalProps> = ({
  initialCategoryId,
  onClose,
}) => {
  const { products, categories, reorderProducts, showNotification } = useCatalog();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Local working copy of product IDs in active order
  const [orderedProductIds, setOrderedProductIds] = useState<string[]>([]);
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Initialize sorted list based on current products and category
  useEffect(() => {
    const sorted = [...products].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setOrderedProductIds(sorted.map((p) => p.id));
    setHasChanges(false);
  }, [products]);

  // Map product objects in their currently reordered sequence
  const currentOrderedProducts = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return orderedProductIds
      .map((id) => map.get(id))
      .filter(Boolean) as Product[];
  }, [products, orderedProductIds]);

  // Filtered view according to selected category and search query
  const visibleProducts = useMemo(() => {
    return currentOrderedProducts.filter((p) => {
      if (selectedCategory && p.categoryId !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const score = matchProduct(p, searchQuery, categories);
        if (score <= 0) return false;
      }
      return true;
    });
  }, [currentOrderedProducts, selectedCategory, searchQuery, categories]);

  // Move an item within the master list
  const moveItem = (productId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    // Determine the active scope (visible items or entire list)
    const scope = visibleProducts.map((p) => p.id);
    const scopeIndex = scope.indexOf(productId);
    if (scopeIndex === -1) return;

    let targetScopeIndex = scopeIndex;
    if (direction === 'up') targetScopeIndex = Math.max(0, scopeIndex - 1);
    if (direction === 'down') targetScopeIndex = Math.min(scope.length - 1, scopeIndex + 1);
    if (direction === 'top') targetScopeIndex = 0;
    if (direction === 'bottom') targetScopeIndex = scope.length - 1;

    if (targetScopeIndex === scopeIndex) return;

    const targetProductId = scope[targetScopeIndex];

    // Find indices in global orderedProductIds
    const globalFrom = orderedProductIds.indexOf(productId);
    const globalTo = orderedProductIds.indexOf(targetProductId);

    if (globalFrom === -1 || globalTo === -1) return;

    const newIds = [...orderedProductIds];
    const [moved] = newIds.splice(globalFrom, 1);
    newIds.splice(globalTo, 0, moved);

    setOrderedProductIds(newIds);
    setHasChanges(true);
  };

  // Jump to specific rank number directly
  const handleDirectRankChange = (productId: string, targetRankNumber: number) => {
    if (isNaN(targetRankNumber) || targetRankNumber < 1) return;
    const scope = visibleProducts.map((p) => p.id);
    const clampedIndex = Math.min(scope.length - 1, Math.max(0, targetRankNumber - 1));
    const targetProductId = scope[clampedIndex];
    if (!targetProductId || targetProductId === productId) return;

    const globalFrom = orderedProductIds.indexOf(productId);
    const globalTo = orderedProductIds.indexOf(targetProductId);
    if (globalFrom === -1 || globalTo === -1) return;

    const newIds = [...orderedProductIds];
    const [moved] = newIds.splice(globalFrom, 1);
    newIds.splice(globalTo, 0, moved);

    setOrderedProductIds(newIds);
    setHasChanges(true);
  };

  // Preset Auto-Sort templates
  const applyPresetSort = (
    mode: 'name_asc' | 'name_desc' | 'sku_asc' | 'price_asc' | 'price_desc' | 'newest' | 'category'
  ) => {
    // If a category is selected, sort only within that category and keep others intact
    const targetProducts = selectedCategory
      ? currentOrderedProducts.filter((p) => p.categoryId === selectedCategory)
      : [...currentOrderedProducts];

    const sorted = [...targetProducts].sort((a, b) => {
      if (mode === 'name_asc') return a.name.localeCompare(b.name, 'tr');
      if (mode === 'name_desc') return b.name.localeCompare(a.name, 'tr');
      if (mode === 'sku_asc') return a.sku.localeCompare(b.sku, 'tr', { numeric: true });
      if (mode === 'price_asc') return (a.price ?? 0) - (b.price ?? 0);
      if (mode === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
      if (mode === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (mode === 'category') {
        const catA = categories.find((c) => c.id === a.categoryId)?.name || '';
        const catB = categories.find((c) => c.id === b.categoryId)?.name || '';
        return catA.localeCompare(catB, 'tr') || a.name.localeCompare(b.name, 'tr');
      }
      return 0;
    });

    if (selectedCategory) {
      // Merge back: replace only category items in their positions
      const sortedIds = sorted.map((p) => p.id);
      let sortIdx = 0;
      const newGlobalIds = orderedProductIds.map((id) => {
        const p = products.find((prod) => prod.id === id);
        if (p && p.categoryId === selectedCategory) {
          const replacement = sortedIds[sortIdx];
          sortIdx++;
          return replacement;
        }
        return id;
      });
      setOrderedProductIds(newGlobalIds);
    } else {
      setOrderedProductIds(sorted.map((p) => p.id));
    }

    setHasChanges(true);
    showNotification('Sıralama şablonu uygulandı. Kaydetmek için "Kaydet & Uygula" butonuna basın.', 'info');
  };

  // Reset to original database sort
  const resetToDatabaseSort = () => {
    const sorted = [...products].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setOrderedProductIds(sorted.map((p) => p.id));
    setHasChanges(false);
    showNotification('Sıralama varsayılana sıfırlandı.');
  };

  // Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const draggedProduct = visibleProducts[draggedIndex];
    const targetProduct = visibleProducts[index];

    if (!draggedProduct || !targetProduct) return;

    const globalFrom = orderedProductIds.indexOf(draggedProduct.id);
    const globalTo = orderedProductIds.indexOf(targetProduct.id);

    if (globalFrom !== -1 && globalTo !== -1) {
      const newIds = [...orderedProductIds];
      const [moved] = newIds.splice(globalFrom, 1);
      newIds.splice(globalTo, 0, moved);
      setOrderedProductIds(newIds);
      setHasChanges(true);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Save changes to database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await reorderProducts(orderedProductIds);
      setHasChanges(false);
      onClose();
    } catch (err) {
      console.error('Error saving reordered products:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Hızlı Ürün Sıralama Modu
                </h2>
                {hasChanges && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded-full border border-amber-500/30 flex items-center gap-1 animate-pulse">
                    <AlertCircle className="w-3 h-3" /> Değişiklikler Kaydedilmedi
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Ürünlerin katalogdaki ve sitedeki gösterim sırasını sürükleyerek, oklarla veya tek tıkla şablonlarla hızla değiştirin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Category Filter & Auto Sort Presets */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex-shrink-0 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Category Selector */}
            <div className="sm:col-span-4 relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Kategori Seçimi
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-teal-600 shadow-2xs"
                >
                  <option value="">Tüm Ürünler ({products.length} Ürün)</option>
                  {categories.map((c) => {
                    const count = products.filter((p) => p.categoryId === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({count} Ürün)
                      </option>
                    );
                  })}
                </select>
                <FolderTree className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Search Filter */}
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Ürün Ara (İsim veya SKU)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Listede hızlı filtrele..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-teal-600 shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Reset Button */}
            <div className="sm:col-span-4 flex items-end justify-end">
              <button
                onClick={resetToDatabaseSort}
                disabled={!hasChanges}
                className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  hasChanges
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sıralamayı Sıfırla</span>
              </button>
            </div>
          </div>

          {/* Quick Auto-Sort Presets */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tek Tıkla Akıllı Sıralama:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => applyPresetSort('name_asc')}
                className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                title="Ürün ismine göre A'dan Z'ye sıralar"
              >
                <ArrowDownAZ className="w-3.5 h-3.5 text-teal-600" />
                <span>A → Z</span>
              </button>

              <button
                onClick={() => applyPresetSort('name_desc')}
                className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                title="Ürün ismine göre Z'den A'ya sıralar"
              >
                <ArrowUpZA className="w-3.5 h-3.5 text-teal-600" />
                <span>Z → A</span>
              </button>

              <button
                onClick={() => applyPresetSort('sku_asc')}
                className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                title="Ürün koduna (SKU) göre sıralar"
              >
                <Hash className="w-3.5 h-3.5 text-amber-600" />
                <span>SKU (Koda Göre)</span>
              </button>

              <button
                onClick={() => applyPresetSort('price_asc')}
                className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                title="Fiyata göre ucuzdan pahalıya"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fiyat (Artan)</span>
              </button>

              <button
                onClick={() => applyPresetSort('price_desc')}
                className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                title="Fiyata göre pahalıdan ucuza"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fiyat (Azalan)</span>
              </button>

              <button
                onClick={() => applyPresetSort('newest')}
                className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                title="En yeni eklenen ürünler en başta"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>En Yeniler</span>
              </button>

              {!selectedCategory && (
                <button
                  onClick={() => applyPresetSort('category')}
                  className="px-2.5 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                  title="Kategorilere göre gruplayarak sıralar"
                >
                  <FolderTree className="w-3.5 h-3.5 text-purple-600" />
                  <span>Kategoriye Göre</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Items List (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
          {visibleProducts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FolderTree className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-sm text-slate-600">Seçilen filtrede ürün bulunamadı.</p>
              <p className="text-xs text-slate-400 mt-1">Lütfen kategori veya arama terimini değiştirin.</p>
            </div>
          ) : (
            visibleProducts.map((p, idx) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              const rankNumber = idx + 1;
              const isDragging = draggedIndex === idx;
              const isOver = dragOverIndex === idx;

              return (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  className={`pt-2 first:pt-0 transition-all ${
                    isDragging ? 'opacity-40 scale-[0.98]' : ''
                  }`}
                >
                  <div
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isOver
                        ? 'bg-teal-50 border-teal-500 shadow-md ring-2 ring-teal-400'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs'
                    }`}
                  >
                    {/* Left: Drag Handle, Direct Rank Input, Thumbnail & Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Drag Handle */}
                      <div
                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors flex-shrink-0"
                        title="Sürükleyip Bırakarak Sırayı Değiştirin"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Rank Number & Direct Input */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[11px] font-black text-slate-400">#</span>
                        <input
                          type="number"
                          min={1}
                          max={visibleProducts.length}
                          defaultValue={rankNumber}
                          key={`rank-${p.id}-${rankNumber}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = parseInt((e.target as HTMLInputElement).value, 10);
                              handleDirectRankChange(p.id, val);
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (val !== rankNumber) {
                              handleDirectRankChange(p.id, val);
                            }
                          }}
                          className="w-12 py-1 px-1.5 text-center font-mono font-extrabold text-xs text-teal-900 bg-teal-50 border border-teal-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                          title="Sıra Numarası (Yazıp Enter'a basarak doğrudan o sıraya taşıyabilirsiniz)"
                        />
                      </div>

                      {/* Product Thumbnail */}
                      <img
                        src={getProductImage(p)}
                        alt={p.name}
                        className="w-11 h-11 object-cover rounded-xl border border-slate-200 flex-shrink-0 bg-slate-100"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                        }}
                      />

                      {/* Product SKU, Name & Category */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80 text-[11px]">
                            {p.sku}
                          </span>
                          {p.brand && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {p.brand}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500 font-medium truncate">
                            {cat?.name || 'Kategorisiz'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate mt-0.5">
                          {p.name}
                        </h4>
                      </div>

                      {/* Price Tag */}
                      <div className="hidden md:block text-right flex-shrink-0 pr-2">
                        <span className="font-bold text-slate-900 text-xs block">
                          {formatPrice(p.price, p.currency, p.showPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400">{p.priceType}</span>
                      </div>
                    </div>

                    {/* Right: Quick Move Buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                      {/* Top */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveItem(p.id, 'top')}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-transparent hover:border-teal-200"
                        title="En Başa Al"
                      >
                        <ChevronsUp className="w-4 h-4" />
                      </button>

                      {/* Up */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveItem(p.id, 'up')}
                        className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-slate-200 hover:border-teal-300 bg-white shadow-2xs"
                        title="1 Sıra Yukarı Taşı"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      {/* Down */}
                      <button
                        type="button"
                        disabled={idx === visibleProducts.length - 1}
                        onClick={() => moveItem(p.id, 'down')}
                        className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-slate-200 hover:border-teal-300 bg-white shadow-2xs"
                        title="1 Sıra Aşağı Taşı"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Bottom */}
                      <button
                        type="button"
                        disabled={idx === visibleProducts.length - 1}
                        onClick={() => moveItem(p.id, 'bottom')}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-transparent hover:border-teal-200"
                        title="En Sona Al"
                      >
                        <ChevronsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Save Action */}
        <div className="p-4 bg-slate-900 text-white flex-shrink-0 flex items-center justify-between border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-bold text-white">{visibleProducts.length}</span>
            <span>ürün listelendi.</span>
            {hasChanges && (
              <span className="text-amber-400 font-bold ml-2">
                (Değişikliklerin geçerli olması için kaydedin)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-teal-900/30 flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sıralama Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Sıralamayı Kaydet & Kataloğa Uygula</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
