import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import {
  Search,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    currentUser,
    setSelectedCategory,
    setSelectedSubcategory,
  } = useCatalog();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: 'home' | 'products' | 'categories' | 'admin') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('products');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950 text-white border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Top Row: Brand Logo + Mobile Controls */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div
              onClick={() => handleNav('home')}
              className="cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                S
              </div>
              <div>
                <div className="text-2xl font-black tracking-wider font-mono text-white flex items-center gap-2">
                  SCUCS <span className="text-teal-400 text-xs font-sans font-bold px-2 py-0.5 rounded bg-teal-950 border border-teal-800">KATALOG</span>
                </div>
                <div className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">
                  ANTRENMAN MALZEMELERİ VE SPOR AKSESUARLARI
                </div>
              </div>
            </div>

            {/* Mobile Toggle Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-white cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Expanded Search Bar */}
          <div className="w-full md:flex-1 md:max-w-2xl px-0 md:px-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Ürün adı, SCX kodu veya kategori ara..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'products') setActiveTab('products');
                }}
                className="w-full pl-11 pr-24 py-2.5 text-sm rounded-xl bg-slate-900 border-2 border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-inner"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>ARA</span>
              </button>
            </form>
          </div>

          {/* Desktop Navigation & Admin Link */}
          <div className="hidden md:flex items-center space-x-2">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); handleNav('home'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Ana Sayfa
              </button>

              <button
                onClick={() => handleNav('products')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Ürünler
              </button>

              <button
                onClick={() => handleNav('categories')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Kategoriler
              </button>
            </nav>

            <button
              onClick={() => handleNav('admin')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'admin'
                  ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                  : currentUser
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {currentUser ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Yönetim
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  Yönetici Girişi
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'home' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span>Ana Sayfa</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNav('products')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'products' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span>Ürünler</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNav('categories')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'categories' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span>Kategoriler</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNav('admin')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between border ${
              activeTab === 'admin'
                ? 'bg-teal-600 text-white border-teal-500'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            <span>{currentUser ? 'Yönetim Paneli' : 'Yönetici Girişi'}</span>
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
