import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useCatalog } from '../../context/CatalogContext';
import { convertFileToBase64 } from '../../utils/imageUtils';
import {
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Star,
  Sparkles,
  Link as LinkIcon,
  Loader2,
  ImagePlus,
} from 'lucide-react';

interface AdminQuickImageUploadProps {
  productId: string | null;
  onClose: () => void;
}

export const AdminQuickImageUpload: React.FC<AdminQuickImageUploadProps> = ({
  productId,
  onClose,
}) => {
  const { products, categories, updateProduct, showNotification } = useCatalog();

  // Selected product state
  const [currentId, setCurrentId] = useState<string | null>(productId || (products[0]?.id || null));

  const currentProduct = products.find(p => p.id === currentId);
  const currentIndex = products.findIndex(p => p.id === currentId);

  // Form image states
  const [coverImage, setCoverImage] = useState<string>('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [filterMissingOnly, setFilterMissingOnly] = useState<boolean>(false);

  // Filter products list for quick cycle
  const displayProducts = filterMissingOnly
    ? products.filter(
        p =>
          !p.coverImage ||
          p.coverImage.includes('unsplash') ||
          p.coverImage.includes('placeholder')
      )
    : products;

  // Sync state when product changes
  useEffect(() => {
    if (currentProduct) {
      setCoverImage(currentProduct.coverImage || '');
      setGallery(currentProduct.gallery || []);
      setImageUrlInput('');
    }
  }, [currentId, currentProduct]);

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

  const category = categories.find(c => c.id === currentProduct.categoryId);

  // Handle local file selection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const base64 = await convertFileToBase64(files[i]);
        newImages.push(base64);
      }

      if (!coverImage || coverImage.includes('unsplash') || coverImage.includes('placeholder')) {
        setCoverImage(newImages[0]);
        if (newImages.length > 1) {
          setGallery(prev => [...prev, ...newImages.slice(1)]);
        }
      } else {
        setGallery(prev => [...prev, ...newImages]);
      }

      showNotification(`${newImages.length} adet resim yüklendi.`);
    } catch (err) {
      console.error('File upload error:', err);
      showNotification('Resim yüklenirken bir hata oluştu.', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Add via URL input
  const handleAddUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;

    if (!coverImage || coverImage.includes('unsplash') || coverImage.includes('placeholder')) {
      setCoverImage(url);
    } else {
      setGallery(prev => [...prev, url]);
    }

    setImageUrlInput('');
    showNotification('Resim bağlantısı eklendi.');
  };

  // Set gallery image as cover image
  const handleMakeCover = (index: number) => {
    const selected = gallery[index];
    const oldCover = coverImage;

    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    if (oldCover) {
      newGallery.push(oldCover);
    }

    setCoverImage(selected);
    setGallery(newGallery);
    showNotification('Kapak resmi değiştirildi.');
  };

  // Remove gallery item
  const handleRemoveGalleryItem = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  // Save changes
  const handleSave = async (autoNext: boolean = false) => {
    setIsSaving(true);
    try {
      await updateProduct(currentProduct.id, {
        coverImage,
        gallery,
      });

      showNotification(`"${currentProduct.name}" resimleri güncellendi!`);

      if (autoNext && currentIndex < products.length - 1) {
        setCurrentId(products[currentIndex + 1].id);
      } else if (!autoNext) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving images:', err);
      showNotification('Kayıt sırasında hata oluştu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Navigation between products
  const handlePrevProduct = () => {
    if (currentIndex > 0) {
      setCurrentId(products[currentIndex - 1].id);
    }
  };

  const handleNextProduct = () => {
    if (currentIndex < products.length - 1) {
      setCurrentId(products[currentIndex + 1].id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <ImagePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-teal-900/80 text-teal-300 px-2 py-0.5 rounded border border-teal-700/80 uppercase">
                  HIZLI RESİM YÜKLE
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
              onClick={handlePrevProduct}
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
              {displayProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextProduct}
              disabled={currentIndex >= products.length - 1}
              className="p-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 disabled:opacity-30 cursor-pointer transition-colors flex items-center gap-1 font-bold"
            >
              <span>Sonraki</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-600">
              Kategori: <span className="text-slate-900">{category?.name || 'Genel'}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] font-bold text-slate-600 font-mono">
              SKU: <span className="text-teal-700">{currentProduct.sku}</span>
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Cover Image Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Ana Kapak Resmi
              </label>
              {coverImage && (
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Aktif
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Preview Box */}
              <div className="relative group w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center shadow-inner">
                {coverImage ? (
                  <>
                    <img
                      src={coverImage}
                      alt="Kapak"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-lg"
                        title="Kapak Resmini Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-slate-400 p-4 space-y-2">
                    <ImageIcon className="w-10 h-10 mx-auto opacity-40 text-slate-500" />
                    <p className="text-[11px] font-bold">Resim Yok</p>
                  </div>
                )}
              </div>

              {/* Upload & Paste Controls */}
              <div className="sm:col-span-2 space-y-3">
                {/* File Upload Box */}
                <label className="block p-4 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 rounded-2xl text-center cursor-pointer transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    <span className="font-extrabold text-slate-800 text-xs">
                      Bilgisayardan Resim Seç veya Sürükle
                    </span>
                    <span className="text-[10px] text-slate-500">
                      JPG, PNG, WEBP (Birden fazla seçebilirsiniz)
                    </span>
                  </div>
                </label>

                {/* URL Paste Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    veya Resim URL Bağlantısı Ekle
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrlInput}
                        onChange={e => setImageUrlInput(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono"
                      />
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      disabled={!imageUrlInput.trim()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Images Section */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Ek Ürün Galerisi ({gallery.length} Adet)
              </label>
            </div>

            {gallery.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-xs">
                Bu ürüne ait henüz ek galeri resmi bulunmuyor. Yukarıdaki yükleme alanından çoklu resim yükleyebilirsiniz.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
                  >
                    <img src={img} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />

                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between items-center text-center">
                      <button
                        type="button"
                        onClick={() => handleMakeCover(idx)}
                        className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-md shadow-md cursor-pointer transition-colors"
                      >
                        Kapak Yap
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(idx)}
                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-md cursor-pointer transition-colors"
                        title="Resmi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              İptal
            </button>
          </div>

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
