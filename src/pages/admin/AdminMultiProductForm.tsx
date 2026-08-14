import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { StockStatus, PriceType } from '../../types';
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
  Percent,
  Tag,
  FolderTree,
  DollarSign,
  Award,
  Loader2,
} from 'lucide-react';

interface MultiProductRow {
  id: string;
  name: string;
  brand: string;
  sku: string;
  categoryId: string;
  subcategoryId: string;
  price: string;
  discountPrice: string;
  taxStatus: 'KDV Dahil' | 'KDV Hariç';
  vatRate: number;
  priceType: PriceType;
  stockStatus: StockStatus;
  status: 'Yayında' | 'Taslak';
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

  const defaultCatId = categories[0]?.id || 'cat-1';

  // Global defaults that can be applied to all rows
  const [globalCategoryId, setGlobalCategoryId] = useState(defaultCatId);
  const [globalBrand, setGlobalBrand] = useState('');
  const [globalTaxStatus, setGlobalTaxStatus] = useState<'KDV Dahil' | 'KDV Hariç'>('KDV Dahil');
  const [globalVatRate, setGlobalVatRate] = useState<number>(20);
  const [globalPriceType, setGlobalPriceType] = useState<PriceType>('Tek Fiyatı');
  const [globalStockStatus, setGlobalStockStatus] = useState<StockStatus>('Stokta Var');
  const [globalStatus, setGlobalStatus] = useState<'Yayında' | 'Taslak'>('Yayında');

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
    stock: StockStatus,
    brandName = '',
    tax: 'KDV Dahil' | 'KDV Hariç' = 'KDV Dahil',
    vat: number = 20,
    ptype: PriceType = 'Tek Fiyatı'
  ): MultiProductRow {
    return {
      id: `row-${Date.now()}-${idSuffix}-${Math.random().toString(36).substring(2, 5)}`,
      name: '',
      brand: brandName,
      sku: '',
      categoryId: catId,
      subcategoryId: '',
      price: '',
      discountPrice: '',
      taxStatus: tax,
      vatRate: vat,
      priceType: ptype,
      stockStatus: stock,
      status: 'Yayında',
      coverImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
      shortDescription: '',
    };
  }

  const handleAddRows = (count: number) => {
    const newRows: MultiProductRow[] = [];
    for (let i = 0; i < count; i++) {
      newRows.push(
        createEmptyRow(
          `${rows.length + i + 1}`,
          globalCategoryId,
          globalStockStatus,
          globalBrand,
          globalTaxStatus,
          globalVatRate,
          globalPriceType
        )
      );
    }
    setRows((prev) => [...prev, ...newRows]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      showNotification('En az bir ürün satırı bulunmalıdır.', 'error');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRowChange = (id: string, field: keyof MultiProductRow, value: any) => {
    setRows((prev) =>
      prev.map((row) => {
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

  // Bulk apply functions
  const handleApplyGlobalBrand = (newBrand: string) => {
    setGlobalBrand(newBrand);
    setRows((prev) => prev.map((r) => ({ ...r, brand: newBrand })));
    showNotification(`Tüm satırların markası "${newBrand || 'Boş'}" olarak ayarlandı.`);
  };

  const handleApplyGlobalCategory = (newCatId: string) => {
    setGlobalCategoryId(newCatId);
    setRows((prev) => prev.map((r) => ({ ...r, categoryId: newCatId, subcategoryId: '' })));
    showNotification('Tüm satırların kategorisi güncellendi.');
  };

  const handleApplyGlobalTaxStatus = (newTax: 'KDV Dahil' | 'KDV Hariç') => {
    setGlobalTaxStatus(newTax);
    setRows((prev) => prev.map((r) => ({ ...r, taxStatus: newTax })));
    showNotification(`Tüm satırlar "${newTax}" olarak ayarlandı.`);
  };

  const handleApplyGlobalVatRate = (newVat: number) => {
    setGlobalVatRate(newVat);
    setRows((prev) => prev.map((r) => ({ ...r, vatRate: newVat })));
    showNotification(`Tüm satırların KDV oranı %${newVat} olarak ayarlandı.`);
  };

  const handleApplyGlobalPriceType = (newType: PriceType) => {
    setGlobalPriceType(newType);
    setRows((prev) => prev.map((r) => ({ ...r, priceType: newType })));
    showNotification(`Tüm satırların fiyat türü "${newType}" yapıldı.`);
  };

  const handleApplyGlobalStock = (newStock: StockStatus) => {
    setGlobalStockStatus(newStock);
    setRows((prev) => prev.map((r) => ({ ...r, stockStatus: newStock })));
    showNotification(`Tüm satırların stok durumu "${newStock}" yapıldı.`);
  };

  // Parse multi-line paste text into rows
  const handleProcessPasteText = () => {
    if (!rawPasteText.trim()) return;

    const lines = rawPasteText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return;

    const newParsedRows: MultiProductRow[] = lines.map((line, index) => {
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
        brand: globalBrand,
        sku: autoSku,
        categoryId: globalCategoryId,
        subcategoryId: '',
        price: price,
        discountPrice: '',
        taxStatus: globalTaxStatus,
        vatRate: globalVatRate,
        priceType: globalPriceType,
        stockStatus: globalStockStatus,
        status: globalStatus,
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
    const validRows = rows.filter((r) => r.name.trim() !== '');
    if (validRows.length === 0) {
      showNotification('Temizlenecek boş satır bulunamadı.', 'info');
      return;
    }
    setRows(validRows);
  };

  const validCount = rows.filter((r) => r.name.trim() !== '').length;

  const handleSaveAll = async () => {
    const activeRows = rows.filter((r) => r.name.trim() !== '');

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
        const parsedDisc = row.discountPrice ? parseFloat(row.discountPrice.replace(',', '.')) : null;

        await addProduct({
          name: row.name.trim(),
          brand: row.brand?.trim() || undefined,
          sku: skuVal,
          slug: '',
          categoryId: row.categoryId,
          subcategoryId: row.subcategoryId || undefined,
          price: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : null,
          discountPrice: parsedDisc && !isNaN(parsedDisc) ? parsedDisc : null,
          priceType: row.priceType || 'Tek Fiyatı',
          taxStatus: row.taxStatus || 'KDV Dahil',
          vatRate: row.vatRate || 20,
          taxRate: row.vatRate || 20,
          vatIncluded: row.taxStatus === 'KDV Dahil',
          stockStatus: row.stockStatus,
          isFeatured: false,
          featured: false,
          isNewArrival: true,
          isNew: true,
          status: row.status || 'Yayında',
          coverImage: row.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
          imageUrl: row.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
          gallery: [],
          shortDescription: row.shortDescription || `${row.name.trim()} spor ekipmanı.`,
          description: `${row.name.trim()} profesyonel kulüp ve antrenman kullanımı için tasarlanmıştır.`,
          specifications: [],
        });
        savedCount++;
      }

      showNotification(`Tebrikler! ${savedCount} adet ürün tüm KDV ve fiyat ayarlarıyla başarıyla eklendi.`);
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
                <ListPlus className="w-3 h-3 text-teal-400" /> Hızlı & Çoklu Ürün Yükleme
              </span>
              <span className="text-xs text-slate-400">
                ({validCount} / {rows.length} Hazır Ürün)
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Toplu Ürün Ekleme ve KDV / Fiyat Ayarları
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSwitchToSingleForm && (
            <button
              type="button"
              onClick={onSwitchToSingleForm}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs cursor-pointer transition-colors"
            >
              Tekli Detaylı Forma Geç
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPasteModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-black text-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> Metin / Liste Yapıştır
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs cursor-pointer transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{validCount > 0 ? `${validCount} Ürünü Kaydet` : 'Tümünü Kaydet'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Defaults Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Tüm Satırlara Otomatik Uygulanacak Varsayılanlar:</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Aşağıdaki seçimler yeni eklenecek veya mevcut tüm satırlara anında yansır.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Global Brand */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Toplu Marka</label>
            <input
              type="text"
              placeholder="Örn: SCX"
              value={globalBrand}
              onChange={(e) => handleApplyGlobalBrand(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:bg-white focus:outline-teal-500"
            />
          </div>

          {/* Global Category */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Toplu Kategori</label>
            <select
              value={globalCategoryId}
              onChange={(e) => handleApplyGlobalCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-teal-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Global KDV Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Toplu KDV Durumu</label>
            <select
              value={globalTaxStatus}
              onChange={(e) => handleApplyGlobalTaxStatus(e.target.value as any)}
              className="w-full p-2 bg-teal-50 border border-teal-200 text-teal-950 rounded-xl text-xs font-black focus:bg-white focus:outline-teal-500"
            >
              <option value="KDV Dahil">KDV Dahil</option>
              <option value="KDV Hariç">KDV Hariç (+ KDV)</option>
            </select>
          </div>

          {/* Global VAT Rate */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Toplu KDV Oranı</label>
            <select
              value={globalVatRate}
              onChange={(e) => handleApplyGlobalVatRate(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-teal-500"
            >
              <option value={20}>%20 KDV</option>
              <option value={10}>%10 KDV</option>
              <option value={1}>%1 KDV</option>
              <option value={0}>%0 KDV</option>
            </select>
          </div>

          {/* Global Price Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Toplu Fiyat Türü</label>
            <select
              value={globalPriceType}
              onChange={(e) => handleApplyGlobalPriceType(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-teal-500"
            >
              <option value="Tek Fiyatı">Tek Fiyatı</option>
              <option value="Set Fiyatı">Set Fiyatı</option>
              <option value="Paket Fiyatı">Paket Fiyatı</option>
              <option value="Çift Fiyatı">Çift Fiyatı</option>
              <option value="Adet Fiyatı">Adet Fiyatı</option>
            </select>
          </div>

          {/* Global Stock Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Toplu Stok Durumu</label>
            <select
              value={globalStockStatus}
              onChange={(e) => handleApplyGlobalStock(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:outline-teal-500"
            >
              <option value="Stokta Var">Stokta Var</option>
              <option value="Stokta Yok">Stokta Yok</option>
              <option value="Sınırlı Stok">Sınırlı Stok</option>
              <option value="Sipariş Üzerine">Sipariş Üzerine</option>
            </select>
          </div>
        </div>
      </div>

      {/* Multi-Product Rows Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950 text-white font-bold sticky top-0 z-10">
              <tr className="border-b border-slate-800 text-[11px]">
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3 min-w-[200px]">Ürün Adı *</th>
                <th className="p-3 w-28">SKU / Kod *</th>
                <th className="p-3 w-28">Marka</th>
                <th className="p-3 w-36">Kategori</th>
                <th className="p-3 w-28">Fiyat (₺)</th>
                <th className="p-3 w-28">İndirimli (₺)</th>
                <th className="p-3 w-32 bg-teal-950 text-teal-300">KDV Durumu *</th>
                <th className="p-3 w-28 bg-teal-950 text-teal-300">KDV Oranı *</th>
                <th className="p-3 w-32">Fiyat Tipi</th>
                <th className="p-3 w-32">Stok Durumu</th>
                <th className="p-3 w-12 text-center">Sil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => {
                const isFilled = row.name.trim() !== '';

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isFilled ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    {/* Index */}
                    <td className="p-2 text-center font-bold text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Name */}
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder={`Ürün #${idx + 1} adını yazın...`}
                        value={row.name}
                        onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
                        className={`w-full p-2 rounded-lg text-xs font-bold text-slate-900 focus:outline-teal-500 border ${
                          row.name ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50'
                        }`}
                      />
                    </td>

                    {/* SKU */}
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="SCX-0000"
                        value={row.sku}
                        onChange={(e) => handleRowChange(row.id, 'sku', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase focus:outline-teal-500"
                      />
                    </td>

                    {/* Brand */}
                    <td className="p-2">
                      <input
                        type="text"
                        placeholder="Marka"
                        value={row.brand}
                        onChange={(e) => handleRowChange(row.id, 'brand', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold uppercase focus:outline-teal-500 text-amber-900"
                      />
                    </td>

                    {/* Category */}
                    <td className="p-2">
                      <select
                        value={row.categoryId}
                        onChange={(e) => handleRowChange(row.id, 'categoryId', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500"
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
                        value={row.price}
                        onChange={(e) => handleRowChange(row.id, 'price', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-teal-500"
                      />
                    </td>

                    {/* Discount Price */}
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={row.discountPrice}
                        onChange={(e) => handleRowChange(row.id, 'discountPrice', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:outline-teal-500"
                      />
                    </td>

                    {/* KDV STATUS (Dahil / Hariç) */}
                    <td className="p-2 bg-teal-50/20">
                      <select
                        value={row.taxStatus}
                        onChange={(e) => handleRowChange(row.id, 'taxStatus', e.target.value)}
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
                        value={row.vatRate}
                        onChange={(e) => handleRowChange(row.id, 'vatRate', Number(e.target.value))}
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
                        value={row.priceType}
                        onChange={(e) => handleRowChange(row.id, 'priceType', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-teal-500"
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
                        value={row.stockStatus}
                        onChange={(e) => handleRowChange(row.id, 'stockStatus', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-teal-500"
                      >
                        <option value="Stokta Var">Stokta Var</option>
                        <option value="Stokta Yok">Stokta Yok</option>
                        <option value="Sınırlı Stok">Sınırlı Stok</option>
                        <option value="Sipariş Üzerine">Sipariş Üzerine</option>
                      </select>
                    </td>

                    {/* Delete Row */}
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Satırı Kaldır"
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

        {/* Table Bottom Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAddRows(1)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              <span>+ 1 Satır Ekle</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddRows(5)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              <span>+ 5 Satır Ekle</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddRows(10)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 font-bold text-slate-800 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              <span>+ 10 Satır Ekle</span>
            </button>

            <button
              type="button"
              onClick={handleClearEmptyRows}
              className="px-3.5 py-2 bg-slate-200/70 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
            >
              Boş Satırları Temizle
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Toplam <strong>{rows.length}</strong> satır (Doldurulan: <strong>{validCount}</strong>)
            </span>

            <button
              type="button"
              disabled={isSubmitting || validCount === 0}
              onClick={handleSaveAll}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs cursor-pointer transition-all shadow-lg flex items-center gap-2 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{validCount} Ürünü Kataloğa Ekle</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 text-base">Hızlı Liste & Metin Yapıştır</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Her satıra bir ürün gelecek şekilde metin yapıştırın. Fiyat varsa satır sonuna ekleyebilirsiniz (Örn: <em>Antrenman Çanağı 250 TL</em>).
            </p>

            <textarea
              rows={8}
              value={rawPasteText}
              onChange={(e) => setRawPasteText(e.target.value)}
              placeholder={`Örnek Format:\nSCX 1080 Antrenman Çanağı - 120 TL\nSCX 2040 Slalom Çubuğu - 350 TL\nKoordinasyon Çemberi 12'li - 450 TL\nAtlama Engeli 30cm - 210 TL`}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-teal-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleProcessPasteText}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl cursor-pointer shadow-md"
              >
                Listeye Aktar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
