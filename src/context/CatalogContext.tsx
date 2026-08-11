import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sanitizeForFirestore } from '../utils/cleanUtils';
import {
  Product,
  Category,
  QuoteRequest,
  GeneralSettings,
  User,
  QuoteStatus,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
  DEFAULT_SETTINGS,
} from '../data/initialData';
import { generateSlug } from '../utils/formatters';
import { CSVRowProduct } from '../utils/csv';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPriceType: 'vat_excl' | 'vat_incl';
}

interface CatalogContextType {
  products: Product[];
  categories: Category[];
  quotes: QuoteRequest[];
  settings: GeneralSettings;
  currentUser: User | null;
  activeTab: 'home' | 'products' | 'categories' | 'flipbook' | 'admin';
  setActiveTab: (tab: 'home' | 'products' | 'categories' | 'flipbook' | 'admin') => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (subId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProductDetail: Product | null;
  setSelectedProductDetail: (p: Product | null) => void;
  quoteModalProduct: Product | null;
  setQuoteModalProduct: (p: Product | null) => void;
  lightboxImage: string | null;
  setLightboxImage: (img: string | null) => void;

  // Quote Basket State & Actions
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteProductsBulk: (ids: string[]) => Promise<void>;
  duplicateProduct: (id: string) => Promise<void>;
  togglePublishProduct: (id: string) => Promise<void>;

  // Category Actions
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<{ success: boolean; message?: string }>;
  addSubcategory: (categoryId: string, name: string) => Promise<void>;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => Promise<void>;

  // Quote Actions
  addQuoteRequest: (quote: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateQuoteStatus: (id: string, status: QuoteStatus) => Promise<void>;
  deleteQuoteRequest: (id: string) => Promise<void>;

  // Settings & Bulk
  updateSettings: (newSettings: Partial<GeneralSettings>) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;
  importProductsBulk: (bulkData: CSVRowProduct[]) => Promise<{ imported: number; errors: string[] }>;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  isFirebaseConnected: boolean;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [quotes, setQuotes] = useState<QuoteRequest[]>(INITIAL_QUOTES);
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_SETTINGS);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('scucs_admin_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'categories' | 'flipbook' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [quoteModalProduct, setQuoteModalProduct] = useState<Product | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Quote Basket State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('crs_quote_basket');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('crs_quote_basket', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedPriceType: 'vat_incl' }];
    });
    showNotification(`"${product.name}" teklif sepetinize eklendi.`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    showNotification('Ürün teklif sepetinizden çıkarıldı.', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Firestore Real-Time Listeners & Auto-Seeding
  useEffect(() => {
    // Products Listener
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed Firestore with initial products if empty
          try {
            const CHUNK_SIZE = 400;
            for (let i = 0; i < INITIAL_PRODUCTS.length; i += CHUNK_SIZE) {
              const chunk = INITIAL_PRODUCTS.slice(i, i + CHUNK_SIZE);
              const batch = writeBatch(db);
              chunk.forEach((p) => {
                const ref = doc(db, 'products', p.id);
                batch.set(ref, sanitizeForFirestore(p));
              });
              await batch.commit();
            }
          } catch (e) {
            console.error('Error seeding initial products to Firestore:', e);
          }
        } else {
          const loadedProducts = snapshot.docs.map((doc) => doc.data() as Product);
          loadedProducts.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setProducts(loadedProducts);

          // If Firestore has fewer products than catalog, auto-sync missing catalog items
          if (loadedProducts.length < INITIAL_PRODUCTS.length) {
            const existingIds = new Set(loadedProducts.map((p) => p.id));
            const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
            if (missing.length > 0) {
              try {
                const CHUNK_SIZE = 400;
                for (let i = 0; i < missing.length; i += CHUNK_SIZE) {
                  const chunk = missing.slice(i, i + CHUNK_SIZE);
                  const batch = writeBatch(db);
                  chunk.forEach((p) => {
                    const ref = doc(db, 'products', p.id);
                    batch.set(ref, sanitizeForFirestore(p));
                  });
                  await batch.commit();
                }
              } catch (err) {
                console.error('Error auto-syncing missing products:', err);
              }
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore Products Error (quota or network): using local cache fallback', err);
        setIsFirebaseConnected(false);
        setProducts(INITIAL_PRODUCTS);
      }
    );

    // Categories Listener
    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            const batch = writeBatch(db);
            INITIAL_CATEGORIES.forEach((c) => {
              const ref = doc(db, 'categories', c.id);
              batch.set(ref, sanitizeForFirestore(c));
            });
            await batch.commit();
          } catch (e) {
            console.error('Error seeding initial categories:', e);
          }
        } else {
          const loadedCategories = snapshot.docs.map((doc) => doc.data() as Category);
          setCategories(loadedCategories);
        }
      },
      (err) => {
        console.warn('Firestore Categories Error (quota or network): using local cache fallback', err);
        setIsFirebaseConnected(false);
        setCategories(INITIAL_CATEGORIES);
      }
    );

