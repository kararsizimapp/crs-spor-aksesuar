import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { StockStatus } from '../../types';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  FileText,
  Sparkles,
  Layers,
  Package,
  CheckCircle2,
  ListPlus,
  Copy,
} from 'lucide-react';

interface MultiProductRow {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  subcategoryId: string;
  price: string;
  stockStatus: StockStatus;
  coverImage: string;
  shortDescription: string;
}

interface AdminMultiProductFormProps {
  onClose: () => void;
  onSwitchToSingleForm?: () => void;
}

export const AdminMultiProductForm: React.FC<AdminMultiProductFormProps> = ({
  onClose,
  onSwitchToSingleForm,
}) => {
  const { categories, addProduct, showNotification } = useCatalog();

  const defaultCatId = categories[0]?.id || 'cat-01';

  // Global defaults
  const [globalCategoryId, setGlobalCategoryId] = useState(defaultCatId);
  const [globalStockStatus, setGlobalStockStatus] = useState<StockStatus>('Stokta Var');

  // Quick paste modal state
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [rawPasteText, setRawPasteText] = useState('');

  // Initial 5 empty rows
  const [rows, setRows] = useState<MultiProductRow[]>([
    createEmptyRow('1', defaultCatId, 'Stokta Var'),
    createEmptyRow('2', defaultCatId, 'Stokta Var'),
    createEmptyRow('3', defaultCatId, 'Stokta Var'),
    createEmptyRow('4', defaultCatId, 'Stokta Var'),
    createEmptyRow('5', defaultCatId, 'Stokta Var'),
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function createEmptyRow(
    idSuffix: string,
    catId: string,
    stock: StockStatus
  ): MultiProductRow {
    return {
      id: `row-${Date.now()}-${idSuffix}-${Math.random().toString(36).substring(2, 5)}`,
      name: '',
      sku: '',
      categoryId: catId,
      subcategoryId: '',
      price: '',
      stockStatus: stock,
      coverImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
      shortDescription: '',
    };
  }

  const handleAddRows = (count: number) => {
    const newRows: MultiProductRow[] = [];
    for (let i = 0; i < count; i++) {
      newRows.push(createEmptyRow(`${rows.length + i + 1}`, globalCategoryId, globalStockStatus));
    }
    setRows(prev => [...prev, ...newRows]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      showNotification('En az bir ürün satırı bulunmalıdır.', 'error');
      return;
    }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleRowChange = (id: string, field: keyof MultiProductRow, value: string) => {
    setRows(prev =>
      prev.map(row => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };

        // Auto-generate SKU if name is entered and SKU is empty
        if (field === 'name' && value && !row.sku) {
          const autoSku = 'SCX-' + Math.floor(1000 + Math.random() * 9000);
          updated.sku = autoSku;
        }

        return updated;
      })
    );
  };

  const handleApplyGlobalCategory = (newCatId: string) => {
    setGlobalCategoryId(newCatId);
    setRows(prev => prev.map(r => ({ ...r, categoryId: newCatId, subcategoryId: '' })));
  };

  const handleApplyGlobalStock = (newStock: StockStatus) => {
    setGlobalStockStatus(newStock);
    setRows(prev => prev.map(r => ({ ...r, stockStatus: newStock })));
  };

  // Parse multi-line paste text into rows
  const handleProcessPasteText = () => {
    if (!rawPasteText.trim()) return;

    const lines = rawPasteText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return;

    const newParsedRows: MultiProductRow[] = lines.map((line, index) => {
      // Check if line contains price like "Ürün Adı - 250 TL" or "Ürün Adı 250"
      let name = line;
      let price = '';

      const priceMatch = line.match(/(.*?)(?:[-–,:]?\s*(\d+(?:[\.,]\d+)?)\s*(?:tl|₺|try)?)$/i);
      if (priceMatch && priceMatch[1] && priceMatch[2]) {
        name = priceMatch[1].trim();
        price = priceMatch[2].replace(',', '.');
      }

      const autoSku = 'SCX-' + Math.floor(1000 + Math.random() * 9000);

      return {
        id: `row-paste-${Date.now()}-${index}`,
        name: name || `Yeni Ürün ${index + 1}`,
        sku: autoSku,
        categoryId: globalCategoryId,
        subcategoryId: '',
        price: price,
        stockStatus: globalStockStatus,
        coverImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
        shortDescription: 'Yüksek kaliteli profesyonel spor ve antrenman ekipmanı.',
      };
    });

    setRows(newParsedRows);
    setShowPasteModal(false);
    setRawPasteText('');
    showNotification(`${newParsedRows.length} adet ürün listeden aktarıldı.`);
  };

  const handleClearEmptyRows = () => {
    const validRows = rows.filter(r => r.name.trim() !== '');
    if (validRows.length === 0) {
      showNotification('Temizlenecek boş satır bulunamadı.', 'info');
      return;
    }
    setRows(validRows);
  };

  const validCount = rows.filter(r => r.name.trim() !== '').length;

  const handleSaveAll = async () => {
    const activeRows = rows.filter(r => r.name.trim() !== '');

    if (activeRows.length === 0) {
      showNotification('Lütfen en az bir ürün adı giriniz.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let savedCount = 0;
      for (const row of activeRows) {
        const skuVal = row.sku.trim() || `SCX-${Math.floor(1000 + Math.random() * 9000)}`;
        const parsedPrice = row.price ? parseFloat(row.price.replace(',', '.')) : null;

        await addProduct({
          name: row.name.trim(),
          sku: skuVal,
          slug: '',
          categoryId: row.categoryId,
          subcategoryId: row.subcategoryId || undefined,
          price: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : null,
          priceType: 'Tek Fiyatı',
          vatIncluded: true,
          stockStatus: row.stockStatus,
          isFeatured: false,
          isNewArrival: true,
          status: 'Yayında',
          coverImage: row.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
          gallery: [],
          shortDescription: row.shortDescription || `${row.name.trim()} spor ekipmanı.`,
          description: `${row.name.trim()} profesyonel kulüp ve antrenman kullanımı için tasarlanmıştır.`,
          specifications: [],
        });
        savedCount++;
      }

      showNotification(`Tebrikler! ${savedCount} adet ürün başarıyla eklendi.`);
      onClose();
    } catch (err) {
      console.error('Toplu ürün ekleme hatası:', err);
      showNotification('Ürünler eklenirken bir hata oluştu.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Geri Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-900/80 text-teal-300 border border-teal-700/80 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                <ListPlus className="w-3 h-3 text-teal-400" /> Çoklu Ekleme Menüsü
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">Tek Menüden Birden Fazla Ürün Ekle</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {onSwitchToSingleForm && (
            <button
              onClick={onSwitchToSingleForm}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              Tekli Form Modu
            </button>
          )}

          <button
            onClick={handleSaveAll}
            disabled={isSubmitting || validCount === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Kaydediliyor...' : `Tümünü Kaydet (${validCount} Ürün)`}</span>
          </button>
        </div>
      </div>

      {/* Global Quick Setup Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Toplu Hızlı Ayarlar & Şablon Aracı</span>
          </div>

          <button
            onClick={() => setShowPasteModal(true)}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            Toplu Metin Yapıştır (Hızlı Doldur)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Varsayılan Kategori (Tüm Satırlara Uygula)</label>
            <select
              value={globalCategoryId}
              onChange={e => handleApplyGlobalCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 cursor-pointer"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Varsayılan Stok Durumu</label>
            <select
              value={globalStockStatus}
              onChange={e => handleApplyGlobalStock(e.target.value as StockStatus)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 cursor-pointer"
            >
              <option value="Stokta Var">Stokta Var</option>
              <option value="Stok Yok">Stok Yok</option>
              <option value="Ön Sipariş">Ön Sipariş</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => handleAddRows(1)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-teal-600" /> +1 Satır
            </button>
            <button
              onClick={() => handleAddRows(5)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-teal-600" /> +5 Satır
            </button>
            <button
              onClick={handleClearEmptyRows}
              className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl transition-colors cursor-pointer"
              title="Boş Satırları Temizle"
            >
              Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Row Product Inputs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 uppercase font-black tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center border-b border-slate-800">#</th>
                <th className="py-3 px-3 min-w-[220px] border-b border-slate-800">Ürün Adı *</th>
                <th className="py-3 px-3 min-w-[120px] border-b border-slate-800">SKU / Kod</th>
                <th className="py-3 px-3 min-w-[160px] border-b border-slate-800">Kategori</th>
                <th className="py-3 px-3 min-w-[110px] border-b border-slate-800">Fiyat (₺)</th>
                <th className="py-3 px-3 min-w-[120px] border-b border-slate-800">Stok</th>
                <th className="py-3 px-3 min-w-[180px] border-b border-slate-800">Görsel URL</th>
                <th className="py-3 px-3 w-12 text-center border-b border-slate-800">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row, idx) => {
                const currentCat = categories.find(c => c.id === row.categoryId);

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      row.name.trim() ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400 font-mono">
                      {idx + 1}
                    </td>

                    {/* Product Name */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="örn. SCX 1050 Huni Seti 50'li"
                        value={row.name}
                        onChange={e => handleRowChange(row.id, 'name', e.target.value)}
                        className={`w-full p-2 border rounded-xl font-bold transition-all ${
                          row.name.trim()
                            ? 'border-emerald-500 bg-white text-slate-900 shadow-2xs'
                            : 'border-slate-300 bg-slate-50 text-slate-700'
                        }`}
                      />
                    </td>

                    {/* SKU */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="SCX-1050"
                        value={row.sku}
                        onChange={e => handleRowChange(row.id, 'sku', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl font-mono text-slate-800 bg-white"
                      />
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3">
                      <select
                        value={row.categoryId}
                        onChange={e => handleRowChange(row.id, 'categoryId', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-800 cursor-pointer"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={row.price}
                          onChange={e => handleRowChange(row.id, 'price', e.target.value)}
                          className="w-full p-2 pr-6 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 bg-white"
                        />
                        <span className="absolute right-2.5 top-2.5 text-slate-400 font-bold text-xs">₺</span>
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td className="py-2.5 px-3">
                      <select
                        value={row.stockStatus}
                        onChange={e => handleRowChange(row.id, 'stockStatus', e.target.value as StockStatus)}
                        className="w-full p-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-800 cursor-pointer"
                      >
                        <option value="Stokta Var">Stokta Var</option>
                        <option value="Stok Yok">Stok Yok</option>
                        <option value="Ön Sipariş">Ön Sipariş</option>
                      </select>
                    </td>

                    {/* Image URL */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={row.coverImage}
                        onChange={e => handleRowChange(row.id, 'coverImage', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-xl text-slate-600 bg-white text-[11px]"
                      />
                    </td>

                    {/* Remove Row Button */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Satırı Sil"
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

        {/* Add Row Footer Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddRows(1)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              Yeni Satır Ekle
            </button>

            <button
              onClick={() => handleAddRows(5)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              +5 Satır Ekle
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Geçerli/Doldurulmuş Ürün Sayısı: <strong className="text-slate-900 font-black font-mono">{validCount}</strong>
            </span>

            <button
              onClick={handleSaveAll}
              disabled={isSubmitting || validCount === 0}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Kaydediliyor...' : `${validCount} Ürünü Kataloğa Ekle`}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Copy className="w-5 h-5 text-teal-600" />
                Hızlı Liste Yapıştırma
              </h3>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Aşağıdaki kutuya her satıra bir ürün adı (veya ürün adı ve fiyatı) gelecek şekilde listenizi yapıştırın.
              Sistem otomatik olarak satırları oluşturacaktır.
            </p>

            <textarea
              rows={8}
              value={rawPasteText}
              onChange={e => setRawPasteText(e.target.value)}
              placeholder={`Örnek:\nSCX 1010 Antrenman Yeleği - 250 TL\nSCX 1020 Koordinasyon Merdiveni - 450 TL\nSCX 1030 Slalom Takımı - 850 TL`}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50 focus:bg-white text-slate-800"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleProcessPasteText}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Satırları Oluştur ve Aktar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
