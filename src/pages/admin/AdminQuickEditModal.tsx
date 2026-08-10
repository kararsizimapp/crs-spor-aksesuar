import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, StockStatus } from '../../types';
import { useCatalog } from '../../context/CatalogContext';
import {
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Tag,
  FolderTree,
  DollarSign,
  Percent,
  FileText,
  AlignLeft,
  Layers,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Package,
  Award,
} from 'lucide-react';

export type QuickEditTab =
  | 'brand'
  | 'name_sku'
  | 'category'
  | 'price'
  | 'vat'
  | 'short_desc'
  | 'full_desc'
  | 'variants';

interface AdminQuickEditModalProps {
  productId: string | null;
  initialTab?: QuickEditTab;
  onClose: () => void;
}

export const AdminQuickEditModal: React.FC<AdminQuickEditModalProps> = ({
  productId,
  initialTab = 'name_sku',
  onClose,
}) => {
  const { products, categories, updateProduct, showNotification } = useCatalog();

  const [currentId, setCurrentId] = useState<string | null>(productId || (products[0]?.id || null));
  const [activeTab, setActiveTab] = useState<QuickEditTab>(initialTab);

  const currentProduct = products.find(p => p.id === currentId);
  const currentIndex = products.findIndex(p => p.id === currentId);

  // Form local state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [price, setPrice] = useState<string>('');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [taxStatus, setTaxStatus] = useState<'KDV Dahil' | 'KDV Hariç'>('KDV Dahil');
  const [vatRate, setVatRate] = useState<number>(20);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  // Sync state when product changes
  useEffect(() => {
    if (currentProduct) {
      setName(currentProduct.name || '');
      setBrand(currentProduct.brand || '');
      setSku(currentProduct.sku || '');
      setCategoryId(currentProduct.categoryId || categories[0]?.id || '');
      setSubcategoryId(currentProduct.subcategoryId || '');
      setPrice(currentProduct.price !== undefined && currentProduct.price !== null ? String(currentProduct.price) : '');
      setDiscountPrice(currentProduct.discountPrice !== undefined && currentProduct.discountPrice !== null ? String(currentProduct.discountPrice) : '');
      setTaxStatus(currentProduct.taxStatus || 'KDV Dahil');
      setVatRate(currentProduct.vatRate || currentProduct.taxRate || 20);
      setShortDescription(currentProduct.shortDescription || '');
      setDescription(currentProduct.description || '');
      setVariants(currentProduct.variants || []);
    }
  }, [currentId, currentProduct, categories]);

  if (!currentProduct) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4">
          <p className="text-slate-600 font-medium text-sm">Düzenlenecek ürün bulunamadı.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    );
  }

  const selectedCategory = categories.find(c => c.id === categoryId);

  // Add Variant
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: 'Yeni Renk / Beden',
      sku: `${sku || 'SCX'}-${variants.length + 1}`,
      color: '#000000',
      price: price ? parseFloat(price) : null,
      stockStatus: 'Stokta Var',
      active: true,
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants(prev =>
      prev.map(v => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  // Save changes
  const handleSave = async (autoNext: boolean = false) => {
    setIsSaving(true);
    try {
      const parsedPrice = price ? parseFloat(price.replace(',', '.')) : null;
      const parsedDiscountPrice = discountPrice ? parseFloat(discountPrice.replace(',', '.')) : null;

      await updateProduct(currentProduct.id, {
        name: name.trim() || currentProduct.name,
        brand: brand.trim() || undefined,
        sku: sku.trim() || currentProduct.sku,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        price: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : null,
        discountPrice: parsedDiscountPrice && !isNaN(parsedDiscountPrice) ? parsedDiscountPrice : null,
        taxStatus,
        vatRate,
        taxRate: vatRate,
        shortDescription,
        description,
        variants,
      });

      showNotification(`"${name || currentProduct.name}" bilgileri başarıyla güncellendi!`);

      if (autoNext && currentIndex < products.length - 1) {
        setCurrentId(products[currentIndex + 1].id);
      } else if (!autoNext) {
        onClose();
      }
    } catch (err) {
      console.error('Error updating product:', err);
      showNotification('Güncelleme sırasında hata oluştu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const tabList = [
    { id: 'brand', label: 'Hızlı Marka', icon: Award, color: 'text-amber-500' },
    { id: 'name_sku', label: 'Hızlı Ad & Kod', icon: Tag, color: 'text-amber-600' },
    { id: 'category', label: 'Hızlı Kategori', icon: FolderTree, color: 'text-indigo-600' },
    { id: 'price', label: 'Hızlı Fiyat & Satış Fiyatı', icon: DollarSign, color: 'text-emerald-600' },
    { id: 'vat', label: 'Hızlı KDV Durumu', icon: Percent, color: 'text-sky-600' },
    { id: 'short_desc', label: 'Hızlı Kısa Açıklama', icon: FileText, color: 'text-purple-600' },
    { id: 'full_desc', label: 'Hızlı Detaylı Açıklama', icon: AlignLeft, color: 'text-rose-600' },
    { id: 'variants', label: `Hızlı Varyantlar (${variants.length})`, icon: Layers, color: 'text-teal-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-teal-900/80 text-teal-300 px-2 py-0.5 rounded border border-teal-700/80 uppercase">
                  HIZLI DÜZENLEME PANELİ
                </span>
                <span className="text-xs text-slate-400">
                  ({currentIndex + 1} / {products.length})
                </span>
              </div>
              <h3 className="font-black text-sm sm:text-base text-white line-clamp-1 mt-0.5">
                {currentProduct.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Quick Cycler Bar */}
        <div className="bg-slate-100 p-3 px-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => currentIndex > 0 && setCurrentId(products[currentIndex - 1].id)}
              disabled={currentIndex <= 0}
              className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 disabled:opacity-30 cursor-pointer transition-colors flex items-center gap-1 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Önceki</span>
            </button>

            <select
              value={currentId || ''}
              onChange={e => setCurrentId(e.target.value)}
              className="p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-xs max-w-[240px] truncate cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => currentIndex < products.length - 1 && setCurrentId(products[currentIndex + 1].id)}
              disabled={currentIndex >= products.length - 1}
              className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 disabled:opacity-30 cursor-pointer transition-colors flex items-center gap-1 font-bold"
            >
              <span>Sonraki</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-600">
              SKU: <span className="font-mono text-teal-700">{currentProduct.sku}</span>
            </span>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="bg-slate-50 p-2 border-b border-slate-200 overflow-x-auto flex gap-1.5 scrollbar-thin">
          {tabList.map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as QuickEditTab)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* TAB BRAND */}
          {activeTab === 'brand' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Hızlı Marka Tanımlama ve Düzenleme</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Marka Adı
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder="örn. ADIDAS, SELEX, SCX"
                    className="w-full p-3 border border-amber-300 rounded-xl font-black text-sm uppercase text-amber-950 bg-amber-50/40 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Marka adı, ürün detayında ve ürün listelerinde ürün kodunun (SKU) hemen önünde belirgin renkle gösterilir.
                  </p>
                </div>

                {/* Quick Brand selection from catalog */}
                {Array.from(new Set(products.map(p => p.brand).filter(Boolean))).length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                    <label className="block font-bold text-slate-700 text-xs">
                      Katalogdaki Mevcut Markalardan Hızlı Seç:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set(products.map(p => p.brand).filter(Boolean))).map((b, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setBrand(b as string)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            brand === b
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: NAME & SKU */}
          {activeTab === 'name_sku' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Hızlı Ürün Adı ve Ürün Kodu (SKU) Düzenleme</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Hızlı Ürün Adı *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="örn. SCX 1080 Antrenman Çanağı"
                    className="w-full p-3 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Hızlı Ürün Kodu (SKU) *
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="örn. SCX-1080"
                    className="w-full p-3 border border-slate-300 rounded-xl font-mono font-bold text-sm text-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORY */}
          {activeTab === 'category' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-indigo-900 font-bold flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Hızlı Kategori ve Alt Kategori Seçimi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Hızlı Ana Kategori
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => {
                      setCategoryId(e.target.value);
                      setSubcategoryId('');
                    }}
                    className="w-full p-3 border border-slate-300 rounded-xl font-bold text-slate-800 bg-white cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Hızlı Alt Kategori
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={e => setSubcategoryId(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl font-medium text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="">-- Alt Kategori Yok --</option>
                    {selectedCategory?.subcategories?.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICE & DISCOUNT */}
          {activeTab === 'price' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900 font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Hızlı Fiyat ve Satış Fiyatı Güncelleme</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Hızlı Normal Fiyat (₺)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3 pr-8 border border-slate-300 rounded-xl font-mono font-bold text-sm text-slate-900 bg-white"
                    />
                    <span className="absolute right-3 top-3.5 text-slate-400 font-bold">₺</span>
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Hızlı Satış Fiyatı / İndirimli Fiyat (₺)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={discountPrice}
                      onChange={e => setDiscountPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3 pr-8 border border-slate-300 rounded-xl font-mono font-bold text-sm text-emerald-700 bg-white"
                    />
                    <span className="absolute right-3 top-3.5 text-slate-400 font-bold">₺</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Satış fiyatı girdiğinizde sitede eski fiyatın üstü çizili gösterilir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VAT / TAX */}
          {activeTab === 'vat' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-sky-900 font-bold flex items-center gap-2">
                <Percent className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>Hızlı KDV Durumu ve KDV Oranı Belirleme</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Hızlı KDV Dahil/Hariç Durumu
                  </label>
                  <select
                    value={taxStatus}
                    onChange={e => setTaxStatus(e.target.value as 'KDV Dahil' | 'KDV Hariç')}
                    className="w-full p-3 border border-slate-300 rounded-xl font-bold text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="KDV Dahil">KDV Dahil</option>
                    <option value="KDV Hariç">KDV Hariç (+ KDV)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">
                    Hızlı KDV Oranı (%)
                  </label>
                  <select
                    value={vatRate}
                    onChange={e => setVatRate(Number(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-xl font-bold text-slate-800 bg-white cursor-pointer"
                  >
                    <option value={20}>%20 KDV Standardı</option>
                    <option value={10}>%10 KDV</option>
                    <option value={1}>%1 KDV</option>
                    <option value={0}>%0 KDV (Muaf)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SHORT DESCRIPTION */}
          {activeTab === 'short_desc' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-purple-900 font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>Hızlı Kısa Açıklama (Ürün Listesinde ve Kartlarda Görünür)</span>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">
                  Hızlı Kısa Açıklama Metni
                </label>
                <textarea
                  rows={4}
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  placeholder="Ürün kartlarında ve hızlı özet alanlarında görüntülenecek spot açıklama..."
                  className="w-full p-3 border border-slate-300 rounded-xl font-medium text-slate-800 bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 6: FULL DESCRIPTION */}
          {activeTab === 'full_desc' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-900 font-bold flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Hızlı Detaylı Açıklama (Ürün Detay Sayfasında Görünür)</span>
              </div>

              <div>
                <label className="block font-black text-slate-800 mb-1">
                  Hızlı Detaylı Açıklama Metni
                </label>
                <textarea
                  rows={7}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ürünün tüm özelliklerini, malzeme yapısını, kullanım alanlarını ve detaylarını buraya yazın..."
                  className="w-full p-3 border border-slate-300 rounded-xl font-medium text-slate-800 bg-white"
                />
              </div>
            </div>
          )}

          {/* TAB 7: VARIANTS */}
          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl text-teal-900 font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Hızlı Varyant Yönetimi (Renk, Beden, Model Seçenekleri)</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Varyant Ekle
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                  <Package className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="font-bold text-slate-700">Henüz varyant eklenmedi.</p>
                  <p className="text-slate-500 text-[11px]">
                    Renk, beden veya model alternatifleri için "Varyant Ekle" butonunu kullanın.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5 mt-2"
                  >
                    <Plus className="w-4 h-4" /> İlk Varyantı Oluştur
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {variants.map((v, idx) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-3 items-center"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Varyant Adı #{idx + 1}
                        </label>
                        <input
                          type="text"
                          value={v.name}
                          onChange={e => handleUpdateVariant(v.id, 'name', e.target.value)}
                          placeholder="örn. Kırmızı / XL"
                          className="w-full p-2 border border-slate-300 rounded-lg font-bold bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          SKU
                        </label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={e => handleUpdateVariant(v.id, 'sku', e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Stok Durumu
                        </label>
                        <select
                          value={v.stockStatus}
                          onChange={e => handleUpdateVariant(v.id, 'stockStatus', e.target.value as StockStatus)}
                          className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs cursor-pointer"
                        >
                          <option value="Stokta Var">Stokta Var</option>
                          <option value="Stok Yok">Stok Yok</option>
                          <option value="Sınırlı Stok">Sınırlı Stok</option>
                        </select>
                      </div>

                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Varyantı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Vazgeç
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-800 flex items-center gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Kaydet & Sonrakine Geç</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/20 cursor-pointer transition-all flex items-center gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Kaydet & Kapat</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
