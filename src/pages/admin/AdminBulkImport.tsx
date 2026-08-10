import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { parseCsvToProducts, exportProductsToCsv, getSampleCsvTemplate } from '../../utils/csv';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export const AdminBulkImport: React.FC = () => {
  const { products, categories, importProductsBulk, showNotification } = useCatalog();

  const [csvText, setCsvText] = useState('');
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
      processCsvContent(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const processCsvContent = (text: string) => {
    const defaultCatId = categories[0]?.id || 'cat-01';
    const result = parseCsvToProducts(text, defaultCatId);
    setParsedItems(result.products);
    setImportErrors(result.errors);
    setImportedCount(null);
  };

  const handleExecuteImport = () => {
    if (parsedItems.length === 0) return;

    importProductsBulk(parsedItems);
    setImportedCount(parsedItems.length);
    showNotification(`${parsedItems.length} adet ürün başarıyla kataloğa eklendi/güncellendi.`);
    setParsedItems([]);
    setCsvText('');
  };

  const handleExportCsv = () => {
    const csvData = exportProductsToCsv(products, categories);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `scucs_urun_katalogu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const sampleData = getSampleCsvTemplate();
    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `scucs_ornek_urun_sablonu.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Toplu Ürün İçe / Dışa Aktarma (CSV - Excel)</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Yüzlerce ürünü Excel veya CSV dosyası ile saniyeler içinde sisteme aktarın veya yedekleyin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSample}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Örnek Şablon İndir
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-slate-900 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Tüm Kataloğu İndir (CSV)
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {importedCount !== null && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div className="text-xs">
            <strong className="block text-sm font-bold">İçe Aktarma Tamamlandı!</strong>
            <span>Toplam <strong>{importedCount}</strong> ürün başarıyla eklendi veya güncellendi.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upload Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              1. CSV / Excel Dosyası Yükleyin
            </h3>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3 bg-slate-50 hover:bg-slate-100/80 transition-colors">
              <Upload className="w-8 h-8 text-teal-600 mx-auto" />
              <div className="text-xs">
                <label className="font-bold text-teal-700 hover:underline cursor-pointer">
                  <span>Bir dosya seçin</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-500"> veya sürükleyip bırakın.</span>
              </div>
              <p className="text-[11px] text-slate-400">Desteklenen formatlar: .CSV (Virgül veya Noktalı Virgül Ayrıştırmalı)</p>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Veya Doğrudan CSV Metnini Yapıştırın:
              </label>
              <textarea
                rows={5}
                placeholder="SKU,Name,Category,Price,PriceType,Description..."
                value={csvText}
                onChange={e => {
                  setCsvText(e.target.value);
                  processCsvContent(e.target.value);
                }}
                className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Right: Preview & Errors */}
        <div className="lg:col-span-7 space-y-6">
          {importErrors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Format Uyarıları ({importErrors.length}):</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-700">
                {importErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                2. Ayrıştırılan Ürün Önizlemesi ({parsedItems.length})
              </h3>

              {parsedItems.length > 0 && (
                <button
                  onClick={handleExecuteImport}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {parsedItems.length} Ürünü Kataloğa Yükle
                </button>
              )}
            </div>

            {parsedItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Henüz işlenecek bir dosya veya CSV metni girilmedi.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold sticky top-0">
                      <th className="p-2">SKU</th>
                      <th className="p-2">Ürün Adı</th>
                      <th className="p-2">Kategori ID</th>
                      <th className="p-2">Fiyat (₺)</th>
                      <th className="p-2">Fiyat Türü</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-teal-800">{item.sku}</td>
                        <td className="p-2 font-sans font-semibold text-slate-900">{item.name}</td>
                        <td className="p-2 text-slate-500">{item.categoryId}</td>
                        <td className="p-2 text-slate-900 font-bold">{item.price ? `${item.price} ₺` : 'Fiyatsız'}</td>
                        <td className="p-2 text-slate-500">{item.priceType || 'Tek Fiyatı'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
