import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Save, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, showNotification } = useCatalog();

  const [siteName, setSiteName] = useState(settings.siteName);
  const [phone, setPhone] = useState(settings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency);
  const [homeHeroTitle, setHomeHeroTitle] = useState(settings.homeHeroTitle);
  const [homeHeroSubtext, setHomeHeroSubtext] = useState(settings.homeHeroSubtext);
  const [homeBannerImage, setHomeBannerImage] = useState(settings.homeBannerImage);
  const [aboutText, setAboutText] = useState(settings.aboutText);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

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
      aboutText,
    });
    showNotification('Sistem ve iletişim ayarları güncellendi.');
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
            <label className="block font-semibold text-slate-700 mb-1">Ana Sayfa Banner Görsel URL</label>
            <input
              type="text"
              value={homeBannerImage}
              onChange={e => setHomeBannerImage(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
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
