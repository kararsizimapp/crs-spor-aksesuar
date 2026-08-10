import React, { useState, useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatters';
import {
  Search,
  PlusCircle,
  ListPlus,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CheckSquare,
  Square,
  MinusSquare,
  Layers,
  ImagePlus,
  Camera,
} from 'lucide-react';
import { AdminQuickImageUpload } from './AdminQuickImageUpload';

interface AdminProductsProps {
  onAddNew: () => void;
  onEdit: (id: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ onAddNew, onEdit }) => {
  const {
    products,
    categories,
    deleteProduct,
    deleteProductsBulk,
    updateProduct,
    duplicateProduct,
    togglePublishProduct,
    setSelectedProductDetail,
  } = useCatalog();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Selection state for batch/bulk actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Quick image upload state
  const [quickUploadProductId, setQuickUploadProductId] = useState<string | null>(null);
  const [showQuickUploadModal, setShowQuickUploadModal] = useState(false);

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

  // Handle select all filtered items
  const allFilteredSelected = useMemo(() => {
    if (filtered.length === 0) return false;
    return filtered.every(p => selectedProductIds.includes(p.id));
  }, [filtered, selectedProductIds]);

  const someFilteredSelected = useMemo(() => {
    if (filtered.length === 0) return false;
    const selectedCount = filtered.filter(p => selectedProductIds.includes(p.id)).length;
    return selectedCount > 0 && selectedCount < filtered.length;
  }, [filtered, selectedProductIds]);

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      // Unselect all filtered items
      const filteredIds = new Set(filtered.map(p => p.id));
      setSelectedProductIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      // Select all filtered items
      const newSelected = new Set(selectedProductIds);
      filtered.forEach(p => newSelected.add(p.id));
      setSelectedProductIds(Array.from(newSelected));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSingleDelete = async (id: string) => {
    await deleteProduct(id);
    setSelectedProductIds(prev => prev.filter(item => item !== id));
    setDeleteConfirmId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    setIsDeletingBulk(true);
    await deleteProductsBulk(selectedProductIds);
    setSelectedProductIds([]);
    setIsDeletingBulk(false);
    setShowBulkDeleteModal(false);
  };

  const handleBulkPublish = async (publish: boolean) => {
    const status = publish ? 'Yayında' : 'Pasif';
    for (const id of selectedProductIds) {
      await updateProduct(id, { status });
    }
    setSelectedProductIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Ürün Yönetimi</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Katalogdaki tüm ürünlerin listesi, toplu/seçmeli silme ve hızlı düzenleme işlemleri.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setQuickUploadProductId(products[0]?.id || null);
              setShowQuickUploadModal(true);
            }}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-amber-300"
          >
            <ImagePlus className="w-4 h-4 text-amber-600" />
            Hızlı Resim Yükle
          </button>

          <button
            onClick={onAddNew}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-teal-900/20 flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Tek Ürün Ekle
          </button>

          <button
            onClick={onAddNew}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-slate-800"
          >
            <ListPlus className="w-4 h-4 text-teal-400" />
            Çoklu Ürün Ekle (Tek Menü)
          </button>
        </div>
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

      {/* Bulk Action Bar (When items are selected) */}
      {selectedProductIds.length > 0 && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 font-extrabold text-xs flex items-center justify-center border border-teal-500/30">
              {selectedProductIds.length}
            </span>
            <div>
              <p className="text-xs font-bold text-white">
                {selectedProductIds.length} adet ürün seçildi
              </p>

              <p className="text-[11px] text-slate-400">
                Seçilen ürünler üzerinde toplu silme veya yayınlama işlemi yapabilirsiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={() => handleBulkPublish(true)}
              className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="Seçilenleri Yayına Al"
            >
              <Eye className="w-3.5 h-3.5" />
              Yayına Al
            </button>

            <button
              onClick={() => handleBulkPublish(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title="Seçilenleri Pasife Al"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Pasife Al
            </button>

            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Seçilenleri Sil ({selectedProductIds.length})
            </button>

            <button
              onClick={() => setSelectedProductIds([])}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs font-medium cursor-pointer"
            >
              Seçimi Temizle
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <th className="p-3.5 w-10 text-center">
                  <button
                    onClick={toggleSelectAllFiltered}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center mx-auto"
                    title={allFilteredSelected ? 'Tümünün Seçimini Kaldır' : 'Tümünü Seç'}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-teal-400" />
                    ) : someFilteredSelected ? (
                      <MinusSquare className="w-4 h-4 text-teal-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
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
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Filtre kriterlerine uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  const isSelected = selectedProductIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-teal-50/70 hover:bg-teal-50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(p.id)}
                          className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer accent-teal-600"
                        />
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickUploadProductId(p.id);
                              setShowQuickUploadModal(true);
                            }}
                            className="relative group cursor-pointer text-left focus:outline-none"
                            title="Hızlı Görsel Yükle / Değiştir"
                          >
                            <img
                              src={p.coverImage}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0 group-hover:brightness-75 transition-all"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-4 h-4 text-amber-300" />
                            </div>
                          </button>
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
                            {p.status === 'Yayında' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {p.status}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setQuickUploadProductId(p.id);
                              setShowQuickUploadModal(true);
                            }}
                            className="p-1.5 rounded-lg text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer border border-amber-200/80"
                            title="Hızlı Resim Yükle"
                          >
                            <ImagePlus className="w-4 h-4 text-amber-600" />
                          </button>

                          <button
                            onClick={() => togglePublishProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                            title={p.status === 'Yayında' ? 'Yayından Kaldır' : 'Yayına Al'}
                          >
                            {p.status === 'Yayında' ? (
                              <Eye className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            )}
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
                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
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

      {/* Single Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Ürünü Silmek İstiyor Musunuz?</h3>
              <p className="text-xs text-slate-500">
                Bu işlem geri alınamaz. Seçilen ürün canlı veritabanından tamamen silinecektir.
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
                onClick={() => handleSingleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Seçilen {selectedProductIds.length} Ürünü Silmek İstiyor Musunuz?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seçmiş olduğunuz <strong className="text-slate-900">{selectedProductIds.length}</strong> ürün canlı veritabanından kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={isDeletingBulk}
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                İptal
              </button>
              <button
                disabled={isDeletingBulk}
                onClick={handleBulkDelete}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-red-900/20 disabled:opacity-50"
              >
                {isDeletingBulk ? (
                  <span>Siliniyor...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Evet, Hepsini Sil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Image Upload Modal */}
      {showQuickUploadModal && (
        <AdminQuickImageUpload
          productId={quickUploadProductId}
          onClose={() => {
            setShowQuickUploadModal(false);
            setQuickUploadProductId(null);
          }}
        />
      )}
    </div>
  );
};
