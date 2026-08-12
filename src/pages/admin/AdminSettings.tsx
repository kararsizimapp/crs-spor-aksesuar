import React, { useState, useRef } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { DEFAULT_SETTINGS } from '../../data/initialData';
import { HomeBanner } from '../../types';
import { uploadBannerImage } from '../../services/storageService';
import { Save, RotateCcw, AlertTriangle, ShieldCheck, Plus, Trash2, Edit2, Eye, EyeOff, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, showNotification } = useCatalog();

  const [siteName, setSiteName] = useState(settings.siteName || 'SCUCS Antrenman Malzemeleri');
  const [phone, setPhone] = useState(settings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency);
  const [homeHeroTitle, setHomeHeroTitle] = useState(settings.homeHeroTitle);
  const [homeHeroSubtext, setHomeHeroSubtext] = useState(settings.homeHeroSubtext);
  const [homeBannerImage, setHomeBannerImage] = useState(settings.homeBannerImage);
  const [aboutText, setAboutText] = useState(settings.aboutText);

  // Promo Banners State
  const [banners, setBanners] = useState<HomeBanner[]>(
    settings.promoBanners || DEFAULT_SETTINGS.promoBanners || []
  );

  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [newBanner, setNewBanner] = useState<Partial<HomeBanner>>({
    title: '',
    subtitle: '',
    badge: 'KAMPANYA',
    imageUrl: '',
    linkTab: 'products',
    buttonText: 'İncele',
    active: true,
  });

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // File Upload States & Refs
  const [isUploadingHomeBanner, setIsUploadingHomeBanner] = useState(false);
  const [isUploadingNewBanner, setIsUploadingNewBanner] = useState(false);
  const [uploadingBannerId, setUploadingBannerId] = useState<string | null>(null);

  const homeBannerFileRef = useRef<HTMLInputElement | null>(null);
  const newBannerFileRef = useRef<HTMLInputElement | null>(null);
  const existingBannerFileRef = useRef<HTMLInputElement | null>(null);
  const [selectedBannerToUpdate, setSelectedBannerToUpdate] = useState<string | null>(null);

  const handleUploadHomeBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingHomeBanner(true);
    try {
      const url = await uploadBannerImage(file);
      setHomeBannerImage(url);
      showNotification('Ana sayfa banner görseli başarıyla yüklendi.');
    } catch (err: any) {
      showNotification(err?.message || 'Görsel yüklenirken hata oluştu.', 'error');
    } finally {
      setIsUploadingHomeBanner(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUploadNewBannerImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingNewBanner(true);
    try {
      const url = await uploadBannerImage(file);
      setNewBanner((prev) => ({ ...prev, imageUrl: url }));
      showNotification('Banner görseli başarıyla yüklendi.');
    } catch (err: any) {
      showNotification(err?.message || 'Görsel yüklenirken hata oluştu.', 'error');
    } finally {
      setIsUploadingNewBanner(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUploadExistingBannerImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBannerToUpdate) return;
    const targetId = selectedBannerToUpdate;
    setUploadingBannerId(targetId);
    try {
      const url = await uploadBannerImage(file);
      setBanners((prev) =>
        prev.map((b) => (b.id === targetId ? { ...b, imageUrl: url } : b))
      );
      showNotification('Banner görseli başarıyla güncellendi.');
    } catch (err: any) {
      showNotification(err?.message || 'Görsel yüklenirken hata oluştu.', 'error');
    } finally {
      setUploadingBannerId(null);
      setSelectedBannerToUpdate(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddBanner = () => {
    if (!newBanner.title || !newBanner.imageUrl) {
      showNotification('Lütfen banner başlığı ve görsel URL alanlarını doldurun.', 'error');
      return;
    }
    const created: HomeBanner = {
      id: `banner-${Date.now()}`,
      title: newBanner.title || '',
      subtitle: newBanner.subtitle || '',
      badge: newBanner.badge || 'KAMPANYA',
      imageUrl: newBanner.imageUrl || '',
      linkTab: newBanner.linkTab || 'products',
      buttonText: newBanner.buttonText || 'İncele',
      active: true,
    };
    setBanners([...banners, created]);
    setNewBanner({
      title: '',
      subtitle: '',
      badge: 'KAMPANYA',
      imageUrl: '',
      linkTab: 'products',
      buttonText: 'İncele',
      active: true,
    });
    showNotification('Yeni banner eklendi.');
  };

  const handleDeleteBanner = (id: string) => {
    setBanners(banners.filter((b) => b.id !== id));
    showNotification('Banner silindi.');
  };

  const handleToggleBannerActive = (id: string) => {
    setBanners(
      banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteName,
      phone,
      whatsappNumber,
      email,
      address,
      defaultCurrency,
      homeHeroTitle,
      homeHeroSubtext,
      homeBannerImage,
      promoBanners: banners,
      aboutText,
    });
    showNotification('Sistem ayarları ve slider bannerları başarıyla güncellendi.');
  };

  const handleResetData = () => {
    resetToDemoData();
    setResetConfirmOpen(false);
    showNotification('Tüm ürün ve kategoriler orijinal fabrika demo verilerine sıfırlandı.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Genel Sistem & İletişim Ayarları</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Marka ismi, iletişim numaraları, WhatsApp bağlantısı ve ana sayfa başlıklarını yönetin.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-xs">
        {/* Brand & Communication */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            1. Marka ve İletişim Bilgileri
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marka / Katalog Adı</label>
              <input
                type="text"
                required
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-teal-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Varsayılan Para Birimi</label>
              <select
                value={defaultCurrency}
                onChange={e => setDefaultCurrency(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold"
              >
                <option value="TRY">Türk Lirası (₺)</option>
                <option value="USD">Amerikan Doları ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telefon Numarası</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Numarası (Ülke Kodlu)</label>
              <input
                type="text"
                placeholder="905300000000"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-emerald-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">E-Posta Adresi</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Firma / Mağaza Adresi</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        {/* Homepage Content */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            2. Ana Sayfa İçerik Yönetimi
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ana Sayfa Hero Başlığı</label>
            <input
              type="text"
              value={homeHeroTitle}
              onChange={e => setHomeHeroTitle(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ana Sayfa Alt Metni</label>
            <textarea
              rows={2}
              value={homeHeroSubtext}
              onChange={e => setHomeHeroSubtext(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ana Sayfa Banner Görseli</label>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={homeBannerImage}
                onChange={e => setHomeBannerImage(e.target.value)}
                className="flex-1 p-2.5 rounded-lg border border-slate-300 text-xs font-mono w-full"
              />
              <input
                type="file"
                ref={homeBannerFileRef}
                onChange={handleUploadHomeBanner}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingHomeBanner}
                onClick={() => homeBannerFileRef.current?.click()}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-50"
              >
                {isUploadingHomeBanner ? (
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                ) : (
                  <Upload className="w-4 h-4 text-teal-400" />
                )}
                <span>Fotoğraf Yükle</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hakkımızda Metni</label>
            <textarea
              rows={3}
              value={aboutText}
              onChange={e => setAboutText(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        {/* 3. Popüler Kategoriler Altı Kaydırılabilir Banner Slider Yönetimi */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                3. Popüler Kategoriler Altı Kaydırılabilir Banner Slider
              </h3>
              <p className="text-slate-500 text-[11px]">
                Ana sayfadaki popüler kategorilerin altında yayınlanan kaydırılabilir kampanya bannerlarını buradan düzenleyin veya yeni ekleyin.
              </p>
            </div>
            <span className="font-mono text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg border border-slate-200">
              {banners.length} Banner
            </span>
          </div>

          {/* Hidden File Input for Existing Banner Image Change */}
          <input
            type="file"
            ref={existingBannerFileRef}
            onChange={handleUploadExistingBannerImage}
            accept="image/*"
            className="hidden"
          />

          {/* Current Banners List */}
          <div className="space-y-3">
            {banners.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  b.active !== false ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-300 relative group">
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        {b.badge || 'KAMPANYA'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">{b.title}</h4>
                    </div>
                    {b.subtitle && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{b.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 justify-end">
                  <button
                    type="button"
                    disabled={uploadingBannerId === b.id}
                    onClick={() => {
                      setSelectedBannerToUpdate(b.id);
                      existingBannerFileRef.current?.click();
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                    title="Fotoğraf Yükle / Değiştir"
                  >
                    {uploadingBannerId === b.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-teal-400" />
                    )}
                    <span>Resim Değiştir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleBannerActive(b.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      b.active !== false
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {b.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{b.active !== false ? 'Yayında' : 'Gizli'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Banner Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Banner Form Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 text-teal-700">
              <Plus className="w-4 h-4" /> Yeni Banner Ekle
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Banner Başlığı *</label>
                <input
                  type="text"
                  placeholder="Örn: Yeni Sezon Slalom & Engeller"
                  value={newBanner.title || ''}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Etiket / Rozet Metni</label>
                <input
                  type="text"
                  placeholder="Örn: ÖNE ÇIKAN KAMPANYA"
                  value={newBanner.badge || ''}
                  onChange={(e) => setNewBanner({ ...newBanner, badge: e.target.value })}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Görsel Yükle veya URL *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... veya Yükle butonunu kullanın"
                    value={newBanner.imageUrl || ''}
                    onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                  />
                  <input
                    type="file"
                    ref={newBannerFileRef}
                    onChange={handleUploadNewBannerImage}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingNewBanner}
                    onClick={() => newBannerFileRef.current?.click()}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-50"
                  >
                    {isUploadingNewBanner ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-teal-400" />
                    )}
                    <span>Yükle</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Buton Metni & Hedef Sekme</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Örn: Kataloğu İncele"
                    value={newBanner.buttonText || ''}
                    onChange={(e) => setNewBanner({ ...newBanner, buttonText: e.target.value })}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs"
                  />
                  <select
                    value={newBanner.linkTab || 'products'}
                    onChange={(e) => setNewBanner({ ...newBanner, linkTab: e.target.value as any })}
                    className="p-2 bg-white rounded-lg border border-slate-300 text-xs font-bold"
                  >
                    <option value="products">Tüm Ürünler</option>
                    <option value="categories">Kategoriler</option>
                    <option value="brands">Marka Vitrini</option>
                    <option value="flipbook">E-Katalog</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Alt Açıklama Metni</label>
              <input
                type="text"
                placeholder="Örn: Kırılmaz esnek polimer hammadde, kulüp ve altyapı standartları."
                value={newBanner.subtitle || ''}
                onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddBanner}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-teal-400" />
                <span>Listeye Ekle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl border border-red-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Demo Verilere Sıfırla
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Ayarları Kaydet
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Fabrika Ayarlarına Dön?</h3>
              <p className="text-slate-500">
                Tüm eklenen yeni ürünler ve kategoriler silinip orijinal demoya geri dönülecektir. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700 cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 py-2 font-bold rounded-xl bg-red-600 text-white cursor-pointer"
              >
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
