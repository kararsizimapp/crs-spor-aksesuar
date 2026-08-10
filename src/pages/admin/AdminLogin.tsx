import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Lock, Mail, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin } = useCatalog();
  const [email, setEmail] = useState('admin@scucs.com');
  const [password, setPassword] = useState('scucs123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin(email, password);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-teal-900/40">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Yönetici Girişi</h2>
          <p className="text-slate-400 text-xs">
            SCUCS B2B Katalog Yönetim Paneline Erişim
          </p>
        </div>

        {/* Demo Hint Banner */}
        <div className="bg-teal-950/60 border border-teal-500/30 rounded-xl p-3.5 text-xs text-teal-300 flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-white mb-0.5">Demo Yönetici Bilgileri:</strong>
            <span>E-Posta: <code className="bg-slate-900 px-1 rounded text-teal-200">admin@scucs.com</code></span>
            <br />
            <span>Şifre: <code className="bg-slate-900 px-1 rounded text-teal-200">scucs123</code></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              E-Posta Adresi
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Şifre
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Yönetim Paneline Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};
