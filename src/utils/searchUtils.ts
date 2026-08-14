import { Product, Category } from '../types';

/**
 * Normalizes Turkish and international characters:
 * - Handles İ/i, I/ı proper Turkish case conversion
 * - Removes accents and circumflexes (â, î, û, etc.)
 * - Provides both accented and ASCII-stripped strings
 */
export function normalizeTurkishText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .replace(/é/g, 'e')
    .trim();
}

/**
 * Strips all Turkish specific diacritics into plain ASCII for ultra-flexible search
 * e.g., "hız paraşütü" -> "hiz parasutu", "sürât" -> "surat", "çanak" -> "canak"
 */
export function toAsciiFold(text: string | null | undefined): string {
  if (!text) return '';
  const normalized = normalizeTurkishText(text);
  return normalized
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Dictionary of sports equipment synonyms, slang and related search terms
 */
const SPORTS_SYNONYMS: Record<string, string[]> = {
  hiz: ['surat', 'sprint', 'siprint', 'cabukluk', 'reaksiyon', 'ivmelenme', 'patlayici'],
  surat: ['hiz', 'sprint', 'siprint', 'cabukluk', 'reaksiyon', 'ivmelenme'],
  sprint: ['hiz', 'surat', 'siprint', 'cabukluk'],
  siprint: ['sprint', 'hiz', 'surat'],
  cabukluk: ['hiz', 'surat', 'merdiven', 'koordinasyon', 'ladder'],
  parasut: ['parasutu', 'direnc', 'surat', 'hiz', 'kosu', 'paraşüt'],
  parasutu: ['parasut', 'direnc', 'surat', 'hiz', 'kosu'],
  kemer: ['cek cek', 'kizak', 'surat kemeri', 'direnc', 'bel kemeri'],
  cekcek: ['cek cek', 'surat kemeri', 'direnc lastigi', 'kemer'],
  merdiven: ['cabukluk', 'koordinasyon', 'ladder', 'kondisyon', 'basamak'],
  huni: ['koni', 'delikli huni', 'trafik', 'antrenman hunisi', 'cone'],
  koni: ['huni', 'delikli huni', 'trafik hunisi'],
  canak: ['tabak', 'marker', 'antrenman canagi', 'dish', 'kubbe'],
  tabak: ['canak', 'antrenman canagi', 'marker'],
  cember: ['halka', 'koordinasyon cemberi', 'ring', 'sekizgen', 'altigen'],
  baraj: ['frikik', 'serbest vurus', 'baraj adami', 'dummy'],
  dambil: ['dumbell', 'dumbbell', 'agirlik', 'dambıllar', 'el agirligi'],
  kizak: ['agirlik kizagi', 'surat kizagi', 'guc kizagi', 'sled'],
  ip: ['atlama ipi', 'kondisyon ipi', 'crossfit', 'rope', 'halat'],
  atlama: ['ip', 'atlama ipi', 'engel', 'atlama engeli'],
  engel: ['atlama engeli', 'hurdle', 'devrilmez engel', 'yukseklik ayarli'],
  direnc: ['lastik', 'tup', 'bant', 'band', 'tup direnci', 'egzersiz lastigi', 'loop'],
  lastik: ['direnc', 'tup', 'bant', 'egzersiz lastigi'],
  pilates: ['plates', 'pilates topu', 'overball', 'pilates bandi', 'egzersiz'],
  plates: ['pilates', 'pilates topu'],
  hakem: ['duduk', 'kart', 'bayrak', 'cuzdan', 'referee'],
  duduk: ['düdük', 'hakem', 'fox', 'fox40', 'duduk ipli'],
  taktik: ['tahta', 'manyetik', 'antrenor tahtasi', 'pano', 'klipsli dosya'],
  saglik: ['ecza', 'ilk yardim', 'medikal', 'sprey', 'buz', 'sedye', 'sogutucu'],
  file: ['ag', 'top filesi', 'kale filesi', 'reaksiyon filesi'],
  kale: ['mini kale', 'futbol kalesi', 'antreman kalesi'],
  slalom: ['cubuk', 'dikme', 'takoz', 'yayli slalom', 'slalom cubugu'],
  yelek: ['agirlik yelegi', 'antrenman yelegi', 'kondisyon'],
  agirlik: ['dambil', 'kizak', 'yelek', 'plaka'],
  pazuband: ['kaptanlik bandi', 'kol bandi', 'pazubant', 'armband'],
  pazubant: ['kaptanlik bandi', 'kol bandi', 'pazuband'],
};

/**
 * Expands a single token to include its synonyms and ASCII folded forms
 */
function getExpandedTokens(token: string): string[] {
  const asciiToken = toAsciiFold(token);
  if (!asciiToken) return [];

  const results = new Set<string>();
  results.add(asciiToken);
  results.add(normalizeTurkishText(token));

  // Check synonym dictionary
  if (SPORTS_SYNONYMS[asciiToken]) {
    SPORTS_SYNONYMS[asciiToken].forEach((syn) => {
      results.add(toAsciiFold(syn));
    });
  }

  // Also check if any dictionary key contains or is contained in this token
  for (const [key, synList] of Object.entries(SPORTS_SYNONYMS)) {
    if (asciiToken.includes(key) || key.includes(asciiToken)) {
      synList.forEach((syn) => results.add(toAsciiFold(syn)));
    }
  }

  return Array.from(results);
}

/**
 * Builds a searchable text blob for a product including categories, specs, tags, and synonyms
 */
export function buildProductSearchBlob(
  product: Product,
  categories?: Category[]
): {
  normalizedOriginal: string;
  asciiFolded: string;
} {
  const parts: string[] = [];

  // Core product details
  if (product.name) parts.push(product.name);
  if (product.sku) {
    parts.push(product.sku);
    // Add SKU without spaces/dashes for continuous matching (e.g. SCX1172 -> SCX 1172)
    parts.push(product.sku.replace(/[\s-_]/g, ''));
  }
  if (product.brand) parts.push(product.brand);
  if (product.shortDescription) parts.push(product.shortDescription);
  if (product.description) parts.push(product.description);
  if (product.material) parts.push(product.material);
  if (product.dimensions) parts.push(product.dimensions);
  if (product.weight) parts.push(product.weight);
  if (product.setContents) parts.push(product.setContents);
  if (product.packageQuantity) parts.push(product.packageQuantity);
  if (product.colors && product.colors.length > 0) parts.push(product.colors.join(' '));

  // Specifications
  if (product.specifications && Array.isArray(product.specifications)) {
    product.specifications.forEach((spec) => {
      if (spec.title) parts.push(spec.title);
      if (spec.value) parts.push(spec.value);
    });
  }

  // Category and Subcategory names
  if (categories && categories.length > 0) {
    const cat = categories.find((c) => c.id === product.categoryId);
    if (cat) {
      parts.push(cat.name);
      if (cat.description) parts.push(cat.description);
      if (product.subcategoryId && cat.subcategories) {
        const sub = cat.subcategories.find((s) => s.id === product.subcategoryId);
        if (sub) parts.push(sub.name);
      }
    }
  }

  const combined = parts.join(' ');
  return {
    normalizedOriginal: normalizeTurkishText(combined),
    asciiFolded: toAsciiFold(combined),
  };
}

export interface ProductSearchResult {
  product: Product;
  score: number;
}

/**
 * Checks whether a product matches a given search query.
 * Returns score > 0 if match, 0 if no match.
 */
export function matchProduct(
  product: Product,
  query: string,
  categories?: Category[]
): number {
  if (!query || !query.trim()) return 100;

  const rawQuery = query.trim();
  const queryAscii = toAsciiFold(rawQuery);
  const queryTokens = queryAscii.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return 100;

  const { asciiFolded, normalizedOriginal } = buildProductSearchBlob(product, categories);

  const productNameAscii = toAsciiFold(product.name);
  const productSkuAscii = toAsciiFold(product.sku);
  const cleanSku = productSkuAscii.replace(/[\s-_]/g, '');
  const cleanQuery = queryAscii.replace(/[\s-_]/g, '');

  let score = 0;

  // 1. Exact SKU Match (Highest priority)
  if (productSkuAscii === queryAscii || cleanSku === cleanQuery) {
    return 1000;
  }
  if (productSkuAscii.includes(queryAscii) || cleanSku.includes(cleanQuery)) {
    score += 500;
  }

  // 2. Exact Name Match
  if (productNameAscii === queryAscii) {
    return 900;
  }

  // 3. Name starts with query
  if (productNameAscii.startsWith(queryAscii)) {
    score += 400;
  }

  // 4. Exact Phrase in Name or Description
  if (productNameAscii.includes(queryAscii)) {
    score += 300;
  } else if (asciiFolded.includes(queryAscii)) {
    score += 150;
  }

  // 5. Multi-token / Keyword / Synonym Matching
  // Every token in the user's query must match either directly or via synonym
  let allTokensMatched = true;
  let tokenMatchBonus = 0;

  for (const token of queryTokens) {
    const expansions = getExpandedTokens(token);
    let tokenFound = false;

    for (const exp of expansions) {
      if (asciiFolded.includes(exp) || normalizedOriginal.includes(exp)) {
        tokenFound = true;
        // Higher bonus if matched in product name or SKU
        if (productNameAscii.includes(exp) || productSkuAscii.includes(exp)) {
          tokenMatchBonus += 40;
        } else {
          tokenMatchBonus += 15;
        }
        break;
      }
    }

    if (!tokenFound) {
      allTokensMatched = false;
      break;
    }
  }

  if (allTokensMatched) {
    score += 100 + tokenMatchBonus;
  }

  return score;
}
