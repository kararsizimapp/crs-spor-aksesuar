import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { CrsSporLogo } from './CrsSporLogo';
import {
  Search,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  ShoppingBag,
  Award,
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
    cartItems,
    setIsCartOpen,
  } = useCatalog();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleNav = (tab: 'home' | 'products' | 'categories' | 'flipbook' | 'brands' | 'admin') => {
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
    <header className="sticky top-0 z-40 w-full bg-white text-slate-900 border-b border-slate-200 shadow-md border-t-4 border-t-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Top Row: Brand Logo + Mobile Controls */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div
              onClick={() => handleNav('home')}
              className="cursor-pointer flex items-center gap-3 group py-1"
              title="CRS SPOR Ana Sayfa"
            >
              <div className="flex items-center tracking-tight">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tighter group-hover:text-slate-800 transition-colors">CRS</span>
                <span className="text-2xl sm:text-3xl font-black text-red-600 font-sans tracking-tight ml-1.5 group-hover:text-red-700 transition-colors">SPOR</span>
              </div>
            </div>

            {/* Mobile Toggle Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 cursor-pointer transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Expanded Search Bar */}
          <div className="w-full md:flex-1 px-0 md:px-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Ürün adı, Stok Kodu (SKU), kategori veya 'hız paraşütü' ara..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'products') setActiveTab('products');
                }}
                className="w-full pl-11 pr-28 py-2.5 text-sm rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-500/15 transition-all shadow-2xs"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              
              <div className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Aramayı Temizle"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="h-full px-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>ARA</span>
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation & Admin Link */}
          <div className="hidden md:flex items-center space-x-1.5">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); handleNav('home'); }}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Ana Sayfa
              </button>

              <button
                onClick={() => handleNav('products')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Ürünler
              </button>

              <button
                onClick={() => handleNav('categories')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Kategoriler
              </button>

              <button
                onClick={() => handleNav('brands')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'brands'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Markalar</span>
              </button>

              <button
                onClick={() => handleNav('flipbook')}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'flipbook'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>E-Katalog</span>
              </button>
            </nav>

            {/* Teklif Sepetim Icon Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              title="Teklif Sepetim"
              className="relative p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md border border-slate-800"
            >
              <ShoppingBag className="w-5 h-5 text-red-500" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ring-2 ring-white animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Yönetim Icon Button */}
            <button
              onClick={() => handleNav('admin')}
              title={currentUser ? 'Yönetim Paneli' : 'Yönetici Girişi'}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer border ${
                activeTab === 'admin'
                  ? 'bg-slate-950 text-white border-slate-900 shadow-md'
                  : currentUser
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                  : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {currentUser ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <UserCheck className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'home' ? 'bg-red-600 text-white' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span>Ana Sayfa</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNav('products')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'products' ? 'bg-red-600 text-white' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span>Ürünler</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNav('categories')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'categories' ? 'bg-red-600 text-white' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span>Kategoriler</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNav('brands')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'brands' ? 'bg-red-600 text-white' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Markalar / Marka Vitrini</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNav('flipbook')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'flipbook' ? 'bg-red-600 text-white' : 'text-slate-800 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>E-Katalog / Flipbook</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsCartOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-extrabold bg-slate-900 text-white flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-red-500" />
              <span>Teklif Sepetim</span>
            </div>
            {totalCartCount > 0 && (
              <span className="bg-red-600 text-white text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                {totalCartCount} Ürün
              </span>
            )}
          </button>
          <button
            onClick={() => handleNav('admin')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between border ${
              activeTab === 'admin'
                ? 'bg-slate-950 text-white border-slate-900'
                : 'bg-slate-100 text-slate-800 border-slate-200'
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

