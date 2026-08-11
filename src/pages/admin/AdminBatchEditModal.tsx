import React, { useState } from 'react';
import { Product, StockStatus } from '../../types';
import { useCatalog } from '../../context/CatalogContext';
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
} from 'lucide-react';

interface AdminBatchEditModalProps {
  selectedIds: string[];
  onClose: () => void;
}

export const AdminBatchEditModal: React.FC<AdminBatchEditModalProps> = ({
  selectedIds,
  onClose,
}) => {
  const { products, categories, updateProductsBulk, showNotification } = useCatalog();

  // Mode: 'table' (inline row editing list) or 'bulk_apply' (apply 1 value to all selected)
  const [activeMode, setActiveMode] = useState<'table' | 'bulk_apply'>('table');

  // Filter selected product objects
  const targetProducts = products.filter((p) => selectedIds.includes(p.id));

  // --- MODE 1: TABLE INLINE EDIT STATE ---
  // Map of product ID -> modified fields
  const [tableData, setTableData] = useState<{ [id: string]: Partial<Product> }>(() => {
    const initial: { [id: string]: Partial<Product> } = {};
    targetProducts.forEach((p) => {
      initial[p.id] = {
        name: p.name,
        sku: p.sku,
        brand: p.brand || '',
        categoryId: p.categoryId,
        subcategoryId: p.subcategoryId || '',
        price: p.price,
        discountPrice: p.discountPrice,
        taxStatus: p.taxStatus || 'KDV Dahil',
        vatRate: p.vatRate || p.taxRate || 20,
        stockStatus: p.stockStatus || 'Stokta Var',
        status: p.status || 'Yayında',
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

  const [applyVatEnabled, setApplyVatEnabled] = useState(false);
  const [applyTaxStatus, setApplyTaxStatus] = useState<'KDV Dahil' | 'KDV Hariç'>('KDV Dahil');
  const [applyVatRate, setApplyVatRate] = useState<number>(20);

  const [applyStockEnabled, setApplyStockEnabled] = useState(false);
  const [applyStockStatus, setApplyStockStatus] = useState<StockStatus>('Stokta Var');

  const [applyPublishEnabled, setApplyPublishEnabled] = useState(false);
  const [applyPublished, setApplyPublished] = useState<boolean>(true);

  const [isSaving, setIsSaving] = useState(false);

  // SAVE HANDLER FOR TABLE INLINE EDIT
  const handleSaveTableEdits = async () => {
    setIsSaving(true);
    try {
      await updateProductsBulk(tableData);
      showNotification(`${targetProducts.length} adet ürünün değişiklikleri kaydedildi.`);
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
      !applyVatEnabled &&
      !applyStockEnabled &&
      !applyPublishEnabled
    ) {
      showNotification('Lütfen uygulamak istediğiniz en az bir alanı seçin.', 'info');
      return;
    }

    setIsSaving(true);
    try {
      const updatesMap: { [id: string]: Partial<Product> } = {};

      targetProducts.forEach((p) => {
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

        if (applyVatEnabled) {
          updates.taxStatus = applyTaxStatus;
          updates.vatRate = applyVatRate;
          updates.taxRate = applyVatRate;
        }

        if (applyStockEnabled) {
          updates.stockStatus = applyStockStatus;
        }

        if (applyPublishEnabled) {
          updates.status = applyPublished ? 'Yayında' : 'Pasif';
        }

        updatesMap[p.id] = updates;
      });

      await updateProductsBulk(updatesMap);
      showNotification(`${targetProducts.length} ürüne toplu ayarlar başarıyla uygulandı.`);
      onClose();
    } catch (err) {
      console.error(err);
      showNotification('Toplu işlem sırasında bir hata oluştu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCatObj = categories.find((c) => c.id === applyCatId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Toplu Hızlı Düzenleme Paneli</h2>
                <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-[11px] font-bold">
                  {targetProducts.length} Seçili Ürün
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Seçtiğiniz ürünleri listeden doğrudan tablo halinde düzenleyebilir veya toplu değer atayabilirsiniz.
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

        {/* Mode Selector Tabs */}
        <div className="bg-slate-900 px-6 pt-3 pb-0 flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveMode('table')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeMode === 'table'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ListFilter className="w-4 h-4 text-teal-600" />
            <span>Listeden Tablo Halinde Düzenle ({targetProducts.length})</span>
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* MODE 1: INLINE ROW TABLE EDITING */}
          {activeMode === 'table' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Aşağıdaki tablodaki tüm hücreler doğrudan düzenlenebilir. Değişikliklerinizi yaptıktan sonra <strong>Tüm Değişiklikleri Kaydet</strong> butonuna basın.
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto max-h-[52vh]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-900 text-white font-bold sticky top-0 z-10">
                      <tr className="border-b border-slate-800">
                        <th className="p-3 w-12 text-center">Görsel</th>
                        <th className="p-3 min-w-[200px]">Ürün Adı</th>
                        <th className="p-3 w-28">SKU / Kod</th>
                        <th className="p-3 w-32">Marka</th>
                        <th className="p-3 w-40">Kategori</th>
                        <th className="p-3 w-28">Fiyat (₺)</th>
                        <th className="p-3 w-28">Satış Fiyatı</th>
                        <th className="p-3 w-28">KDV Oranı</th>
                        <th className="p-3 w-32">Stok Durumu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {targetProducts.map((p) => {
                        const row = tableData[p.id] || {};
                        const rowCat = categories.find((c) => c.id === row.categoryId);

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Image thumbnail */}
                            <td className="p-2.5 text-center">
                              <img
                                src={p.imageUrl || p.coverImage || 'https://via.placeholder.com/100'}
                                alt=""
                                className="w-8 h-8 object-cover rounded-lg border border-slate-200 mx-auto"
                              />
                            </td>

                            {/* Name */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.name || ''}
                                onChange={(e) => handleTableFieldChange(p.id, 'name', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </td>

                            {/* SKU */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.sku || ''}
                                onChange={(e) => handleTableFieldChange(p.id, 'sku', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase focus:border-teal-500 focus:outline-none"
                              />
                            </td>

                            {/* Brand */}
                            <td className="p-2">
                              <input
                                type="text"
                                placeholder="Marka"
                                value={row.brand || ''}
                                onChange={(e) => handleTableFieldChange(p.id, 'brand', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-teal-500 focus:outline-none"
                              />
                            </td>

                            {/* Category */}
                            <td className="p-2">
                              <select
                                value={row.categoryId || ''}
                                onChange={(e) => handleTableFieldChange(p.id, 'categoryId', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-teal-500 focus:outline-none font-medium"
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
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-teal-500 focus:outline-none"
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
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-600 focus:border-teal-500 focus:outline-none"
                              />
                            </td>

                            {/* VAT Rate */}
                            <td className="p-2">
                              <select
                                value={row.vatRate || 20}
                                onChange={(e) => handleTableFieldChange(p.id, 'vatRate', Number(e.target.value))}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-teal-500 focus:outline-none"
                              >
                                <option value={20}>%20 KDV</option>
                                <option value={10}>%10 KDV</option>
                                <option value={1}>%1 KDV</option>
                                <option value={0}>%0 KDV</option>
                              </select>
                            </td>

                            {/* Stock Status */}
                            <td className="p-2">
                              <select
                                value={row.stockStatus || 'Stokta Var'}
                                onChange={(e) => handleTableFieldChange(p.id, 'stockStatus', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-teal-500 focus:outline-none font-medium"
                              >
                                <option value="Stokta Var">Stokta Var</option>
                                <option value="Stokta Yok">Stokta Yok</option>
                                <option value="Sınırlı Stok">Sınırlı Stok</option>
                                <option value="Ön Sipariş">Ön Sipariş</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                  İşaretlediğiniz alanlar, seçtiğiniz <strong>{targetProducts.length} adet ürünün</strong> tamamına tek tıklamayla uygulanacaktır. Seçilmeyen alanlar değiştirilmeyecektir.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
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
                      placeholder="Örn: SCX SPOR"
                      value={applyBrand}
                      onChange={(e) => setApplyBrand(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-500 focus:outline-none"
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
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-500 focus:outline-none"
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
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-teal-500"
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
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-teal-500 focus:outline-none"
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
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-rose-600 focus:border-teal-500 focus:outline-none"
                    />
                  )}
                </div>

                {/* VAT Status & Rate */}
                <div className={`p-4 rounded-2xl border transition-all ${applyVatEnabled ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/10' : 'bg-slate-100/70 border-slate-200 opacity-80'}`}>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 mb-3">
                    <input
                      type="checkbox"
                      checked={applyVatEnabled}
                      onChange={(e) => setApplyVatEnabled(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                    <Percent className="w-4 h-4 text-sky-500" />
                    <span>KDV Durumu & Oranı</span>
                  </label>
                  {applyVatEnabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={applyTaxStatus}
                        onChange={(e) => setApplyTaxStatus(e.target.value as any)}
                        className="p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                      >
                        <option value="KDV Dahil">KDV Dahil</option>
                        <option value="KDV Hariç">KDV Hariç</option>
                      </select>

                      <select
                        value={applyVatRate}
                        onChange={(e) => setApplyVatRate(Number(e.target.value))}
                        className="p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                      >
                        <option value={20}>%20 KDV</option>
                        <option value={10}>%10 KDV</option>
                        <option value={1}>%1 KDV</option>
                        <option value={0}>%0 KDV</option>
                      </select>
                    </div>
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
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      <option value="Stokta Var">Stokta Var</option>
                      <option value="Stokta Yok">Stokta Yok</option>
                      <option value="Sınırlı Stok">Sınırlı Stok</option>
                      <option value="Ön Sipariş">Ön Sipariş</option>
                    </select>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs font-medium text-slate-500">
            {targetProducts.length} ürün güncellenecek
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
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Tüm Değişiklikleri Kaydet ({targetProducts.length} Ürün)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveBulkApply}
                disabled={isSaving}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uygulanıyor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Toplu Değerleri Uygula ve Kaydet ({targetProducts.length} Ürün)</span>
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
