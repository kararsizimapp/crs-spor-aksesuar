import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import {
  Package,
  CheckCircle2,
  FileEdit,
  Layers,
  AlertCircle,
  ImageOff,
  MessageSquare,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatPrice, formatDateTime, getProductImage, DEFAULT_FALLBACK_IMAGE } from '../../utils/formatters';

interface AdminDashboardProps {
  onNavigateTab: (tab: 'products' | 'add-product' | 'categories' | 'quotes' | 'settings' | 'import') => void;
  onEditProduct: (productId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, onEditProduct }) => {
  const { products, categories, quotes } = useCatalog();

  const totalProducts = products.length;
  const publishedProducts = products.filter(p => p.status === 'Yayında').length;
  const draftProducts = products.filter(p => p.status === 'Taslak').length;
  const totalCategories = categories.length;
  const missingPriceProducts = products.filter(p => p.price === null || p.price === undefined).length;
  const missingImageProducts = products.filter(p => !p.coverImage || p.coverImage.includes('placeholder')).length;

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentEditedProducts = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-teal-400 text-xs font-mono font-bold uppercase tracking-wider">
            Yönetim Özeti
          </span>
          <h2 className="text-xl font-black text-white mt-0.5">SCUCS Yönetim Paneli Dashboard</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('add-product')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-teal-900/30 flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Yeni Ürün Ekle
          </button>
        </div>
      </div>

      {/* 8 Stats Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase">Toplam Ürün</span>
            <Package className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalProducts}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase">Yayında</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{publishedProducts}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase">Taslak</span>
            <FileEdit className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{draftProducts}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase">Kategori</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalCategories}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase">Fiyatsız</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 font-mono">{missingPriceProducts}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase">Görselsiz</span>
            <ImageOff className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-700 font-mono">{missingImageProducts}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase">Teklifler</span>
            <MessageSquare className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 font-mono">{quotes.length}</div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* Recently Added Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Son Eklenen Ürünler
            </h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              Tümü
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentProducts.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={getProductImage(p)}
                    alt={p.name}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-teal-700 text-teal-50 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded">
                        {p.sku}
                      </span>
                      <span className="font-bold text-slate-900 truncate">{p.name}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{formatDateTime(p.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">
                    {formatPrice(p.price, p.currency, p.showPrice)}
                  </span>
                  <button
                    onClick={() => onEditProduct(p.id)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px] cursor-pointer"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Edited Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Son Düzenlenen Ürünler
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentEditedProducts.map((p) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-1 rounded border border-slate-200">
                    {p.sku}
                  </span>
                  <span className="font-bold text-slate-900 truncate">{p.name}</span>
                </div>
                <button
                  onClick={() => onEditProduct(p.id)}
                  className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                >
                  Düzenle
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
