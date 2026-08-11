import React, { useState, useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { getProductImage, DEFAULT_FALLBACK_IMAGE } from '../utils/formatters';
import { X, Send, Building, User, Phone, Mail, MapPin, Hash, Package } from 'lucide-react';

export const QuoteModal: React.FC = () => {
  const { quoteModalProduct, setQuoteModalProduct, addQuoteRequest } = useCatalog();

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [message, setMessage] = useState('');
  const [kvkkConsent, setKvkkConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quoteModalProduct) {
      setMessage(`Merhaba, ${quoteModalProduct.name} (${quoteModalProduct.sku}) için kurumsal fiyat ve teslimat teklifi almak istiyoruz.`);
    }
  }, [quoteModalProduct]);

  if (!quoteModalProduct) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkkConsent) {
      alert('Lütfen KVKK aydınlatma metnini onaylayınız.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addQuoteRequest({
        fullName,
        companyName,
        phone,
        email,
        city,
        productName: quoteModalProduct.name,
        productSku: quoteModalProduct.sku,
        quantity,
        message,
        kvkkConsent,
      });

      setIsSubmitting(false);
      setQuoteModalProduct(null);
      // Reset
      setFullName('');
      setCompanyName('');
      setPhone('');
      setEmail('');
      setCity('');
      setQuantity(10);
      setMessage('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="text-teal-400 text-xs font-mono font-bold uppercase tracking-wider mb-0.5">
              B2B Kurumsal Teklif Formu
            </div>
            <h3 className="text-lg font-bold text-white">Teklif Talebi Oluştur</h3>
          </div>
          <button
            onClick={() => setQuoteModalProduct(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Product Summary Box */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-3">
          <img
            src={getProductImage(quoteModalProduct)}
            alt={quoteModalProduct.name}
            className="w-14 h-14 object-cover rounded-lg border border-slate-200 flex-shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
            }}
          />
          <div className="flex-1 min-w-0">
            <span className="bg-teal-700 text-teal-50 font-mono text-[11px] font-bold px-2 py-0.5 rounded">
              {quoteModalProduct.sku}
            </span>
            <h4 className="font-bold text-slate-900 text-sm truncate mt-1">
              {quoteModalProduct.name}
            </h4>
            <span className="text-xs text-slate-500">
              {quoteModalProduct.priceType}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ad Soyad *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Firma / Kulüp Adı *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="XYZ Spor Kulübü"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefon *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="0532 000 00 00"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-Posta *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="ornek@firma.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Şehir
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="İstanbul"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Talep Edilen Adet
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 font-semibold"
                />
                <Package className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mesaj ve Özel Talepler
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Sipariş detayları, renk tercihleri, özel teslimat taleplerinizi yazabilirsiniz..."
              className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
            />
          </div>

          {/* KVKK Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="kvkkConsent"
              checked={kvkkConsent}
              onChange={e => setKvkkConsent(e.target.checked)}
              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            />
            <label htmlFor="kvkkConsent" className="text-[11px] text-slate-600 leading-snug">
              Kişisel verilerimin KVKK aydınlatma metni kapsamında teklif hazırlanması ve iletişim kurulması amacıyla işlenmesini onaylıyorum.
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setQuoteModalProduct(null)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-900/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Gönderiliyor...' : 'Teklif Talebini Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
