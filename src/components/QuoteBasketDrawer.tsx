import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { formatCurrency, getProductImage } from '../utils/formatters';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  Printer,
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  FileCheck,
  FileText,
} from 'lucide-react';

export const QuoteBasketDrawer: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  } = useCatalog();

  // Fixed Default Company Info provided by user
  const companyDetails = {
    title: 'CRS Spor Tekstil Sanayi Ticaret Limited Şirketi',
    phone: '0 850 360 00 55',
    address: 'Şabanoğlu Mahallesi Atatürk Bulvarı No: 186 Tekkeköy/SAMSUN',
    taxOffice: '19 Mayıs V.D - 2150601373',
    email: 'kurumsal@crsspor.com',
  };

  // Editable Sales Representative
  const [salesRep, setSalesRep] = useState('CRS Spor Satış Ekibi');
  const [customerOrg, setCustomerOrg] = useState('');
  const [note, setNote] = useState('');
  const [priceDisplayType, setPriceDisplayType] = useState<'vat_incl' | 'vat_excl'>('vat_incl');

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

  // Print / Save as PDF
  const handlePrintQuote = () => {
    if (cartItems.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsRowsHtml = cartItems.map((item, idx) => {
      const vatRate = item.product.vatRate || 20;
      const unitNet = item.product.vatIncludedPrice
        ? item.product.vatIncludedPrice / (1 + vatRate / 100)
        : item.product.price;
      const unitVat = unitNet * (vatRate / 100);
      const totalItemVat = unitVat * item.quantity;
      const lineTotalVatIncl = (item.product.vatIncludedPrice || (unitNet * (1 + vatRate / 100))) * item.quantity;

      return `
        <tr style="border-bottom: 1px solid #94a3b8;">
          <td style="padding: 6px 4px; text-align: center; font-weight: 900; color: #0f172a; font-size: 11px; border: 1px solid #94a3b8;">${idx + 1}</td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #94a3b8;">
            <img src="${getProductImage(item.product)}" style="width: 44px; height: 44px; object-fit: contain; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff;" />
          </td>
          <td style="padding: 6px 8px; border: 1px solid #94a3b8;">
            <div style="font-weight: 800; font-size: 12px; color: #0f172a; line-height: 1.35;">${item.product.name}</div>
            <div style="font-family: monospace; font-size: 10px; color: #dc2626; font-weight: 800; margin-top: 2px;">KOD: ${item.product.sku}</div>
          </td>
          <td style="padding: 6px 4px; text-align: center; border: 1px solid #94a3b8;">
            <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase;">${item.product.brand || '-'}</div>
          </td>
          <td style="padding: 6px 4px; text-align: center; font-weight: 900; font-size: 12.5px; color: #0f172a; border: 1px solid #94a3b8; background-color: #f1f5f9;">
            ${item.quantity} Adet
          </td>
          <td style="padding: 6px 6px; text-align: right; font-weight: 800; font-size: 12px; color: #0f172a; font-family: monospace; border: 1px solid #94a3b8;">
            ${formatCurrency(unitNet)}
          </td>
          <td style="padding: 6px 4px; text-align: center; font-weight: 800; font-size: 11px; color: #0284c7; border: 1px solid #94a3b8;">
            %${vatRate}
          </td>
          <td style="padding: 6px 6px; text-align: right; font-weight: 800; font-size: 11.5px; color: #dc2626; font-family: monospace; border: 1px solid #94a3b8;">
            ${formatCurrency(totalItemVat)}
          </td>
          <td style="padding: 6px 8px; text-align: right; font-weight: 900; font-size: 12.5px; color: #0f172a; font-family: monospace; border: 1px solid #94a3b8; background-color: #f8fafc;">
            ${formatCurrency(lineTotalVatIncl)}
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CRS SPOR - Fiyat Teklif Formu</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 18px; color: #1e293b; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #dc2626; padding-bottom: 12px; margin-bottom: 18px; }
          .logo { font-size: 32px; font-weight: 900; color: #0f172a; letter-spacing: -1px; }
          .logo span { color: #dc2626; }
          .doc-title { text-align: right; }
          .doc-title h2 { margin: 0; font-size: 22px; color: #0f172a; text-transform: uppercase; font-weight: 900; letter-spacing: 0.5px; }
          .doc-title p { margin: 4px 0 0 0; font-size: 11px; color: #64748b; font-weight: 700; }

          /* Customer Section & Info Grid - Compact & Corporate */
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; align-items: start; }
          .info-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden; }
          .info-box-header { background: #0f172a; color: #ffffff; padding: 5px 10px; font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-box-header.customer-header { background: #1e293b; border-left: 4px solid #dc2626; }
          .info-box-body { padding: 8px 10px; font-size: 10px; color: #1e293b; line-height: 1.4; }
          .info-box-body p { margin: 2px 0; }
          .customer-title-display { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px; letter-spacing: -0.1px; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
          th { background-color: #000000 !important; color: #ffffff !important; text-align: left; padding: 7px 4px; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.4px; vertical-align: middle; opacity: 1; font-weight: 900; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          
          .bottom-section { display: grid; grid-template-columns: 1fr 310px; gap: 14px; margin-top: 14px; align-items: stretch; }
          .sales-rep-card { background: #0f172a; color: #ffffff; padding: 12px 14px; border-radius: 8px; border-left: 5px solid #dc2626; box-shadow: 0 2px 5px rgba(15,23,42,0.12); height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; }
          
          .totals { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11.5px; color: #1e293b; font-weight: 600; }
          .totals-row.grand { font-weight: 900; font-size: 15px; color: #0f172a; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 4px; }
          
          .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 10px; color: #475569; font-weight: 600; line-height: 1.4; }
          
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">CRS <span>SPOR</span></div>
            <div style="font-size: 11px; font-weight: bold; color: #475569; margin-top: 2px;">SPOR EKİPMANLARI VE TEKSTİL</div>
          </div>
          <div class="doc-title">
            <h2>FİYAT TEKLİF FORMU</h2>
            <p>Tarih: ${new Date().toLocaleDateString('tr-TR')} | Belge No: CRS-Q-${Math.floor(100000 + Math.random() * 900000)}</p>
          </div>
        </div>

        <div class="info-grid">
          <!-- Supplier Box (LEFT) -->
          <div class="info-box">
            <div class="info-box-header">TEDARİKÇİ BİLGİLERİ</div>
            <div class="info-box-body">
              <p><strong>Firma Unvanı:</strong> ${companyDetails.title}</p>
              <p><strong>Adres:</strong> ${companyDetails.address}</p>
              <p><strong>Vergi Dairesi & No:</strong> ${companyDetails.taxOffice}</p>
              <p><strong>İletişim:</strong> ${companyDetails.phone} | ${companyDetails.email}</p>
            </div>
          </div>

          <!-- Customer Box (RIGHT) -->
          <div class="info-box">
            <div class="info-box-header customer-header">TEKLİF SUNULAN MÜŞTERİ / KURUM BİLGİSİ</div>
            <div class="info-box-body">
              <div class="customer-title-display">${customerOrg || 'SAYIN MÜŞTERİMİZ / SPOR KULÜBÜ'}</div>
            </div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 2px solid #000000;">
          <thead>
            <tr style="background-color: #000000; color: #ffffff;">
              <th style="width: 20px; text-align: center; border: 1px solid #334155; background-color: #000000; color: #ffffff !important; font-weight: 900;">#</th>
              <th style="width: 45px; text-align: center; border: 1px solid #334155; background-color: #000000; color: #ffffff !important; font-weight: 900;">Görsel</th>
              <th style="border: 1px solid #334155; padding-left: 8px; background-color: #000000; color: #ffffff !important; font-weight: 900;">Ürün Adı & Kodu</th>
              <th style="text-align: center; width: 50px; border: 1px solid #334155; background-color: #000000; color: #ffffff !important; font-weight: 900;">Marka</th>
              <th style="text-align: center; width: 45px; border: 1px solid #334155; background-color: #000000; color: #ffffff !important; font-weight: 900;">Miktar</th>
              <th style="text-align: right; width: 80px; border: 1px solid #334155; background-color: #000000; color: #ffffff !important; font-weight: 900;">Birim Fiyat<br/><span style="font-size: 8px; font-weight: 700; color: #e2e8f0;">(KDV Hariç)</span></th>
              <th style="text-align: center; width: 45px; border: 1px solid #334155; background-color: #000000; color: #ffffff !important; font-weight: 900;">KDV</th>
              <th style="text-align: right; width: 75px; border: 1px solid #334155; background-color: #000000; color: #ffffff !important; font-weight: 900;">KDV Tutarı</th>
              <th style="text-align: right; width: 85px; border: 1px solid #334155; background-color: #000000; color: #ffffff !important; font-weight: 900;">Toplam Tutar<br/><span style="font-size: 8px; font-weight: 700; color: #e2e8f0;">(KDV Dahil)</span></th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <div class="bottom-section">
          <div style="display: flex; flex-direction: column; gap: 8px; justify-content: space-between;">
            <!-- Prominent Sales Representative Box at the bottom -->
            <div class="sales-rep-card">
              <div style="font-size: 9.5px; font-weight: 900; color: #f87171; text-transform: uppercase; letter-spacing: 0.8px;">TEKLİFİ HAZIRLAYAN SATIŞ TEMSİLCİSİ</div>
              <div style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 3px; letter-spacing: -0.2px;">${salesRep || 'CRS Spor Satış Ekibi'}</div>
            </div>

            ${note ? `
              <div style="padding: 8px 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 10.5px; color: #1e293b;">
                <strong style="color: #0f172a;">Teklif Notu / Özel Açıklamalar:</strong> ${note}
              </div>
            ` : ''}
          </div>

          <!-- Totals -->
          <div class="totals">
            <div class="totals-row">
              <span>Ara Toplam (KDV Hariç):</span>
              <span style="font-family: monospace; font-weight: bold;">${formatCurrency(subtotalNet)}</span>
            </div>
            <div class="totals-row">
              <span>Hesaplanan KDV (%20):</span>
              <span style="font-family: monospace; font-weight: bold;">${formatCurrency(totalVat)}</span>
            </div>
            <div class="totals-row grand">
              <span>GENEL TOPLAM:</span>
              <span style="font-family: monospace;">${formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          Bu fiyat teklifi CRS Spor Tekstil Sanayi Ticaret Limited Şirketi tarafından hazırlanmış olup bilgi ve sipariş teyidi amaçlıdır.<br/>
          Kurumsal siparişleriniz ve detaylı bilgi için 0 850 360 00 55 numaramızdan veya kurumsal@crsspor.com adresinden bize ulaşabilirsiniz.
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
                Sipariş ve fiyat teklifi oluşturma sepeti
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
          
          {cartItems.length === 0 ? (
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
              {/* Controls bar: Clear cart */}
              <div className="flex items-center justify-end bg-slate-50 p-2.5 px-3.5 rounded-xl border border-slate-200">
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 cursor-pointer hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sepeti Temizle</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const vatRate = item.product.vatRate || 20;
                  const unitPrice = priceDisplayType === 'vat_incl'
                    ? (item.product.vatIncludedPrice || item.product.price * (1 + vatRate / 100))
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
                            src={getProductImage(item.product)}
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

              {/* Fixed Company Info + Editable Sales Representative */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-red-600" />
                    Teklif Veren Firma Bilgileri
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                    Sabit Kurumsal
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200">
                  <p className="font-black text-slate-900">{companyDetails.title}</p>
                  <p className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{companyDetails.address}</span>
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 pt-1 font-mono text-[11px]">
                    <span>Tel: <strong className="text-slate-800">{companyDetails.phone}</strong></span>
                    <span>V.D: <strong className="text-slate-800">{companyDetails.taxOffice}</strong></span>
                    <span>E-posta: <strong className="text-slate-800">{companyDetails.email}</strong></span>
                  </div>
                </div>

                {/* Editable Fields: Sales Representative & Customer Org */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-red-600" />
                      Satış Temsilcisi (Manuel Değiştirilebilir)
                    </label>
                    <input
                      type="text"
                      placeholder="Satış temsilcisi adı"
                      value={salesRep}
                      onChange={(e) => setSalesRep(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-800 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-red-600" />
                      Müşteri / Kulüp Adı (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Samsun Spor Kulübü"
                      value={customerOrg}
                      onChange={(e) => setCustomerOrg(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                    Özel Not veya Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Teklif belgesinde görünecek özel açıklama, teslim süresi veya not..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 bg-white resize-none text-slate-900"
                  />
                </div>

                {/* Single Print / Download PDF Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePrintQuote}
                    className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Printer className="w-4 h-4 text-red-500" />
                    <span>Yazdır / PDF İndir</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
