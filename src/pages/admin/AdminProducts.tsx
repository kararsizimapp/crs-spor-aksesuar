import React, { useState, useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatters';
import {
  Search,
  PlusCircle,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface AdminProductsProps {
  onAddNew: () => void;
  onEdit: (id: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ onAddNew, onEdit }) => {
  const {
    products,
    categories,
    deleteProduct,
    duplicateProduct,
    togglePublishProduct,
    setSelectedProductDetail,
  } = useCatalog();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }

      if (selectedCat && p.categoryId !== selectedCat) return false;
      if (selectedStatus && p.status !== selectedStatus) return false;

      return true;
    });
  }, [products, search, selectedCat, selectedStatus]);

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Ürün Yönetimi</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Katalogdaki tüm ürünlerin listesi, yayın durumları ve hızlı düzenleme işlemleri.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-teal-900/20 flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Yeni Ürün Ekle
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Ürün adı veya SKU (SCX)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div>
          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
          >
            <option value="">Tüm Durumlar</option>
            <option value="Yayında">Yayında</option>
            <option value="Taslak">Taslak</option>
            <option value="Pasif">Pasif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <th className="p-3.5">Görsel / SKU</th>
                <th className="p-3.5">Ürün Adı</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Fiyat / Tür</th>
                <th className="p-3.5">Stok / Durum</th>
                <th className="p-3.5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Filtre kriterlerine uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2">
                          <img
                            src={p.coverImage}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                          />
                          <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
                            {p.sku}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-slate-900">
                        <button
                          onClick={() => setSelectedProductDetail(p)}
                          className="hover:text-teal-700 text-left line-clamp-1 cursor-pointer"
                        >
                          {p.name}
                        </button>
                        {p.isNew && (
                          <span className="inline-block ml-2 text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded">
                            YENİ
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-600 font-medium">
                        {cat?.name || '—'}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">
                          {formatPrice(p.price, p.currency, p.showPrice)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {p.priceType}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              p.status === 'Yayında'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 'Taslak'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.status === 'Yayında' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {p.status}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => togglePublishProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                            title={p.status === 'Yayında' ? 'Yayından Kaldır' : 'Yayına Al'}
                          >
                            {p.status === 'Yayında' ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                          </button>

                          <button
                            onClick={() => duplicateProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Ürünü Çoğalt"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEdit(p.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Ürünü Silmek İstiyor Musunuz?</h3>
              <p className="text-xs text-slate-500">
                Bu işlem geri alınamaz. Ürün katalogdan tamamen silinecektir.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
