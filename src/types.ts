export type PriceType = 'Tek Fiyatı' | 'Set Fiyatı' | 'Paket Fiyatı';

export type StockStatus = 'Stokta Var' | 'Stokta Yok' | 'Sınırlı Stok' | 'Sipariş Üzerine';

export type ProductStatus = 'Yayında' | 'Taslak' | 'Pasif';

export type QuoteStatus = 'Yeni' | 'Görüşüldü' | 'Teklif verildi' | 'Tamamlandı' | 'İptal edildi';

export interface Specification {
  id: string;
  title: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Kırmızı"
  sku: string; // e.g. "SCX 1080-K"
  color: string;
  price?: number | null;
  stockStatus: StockStatus;
  image?: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  subcategoryId?: string;
  shortDescription: string;
  description: string;
  price?: number | null;
  discountPrice?: number | null;
  currency: string;
  priceType: PriceType;
  showPrice: boolean;
  taxStatus: 'KDV Dahil' | 'KDV Hariç';
  vatRate?: number;
  taxRate?: number;
  stockStatus: StockStatus;
  status: ProductStatus;
  featured: boolean;
  isNew: boolean;
  coverImage: string;
  images: string[];
  colors?: string[];
  specifications: Specification[];
  variants?: ProductVariant[];
  packageQuantity?: string;
  setContents?: string;
  material?: string;
  weight?: string;
  dimensions?: string;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  active: boolean;
  subcategories: Subcategory[];
}

export interface QuoteRequest {
  id: string;
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
  city: string;
  productName: string;
  productSku: string;
  quantity: number;
  message: string;
  kvkkConsent: boolean;
  status: QuoteStatus;
  createdAt: string;
}

export interface GeneralSettings {
  brandName: string;
  logoText: string;
  logoSubtext: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  homeHeroTitle: string;
  homeHeroSubtext: string;
  homeBannerImage: string;
  aboutText: string;
  contactInfo: string;
  defaultCurrency: string;
  taxSetting: string;
  maintenanceMode: boolean;
  globalShowPrice: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor';
}
