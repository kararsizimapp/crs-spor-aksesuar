import React, { useState } from 'react';
import { Product, StockStatus, PriceType } from '../../types';
import { useCatalog } from '../../context/CatalogContext';
import { matchProduct } from '../../utils/searchUtils';
import {
  X,
  Save,
  CheckCircle,
  Tag,
  FolderTree,
  DollarSign,
  Percent,
  Layers,
  ListFilter,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Loader2,
  Check,
  Package,
  Award,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Eye,
  Image as ImageIcon,
  CheckSquare,
} from 'lucide-react';

interface AdminBatchEditModalProps {
  selectedIds: string[];
  onClose: () => void;
}

export const AdminBatchEditModal: React.FC<AdminBatchEditModalProps> = ({
  selectedIds,
  onClose,
}) => {
  const { products, categories, updateProductsBulk, addProduct, showNotification } = useCatalog();

  // Mode: 'table' (inline row editing list) or 'bulk_apply' (apply 1 value to all selected)
  const [activeMode, setActiveMode] = useState<'table' | 'bulk_apply'>('table');

  // Filter selected product objects, or fallback to all if empty
  const initialProducts = selectedIds.length > 0
    ? products.filter((p) => selectedIds.includes(p.id))
    : products.slice(0, 30);

  // Search & Filter state inside modal
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Editable row IDs list (allows adding new temporary rows as well)
  const [productRows, setProductRows] = useState<Product[]>(initialProducts);

  // --- MODE 1: TABLE INLINE EDIT STATE ---
  const [tableData, setTableData] = useState<{ [id: string]: Partial<Product> }>(() => {
    const initial: { [id: string]: Partial<Product> } = {};
    initialProducts.forEach((p) => {
      initial[p.id] = {
        name: p.name,
        sku: p.sku,
        brand: p.brand || '',
        categoryId: p.categoryId,
        subcategoryId: p.subcategoryId || '',
        price: p.price,
        discountPrice: p.discountPrice,
        priceType: p.priceType || 'Tek Fiyatı',
        showPrice: p.showPrice !== false,
        taxStatus: p.taxStatus || 'KDV Dahil',
        vatRate: p.vatRate || p.taxRate || 20,
        stockStatus: p.stockStatus || 'Stokta Var',
        status: p.status || 'Yayında',
        featured: p.featured || p.isFeatured || false,
        isNew: p.isNew || p.isNewArrival || false,
        coverImage: p.coverImage || p.imageUrl || '',
      };
    });
    return initial;
  });

  const handleTableFieldChange = (id: string, field: keyof Product, value: any) => {
    setTableData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Quick column helper: set tax status for all rows in table
  const handleSetAllTaxStatus = (status: 'KDV Dahil' | 'KDV Hariç') => {
    setTableData((prev) => {
      const updated = { ...prev };
      productRows.forEach((p) => {
        updated[p.id] = {
          ...updated[p.id],
          taxStatus: status,
        };
      });
      return updated;
    });
    showNotification(`Tablodaki tüm ürünler "${status}" olarak ayarlandı.`);
  };

  // Quick column helper: set VAT rate for all rows in table
  const handleSetAllVatRate = (rate: number) => {
    setTableData((prev) => {
      const updated = { ...prev };
      productRows.forEach((p) => {
        updated[p.id] = {
          ...updated[p.id],
          vatRate: rate,
          taxRate: rate,
        };
      });
      return updated;
    });
    showNotification(`Tablodaki tüm ürünlerin KDV oranı %${rate} olarak ayarlandı.`);
  };

  // Quick helper: Add brand new product row to table
  const handleAddNewRow = () => {
    const tempId = `new-temp-${Date.now()}`;
    const autoSku = `SCX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProduct: Product = {
      id: tempId,
      name: '',
      sku: autoSku,
      slug: '',
      brand: '',
      categoryId: categories[0]?.id || 'cat-1',
      subcategoryId: '',
      price: 0,
      discountPrice: null,
      currency: 'TRY',
      priceType: 'Tek Fiyatı',
      showPrice: true,
      taxStatus: 'KDV Dahil',
      vatRate: 20,
      taxRate: 20,
      stockStatus: 'Stokta Var',
      status: 'Yayında',
      featured: false,
      isNew: true,
      coverImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
      images: ['https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80'],
      shortDescription: '',
      description: '',
      specifications: [],
      sortOrder: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProductRows((prev) => [newProduct, ...prev]);
    setTableData((prev) => ({
      ...prev,
      [tempId]: {
        name: '',
        sku: autoSku,
        brand: '',
        categoryId: categories[0]?.id || 'cat-1',
        subcategoryId: '',
        price: null,
        discountPrice: null,
        priceType: 'Tek Fiyatı',
        taxStatus: 'KDV Dahil',
        vatRate: 20,
        stockStatus: 'Stokta Var',
        status: 'Yayında',
        featured: false,
        isNew: true,
        coverImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
      },
    }));
    showNotification('Tabloya yeni ürün satırı eklendi.');
  };

  const handleRemoveRow = (id: string) => {
    setProductRows((prev) => prev.filter((p) => p.id !== id));
    setTableData((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // --- MODE 2: BULK APPLY FIELDS STATE ---
  const [applyBrandEnabled, setApplyBrandEnabled] = useState(false);
  const [applyBrand, setApplyBrand] = useState('');

  const [applyCatEnabled, setApplyCatEnabled] = useState(false);
  const [applyCatId, setApplyCatId] = useState(categories[0]?.id || '');
  const [applySubcatId, setApplySubcatId] = useState('');

  const [applyPriceEnabled, setApplyPriceEnabled] = useState(false);
  const [priceActionType, setPriceActionType] = useState<'fixed' | 'percent_increase' | 'percent_decrease'>('fixed');
  const [priceValue, setPriceValue] = useState<string>('');

  const [applyDiscountEnabled, setApplyDiscountEnabled] = useState(false);
  const [discountValue, setDiscountValue] = useState<string>('');

  const [applyPriceTypeEnabled, setApplyPriceTypeEnabled] = useState(false);
  const [applyPriceType, setApplyPriceType] = useState<PriceType>('Tek Fiyatı');

  const [applyVatEnabled, setApplyVatEnabled] = useState(false);
  const [applyTaxStatus, setApplyTaxStatus] = useState<'KDV Dahil' | 'KDV Hariç'>('KDV Dahil');
  const [applyVatRate, setApplyVatRate] = useState<number>(20);

  const [applyStockEnabled, setApplyStockEnabled] = useState(false);
  const [applyStockStatus, setApplyStockStatus] = useState<StockStatus>('Stokta Var');

  const [applyPublishEnabled, setApplyPublishEnabled] = useState(false);
  const [applyPublished, setApplyPublished] = useState<'Yayında' | 'Taslak' | 'Pasif'>('Yayında');

  const [applyFeaturedEnabled, setApplyFeaturedEnabled] = useState(false);
  const [applyFeatured, setApplyFeatured] = useState<boolean>(true);

  const [isSaving, setIsSaving] = useState(false);

  // SAVE HANDLER FOR TABLE INLINE EDIT
  const handleSaveTableEdits = async () => {
    setIsSaving(true);
    try {
      // Split between existing products and brand new temp rows
      const existingUpdates: { [id: string]: Partial<Product> } = {};
      const newItemsToAdd: any[] = [];

      for (const [id, fields] of Object.entries(tableData)) {
        const item = fields as Partial<Product>;
        if (id.startsWith('new-temp-')) {
          if (item.name && item.name.trim() !== '') {
            newItemsToAdd.push({
              name: item.name.trim(),
              sku: item.sku?.trim() || `SCX-${Math.floor(1000 + Math.random() * 9000)}`,
              slug: '',
              brand: item.brand?.trim() || undefined,
              categoryId: item.categoryId || categories[0]?.id,
              subcategoryId: item.subcategoryId || undefined,
              price: item.price && !isNaN(item.price) ? item.price : null,
              discountPrice: item.discountPrice && !isNaN(item.discountPrice) ? item.discountPrice : null,
              currency: 'TRY',
              priceType: item.priceType || 'Tek Fiyatı',
              showPrice: true,
              taxStatus: item.taxStatus || 'KDV Dahil',
              vatRate: item.vatRate || 20,
              taxRate: item.vatRate || 20,
              stockStatus: item.stockStatus || 'Stokta Var',
              status: item.status || 'Yayında',
              featured: item.featured || false,
              isNew: item.isNew || false,
              coverImage: item.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
              imageUrl: item.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
              images: [item.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80'],
              shortDescription: `${item.name.trim()} spor ve antrenman ekipmanı.`,
              description: `${item.name.trim()} profesyonel kulüp ve antrenman kullanımı için tasarlanmıştır.`,
              specifications: [],
              sortOrder: 0,
            });
          }
        } else {
          existingUpdates[id] = {
            ...item,
            taxRate: item.vatRate,
          };
        }
      }

      // 1. Update existing products
      if (Object.keys(existingUpdates).length > 0) {
        await updateProductsBulk(existingUpdates);
      }

      // 2. Insert new products if any were added in table
      for (const newItem of newItemsToAdd) {
        await addProduct(newItem);
      }

      const totalCount = Object.keys(existingUpdates).length + newItemsToAdd.length;
      showNotification(`${totalCount} adet ürünün değişiklikleri ve yeni kayıtları başarıyla kaydedildi!`);
      onClose();
    } catch (err) {
      console.error(err);
      showNotification('Güncelleme sırasında bir hata oluştu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // SAVE HANDLER FOR BULK FIELD APPLY
  const handleSaveBulkApply = async () => {
    if (
      !applyBrandEnabled &&
      !applyCatEnabled &&
      !applyPriceEnabled &&
      !applyDiscountEnabled &&
      !applyPriceTypeEnabled &&
      !applyVatEnabled &&
      !applyStockEnabled &&
      !applyPublishEnabled &&
      !applyFeaturedEnabled
    ) {
      showNotification('Lütfen uygulamak istediğiniz en az bir alanı seçin.', 'info');
      return;
    }

    setIsSaving(true);
    try {
      const updatesMap: { [id: string]: Partial<Product> } = {};

      productRows.forEach((p) => {
        const updates: Partial<Product> = {};

        if (applyBrandEnabled) {
          updates.brand = applyBrand.trim();
        }

        if (applyCatEnabled) {
          updates.categoryId = applyCatId;
          updates.subcategoryId = applySubcatId || undefined;
        }

        if (applyPriceEnabled) {
          const numVal = parseFloat(priceValue.replace(',', '.'));
          if (!isNaN(numVal)) {
            if (priceActionType === 'fixed') {
              updates.price = numVal;
            } else if (priceActionType === 'percent_increase' && p.price) {
              updates.price = Math.round(p.price * (1 + numVal / 100) * 100) / 100;
            } else if (priceActionType === 'percent_decrease' && p.price) {
              updates.price = Math.max(0, Math.round(p.price * (1 - numVal / 100) * 100) / 100);
            }
          }
        }

        if (applyDiscountEnabled) {
          const numVal = parseFloat(discountValue.replace(',', '.'));
          updates.discountPrice = !isNaN(numVal) && numVal > 0 ? numVal : null;
        }

        if (applyPriceTypeEnabled) {
          updates.priceType = applyPriceType;
        }

        if (applyVatEnabled) {
          updates.taxStatus = applyTaxStatus;
          updates.vatRate = applyVatRate;
          updates.taxRate = applyVatRate;
        }

        if (applyStockEnabled) {
          updates.stockStatus = applyStockStatus;
        }

        if (applyPublishEnabled) {
          updates.status = applyPublished;
        }

        if (applyFeaturedEnabled) {
          updates.featured = applyFeatured;
        }

        updatesMap[p.id] = updates;
      });

      await updateProductsBulk(updatesMap);
      showNotification(`${productRows.length} ürüne toplu ayarlar başarıyla uygulandı.`);
      onClose();
    } catch (err) {
      console.error(err);
      showNotification('Toplu işlem sırasında bir hata oluştu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered rows for display
  const displayedRows = productRows.filter((p) => {
    const r = tableData[p.id] || p;
    const mergedProduct: Product = {
      ...p,
      name: r.name !== undefined ? r.name : p.name,
      sku: r.sku !== undefined ? r.sku : p.sku,
      brand: r.brand !== undefined ? r.brand : p.brand,
      categoryId: r.categoryId !== undefined ? r.categoryId : p.categoryId,
    };

    if (searchQuery.trim()) {
      const score = matchProduct(mergedProduct, searchQuery, categories);
      if (score <= 0) return false;
    }

    const matchesCategory = !categoryFilter || mergedProduct.categoryId === categoryFilter;
    return matchesCategory;
  });

  const selectedCatObj = categories.find((c) => c.id === applyCatId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Hızlı Düzenleme & Toplu Ürün Paneli</h2>
                <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-[11px] font-bold">
                  {productRows.length} Ürün Listede
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                KDV Dahil/Hariç, KDV oranı, fiyat, stok ve kategori dahil tüm ürün özelliklerini tek tabloda hızlıca güncelleyin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs & Global Quick Actions */}
        <div className="bg-slate-900 px-6 pt-3 pb-0 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveMode('table')}
              className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'table'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ListFilter className="w-4 h-4 text-teal-600" />
              <span>Listeden Tablo Halinde Düzenle ({productRows.length})</span>
            </button>

            <button
              onClick={() => setActiveMode('bulk_apply')}
              className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'bulk_apply'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-amber-500" />
              <span>Tüm Seçilenlere Toplu Değer Uygula</span>
            </button>
          </div>

          {activeMode === 'table' && (
            <div className="flex items-center gap-2 pb-2">
              <button
                type="button"
                onClick={handleAddNewRow}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Yeni Ürün Satırı Ekle</span>
              </button>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* MODE 1: INLINE ROW TABLE EDITING */}
          {activeMode === 'table' && (
            <div className="space-y-4">
              {/* Quick Filter & Global Preset Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tabloda ürün adı, SKU veya marka ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-teal-500"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Column Auto-fill helpers */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Hızlı KDV:</span>
                  <button
                    type="button"
                    onClick={() => handleSetAllTaxStatus('KDV Dahil')}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-black cursor-pointer"
                  >
                    Tümü KDV Dahil
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllTaxStatus('KDV Hariç')}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-black cursor-pointer"
                  >
                    Tümü KDV Hariç (+KDV)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllVatRate(20)}
                    className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[11px] font-black cursor-pointer"
                  >
                    Tümü %20 KDV
                  </button>
                </div>
              </div>

              {/* Editable Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto max-h-[55vh]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-950 text-white font-bold sticky top-0 z-10">
                      <tr className="border-b border-slate-800 text-[11px]">
                        <th className="p-3 w-10 text-center">Görsel</th>
                        <th className="p-3 min-w-[180px]">Ürün Adı *</th>
                        <th className="p-3 w-28">SKU / Kod *</th>
                        <th className="p-3 w-28">Marka</th>
                        <th className="p-3 w-36">Kategori</th>
                        <th className="p-3 w-28">Fiyat (₺)</th>
                        <th className="p-3 w-28">Satış Fiyatı (₺)</th>
                        <th className="p-3 w-32 bg-teal-950 text-teal-300">KDV Durumu *</th>
                        <th className="p-3 w-28 bg-teal-950 text-teal-300">KDV Oranı *</th>
                        <th className="p-3 w-32">Fiyat Tipi</th>
                        <th className="p-3 w-32">Stok Durumu</th>
                        <th className="p-3 w-28">Yayın</th>
                        <th className="p-3 w-12 text-center">Sil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedRows.map((p) => {
                        const row = tableData[p.id] || {};
                        const rowCat = categories.find((c) => c.id === row.categoryId);
                        const isNewTemp = p.id.startsWith('new-temp-');

                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isNewTemp ? 'bg-teal-50/40 border-l-4 border-l-teal-500' : ''
                            }`}
                          >
                            {/* Image thumbnail & quick change */}
                            <td className="p-2 text-center">
                              <div className="relative group mx-auto w-9 h-9">
                                <img
                                  src={row.coverImage || p.imageUrl || p.coverImage || 'https://via.placeholder.com/100'}
                                  alt=""
                                  className="w-9 h-9 object-cover rounded-lg border border-slate-200 mx-auto"
                                />
                              </div>
                            </td>

                            {/* Name */}
                            <td className="p-2">
                              <input
                                type="text"
                                placeholder="Ürün adı giriniz"
                                value={row.name || ''}
                                onChange={(e) => handleTableFieldChange(p.id, 'name', e.target.value)}
                                className={`w-full p-2 bg-white border rounded-lg text-xs font-bold text-slate-900 focus:outline-teal-500 ${
                                  !row.name ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
                                }`}
                              />
                            </td>

                            {/* SKU */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.sku || ''}
                                onChange={(e) => handleTableFieldChange(p.id, 'sku', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase focus:outline-teal-500"
                              />
                            </td>

                            {/* Brand */}
                            <td className="p-2">
                              <input
                                type="text"
                                placeholder="Örn: SCX"
                                value={row.brand || ''}
                                onChange={(e) => handleTableFieldChange(p.id, 'brand', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase focus:outline-teal-500 text-amber-900"
                              />
                            </td>

                            {/* Category */}
                            <td className="p-2">
                              <select
                                value={row.categoryId || ''}
                                onChange={(e) => handleTableFieldChange(p.id, 'categoryId', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-teal-500 font-semibold text-slate-800"
                              >
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Price */}
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={row.price !== undefined && row.price !== null ? row.price : ''}
                                onChange={(e) =>
                                  handleTableFieldChange(
                                    p.id,
                                    'price',
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-teal-500"
                              />
                            </td>

                            {/* Discount Price */}
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={
                                  row.discountPrice !== undefined && row.discountPrice !== null
                                    ? row.discountPrice
                                    : ''
                                }
                                onChange={(e) =>
                                  handleTableFieldChange(
                                    p.id,
                                    'discountPrice',
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:outline-teal-500"
                              />
                            </td>

                            {/* KDV STATUS (Dahil / Hariç) - USER HIGHLIGHTED REQUIREMENT */}
                            <td className="p-2 bg-teal-50/20">
                              <select
                                value={row.taxStatus || 'KDV Dahil'}
                                onChange={(e) => handleTableFieldChange(p.id, 'taxStatus', e.target.value)}
                                className={`w-full p-2 rounded-lg text-xs font-black border focus:outline-teal-500 cursor-pointer ${
                                  row.taxStatus === 'KDV Hariç'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                }`}
                              >
                                <option value="KDV Dahil">✓ KDV Dahil</option>
                                <option value="KDV Hariç">+ KDV Hariç</option>
                              </select>
                            </td>

                            {/* VAT RATE */}
                            <td className="p-2 bg-teal-50/20">
                              <select
                                value={row.vatRate !== undefined ? row.vatRate : 20}
                                onChange={(e) => handleTableFieldChange(p.id, 'vatRate', Number(e.target.value))}
                                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-teal-500 cursor-pointer"
                              >
                                <option value={20}>%20 KDV</option>
                                <option value={10}>%10 KDV</option>
                                <option value={1}>%1 KDV</option>
                                <option value={0}>%0 (Muaf)</option>
                              </select>
                            </td>

                            {/* Price Type */}
                            <td className="p-2">
                              <select
                                value={row.priceType || 'Tek Fiyatı'}
                                onChange={(e) => handleTableFieldChange(p.id, 'priceType', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-teal-500 cursor-pointer"
                              >
                                <option value="Tek Fiyatı">Tek Fiyatı</option>
                                <option value="Set Fiyatı">Set Fiyatı</option>
                                <option value="Paket Fiyatı">Paket Fiyatı</option>
                                <option value="Çift Fiyatı">Çift Fiyatı</option>
                                <option value="Adet Fiyatı">Adet Fiyatı</option>
                              </select>
                            </td>

                            {/* Stock Status */}
                            <td className="p-2">
                              <select
                                value={row.stockStatus || 'Stokta Var'}
                                onChange={(e) => handleTableFieldChange(p.id, 'stockStatus', e.target.value)}
                                className={`w-full p-2 rounded-lg text-xs font-bold border focus:outline-teal-500 cursor-pointer ${
                                  row.stockStatus === 'Stokta Var'
                                    ? 'bg-emerald-50/60 text-emerald-800 border-emerald-200'
                                    : row.stockStatus === 'Stokta Yok'
                                    ? 'bg-rose-50/60 text-rose-800 border-rose-200'
                                    : 'bg-amber-50/60 text-amber-800 border-amber-200'
                                }`}
                              >
                                <option value="Stokta Var">Stokta Var</option>
                                <option value="Stokta Yok">Stokta Yok</option>
                                <option value="Sınırlı Stok">Sınırlı Stok</option>
                                <option value="Sipariş Üzerine">Sipariş Üzerine</option>
                                <option value="Ön Sipariş">Ön Sipariş</option>
                              </select>
                            </td>

                            {/* Status (Publish) */}
                            <td className="p-2">
                              <select
                                value={row.status || 'Yayında'}
                                onChange={(e) => handleTableFieldChange(p.id, 'status', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-teal-500 cursor-pointer"
                              >
                                <option value="Yayında">Yayında</option>
                                <option value="Taslak">Taslak</option>
                                <option value="Pasif">Pasif</option>
                              </select>
                            </td>

                            {/* Delete / Remove row */}
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(p.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Satırı Tablodan Kaldır"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Helper */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
                  <div>
                    Toplam <strong>{displayedRows.length}</strong> ürün listeleniyor ({productRows.length} toplam kayıt)
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewRow}
                    className="text-teal-700 hover:text-teal-900 font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Tabloya Yeni Ürün Satırı Ekle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: BULK APPLY TO ALL SELECTED */}
          {activeMode === 'bulk_apply' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl text-xs text-teal-950 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span>
                  İşaretlediğiniz alanlar, tablodaki <strong>{productRows.length} adet ürünün</strong> tamamına tek tıklamayla uygulanacaktır. İşaretlenmeyen alanlar değiştirilmeyecektir.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* KDV STATUS & RATE (CORE HIGHLIGHT) */}
                <div className={`p-4 rounded-2xl border transition-all md:col-span-2 ${applyVatEnabled ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/10' : 'bg-slate-100/70 border-slate-200 opacity-80'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 mb-3">
                    <input
                      type="checkbox"
                      checked={applyVatEnabled}
                      onChange={(e) => setApplyVatEnabled(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                    <Percent className="w-4 h-4 text-sky-600" />
                    <span className="text-sm font-black text-teal-900">KDV Dahil / Hariç Durumu ve KDV Oranı Toplu Güncelle</span>
                  </label>
                  {applyVatEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          KDV Dahil / Hariç Ayarı
                        </label>
                        <select
                          value={applyTaxStatus}
                          onChange={(e) => setApplyTaxStatus(e.target.value as any)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-800"
                        >
                          <option value="KDV Dahil">KDV Dahil (Fiyata KDV ekli)</option>
                          <option value="KDV Hariç">KDV Hariç (+ KDV faturalandırılacak)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          KDV Oranı (%)
                        </label>
                        <select
                          value={applyVatRate}
                          onChange={(e) => setApplyVatRate(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-800"
                        >
                          <option value={20}>%20 KDV Standardı</option>
                          <option value={10}>%10 KDV</option>
                          <option value={1}>%1 KDV</option>
                          <option value={0}>%0 KDV (Muaf)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Brand */}
                <div className={`p-4 rounded-2xl border transition-all ${applyBrandEnabled ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/10' : 'bg-slate-100/70 border-slate-200 opacity-80'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 mb-3">
                    <input
                      type="checkbox"
                      checked={applyBrandEnabled}
                      onChange={(e) => setApplyBrandEnabled(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Marka Güncelle</span>
                  </label>
                  {applyBrandEnabled && (
                    <input
                      type="text"
                      placeholder="Örn: SCX SPOR, ADIDAS"
                      value={applyBrand}
                      onChange={(e) => setApplyBrand(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold uppercase focus:border-teal-500 focus:outline-none"
                    />
                  )}
                </div>

                {/* Category */}
                <div className={`p-4 rounded-2xl border transition-all ${applyCatEnabled ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/10' : 'bg-slate-100/70 border-slate-200 opacity-80'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 mb-3">
                    <input
                      type="checkbox"
                      checked={applyCatEnabled}
                      onChange={(e) => setApplyCatEnabled(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                    <FolderTree className="w-4 h-4 text-indigo-500" />
                    <span>Kategori Değiştir</span>
                  </label>
                  {applyCatEnabled && (
                    <div className="space-y-2">
                      <select
                        value={applyCatId}
                        onChange={(e) => {
                          setApplyCatId(e.target.value);
                          setApplySubcatId('');
                        }}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:border-teal-500 focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      {selectedCatObj?.subcategories && selectedCatObj.subcategories.length > 0 && (
                        <select
                          value={applySubcatId}
                          onChange={(e) => setApplySubcatId(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-teal-500 focus:outline-none"
                        >
                          <option value="">-- Bütün Alt Kategoriler (Tüm Liste) --</option>
                          {selectedCatObj.subcategories.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Adjustment */}
                <div className={`p-4 rounded-2xl border transition-all ${applyPriceEnabled ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/10' : 'bg-slate-100/70 border-slate-200 opacity-80'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 mb-3">
                    <input
                      type="checkbox"
                      checked={applyPriceEnabled}
                      onChange={(e) => setApplyPriceEnabled(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Fiyat Güncelleme / Zam & İndirim</span>
                  </label>
                  {applyPriceEnabled && (
                    <div className="space-y-2">
                      <select
                        value={priceActionType}
                        onChange={(e) => setPriceActionType(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:border-teal-500"
                      >
                        <option value="fixed">Sabit Fiyat Belirle (₺)</option>
                        <option value="percent_increase">Mevcut Fiyata Yüzde Zam Ekle (+%)</option>
                        <option value="percent_decrease">Mevcut Fiyata Yüzde İndirim Yap (-%)</option>
                      </select>

                      <input
                        type="number"
                        step="0.01"
                        placeholder={priceActionType === 'fixed' ? 'Örn: 250.00' : 'Örn: 10 (%10 zam)'}
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Discount Price */}
                <div className={`p-4 rounded-2xl border transition-all ${applyDiscountEnabled ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/10' : 'bg-slate-100/70 border-slate-200 opacity-80'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 mb-3">
                    <input
                      type="checkbox"
                      checked={applyDiscountEnabled}
                      onChange={(e) => setApplyDiscountEnabled(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                    <Percent className="w-4 h-4 text-rose-500" />
                    <span>İndirimli / Satış Fiyatı Belirle</span>
                  </label>
                  {applyDiscountEnabled && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Örn: 199.00 (Kaldırmak için boş bırakın)"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-rose-600 focus:border-teal-500 focus:outline-none"
                    />
                  )}
                </div>

                {/* Price Type */}
                <div className={`p-4 rounded-2xl border transition-all ${applyPriceTypeEnabled ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/10' : 'bg-slate-100/70 border-slate-200 opacity-80'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 mb-3">
                    <input
                      type="checkbox"
                      checked={applyPriceTypeEnabled}
                      onChange={(e) => setApplyPriceTypeEnabled(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                    <Tag className="w-4 h-4 text-purple-500" />
                    <span>Fiyat Türü / Birimi Belirle</span>
                  </label>
                  {applyPriceTypeEnabled && (
                    <select
                      value={applyPriceType}
                      onChange={(e) => setApplyPriceType(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="Tek Fiyatı">Tek Fiyatı</option>
                      <option value="Set Fiyatı">Set Fiyatı</option>
                      <option value="Paket Fiyatı">Paket Fiyatı</option>
                      <option value="Çift Fiyatı">Çift Fiyatı</option>
                      <option value="Adet Fiyatı">Adet Fiyatı</option>
                    </select>
                  )}
                </div>

                {/* Stock Status */}
                <div className={`p-4 rounded-2xl border transition-all ${applyStockEnabled ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/10' : 'bg-slate-100/70 border-slate-200 opacity-80'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 mb-3">
                    <input
                      type="checkbox"
                      checked={applyStockEnabled}
                      onChange={(e) => setApplyStockEnabled(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                    <Package className="w-4 h-4 text-purple-500" />
                    <span>Stok Durumu Belirle</span>
                  </label>
                  {applyStockEnabled && (
                    <select
                      value={applyStockStatus}
                      onChange={(e) => setApplyStockStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="Stokta Var">Stokta Var</option>
                      <option value="Stokta Yok">Stokta Yok</option>
                      <option value="Sınırlı Stok">Sınırlı Stok</option>
                      <option value="Sipariş Üzerine">Sipariş Üzerine</option>
                      <option value="Ön Sipariş">Ön Sipariş</option>
                    </select>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-600">
            {productRows.length} ürün listelendi
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
            >
              Vazgeç
            </button>

            {activeMode === 'table' ? (
              <button
                type="button"
                onClick={handleSaveTableEdits}
                disabled={isSaving}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Tüm Değişiklikleri Kaydet ({productRows.length} Ürün)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveBulkApply}
                disabled={isSaving}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uygulanıyor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Toplu Değerleri Uygula ve Kaydet ({productRows.length} Ürün)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
