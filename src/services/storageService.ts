import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file format (jpg, jpeg, png, webp) and size (max 5MB).
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'Lütfen geçerli bir resim dosyası seçiniz.' };
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  const isTypeValid =
    ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) ||
    ALLOWED_EXTENSIONS.includes(fileExt);

  if (!isTypeValid) {
    return {
      valid: false,
      error: 'Geçersiz dosya formatı. Yalnızca JPG, JPEG, PNG ve WEBP formatındaki resimler yükleyebilirsiniz.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Dosya boyutu çok büyük. Yüklenecek resim maksimum 5 MB olabilir.',
    };
  }

  return { valid: true };
}

/**
 * Uploads a product image file to Firebase Storage under products/{productId}/{uniqueFileName}
 * using uploadBytes and returns the getDownloadURL.
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFileName = `${Date.now()}_${cleanFileName}`;
  const filePath = `products/${productId}/${uniqueFileName}`;
  const storageRef = ref(storage, filePath);

  try {
    await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    });
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (err: any) {
    console.error('Firebase Storage upload error:', err);
    if (err?.code === 'storage/unauthorized' || (err?.message && err.message.toLowerCase().includes('unauthorized'))) {
      throw new Error('Görsel yükleme yetkiniz yok (storage/unauthorized). Lütfen Firebase Authentication ile yönetici girişi yaptığınızdan emin olun.');
    }
    throw new Error(
      'Resim Firebase Storage’a yüklenirken hata oluştu: ' +
        (err?.message || 'Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.')
    );
  }
}

/**
 * Deletes an image from Firebase Storage if the URL belongs to Firebase Storage.
 */
export async function deleteProductImageFromStorage(imageUrl?: string | null): Promise<void> {
  if (!imageUrl) return;

  const isFirebaseStorageUrl =
    imageUrl.includes('firebasestorage.googleapis.com') ||
    imageUrl.includes('firebasestorage.app') ||
    imageUrl.includes('crs-aksesuar.firebasestorage.app');

  if (!isFirebaseStorageUrl) return;

  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('Firebase Storage’dan eski resim silinirken hata oluştu (görmezden geliniyor):', err);
  }
}
