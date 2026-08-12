import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Lock, Mail, ShieldCheck, KeyRound, Sparkles, Loader2, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin } = useCatalog();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setErrorMessage(null);
    setIsLoading(true);

    const result = await loginAdmin(email, password);
    setIsLoading(false);

    if (!result.success && result.error) {
      setErrorMessage(result.error);
    }
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
            Firebase Authentication ile Yönetim Paneline Erişim
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-teal-950/60 border border-teal-500/30 rounded-xl p-3.5 text-xs text-teal-300 flex items-start justify-between gap-2.5">
          <div className="flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-white mb-0.5">Yönetici Girişi:</strong>
              <span>Firebase Authentication veya varsayılan Demo Hesabı (admin@scucs.com / admin123) ile giriş yapabilirsiniz.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@scucs.com');
              setPassword('admin123');
            }}
            className="px-2.5 py-1 bg-teal-800/80 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer border border-teal-600/50"
          >
            Demo Doldur
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-950/90 border border-red-500/50 rounded-xl p-4 text-xs text-red-200 space-y-2">
            <div className="flex items-start gap-2.5 font-bold text-red-300">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>Giriş Başarısız</span>
            </div>
            <p className="pl-7 leading-relaxed">{errorMessage}</p>
            {errorMessage.includes('Email/Password') && (
              <div className="mt-3 p-3 bg-red-900/40 rounded-lg border border-red-800/60 text-[11px] text-red-100 space-y-1">
                <strong className="block font-semibold text-white">Çözüm Adımları (Firebase Console):</strong>
                <ol className="list-decimal pl-4 space-y-1 text-slate-200">
                  <li><a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-teal-300 hover:text-teal-200">Firebase Console</a>&apos;a gidin ve projenizi açın.</li>
                  <li>Sol menüden <strong>Build &gt; Authentication</strong> sayfasına gidin.</li>
                  <li><strong>Sign-in method</strong> sekmesini tıklayın.</li>
                  <li><strong>Email/Password</strong> seçeneğini düzenleyin ve <strong>Enable (Etkinleştir)</strong> yapıp kaydet butonuna basın.</li>
                  <li>Ardından <strong>Users</strong> sekmesinden yeni bir yönetici kullanıcısı (ör. <code>admin@scucs.com</code>) ekleyin.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              E-Posta Adresi
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
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
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Oturum Açılıyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Yönetim Paneline Giriş Yap</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
