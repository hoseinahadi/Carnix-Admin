// features/products/components/ProductModal/ProductModal.tsx

'use client';

import React, { useEffect, useState, useRef } from 'react';
import BaseModal from '@/layout/components/dasboard/BaseModal/BaseModal';
import type { Product } from '@/models/product/Product';
import type { Category } from '@/models/category/Category';
import type { Brand } from '@/models/Brand/Brand';
import ProductMediaManager, { type MediaItem } from '../ProductMediaManager/ProductMediaManager';
import styles from './ProductModal.module.scss';
import { Loader2, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, file?: File | null) => void; // 🟢 قابلیت دریافت فایل در onSubmit
  editingProduct?: Product | null;
  categories: Category[];
  brands?: Brand[];
  loading?: boolean;
  isCategoriesLoading?: boolean;
}

type TabType = 'basic' | 'details' | 'seo' | 'media';

const initialFormState = {
  productName     : '',
  productCode     : '',
  categoryId      : '',
  brandId         : '',
  basePrice       : '',
  totalStock      : '',
  shortDescription: '',
  fullDescription : '',
  isActive        : true,
  isFeatured      : false,
  displayOrder    : '0',
  pageTitle       : '',
  metaDescription : '',
  metaKeywords    : '',
  slug            : '',
  h1Tag           : '',
  h2Tag           : '',
  mainImageAltText: '',
  mainImageUrl    : '',
};

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  categories,
  brands = [],
  loading = false,
  isCategoriesLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]); 

  // 🟢 استیت‌های مربوط به انتخاب تصویر جدید
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          productName     : editingProduct.productName      || '',
          productCode     : editingProduct.productCode      || '',
          categoryId      : editingProduct.categoryId?.toString()  || '',
          brandId         : editingProduct.brandId?.toString()     || '',
          basePrice       : editingProduct.basePrice?.toString()   || '',
          totalStock      : editingProduct.totalStock?.toString()  || '',
          shortDescription: editingProduct.shortDescription || '',
          fullDescription : editingProduct.fullDescription  || '',
          isActive        : editingProduct.isActive  ?? true,
          isFeatured      : editingProduct.isFeatured ?? false,
          displayOrder    : editingProduct.displayOrder?.toString() || '0',
          pageTitle       : '',
          metaDescription : '',
          metaKeywords    : '',
          slug            : '',
          h1Tag           : '',
          h2Tag           : '',
          mainImageAltText: '',
          mainImageUrl    : '',
        });
      } else {
        setFormData(initialFormState);
      }
      setMediaItems([]); 
      setSelectedFile(null); // 🟢 پاک کردن فایل قبلی
      setPreviewUrl(null);   // 🟢 پاک کردن پیش‌نمایش قبلی
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  const isNewProduct = !editingProduct;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // 🟢 هندل کردن انتخاب فایل توسط کاربر
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم عکس نمی‌تواند بیشتر از ۵ مگابایت باشد');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 🟢 حذف تصویر انتخاب شده (قبل از آپلود)
  const handleRemoveSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.productName.trim())
      newErrors.productName = 'نام محصول الزامی است';
    if (!formData.categoryId)
      newErrors.categoryId  = 'انتخاب دسته‌بندی الزامی است';
    if (!formData.basePrice || Number(formData.basePrice) <= 0)
      newErrors.basePrice   = 'قیمت باید بیشتر از صفر باشد';
    if (!formData.totalStock || Number(formData.totalStock) < 0)
      newErrors.totalStock  = 'موجودی نمی‌تواند منفی باشد';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setActiveTab('basic');
      return;
    }

    const payload = {
      categoryId      : Number(formData.categoryId),
      brandId         : formData.brandId ? Number(formData.brandId) : null,
      productName     : formData.productName.trim(),
      productCode     : formData.productCode.trim()      || null,
      shortDescription: formData.shortDescription.trim() || null,
      fullDescription : formData.fullDescription.trim()  || null,
      basePrice       : Number(formData.basePrice),
      totalStock      : Number(formData.totalStock),
      isActive        : formData.isActive,
      isFeatured      : formData.isFeatured,
      displayOrder    : Number(formData.displayOrder),
      mediaItems, 
    };

    // 🟢 ارسال دیتا به همراه فایلِ تصویر
    onSubmit(
      editingProduct
        ? { ...payload, productId: Number(editingProduct.productId) }
        : payload,
      selectedFile
    );
  };

  const TABS: { key: TabType; label: string; disabled?: boolean; tooltip?: string }[] = [
    { key: 'basic',   label: 'اطلاعات پایه' },
    { key: 'details', label: 'جزئیات' },
    { key: 'seo',     label: 'سئو' },
    { 
      key: 'media',   
      label: 'گالری تصاویر', 
      disabled: isNewProduct, 
      tooltip: isNewProduct ? 'برای مدیریت گالری و ویدیوها، ابتدا محصول را ذخیره کنید' : '' 
    },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'}
      maxWidth="800px"
    >
      <form onSubmit={handleSubmit} className={styles.modalForm}>

        <div className={styles.tabs}>
          {TABS.map(({ key, label, disabled, tooltip }) => (
            <button
              key={key}
              type="button"
              className={`${styles.tab} ${activeTab === key ? styles.activeTab : ''} ${disabled ? styles.disabledTab : ''}`}
              onClick={() => !disabled && setActiveTab(key)}
              disabled={disabled}
              title={tooltip}
            >
              {label}
              {disabled && <span className={styles.lockIcon}>🔒</span>}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'basic' && (
            <>
              {/* 🟢 بخش تصویر اصلی در زمان ساخت محصول جدید */}
              {isNewProduct && (
                <div className={styles.mainImageUploader}>
                  <label className={styles.label}>تصویر اصلی محصول</label>
                  <div 
                    className={styles.uploadArea}
                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/png, image/jpeg, image/webp"
                      style={{ display: 'none' }}
                    />
                    
                    {previewUrl ? (
                      <div className={styles.imagePreviewWrapper}>
                        <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                        <button type="button" className={styles.removeImageBtn} onClick={handleRemoveSelectedFile}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <ImagePlus size={32} className={styles.placeholderIcon} />
                        <span>برای انتخاب تصویر کلیک کنید</span>
                        <small>فرمت‌های مجاز: JPG, PNG, WEBP</small>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    نام محصول <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="مثال: گوشی سامسونگ S24"
                    className={`${styles.input} ${errors.productName ? styles.inputError : ''}`}
                    disabled={loading}
                  />
                  {errors.productName && <span className={styles.errorMsg}>{errors.productName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>کد محصول</label>
                  <input
                    type="text"
                    name="productCode"
                    value={formData.productCode}
                    onChange={handleChange}
                    placeholder="مثال: PROD-001"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    دسته‌بندی <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.categoryId ? styles.inputError : ''}`}
                    disabled={loading || isCategoriesLoading}
                  >
                    <option value="">{isCategoriesLoading ? 'در حال بارگذاری...' : 'انتخاب کنید...'}</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <span className={styles.errorMsg}>{errors.categoryId}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>برند</label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleChange}
                    className={styles.select}
                    disabled={loading}
                  >
                    <option value="">بدون برند</option>
                    {brands.map((brand) => (
                      <option key={brand.brandId} value={brand.brandId}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    قیمت پایه (تومان) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    placeholder="مثال: 5000000"
                    className={`${styles.input} ${errors.basePrice ? styles.inputError : ''}`}
                    disabled={loading}
                  />
                  {errors.basePrice && <span className={styles.errorMsg}>{errors.basePrice}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    موجودی کل <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="totalStock"
                    value={formData.totalStock}
                    onChange={handleChange}
                    placeholder="تعداد در انبار"
                    className={`${styles.input} ${errors.totalStock ? styles.inputError : ''}`}
                    disabled={loading}
                  />
                  {errors.totalStock && <span className={styles.errorMsg}>{errors.totalStock}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>ترتیب نمایش</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    placeholder="0"
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>وضعیت</label>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className={styles.checkbox}
                        disabled={loading}
                      />
                      محصول فعال باشد
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        className={styles.checkbox}
                        disabled={loading}
                      />
                      محصول ویژه
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'details' && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>توضیح کوتاه</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="خلاصه‌ای از محصول..."
                  className={styles.textarea}
                  disabled={loading}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>توضیحات کامل</label>
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleChange}
                  rows={6}
                  placeholder="توضیحات کامل محصول..."
                  className={styles.textarea}
                  disabled={loading}
                />
              </div>
            </>
          )}

          {activeTab === 'seo' && (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>عنوان صفحه</label>
                  <input type="text" name="pageTitle" value={formData.pageTitle} onChange={handleChange} className={styles.input} disabled={loading} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Slug</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} className={styles.input} disabled={loading} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Meta Description</label>
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows={3} placeholder="توضیح کوتاه برای نتایج جستجو..." className={styles.textarea} disabled={loading} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Meta Keywords</label>
                <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} placeholder="کلمه1، کلمه2، کلمه3" className={styles.input} disabled={loading} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>تگ H1</label>
                  <input type="text" name="h1Tag" value={formData.h1Tag} onChange={handleChange} placeholder="عنوان اصلی صفحه" className={styles.input} disabled={loading} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>تگ H2</label>
                  <input type="text" name="h2Tag" value={formData.h2Tag} onChange={handleChange} placeholder="عنوان فرعی" className={styles.input} disabled={loading} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Alt Text تصویر اصلی</label>
                <input type="text" name="mainImageAltText" value={formData.mainImageAltText} onChange={handleChange} placeholder="توضیح تصویر برای دسترسی‌پذیری" className={styles.input} disabled={loading} />
              </div>
            </>
          )}

          {activeTab === 'media' && !isNewProduct && (
            <ProductMediaManager
              productId={editingProduct?.productId ?? null}
              initialMedia={mediaItems}
              onChange={setMediaItems}
            />
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
            انصراف
          </button>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading && <Loader2 className={styles.buttonSpinner} size={16} />}
            {editingProduct ? 'ذخیره تغییرات' : 'ثبت محصول و تصویر'}
          </button>
        </div>

      </form>
    </BaseModal>
  );
};

export default ProductModal;