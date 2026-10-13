// features/products/components/ProductMediaManager/ProductMediaManager.tsx

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ProductMediaApi } from '@/api/product/ProductMediaApi';
import { Loader2, UploadCloud, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './ProductMediaManager.module.scss';

export interface MediaItem {
  productMediaId?: number;
  productId?: number | null;
  mediaType: string;
  mediaUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface ProductMediaManagerProps {
  productId: number | null;
  initialMedia?: MediaItem[];
  onChange?: (media: MediaItem[]) => void;
}

const getValidImageUrl = (rawUrl?: string) => {
  if (!rawUrl) return '';
  let cleanPath = rawUrl.replace(/^wwwroot[\\/]/i, '');
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7191';
  return `${backendBaseUrl}${cleanPath}`;
};

const ProductMediaManager: React.FC<ProductMediaManagerProps> = ({
  productId,
  initialMedia = [],
  onChange,
}) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // واکشی تصاویر قبلی این محصول از سرور
  const fetchMedia = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const response = await ProductMediaApi.getMediaByProductId(productId);
      if (response.data.isSuccess) {
        const items = response.data.data || response.data.mainResults || [];
        setMediaList(items);
        onChange?.(items);
      }
    } catch (error) {
      toast.error('خطا در دریافت تصاویر محصول', { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchMedia();
    }
  }, [productId]);

  // هندل کردن انتخاب و آپلود فایل
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;

    // بررسی حجم (مثلاً حداکثر 5 مگابایت)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم عکس نمی‌تواند بیشتر از ۵ مگابایت باشد');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('MediaType', 'Image'); // یا 'Video'
    formData.append('ProductId', productId.toString());
    formData.append('DisplayOrder', mediaList.length.toString());
    formData.append('IsPrimary', mediaList.length === 0 ? 'true' : 'false'); // اولین عکس اصلی می‌شود

    setIsUploading(true);
    try {
      const response = await ProductMediaApi.uploadMedia(formData);
      if (response.data.isSuccess) {
        toast.success('تصویر با موفقیت آپلود شد');
        fetchMedia(); // رفرش لیست بعد از آپلود
      } else {
        toast.error(response.data.message || 'خطا در آپلود');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ارتباط با سرور هنگام آپلود');
    } finally {
      setIsUploading(false);
      // پاک کردن مقدار اینپوت تا بتوان دوباره همان فایل را انتخاب کرد
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (mediaId?: number) => {
    if (!mediaId) return;
    try {
      setIsLoading(true);
      const res = await ProductMediaApi.deleteMedia(mediaId);
      if (res.data.isSuccess) {
        toast.success('تصویر حذف شد');
        fetchMedia();
      }
    } catch (error: any) {
      toast.error('خطا در حذف تصویر');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (mediaId?: number) => {
    if (!mediaId || !productId) return;
    try {
      setIsLoading(true);
      const res = await ProductMediaApi.setPrimary(mediaId, productId);
      if (res.data.isSuccess) {
        toast.success('تصویر اصلی تغییر کرد');
        fetchMedia();
      }
    } catch (error) {
      toast.error('خطا در تغییر تصویر اصلی');
    } finally {
      setIsLoading(false);
    }
  };

  if (!productId) {
    return (
      <div className={styles.emptyState}>
        لطفاً ابتدا اطلاعات پایه محصول را ذخیره کنید تا شناسه محصول ایجاد شده و امکان آپلود فراهم شود.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ─── باکس آپلود فایل ─── */}
      <div 
        className={`${styles.uploadBox} ${isUploading ? styles.disabled : ''}`} 
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          style={{ display: 'none' }}
        />
        {isUploading ? (
          <div className={styles.uploadingState}>
            <Loader2 className={styles.spinner} size={32} />
            <span>در حال آپلود...</span>
          </div>
        ) : (
          <div className={styles.uploadPrompt}>
            <UploadCloud size={40} className={styles.uploadIcon} />
            <p>برای آپلود تصویر جدید، اینجا کلیک کنید</p>
            <span>فرمت‌های مجاز: JPG, PNG, WEBP (حداکثر ۵ مگابایت)</span>
          </div>
        )}
      </div>

      {/* ─── گالری تصاویر آپلود شده ─── */}
      <div className={styles.mediaGallery}>
        {isLoading && mediaList.length === 0 ? (
          <div className={styles.loadingGallery}>
            <Loader2 className={styles.spinner} size={24} /> در حال دریافت تصاویر...
          </div>
        ) : mediaList.length === 0 ? (
          <div className={styles.noMedia}>هیچ تصویری برای این محصول ثبت نشده است.</div>
        ) : (
          mediaList.map((media) => (
            <div key={media.productMediaId} className={`${styles.mediaCard} ${media.isPrimary ? styles.primaryCard : ''}`}>
              <div className={styles.imageWrapper}>
                <img src={getValidImageUrl(media.mediaUrl)} alt="Product" />
                {media.isPrimary && <div className={styles.primaryBadge}>اصلی</div>}
              </div>
              <div className={styles.mediaActions}>
                <button
                  type="button"
                  className={styles.starBtn}
                  title="تنظیم به عنوان تصویر اصلی"
                  onClick={() => handleSetPrimary(media.productMediaId)}
                  disabled={media.isPrimary || isLoading}
                >
                  <Star size={16} fill={media.isPrimary ? "#eab308" : "none"} color={media.isPrimary ? "#eab308" : "#64748b"} />
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  title="حذف تصویر"
                  onClick={() => handleDelete(media.productMediaId)}
                  disabled={isLoading}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductMediaManager;