/**
 * Utility functions for formatting prices, dates, slugs, and WhatsApp links
 */

export function formatPrice(price?: number | null, currency: string = 'TRY', showPrice: boolean = true): string {
  if (!showPrice || price === null || price === undefined || isNaN(price)) {
    return 'Fiyat için iletişime geçiniz';
  }

  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  const symbol = currency === 'TRY' ? '₺' : currency;
  return `${formatted} ${symbol}`;
}

export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  return formatPrice(amount, currency, true);
}

export function calculateTaxPrices(
  price?: number | null,
  taxStatus: 'KDV Dahil' | 'KDV Hariç' = 'KDV Hariç',
  vatRate: number = 20
) {
  if (price === null || price === undefined || isNaN(price)) {
    return { exVat: null, incVat: null, vatRate };
  }
  const effectiveRate = vatRate !== undefined && !isNaN(vatRate) ? vatRate : 20;
  const rateDecimal = effectiveRate / 100;
  let exVat: number;
  let incVat: number;

  if (taxStatus === 'KDV Dahil') {
    incVat = price;
    exVat = price / (1 + rateDecimal);
  } else {
    exVat = price;
    incVat = price * (1 + rateDecimal);
  }

  return { exVat, incVat, vatRate: effectiveRate };
}

export function generateSlug(text: string): string {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };

  return text
    .split('')
    .map(char => trMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function generateWhatsappLink(phone: string, productName: string, productSku: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = `Merhaba, ${productName} – ${productSku} hakkında bilgi almak istiyorum.`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80';

export function getProductImage(product?: { coverImage?: string; images?: string[] } | null): string {
  if (!product) return DEFAULT_FALLBACK_IMAGE;
  
  if (product.coverImage && typeof product.coverImage === 'string' && product.coverImage.trim() !== '') {
    return product.coverImage.trim();
  }
  
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    if (firstImg && typeof firstImg === 'string' && firstImg.trim() !== '') {
      return firstImg.trim();
    }
  }

  return DEFAULT_FALLBACK_IMAGE;
}

export function getCategoryImage(category?: { image?: string } | null): string {
  if (category && category.image && typeof category.image === 'string' && category.image.trim() !== '') {
    return category.image.trim();
  }
  return DEFAULT_FALLBACK_IMAGE;
}


