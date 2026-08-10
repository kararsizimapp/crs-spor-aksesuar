import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { formatCurrency } from '../utils/formatters';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  FileText,
  Printer,
  Send,
  Building2,
  Phone,
  Mail,
  User,
  MessageSquare,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const QuoteBasketDrawer: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    addQuoteRequest,
    settings,
  } = useCatalog();

  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [priceDisplayType, setPriceDisplayType] = useState<'vat_incl' | 'vat_excl'>('vat_incl');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  // Calculate Subtotal, Tax and Total
  const subtotalNet = cartItems.reduce((acc, item) => {
    const unitNet = item.product.vatIncludedPrice
      ? item.product.vatIncludedPrice / (1 + (item.product.vatRate || 20) / 100)
      : item.product.price;
    return acc + unitNet * item.quantity;
  }, 0);

  const totalVat = cartItems.reduce((acc, item) => {
    const unitNet = item.product.vatIncludedPrice
      ? item.product.vatIncludedPrice / (1 + (item.product.vatRate || 20) / 100)
      : item.product.price;
    const unitVat = unitNet * ((item.product.vatRate || 20) / 100);
    return acc + unitVat * item.quantity;
  }, 0);

  const grandTotal = subtotalNet + totalVat;
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Send via WhatsApp
  const handleWhatsAppSend = () => {
    if (cartItems.length === 0) return;

    let message = `*CRS SPOR B2B TEKLİF TALEBİ*\n`;
    message += `----------------------------\n`;
    if (customerName) message += `*Müşteri / Yetkili:* ${customerName}\n`;
    if (companyName) message += `*Firma:* ${companyName}\n`;
    if (phone) message += `*Telefon:* ${phone}\n`;
    if (email) message += `*E-posta:* ${email}\n`;
    message += `----------------------------\n`;
    message += `*TALEP EDİLEN ÜRÜNLER LISTESİ:*\n\n`;

    cartItems.forEach((item, index) => {
      const price = priceDisplayType === 'vat_incl' 
        ? (item.product.vatIncludedPrice || item.product.price * 1.2)
        : item.product.price;
      const lineTotal = price * item.quantity;

      message += `${index + 1}. *${item.product.name}*\n`;
      message += `   • Kod / SKU: ${item.product.sku}\n`;
      message += `   • Adet: ${item.quantity}\n`;
      message += `   • Birim Fiyat: ${formatCurrency(price)}\n`;
      message += `   • Toplam Tutar: ${formatCurrency(lineTotal)}\n\n`;
    });

    message += `----------------------------\n`;
    message += `*Genel Toplam (KDV Dahil):* ${formatCurrency(grandTotal)}\n`;
    if (note) message += `*Müşteri Notu:* ${note}\n`;

    const encoded = encodeURIComponent(message);
    const whatsappNum = settings.contactPhone.replace(/[^0-9]/g, '') || '905000000000';
    window.open(`https://wa.me/${whatsappNum}?text=${encoded}`, '_blank');
  };

  // Print / Save as PDF
  const handlePrintQuote = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsRowsHtml = cartItems.map((item, idx) => {
      const unitPrice = priceDisplayType === 'vat_incl'
        ? (item.product.vatIncludedPrice || item.product.price * 1.2)
        : item.product.price;
      const lineTotal = unitPrice * item.quantity;

      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
          <td style="padding: 10px; text-align: center;">
            <img src="${item.product.images[0] || ''}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0;" />
          </td>
          <td style="padding: 10px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${item.product.name}</div>
            <div style="font-family: monospace; font-size: 11px; color: #dc2626; font-weight: bold;">SKU: ${item.product.sku}</div>
            ${item.product.brand ? `<div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Marka: ${item.product.brand}</div>` : ''}
          </td>
          <td style="padding: 10px; text-align: center; font-weight: bold; font-size: 14px; color: #0f172a;">${item.quantity} Adet</td>
          <td style="padding: 10px; text-align: right; font-weight: 600; font-size: 12px; color: #334155;">${formatCurrency(unitPrice)}</td>
          <td style="padding: 10px; text-align: right; font-weight: 800; font-size: 13px; color: #0f172a;">${formatCurrency(lineTotal)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CRS SPOR - B2B Fiyat Teklif Talebi Formu</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #dc2626; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -1px; }
          .logo span { color: #dc2626; }
          .doc-title { text-align: right; }
          .doc-title h2 { margin: 0; font-size: 18px; color: #0f172a; text-transform: uppercase; }
          .doc-title p { margin: 3px 0 0 0; font-size: 11px; color: #64748b; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .info-box h4 { margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #dc2626; letter-spacing: 0.5px; }
          .info-box p { margin: 3px 0; font-size: 12px; color: #334155; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .totals { width: 300px; margin-left: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #475569; }
          .totals-row.grand { font-weight: 900; font-size: 15px; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 5px; }
          .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">CRS <span>SPOR</span></div>
          <div class="doc-title">
            <h2>B2B TEKLİF TALEBİ FORMU</h2>
            <p>Tarih: ${new Date().toLocaleDateString('tr-TR')} | Belge No: CRS-Q-${Math.floor(100000 + Math.random() * 900000)}</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h4>MÜŞTERİ / FİRMA BİLGİLERİ</h4>
            <p><strong>Yetkili Ad Soyad:</strong> ${customerName || 'Belirtilmedi'}</p>
            <p><strong>Firma Unvanı:</strong> ${companyName || 'Belirtilmedi'}</p>
            <p><strong>Telefon:</strong> ${phone || 'Belirtilmedi'}</p>
            <p><strong>E-posta:</strong> ${email || 'Belirtilmedi'}</p>
          </div>
          <div class="info-box">
            <h4>TEDARİKÇİ BİLGİLERİ</h4>
            <p><strong>Firma:</strong> ${settings.siteTitle || 'CRS SPOR Ekipmanları'}</p>
            <p><strong>Telefon:</strong> ${settings.contactPhone}</p>
            <p><strong>E-posta:</strong> ${settings.contactEmail}</p>
            <p><strong>Web:</strong> www.crsspor.com.tr</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th style="width: 60px; text-align: center;">Görsel</th>
              <th>Ürün Bilgisi</th>
              <th style="text-align: center;">Miktar</th>
              <th style="text-align: right;">Birim Fiyat</th>
              <th style="text-align: right;">Toplam Tutar</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Ara Toplam (KDV Hariç):</span>
            <span>${formatCurrency(subtotalNet)}</span>
          </div>
          <div class="totals-row">
            <span>Hesaplanan KDV (%20):</span>
            <span>${formatCurrency(totalVat)}</span>
          </div>
          <div class="totals-row grand">
            <span>Genel Toplam:</span>
            <span>${formatCurrency(grandTotal)}</span>
          </div>
        </div>

        ${note ? `
          <div style="margin-top: 20px; padding: 12px; background: #fffbe0; border: 1px solid #fef08a; border-radius: 6px; font-size: 11px;">
            <strong style="color: #854d0e;">Müşteri Notu:</strong> ${note}
          </div>
        ` : ''}

        <div class="footer">
          Bu belge CRS SPOR Dijital Katalog B2B Sistemi üzerinden otomatik olarak üretilmiş teklif taslağıdır. Resmi teklif niteliği taşıması için firma onaylı teklif mektubumuz gereklidir.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Submit Quote directly to system
  const handleSubmitQuoteForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!customerName || !phone) {
      alert('Lütfen Ad Soyad ve Telefon bilgilerinizi eksiksiz giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: priceDisplayType === 'vat_incl' 
          ? (item.product.vatIncludedPrice || item.product.price * 1.2)
          : item.product.price,
        totalPrice: (priceDisplayType === 'vat_incl' 
          ? (item.product.vatIncludedPrice || item.product.price * 1.2)
          : item.product.price) * item.quantity,
      }));

      await addQuoteRequest({
        customerName,
        companyName,
        phone,
        email,
        items: itemsPayload,
        totalAmount: grandTotal,
        note,
      });

      setIsSubmitted(true);
      clearCart();
    } catch (err) {
      console.error(err);
      alert('Teklif talebi gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden relative">
        
        {/* Drawer Header */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Teklif Sepetim
                <span className="bg-red-950 text-red-400 border border-red-800 text-xs px-2 py-0.5 rounded-full font-mono">
                  {totalItemCount} Parça
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Toplu sipariş ve B2B fiyat teklifi listesi
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {isSubmitted ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Teklif Talebiniz Başarıyla Alındı!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Teklif listeniz satış temsilcilerimize ulaştırılmıştır. En kısa sürede sizinle iletişime geçilecektir.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setIsCartOpen(false);
                }}
                className="mt-4 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                Kataloğa Dön
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Teklif sepetiniz şu anda boş</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Katalogdan ilgilendiğiniz antrenman ve spor ekipmanlarını sepetinize ekleyerek toplu fiyat teklifi alabilirsiniz.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Ürünleri İncele
              </button>
            </div>
          ) : (
            <>
              {/* Controls bar: Price type toggle + Clear */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">Fiyat Gösterimi:</span>
                  <div className="inline-flex bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      onClick={() => setPriceDisplayType('vat_incl')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        priceDisplayType === 'vat_incl'
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      KDV Dahil
                    </button>
                    <button
                      onClick={() => setPriceDisplayType('vat_excl')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        priceDisplayType === 'vat_excl'
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      KDV Hariç
                    </button>
                  </div>
                </div>

                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sepeti Temizle</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const unitPrice = priceDisplayType === 'vat_incl'
                    ? (item.product.vatIncludedPrice || item.product.price * 1.2)
                    : item.product.price;
                  const lineTotal = unitPrice * item.quantity;

                  return (
                    <div
                      key={item.product.id}
                      className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                    >
                      {/* Left: Image & Info */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="bg-slate-950 text-red-400 font-mono font-black text-[10px] px-2 py-0.5 rounded uppercase">
                            {item.product.sku}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-xs truncate mt-0.5" title={item.product.name}>
                            {item.product.name}
                          </h4>
                          <div className="text-[11px] text-slate-500 font-medium">
                            Birim: <span className="font-bold text-slate-800">{formatCurrency(unitPrice)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity controls + Line total + Delete */}
                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right w-24">
                          <div className="text-xs font-black text-slate-900">
                            {formatCurrency(lineTotal)}
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Ürünü Çıkar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2.5">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Ara Toplam (KDV Hariç)</span>
                  <span className="font-bold font-mono">{formatCurrency(subtotalNet)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Hesaplanan KDV (%20)</span>
                  <span className="font-bold font-mono">{formatCurrency(totalVat)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center">
                  <span className="text-sm font-black text-white">GENEL TOPLAM</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Customer Info Form for Direct System Submit */}
              <form onSubmit={handleSubmitQuoteForm} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-red-600" />
                  Müşteri & İletişim Bilgileri
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      Ad Soyad / Yetkili *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Ahmet Yılmaz"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      Firma / Kulüp / Okul Adı
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: CRS Spor Kulübü"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      Telefon Numarası *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                      E-posta Adresi
                    </label>
                    <input
                      type="email"
                      placeholder="ornek@firma.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                    Özel Not veya İstekler
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Adres, kargo bilgileri veya özel logo baskı talepleri..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 bg-white resize-none"
                  />
                </div>

                {/* Primary Actions Grid */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={handleWhatsAppSend}
                    className="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp ile Gönder</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintQuote}
                    className="w-full py-3 px-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Yazdır / PDF İndir</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Gönderiliyor...' : 'Teklif İlet'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