    // Quotes Listener
    const unsubQuotes = onSnapshot(
      collection(db, 'quotes'),
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            const batch = writeBatch(db);
            INITIAL_QUOTES.forEach((q) => {
              const ref = doc(db, 'quotes', q.id);
              batch.set(ref, sanitizeForFirestore(q));
            });
            await batch.commit();
          } catch (e) {
            console.error('Error seeding quotes:', e);
          }
        } else {
          const loadedQuotes = snapshot.docs.map((doc) => doc.data() as QuoteRequest);
          loadedQuotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setQuotes(loadedQuotes);
        }
      },
      (err) => {
        console.warn('Firestore Quotes Error (quota or network): using local cache fallback', err);
        setIsFirebaseConnected(false);
        setQuotes(INITIAL_QUOTES);
      }
    );

    // Settings Listener
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'general'),
      async (docSnap) => {
        if (!docSnap.exists()) {
          try {
            await setDoc(doc(db, 'settings', 'general'), sanitizeForFirestore(DEFAULT_SETTINGS));
          } catch (e) {
            console.error('Error seeding settings:', e);
          }
        } else {
          setSettings(docSnap.data() as GeneralSettings);
        }
      },
      (err) => {
        console.warn('Firestore Settings Error (quota or network): using local cache fallback', err);
        setIsFirebaseConnected(false);
        setSettings(DEFAULT_SETTINGS);
      }
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubQuotes();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('scucs_admin_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('scucs_admin_user');
    }
  }, [currentUser]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Product Actions (Firestore Cloud)
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id,
      slug: productData.slug || generateSlug(`${productData.sku} ${productData.name}`),
      createdAt: now,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);
    showNotification(`"${newProduct.name}" ürünü kaydediliyor...`);

    try {
      await setDoc(doc(db, 'products', id), sanitizeForFirestore(newProduct));
      showNotification(`"${newProduct.name}" canlı veritabanına eklendi (herkes tarafından görülebilir).`);
    } catch (err) {
      console.error('Error adding product to Firestore:', err);
      showNotification('Veritabanına kaydedilirken bir hata oluştu.', 'error');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const updatedProduct = {
      ...target,
      ...updates,
      updatedAt: now,
    };
    if (updates.name || updates.sku) {
      updatedProduct.slug = generateSlug(`${updatedProduct.sku} ${updatedProduct.name}`);
    }

    setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));

    try {
      await setDoc(doc(db, 'products', id), sanitizeForFirestore(updatedProduct));
      showNotification('Ürün canlı veritabanında güncellendi.');
    } catch (err) {
      console.error('Error updating product in Firestore:', err);
      showNotification('Güncelleme sırasında hata oluştu.', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
      showNotification('Ürün başarıyla silindi.', 'info');
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('Ürün silinirken bir hata oluştu.', 'error');
    }
  };

  const deleteProductsBulk = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const targetSet = new Set(ids);
    setProducts((prev) => prev.filter((p) => !targetSet.has(p.id)));

    try {
      const chunkSize = 450;
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((id) => {
          batch.delete(doc(db, 'products', id));
        });
        await batch.commit();
      }
      showNotification(`${ids.length} adet ürün başarıyla silindi.`, 'info');
    } catch (err) {
      console.error('Error bulk deleting products:', err);
      showNotification('Toplu ürün silme işlemi sırasında hata oluştu.', 'error');
    }
  };

  const duplicateProduct = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const now = new Date().toISOString();
    const newId = `prod-${Date.now()}`;
    const duplicated: Product = {
      ...target,
      id: newId,
      sku: `${target.sku}-KOPYA`,
      name: `${target.name} (Kopya)`,
      slug: generateSlug(`${target.sku}-KOPYA ${target.name} kopya`),
      status: 'Taslak',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'products', newId), sanitizeForFirestore(duplicated));
      showNotification(`"${duplicated.name}" kopyalandı.`);
    } catch (err) {
      console.error('Error duplicating product:', err);
    }
  };

  const togglePublishProduct = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Yayında' ? 'Pasif' : 'Yayında';
    await updateProduct(id, { status: nextStatus });
  };

  // Category Actions
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCategory: Category = {
      ...categoryData,
      id,
      slug: categoryData.slug || generateSlug(categoryData.name),
      subcategories: categoryData.subcategories || [],
    };

    try {
      await setDoc(doc(db, 'categories', id), sanitizeForFirestore(newCategory));
      showNotification(`"${newCategory.name}" kategorisi oluşturuldu.`);
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    const updatedCategory = { ...target, ...updates };
    if (updates.name) {
      updatedCategory.slug = generateSlug(updates.name);
    }

    try {
      await setDoc(doc(db, 'categories', id), sanitizeForFirestore(updatedCategory));
      showNotification('Kategori güncellendi.');
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const deleteCategory = async (id: string): Promise<{ success: boolean; message?: string }> => {
    const count = products.filter((p) => p.categoryId === id).length;
    if (count > 0) {
      return {
        success: false,
        message: `Bu kategoriye ait ${count} adet ürün bulunmaktadır. Silmeden önce ürünleri başka bir kategoriye taşıyınız.`,
      };
    }

    try {
      await deleteDoc(doc(db, 'categories', id));
      showNotification('Kategori silindi.', 'info');
      return { success: true };
    } catch (err) {
      console.error('Error deleting category:', err);
      return { success: false, message: 'Kategori silinirken bir hata oluştu.' };
    }
  };

  const addSubcategory = async (categoryId: string, name: string) => {
    const target = categories.find((c) => c.id === categoryId);
    if (!target) return;

    const subId = `sub-${Date.now()}`;
    const newSub = {
      id: subId,
      categoryId,
      name,
      slug: generateSlug(name),
      active: true,
    };

    const updatedSubcategories = [...(target.subcategories || []), newSub];
    await updateCategory(categoryId, { subcategories: updatedSubcategories });
    showNotification(`"${name}" alt kategorisi eklendi.`);
  };

  const deleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    const target = categories.find((c) => c.id === categoryId);
    if (!target) return;

    const updatedSubcategories = (target.subcategories || []).filter((s) => s.id !== subcategoryId);
    await updateCategory(categoryId, { subcategories: updatedSubcategories });
    showNotification('Alt kategori silindi.', 'info');
  };

  // Quote Actions
  const addQuoteRequest = async (quoteData: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>) => {
    const newQuote: QuoteRequest = {
      ...quoteData,
      id: `q-${Date.now()}`,
      status: 'Yeni',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'quotes', newQuote.id), sanitizeForFirestore(newQuote));
      showNotification('Teklif talebiniz başarıyla alındı.');
    } catch (err) {
      console.error('Error adding quote:', err);
    }
  };

  const updateQuoteStatus = async (id: string, status: QuoteStatus) => {
    const target = quotes.find((q) => q.id === id);
    if (!target) return;

    try {
      await setDoc(doc(db, 'quotes', id), sanitizeForFirestore({ ...target, status }));
      showNotification(`Teklif durumu "${status}" olarak değiştirildi.`);
    } catch (err) {
      console.error('Error updating quote status:', err);
    }
  };

  const deleteQuoteRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'quotes', id));
      showNotification('Teklif talebi silindi.', 'info');
    } catch (err) {
      console.error('Error deleting quote:', err);
    }
  };

  // Settings & Bulk
  const updateSettings = async (newSettings: Partial<GeneralSettings>) => {
    const updated = { ...settings, ...newSettings };
    try {
      await setDoc(doc(db, 'settings', 'general'), sanitizeForFirestore(updated));
      showNotification('Genel ayarlar kaydedildi.');
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  const resetToDemoData = async () => {
    try {
      // Clear Firestore Products in chunks
      const prodDocs = await getDocs(collection(db, 'products'));
      const prodRefs = prodDocs.docs.map((d) => d.ref);
      const CHUNK = 400;

      for (let i = 0; i < prodRefs.length; i += CHUNK) {
        const batch = writeBatch(db);
        prodRefs.slice(i, i + CHUNK).forEach((ref) => batch.delete(ref));
        await batch.commit();
      }

      // Re-insert INITIAL_PRODUCTS in chunks
      for (let i = 0; i < INITIAL_PRODUCTS.length; i += CHUNK) {
        const batch = writeBatch(db);
        INITIAL_PRODUCTS.slice(i, i + CHUNK).forEach((p) =>
          batch.set(doc(db, 'products', p.id), sanitizeForFirestore(p))
        );
        await batch.commit();
      }

      // Clear & Re-insert Categories and Settings
      const catDocs = await getDocs(collection(db, 'categories'));
      const catBatch = writeBatch(db);
      catDocs.forEach((d) => catBatch.delete(d.ref));
      INITIAL_CATEGORIES.forEach((c) =>
        catBatch.set(doc(db, 'categories', c.id), sanitizeForFirestore(c))
      );
      catBatch.set(doc(db, 'settings', 'general'), sanitizeForFirestore(DEFAULT_SETTINGS));
      await catBatch.commit();

      showNotification('Sistem varsayılan demo verilerine sıfırlandı.', 'info');
    } catch (err) {
      console.error('Error resetting to demo data:', err);
    }
  };

  const loginAdmin = (email: string, pass: string): boolean => {
    if ((email === 'admin@scucs.com' && pass === 'scucs123') || (email === 'admin' && pass === 'admin')) {
      const user: User = {
        uid: 'admin-1',
        email,
        displayName: 'Yönetici',
        role: 'admin',
      };
      setCurrentUser(user);
      showNotification('Yönetim paneline başarıyla giriş yapıldı.');
      return true;
    }
    showNotification('Hatalı e-posta veya şifre.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setCurrentUser(null);
    setActiveTab('home');
    showNotification('Oturum kapatıldı.', 'info');
  };

  const importProductsBulk = async (bulkData: CSVRowProduct[]): Promise<{ imported: number; errors: string[] }> => {
    let imported = 0;
    const errors: string[] = [];
    const now = new Date().toISOString();

    const batch = writeBatch(db);

    bulkData.forEach((row, idx) => {
      let matchedCat = categories.find(
        (c) => c.name.toLowerCase() === row.category.toLowerCase() || c.id === row.category
      );
      if (!matchedCat) {
        matchedCat = categories[0] || { id: 'cat-1', name: 'Genel Spor Aksesuarları' };
      }

      const numPrice = row.price ? parseFloat(row.price.replace(',', '.')) : null;
      const newId = `prod-bulk-${Date.now()}-${idx}`;

      const p: Product = {
        id: newId,
        name: row.name,
        sku: row.sku,
        slug: generateSlug(`${row.sku} ${row.name}`),
        categoryId: matchedCat.id,
        shortDescription: row.description || row.name,
        description: row.description || row.name,
        price: numPrice,
        currency: 'TRY',
        priceType: (row.priceType as any) || 'Tek Fiyatı',
        showPrice: true,
        taxStatus: 'KDV Dahil',
        stockStatus: 'Stokta Var',
        status: (row.status as any) || 'Yayında',
        featured: false,
        isNew: true,
        coverImage: row.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c6232661a0b?auto=format&fit=crop&w=800&q=80',
        images: [row.coverImage || 'https://images.unsplash.com/photo-1517649763962-0c6232661a0b?auto=format&fit=crop&w=800&q=80'],
        colors: row.color ? [row.color] : [],
        specifications: [
          ...(row.weight ? [{ id: 'w', title: 'Ağırlık', value: row.weight }] : []),
          ...(row.dimensions ? [{ id: 'd', title: 'Ölçüler', value: row.dimensions }] : []),
          ...(row.material ? [{ id: 'm', title: 'Malzeme', value: row.material }] : []),
        ],
        variants: [],
        weight: row.weight,
        dimensions: row.dimensions,
        material: row.material,
        packageQuantity: row.packageQuantity,
        sortOrder: products.length + idx + 1,
        createdAt: now,
        updatedAt: now,
      };

      batch.set(doc(db, 'products', newId), sanitizeForFirestore(p));
      imported++;
    });

    try {
      await batch.commit();
      showNotification(`${imported} adet ürün başarıyla yüklendi.`);
    } catch (err) {
      console.error('Error bulk importing:', err);
      errors.push('Toplu yükleme veritabanına aktarılırken hata oluştu.');
    }

    return { imported, errors };
  };

  const value = React.useMemo(() => ({
    products,
    categories,
    quotes,
    settings,
    currentUser,
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    searchQuery,
    setSearchQuery,
    selectedProductDetail,
    setSelectedProductDetail,
    quoteModalProduct,
    setQuoteModalProduct,
    lightboxImage,
    setLightboxImage,
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteProductsBulk,
    duplicateProduct,
    togglePublishProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    addQuoteRequest,
    updateQuoteStatus,
    deleteQuoteRequest,
    updateSettings,
    resetToDemoData,
    loginAdmin,
    logoutAdmin,
    importProductsBulk,
    notification,
    showNotification,
    isFirebaseConnected,
  }), [
    products,
    categories,
    quotes,
    settings,
    currentUser,
    activeTab,
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    selectedProductDetail,
    quoteModalProduct,
    lightboxImage,
    notification,
    isFirebaseConnected,
    cartItems,
    isCartOpen,
  ]);

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
