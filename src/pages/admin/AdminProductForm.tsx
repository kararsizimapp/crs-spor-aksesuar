import React, { useState, useEffect } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Product, ProductVariant, Specification, PriceType, StockStatus, ProductStatus } from '../../types';
import { generateSlug } from '../../utils/formatters';
import { convertFileToBase64 } from '../../utils/imageUtils';
import { AdminMultiProductForm } from './AdminMultiProductForm';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Layers,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Upload,
  Loader2,
  ListPlus,
  FileText,
} from 'lucide-react';

interface AdminProductFormProps {
  productId?: string | null;
  onClose: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({ productId, onClose }) => {
  const { products, categories, addProduct, updateProduct } = useCatalog();

  const existingProduct = productId ? products.find(p => p.id === productId) : null;

  // Active Tab in Form
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'price' | 'images' | 'variants'>('basic');
  const [creationMode, setCreationMode] = useState<'single' | 'multi'>('single');

  // Form State
  const [name, setName] = useState(existingProduct?.name || '');
  const [brand, setBrand] = useState(existingProduct?.brand || '');
  const [sku, setSku] = useState(existingProduct?.sku || '');
  const [slug, setSlug] = useState(existingProduct?.slug || '');
  const [categoryId, setCategoryId] = useState(existingProduct?.categoryId || (categories[0]?.id || ''));
  const [subcategoryId, setSubcategoryId] = useState(existingProduct?.subcategoryId || '');
  const [shortDescription, setShortDescription] = useState(existingProduct?.shortDescription || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [status, setStatus] = useState<ProductStatus>(existingProduct?.status || 'Yayında');
  const [featured, setFeatured] = useState<boolean>(existingProduct?.featured || false);
  const [isNew, setIsNew] = useState<boolean>(existingProduct?.isNew || false);
  const [sortOrder, setSortOrder] = useState<number>(existingProduct?.sortOrder || 1);

  // Price State
  const [price, setPrice] = useState<string>(existingProduct?.price !== undefined && existingProduct?.price !== null ? existingProduct.price.toString() : '');
  const [discountPrice, setDiscountPrice] = useState<string>(existingProduct?.discountPrice ? existingProduct.discountPrice.toString() : '');
  const [currency, setCurrency] = useState<string>(existingProduct?.currency || 'TRY');
  const [priceType, setPriceType] = useState<PriceType>(existingProduct?.priceType || 'Tek Fiyatı');
  const [showPrice, setShowPrice] = useState<boolean>(existingProduct?.showPrice ?? true);
  const [taxStatus, setTaxStatus] = useState<'KDV Dahil' | 'KDV Hariç'>(existingProduct?.taxStatus || 'KDV Dahil');
  const [vatRate, setVatRate] = useState<number>(existingProduct?.vatRate ?? 20);
  const [stockStatus, setStockStatus] = useState<StockStatus>(existingProduct?.stockStatus || 'Stokta Var');

  // Specs & Details State
  const [material, setMaterial] = useState(existingProduct?.material || '');
  const [weight, setWeight] = useState(existingProduct?.weight || '');
  const [dimensions, setDimensions] = useState(existingProduct?.dimensions || '');
  const [packageQuantity, setPackageQuantity] = useState(existingProduct?.packageQuantity || '');
  const [setContents, setSetContents] = useState(existingProduct?.setContents || '');
  const [specifications, setSpecifications] = useState<Specification[]>(existingProduct?.specifications || []);

  // Images State
  const [coverImage, setCoverImage] = useState(existingProduct?.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c6232661a0b?auto=format&fit=crop&w=800&q=80');
  const [images, setImages] = useState<string[]>(existingProduct?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Variants State
  const [variants, setVariants] = useState<ProductVariant[]>(existingProduct?.variants || []);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantSku, setNewVariantSku] = useState('');
  const [newVariantColor, setNewVariantColor] = useState('#EF4444');

  // SEO
  const [seoTitle, setSeoTitle] = useState(existingProduct?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(existingProduct?.seoDescription || '');

  // Auto-generate slug when SKU or Name changes
  useEffect(() => {
    if (!existingProduct && (name || sku)) {
      setSlug(generateSlug(`${sku} ${name}`));
    }
  }, [name, sku, existingProduct]);

  // Selected Category subcategories
  const selectedCatObj = categories.find(c => c.id === categoryId);
  const subcategories = selectedCatObj?.subcategories || [];

  // Spec Handlers
  const handleAddSpec = () => {
    setSpecifications(prev => [
      ...prev,
      { id: `spec-${Date.now()}`, title: '', value: '' },
    ]);
  };

  const handleUpdateSpec = (id: string, field: 'title' | 'value', val: string) => {
    setSpecifications(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleRemoveSpec = (id: string) => {
    setSpecifications(prev => prev.filter(s => s.id !== id));
  };

  const handleMoveSpec = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === specifications.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...specifications];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setSpecifications(copy);
  };

  // Image Handlers
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const base64 = await convertFileToBase64(file);
      setCoverImage(base64);
    } catch (err) {
      console.error('Error processing cover file:', err);
      alert('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const newBase64s: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const b64 = await convertFileToBase64(files[i]);
        newBase64s.push(b64);
      }
      setImages(prev => [...prev, ...newBase64s]);
    } catch (err) {
      console.error('Error processing gallery files:', err);
      alert('Görseller yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Variant Handlers
  const handleAddVariant = () => {
    if (!newVariantName.trim()) return;
    const v: ProductVariant = {
      id: `v-${Date.now()}`,
      name: newVariantName.trim(),
      sku: newVariantSku.trim() || `${sku}-${newVariantName.trim().slice(0, 3).toUpperCase()}`,
      color: newVariantColor,
      stockStatus: 'Stokta Var',
      active: true,
    };
    setVariants(prev => [...prev, v]);
    setNewVariantName('');
    setNewVariantSku('');
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  // Save Form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      alert('Lütfen ürün adı ve ürün kodunu (SKU) doldurunuz.');
      return;
    }

    const numPrice = price.trim() !== '' ? parseFloat(price.replace(',', '.')) : null;
    const numDisc = discountPrice.trim() !== '' ? parseFloat(discountPrice.replace(',', '.')) : null;

    const productPayload = {
      name: name.trim(),
      brand: brand.trim() || undefined,
      sku: sku.trim(),
      slug: slug || generateSlug(`${sku} ${name}`),
      categoryId,
      subcategoryId: subcategoryId || undefined,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      price: numPrice,
      discountPrice: numDisc,
      currency,
      priceType,
      showPrice,
      taxStatus,
      vatRate,
      stockStatus,
      status,
      featured,
      isNew,
      coverImage,
      images: images.length > 0 ? images : [coverImage],
      colors: variants.map(v => v.name),
      specifications: specifications.filter(s => s.title.trim() !== ''),
      variants,
      packageQuantity: packageQuantity.trim() || undefined,
      setContents: setContents.trim() || undefined,
      material: material.trim() || undefined,
      weight: weight.trim() || undefined,
      dimensions: dimensions.trim() || undefined,
      sortOrder,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
    };

    if (existingProduct) {
      updateProduct(existingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    onClose();
  };

  if (!existingProduct && creationMode === 'multi') {
    return (
      <AdminMultiProductForm
        onClose={onClose}
        onSwitchToSingleForm={() => setCreationMode('single')}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-teal-400 text-xs font-mono font-bold uppercase tracking-wider">
              {existingProduct ? 'Düzenleme Modu' : 'Yeni Kayıt'}
            </span>
            <h2 className="text-xl font-black text-white">
              {existingProduct ? `${existingProduct.sku} - ${existingProduct.name}` : 'Yeni Ürün Ekle'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!existingProduct && (
            <button
              type="button"
              onClick={() => setCreationMode('multi')}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold text-xs rounded-xl border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ListPlus className="w-4 h-4 text-teal-400" />
              Çoklu Ürün Ekle (Tek Menü)
            </button>
          )}

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-900/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Kaydet ve Yayınla
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap gap-1.5">
        {[
          { id: 'basic', label: 'Hızlı Temel Bilgiler' },
          { id: 'price', label: 'Hızlı Fiyat & Stok' },
          { id: 'images', label: 'Hızlı Görseller' },
          { id: 'variants', label: `Hızlı Varyantlar (${variants.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFormTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeFormTab === tab.id
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Fields Section */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {/* TAB 1: BASIC INFO */}
        {activeFormTab === 'basic' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block font-bold text-slate-800 mb-1">
                  Marka Adı
                </label>
                <input
                  type="text"
                  placeholder="örn. ADIDAS, SELEX, SCX"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-amber-300 bg-amber-50/50 focus:bg-white focus:outline-none focus:border-amber-500 font-extrabold uppercase text-amber-950"
                />
                {/* Existing Brand Quick Pills */}
                {Array.from(new Set(products.map(p => p.brand).filter(Boolean))).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="text-[10px] text-slate-400 self-center">Hızlı Seç:</span>
                    {Array.from(new Set(products.map(p => p.brand).filter(Boolean))).map((b, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBrand(b as string)}
                        className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Ürün Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="örn. Antrenman Çanağı Standart"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Ürün Kodu / SKU *</label>
                <input
                  type="text"
                  required
                  placeholder="örn. SCX 1080"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-teal-800 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Kategori *</label>
                <select
                  value={categoryId}
                  onChange={e => {
                    setCategoryId(e.target.value);
                    setSubcategoryId('');
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:border-teal-600"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Alt Kategori</label>
                <select
                  value={subcategoryId}
                  onChange={e => setSubcategoryId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:border-teal-600"
                >
                  <option value="">Alt Kategori Seçiniz (İsteğe Bağlı)</option>
                  {subcategories.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Kısa Açıklama (Özet)</label>
              <input
                type="text"
                placeholder="Ürün kartlarında görünecek tek cümlelik özet..."
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Detaylı Açıklama</label>
              <textarea
                rows={4}
                placeholder="Ürün malzemesi, kullanım alanları, kulüp ve takım için avantajları..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Yayın Durumu</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ProductStatus)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="Yayında">Yayında</option>
                  <option value="Taslak">Taslak</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Sıralama</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={e => setSortOrder(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex flex-col justify-end space-y-2 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Öne Çıkan Ürün</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={e => setIsNew(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Yeni Ürün Etiketi</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRICE & STOCK */}
        {activeFormTab === 'price' && (
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800 text-xs">
              💡 <strong>Bilgi:</strong> Fiyat alanları zorunlu değildir. Fiyat girilmediğinde veya gizlendiğinde sitede otomatik olarak <strong>"Fiyat için iletişime geçiniz"</strong> ifadesi gösterilir.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Satış Fiyatı (₺)</label>
                <input
                  type="text"
                  placeholder="örn. 1250,00"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">İndirimli Fiyat (₺)</label>
                <input
                  type="text"
                  placeholder="örn. 990,00"
                  value={discountPrice}
                  onChange={e => setDiscountPrice(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Para Birimi</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value="TRY">Türk Lirası (₺)</option>
                  <option value="USD">Amerikan Doları ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">KDV Durumu</label>
                <select
                  value={taxStatus}
                  onChange={e => setTaxStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="KDV Dahil">KDV Dahil</option>
                  <option value="KDV Hariç">KDV Hariç</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">KDV Oranı (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="20"
                    value={vatRate}
                    onChange={e => setVatRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Stok Durumu</label>
                <select
                  value={stockStatus}
                  onChange={e => setStockStatus(e.target.value as StockStatus)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Stokta Var">Stokta Var</option>
                  <option value="Sınırlı Stok">Sınırlı Stok</option>
                  <option value="Stokta Yok">Stokta Yok</option>
                  <option value="Sipariş Üzerine">Sipariş Üzerine</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={e => setShowPrice(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <span>Fiyat Sitede Gösterilsin</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: IMAGES */}
        {activeFormTab === 'images' && (
          <div className="space-y-6 text-xs">
            {/* Cover Image Section */}
            <div className="space-y-3">
              <label className="block font-bold text-slate-800 text-sm">
                Ana Kapak Görseli *
              </label>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-36 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-center relative shadow-xs">
                  {coverImage ? (
                    <img src={coverImage} alt="Kapak Önizleme" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      1. Bilgisayardan Fotoğraf Yükle (Herkes Görebilir)
                    </label>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer shadow-xs transition-colors">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Yükleniyor...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Bilgisayarımdan Fotoğraf Seç</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      2. Veya Dış Görsel URL Adresi
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://..."
                      value={coverImage}
                      onChange={e => setCoverImage(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Images Section */}
            <div className="pt-5 border-t border-slate-200 space-y-3">
              <label className="block font-bold text-slate-800 text-sm">
                Galeri Görselleri (Çoklu Fotoğraf)
              </label>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer shadow-xs transition-colors text-xs">
                  <Upload className="w-4 h-4" />
                  <span>Bilgisayardan Çoklu Fotoğraf Yükle</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>

                <span className="text-slate-400 font-medium">veya</span>

                <div className="flex-1 flex gap-2 w-full">
                  <input
                    type="text"
                    placeholder="Görsel URL yapıştırın..."
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer"
                  >
                    Ekle
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-50 aspect-video shadow-2xs">
                    <img src={img} alt={`Görsel ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VARIANTS */}
        {activeFormTab === 'variants' && (
          <div className="space-y-6 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Yeni Renk / Model Varyantı Ekle
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Varyant Adı (örn. Kırmızı)</label>
                  <input
                    type="text"
                    placeholder="Kırmızı"
                    value={newVariantName}
                    onChange={e => setNewVariantName(e.target.value)}
                    className="w-full p-2 bg-white rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Varyant Kodu / SKU</label>
                  <input
                    type="text"
                    placeholder="örn. SCX 1080-K"
                    value={newVariantSku}
                    onChange={e => setNewVariantSku(e.target.value)}
                    className="w-full p-2 bg-white rounded border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Renk Seçimi</label>
                  <input
                    type="color"
                    value={newVariantColor}
                    onChange={e => setNewVariantColor(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Varyantı Ekle
              </button>
            </div>

            {/* List of Existing Variants */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">Mevcut Varyantlar ({variants.length})</h4>
              {variants.length === 0 ? (
                <p className="text-slate-400 text-xs">Henüz bu ürüne ait ek renk varyantı yok.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {variants.map(v => (
                    <div key={v.id} className="p-3 flex items-center justify-between bg-white">
                      <div className="flex items-center space-x-3">
                        <span
                          className="w-5 h-5 rounded-full border border-slate-300"
                          style={{ backgroundColor: v.color }}
                        />
                        <div>
                          <strong className="text-slate-900 block">{v.name}</strong>
                          <span className="font-mono text-slate-500 text-[11px]">{v.sku}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Bar at bottom of Form */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            İptal
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Ürünü Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};
