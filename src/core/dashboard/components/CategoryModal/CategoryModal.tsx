import React, { useState, useEffect } from 'react';
import styles from './CategoryModal.module.scss';
import { Category } from '@/models/category/Category';


interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Category | null;
  availableCategories: Category[];
  isLoading?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  availableCategories,
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    metaTitle: '',
    description: '',
    parentCategoryId: '' as string | number,
    displayOrder: 0,
    isActive: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        metaTitle: initialData.metaTitle || '',
        description: initialData.description || '',
        parentCategoryId: initialData.parentCategoryId || '',
        displayOrder: initialData.displayOrder || 0,
        isActive: initialData.isActive ?? true
      });
    } else {
      setFormData({ 
        name: '', 
        metaTitle: '', 
        description: '', 
        parentCategoryId: '',
        displayOrder: 0,
        isActive: true
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // مدیریت چک‌باکس
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      // تبدیل مقادیر عددی
      parentCategoryId: formData.parentCategoryId ? Number(formData.parentCategoryId) : null,
      displayOrder: Number(formData.displayOrder)
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{initialData ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={isLoading}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>نام دسته‌بندی</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>نامک (metaTitle)</label>
            <input
              type="text"
              name="metaTitle"
              dir="ltr"
              value={formData.metaTitle}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>دسته‌بندی والد</label>
            <select
              name="parentCategoryId"
              value={formData.parentCategoryId}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="">بدون والد (اصلی)</option>
              {availableCategories?.map(cat => (
                cat.categoryId !== initialData?.categoryId && (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                )
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>توضیحات</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>ترتیب نمایش</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                min="0"
                disabled={isLoading}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                وضعیت فعال
              </label>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>
              انصراف
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'در حال ثبت...' : (initialData ? 'ذخیره تغییرات' : 'ثبت دسته‌بندی')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
