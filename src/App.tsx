import React, { useState } from 'react';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { Header } from './components/Header';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QuoteModal } from './components/QuoteModal';
import { LightboxModal } from './components/LightboxModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { FlipbookPage } from './pages/FlipbookPage';
import { BrandShowcase } from './components/BrandShowcase';
import { QuoteBasketDrawer } from './components/QuoteBasketDrawer';
import { BackToTop } from './components/BackToTop';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminQuotes } from './pages/admin/AdminQuotes';
import { AdminBulkImport } from './pages/admin/AdminBulkImport';
import { AdminSettings } from './pages/admin/AdminSettings';

import {
  LayoutDashboard,
  Package,
  Layers,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Settings,
  FileText,
  Upload,
} from 'lucide-react';

type AdminTab = 'dashboard' | 'products' | 'categories' | 'quotes' | 'bulk' | 'settings' | 'add-product' | 'edit-product';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    isAuthLoading,
    logoutAdmin,
    notification,
  } = useCatalog();

  const [adminSubTab, setAdminSubTab] = useState<AdminTab>('dashboard');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleNavigateAdminTab = (tab: 'products' | 'add-product' | 'categories' | 'quotes' | 'settings' | 'import') => {
    if (tab === 'import') {
      setAdminSubTab('bulk');
    } else if (tab === 'add-product') {
      setEditingProductId(null);
      setAdminSubTab('add-product');
    } else {
      setAdminSubTab(tab as AdminTab);
    }
  };

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setAdminSubTab('edit-product');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Global Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 backdrop-blur-md ${
              notification.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-800'
                : notification.type === 'info'
                ? 'bg-slate-900/90 text-slate-200 border-slate-700'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : notification.type === 'info' ? (
              <Info className="w-4 h-4 text-teal-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Body Router */}
      <main className="flex-1">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'products' && <ProductsPage />}
        {activeTab === 'categories' && <CategoriesPage />}
        {activeTab === 'brands' && <BrandShowcase />}
        {activeTab === 'flipbook' && <FlipbookPage />}

        {activeTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {isAuthLoading ? (
              <div className="min-h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  <span className="text-xs font-semibold">Oturum durumu kontrol ediliyor...</span>
                </div>
              </div>
            ) : !currentUser ? (
              <AdminLogin />
            ) : (
              <div className="space-y-6">
                {/* Admin Shell Bar */}
                <div className="bg-slate-950 text-white rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm flex items-center gap-2 text-white">
                        SCUCS B2B Yönetim Paneli
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                          {currentUser.email}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Katalog, Ürün, Kategori ve Teklif Yönetimi
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTab('home')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-lg border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                      Sitede Gör
                    </button>

                    <button
                      onClick={logoutAdmin}
                      className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-xs rounded-lg border border-red-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      Çıkış Yap
                    </button>
                  </div>
                </div>

                {/* Admin Sub-Tabs Navigation */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-1">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'products', label: 'Ürün Yönetimi', icon: Package },
                    { id: 'categories', label: 'Kategoriler', icon: Layers },
                    { id: 'quotes', label: 'Gelen Teklifler', icon: FileText },
                    { id: 'bulk', label: 'Toplu İçe Aktar', icon: Upload },
                    { id: 'settings', label: 'Genel & Banner Ayarları', icon: Settings },
                  ].map(tab => {
                    const IconComponent = tab.icon;
                    const isActive =
                      adminSubTab === tab.id ||
                      (tab.id === 'products' && (adminSubTab === 'add-product' || adminSubTab === 'edit-product'));

                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          if (tab.id === 'products') {
                            setEditingProductId(null);
                          }
                          setAdminSubTab(tab.id as AdminTab);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isActive
                            ? 'bg-teal-600 text-white shadow-md shadow-teal-900/20 font-extrabold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Admin View Render */}
                <div className="pt-2">
                  {adminSubTab === 'dashboard' && (
                    <AdminDashboard
                      onNavigateTab={handleNavigateAdminTab}
                      onEditProduct={handleEditProduct}
                    />
                  )}

                  {adminSubTab === 'products' && (
                    <AdminProducts
                      onAddNew={() => {
                        setEditingProductId(null);
                        setAdminSubTab('add-product');
                      }}
                      onEdit={handleEditProduct}
                    />
                  )}

                  {(adminSubTab === 'add-product' || adminSubTab === 'edit-product') && (
                    <AdminProductForm
                      productId={editingProductId}
                      onClose={() => setAdminSubTab('products')}
                    />
                  )}

                  {adminSubTab === 'categories' && <AdminCategories />}
                  {adminSubTab === 'quotes' && <AdminQuotes />}
                  {adminSubTab === 'bulk' && <AdminBulkImport />}
                  {adminSubTab === 'settings' && <AdminSettings />}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals & Floating Widgets */}
      <ProductDetailModal />
      <QuoteModal />
      <LightboxModal />
      <QuoteBasketDrawer />
      <BackToTop />
    </div>
  );
};

export default function App() {
  return (
    <CatalogProvider>
      <AppContent />
    </CatalogProvider>
  );
}
