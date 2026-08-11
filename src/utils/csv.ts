import { Product, Category } from '../types';

export interface CSVRowProduct {
  name: string;
  sku: string;
  category: string;
  subcategory?: string;
  description?: string;
  price?: string;
  priceType?: string;
  color?: string;
  weight?: string;
  dimensions?: string;
  material?: string;
  packageQuantity?: string;
  coverImage?: string;
  status?: string;
}

export function parseCSV(text: string): { data: CSVRowProduct[]; errors: string[] } {
  const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) {
    return { data: [], errors: ['Dosya boş veya başlık satırı eksik.'] };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const data: CSVRowProduct[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const values = parseCSVLine(rawLine);
    if (values.length === 0) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] ? values[idx].trim() : '';
    });

    const name = rowObj['ürün adı'] || rowObj['urun adi'] || rowObj['name'] || rowObj['ürün'] || values[0] || '';
    const sku = rowObj['ürün kodu'] || rowObj['urun kodu'] || rowObj['sku'] || values[1] || '';
    const category = rowObj['kategori'] || rowObj['category'] || values[2] || 'Genel Spor Aksesuarları';

    if (!name || !sku) {
      errors.push(`Satır ${i + 1}: Ürün adı veya SKU eksik olduğu için atlandı.`);
      continue;
    }

    data.push({
      name,
      sku,
      category,
      subcategory: rowObj['alt kategori'] || rowObj['subCategory'] || '',
      description: rowObj['açıklama'] || rowObj['aciklama'] || rowObj['description'] || '',
      price: rowObj['fiyat'] || rowObj['price'] || '',
      priceType: rowObj['fiyat türü'] || rowObj['fiyat turu'] || rowObj['priceType'] || 'Tek Fiyatı',
      color: rowObj['renk'] || rowObj['color'] || '',
      weight: rowObj['ağırlık'] || rowObj['agirlik'] || rowObj['weight'] || '',
      dimensions: rowObj['ölçüler'] || rowObj['olculer'] || rowObj['dimensions'] || '',
      material: rowObj['malzeme'] || rowObj['material'] || '',
      packageQuantity: rowObj['paket adedi'] || rowObj['packageQuantity'] || '',
      coverImage: rowObj['görsel url'] || rowObj['gorsel url'] || rowObj['coverImage'] || '',
      status: rowObj['yayın durumu'] || rowObj['yayin durumu'] || rowObj['status'] || 'Yayında',
    });
  }

  return { data, errors };
}

export function parseCsvToProducts(text: string, defaultCatId: string = 'cat-1'): { products: CSVRowProduct[]; errors: string[] } {
  const parsed = parseCSV(text);
  return {
    products: parsed.data,
    errors: parsed.errors,
  };
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

export function exportProductsToCSV(products: Product[]): void {
  const csvContent = exportProductsToCsv(products);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SCUCS_Urun_Katalogu_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportProductsToCsv(products: Product[], categories?: Category[]): string {
  const headers = [
    'Ürün Adı',
    'Ürün Kodu',
    'Kategori',
    'Alt Kategori',
    'Açıklama',
    'Fiyat',
    'Fiyat Türü',
    'Renk',
    'Ağırlık',
    'Ölçüler',
    'Malzeme',
    'Paket Adedi',
    'Görsel URL',
    'Yayın Durumu',
  ];

  const rows = products.map(p => {
    const catName = categories ? categories.find(c => c.id === p.categoryId)?.name || p.categoryId : p.categoryId;
    return [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${catName}"`,
      `"${p.subcategoryId || ''}"`,
      `"${p.shortDescription.replace(/"/g, '""')}"`,
      p.price ? p.price.toString() : '',
      `"${p.priceType}"`,
      `"${(p.colors || []).join(', ')}"`,
      `"${p.weight || ''}"`,
      `"${p.dimensions || ''}"`,
      `"${p.material || ''}"`,
      `"${p.packageQuantity || ''}"`,
      `"${p.coverImage}"`,
      `"${p.status}"`,
    ];
  });

  return '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
}

export function getSampleCsvTemplate(): string {
  return `\uFEFFÜrün Adı;Ürün Kodu;Kategori;Alt Kategori;Açıklama;Fiyat;Fiyat Türü;Renk;Ağırlık;Ölçüler;Malzeme;Paket Adedi;Görsel URL;Yayın Durumu
"Antrenman Çanağı 5cm","SCX 1080","Çanak ve Huniler","","Esnek kırılmaz antrenman çanağı","12.50","Tek Fiyatı","Florasan Sarı","30g","18.5cm x 5cm","Kırılmaz Polimer","50 Adet","https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80","Yayında"
"Koordinasyon Merdiveni 6m","SCX 2040","Agility Ekipmanları","","6 metre uzunluğunda dayanıklı basamaklı merdiven","450.00","Tek Fiyatı","Sarı/Siyah","850g","6m x 50cm","Naylon ve PP","1 Adet","https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80","Yayında"`;
}
