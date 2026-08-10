import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { QuoteRequest } from '../../types';
import { formatDateTime, generateWhatsappLink } from '../../utils/formatters';
import { MessageSquare, Trash2, Eye, Mail, Phone, Building, Calendar, CheckCircle } from 'lucide-react';

export const AdminQuotes: React.FC = () => {
  const { quotes, updateQuoteStatus, deleteQuoteRequest, settings } = useCatalog();

  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredQuotes = quotes.filter(q => {
    if (filterStatus !== 'all' && q.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Teklif Talepleri Yönetimi</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Gelen B2B ürün ve toplu sipariş teklif formlarını inceleyin, durumlarını güncelleyin.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600">Durum Filtresi:</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:border-teal-600"
          >
            <option value="all">Tüm Durumlar ({quotes.length})</option>
            <option value="Yeni">Yeni</option>
            <option value="Görüşüldü">Görüşüldü</option>
            <option value="Teklif Verildi">Teklif Verildi</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="İptal Edildi">İptal Edildi</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                <th className="p-3.5">Müşteri / Kulüp</th>
                <th className="p-3.5">İletişim</th>
                <th className="p-3.5">Talep Edilen Ürün</th>
                <th className="p-3.5">Adet</th>
                <th className="p-3.5">Tarih</th>
                <th className="p-3.5">Durum</th>
                <th className="p-3.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Henüz seçilen filtrede teklif talebi bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map(q => {
                  const whatsappUrl = generateWhatsappLink(
                    q.phone || settings.whatsappNumber,
                    q.productName,
                    q.productSku
                  );

                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <strong className="text-slate-900 block">{q.fullName}</strong>
                        <span className="text-[11px] text-slate-500">{q.companyName || '—'} ({q.city})</span>
                      </td>

                      <td className="p-3.5 font-mono text-[11px]">
                        <div>{q.phone}</div>
                        <div className="text-slate-400">{q.email}</div>
                      </td>

                      <td className="p-3.5">
                        <strong className="text-teal-800 block">{q.productName}</strong>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                          {q.productSku}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold font-mono text-slate-900">
                        {q.quantity} Adet
                      </td>

                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {formatDateTime(q.createdAt)}
                      </td>

                      <td className="p-3.5">
                        <select
                          value={q.status}
                          onChange={e => updateQuoteStatus(q.id, e.target.value as any)}
                          className="text-[11px] font-bold p-1 rounded border border-slate-300 bg-slate-50 focus:outline-none"
                        >
                          <option value="Yeni">Yeni</option>
                          <option value="Görüşüldü">Görüşüldü</option>
                          <option value="Teklif Verildi">Teklif Verildi</option>
                          <option value="Tamamlandı">Tamamlandı</option>
                          <option value="İptal Edildi">İptal Edildi</option>
                        </select>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedQuote(q)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 cursor-pointer"
                            title="Detay Gör"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            title="WhatsApp Mesaj Gönder"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => deleteQuoteRequest(q.id)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Teklif Talebi Detayı</h3>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Müşteri / Kulüp</span>
                  <strong className="block text-slate-900 text-xs">{selectedQuote.fullName}</strong>
                  <span className="text-slate-500 text-[11px]">{selectedQuote.companyName || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Şehir</span>
                  <span className="block text-slate-900 text-xs font-semibold">{selectedQuote.city || 'Belirtilmedi'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Telefon</span>
                  <strong className="block text-teal-800 text-xs font-mono">{selectedQuote.phone}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">E-Posta</span>
                  <span className="block text-slate-800 text-xs font-mono">{selectedQuote.email}</span>
                </div>
              </div>

              <div className="bg-teal-50/80 p-3 rounded-xl border border-teal-200">
                <span className="text-[10px] text-teal-800 font-bold uppercase">İstenen Ürün & Miktar</span>
                <strong className="block text-teal-950 text-sm">{selectedQuote.productName}</strong>
                <span className="font-mono text-teal-700 font-bold">SKU: {selectedQuote.productSku} | Adet: {selectedQuote.quantity}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Müşteri Mesajı</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedQuote.message || 'Ek mesaj belirtilmemiş.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
