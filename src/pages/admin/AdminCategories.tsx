import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Category, Subcategory } from '../../types';
import { generateSlug, getCategoryImage, DEFAULT_FALLBACK_IMAGE } from '../../utils/formatters';
import { convertFileToBase64 } from '../../utils/imageUtils';
import { Plus, Edit, Trash2, Layers, AlertTriangle, ChevronRight, FolderPlus, Upload, Loader2 } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useCatalog();

  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form inputs for main category
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const base64 = await convertFileToBase64(file);
      setCatImage(base64);
    } catch (err) {
      console.error('Error uploading category image:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Subcategory Add Form
  const [addingSubForCatId, setAddingSubForCatId] = useState<string | null>(null);
  const [subName, setSubName] = useState('');

  // Delete Confirm Modal
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const startCreate = () => {
    setEditingCat(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatImage('https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=600&q=80');
    setIsAddingNew(true);
  };

  const startEdit = (c: Category) => {
    setEditingCat(c);
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatDesc(c.description || '');
    setCatImage(c.image || '');
    setIsAddingNew(false);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const payload = {
      name: catName.trim(),
      slug: catSlug || generateSlug(catName),
      description: catDesc.trim(),
      image: catImage || 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=600&q=80',
      sortOrder: editingCat ? editingCat.sortOrder : categories.length + 1,
      subcategories: editingCat ? editingCat.subcategories : [],
    };

    if (editingCat) {
      updateCategory(editingCat.id, payload);
    } else {
      addCategory(payload);
    }

    setIsAddingNew(false);
    setEditingCat(null);
  };

  const handleAddSubcategory = (catId: string) => {
    if (!subName.trim()) return;

    const targetCat = categories.find(c => c.id === catId);
    if (!targetCat) return;

    const newSub: Subcategory = {
      id: `sub-${Date.now()}`,
      categoryId: catId,
      name: subName.trim(),
      slug: generateSlug(subName),
      active: true,
    };

    const updatedSubcategories = [...(targetCat.subcategories || []), newSub];
    updateCategory(catId, { subcategories: updatedSubcategories });

    setSubName('');
    setAddingSubForCatId(null);
  };

  const handleRemoveSubcategory = (catId: string, subId: string) => {
    const targetCat = categories.find(c => c.id === catId);
    if (!targetCat) return;

    const updatedSubcategories = (targetCat.subcategories || []).filter(s => s.id !== subId);
    updateCategory(catId, { subcategories: updatedSubcategories });
  };

  const confirmDeleteCategory = (catId: string) => {
    deleteCategory(catId);
    setDeleteCatId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Kategori Yönetimi</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Ürün kataloğunun ana ve alt kategorilerini düzenleyin, yeni grup ekleyin.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yeni Ana Kategori Ekle
        </button>
      </div>

      {/* Modal / Form for Category */}
      {(isAddingNew || editingCat) && (
        <form onSubmit={handleSaveCategory} className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <h3 className="font-bold text-sm text-teal-400">
            {editingCat ? `Kategori Düzenle: ${editingCat.name}` : 'Yeni Ana Kategori Ekle'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-300">Kategori Adı *</label>
              <input
                type="text"
                required
                value={catName}
                onChange={e => {
                  setCatName(e.target.value);
                  if (!editingCat) setCatSlug(generateSlug(e.target.value));
                }}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-300">Kategori Görseli</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Görsel URL (https://...)"
                  value={catImage}
                  onChange={e => setCatImage(e.target.value)}
                  className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-teal-500 font-mono text-xs"
                />
                <label className="px-3 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 flex-shrink-0 text-xs">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Dosya Yükle</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-300">Açıklama</label>
            <input
              type="text"
              value={catDesc}
              onChange={e => setCatDesc(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                setEditingCat(null);
              }}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 cursor-pointer"
            >
              Kaydet
            </button>
          </div>
        </form>
      )}

      {/* List of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const categoryProducts = products.filter(p => p.categoryId === cat.id);

          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getCategoryImage(cat)}
                      alt={cat.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-sm text-white">{cat.name}</h3>
                      <span className="text-[11px] text-teal-400 font-mono">
                        {categoryProducts.length} Ürün Bağlı
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-300 cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCatId(cat.id)}
                      className="p-1.5 hover:bg-red-900/60 rounded text-red-400 cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-500">{cat.description || 'Açıklama girilmemiş.'}</p>

                  {/* Subcategories */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Alt Kategoriler ({(cat.subcategories || []).length})
                      </span>
                      <button
                        onClick={() => setAddingSubForCatId(cat.id)}
                        className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5" /> Alt Kategori Ekle
                      </button>
                    </div>

                    {addingSubForCatId === cat.id && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Alt Kategori Adı"
                          value={subName}
                          onChange={e => setSubName(e.target.value)}
                          className="flex-1 p-1.5 text-xs rounded border border-slate-300"
                        />
                        <button
                          onClick={() => handleAddSubcategory(cat.id)}
                          className="px-3 py-1.5 bg-teal-600 text-white font-bold text-xs rounded cursor-pointer"
                        >
                          Ekle
                        </button>
                        <button
                          onClick={() => setAddingSubForCatId(null)}
                          className="px-2 py-1.5 bg-slate-100 text-slate-600 text-xs rounded cursor-pointer"
                        >
                          İptal
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(cat.subcategories || []).map(sub => (
                        <span
                          key={sub.id}
                          className="bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1"
                        >
                          {sub.name}
                          <button
                            onClick={() => handleRemoveSubcategory(cat.id, sub.id)}
                            className="text-slate-400 hover:text-red-600 ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Category Confirmation */}
      {deleteCatId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Kategoriyi Sil</h3>
              <p className="text-xs text-slate-500">
                Bu kategoriyi silmek istediğinize emin misiniz? Bağlı ürünler kategorisiz kalabilir.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteCatId(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={() => confirmDeleteCategory(deleteCatId)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 text-white cursor-pointer"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
