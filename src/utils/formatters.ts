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
