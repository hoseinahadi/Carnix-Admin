// features/warehouse/components/WarehouseModal/WarehouseModal.tsx
import React, { useEffect, useState } from 'react';
import BaseModal from '@/layout/components/dasboard/BaseModal/BaseModal';
import type { WarehouseDto, CreateWarehouseDto, UpdateWarehouseDto } from '@/models/warehouse/Warehouse';
import styles from './WarehouseModal.module.scss';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWarehouseDto | UpdateWarehouseDto) => void;
  editingWarehouse?: WarehouseDto | null;
  loading: boolean;
}

const initialFormState = {
  name: '',
  address: '',
  description: '',
  province: '',
  city: '',
  postalCode: '',
  preparationTimeHours: '24',
  priority: '100',
  isActive: true,
};

const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingWarehouse,
  loading,
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingWarehouse) {
        setFormData({
          name: editingWarehouse.name || '',
          address: editingWarehouse.address || '',
          description: editingWarehouse.description || '',
          province: editingWarehouse.province || '',
          city: editingWarehouse.city || '',
          postalCode: editingWarehouse.postalCode || '',
          preparationTimeHours: editingWarehouse.preparationTimeHours?.toString() || '24',
          priority: editingWarehouse.priority?.toString() || '100',
          isActive: editingWarehouse.isActive ?? true,
        });
      } else {
        setFormData(initialFormState);
      }setErrors({});
    }
  }, [isOpen, editingWarehouse]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'نام انبار الزامی است';
    if (!formData.address.trim()) newErrors.address = 'آدرس الزامی است';
    if (!formData.province.trim()) newErrors.province = 'استان الزامی است';
    if (!formData.city.trim()) newErrors.city = 'شهر الزامی است';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: any = {
      name: formData.name,
      address: formData.address,
      description: formData.description || undefined,
      province: formData.province,
      city: formData.city,
      postalCode: formData.postalCode || undefined,
      preparationTimeHours: Number(formData.preparationTimeHours),
      priority: Number(formData.priority),
      isActive: formData.isActive,
    };

    if (editingWarehouse) {
      payload.warehouseId = editingWarehouse.warehouseId;
    }

    onSubmit(payload);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingWarehouse ? 'ویرایش انبار' : 'افزودن انبار جدید'}
      maxWidth="700px"
    >
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              نام انبار <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="نام انبار"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              شهر <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="شهر"
              className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
            />
            {errors.city && <span className={styles.errorMsg}>{errors.city}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              استان <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              placeholder="استان"
              className={`${styles.input} ${errors.province ? styles.inputError : ''}`}
            />
            {errors.province && <span className={styles.errorMsg}>{errors.province}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>کد پستی</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="کد پستی"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            آدرس <span className={styles.required}>*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="آدرس کامل"
            className={`${styles.textarea} ${errors.address ? styles.inputError : ''}`}
            rows={3}
          />
          {errors.address && <span className={styles.errorMsg}>{errors.address}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>توضیحات</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="توضیحات اختیاری"
            className={styles.textarea}
            rows={2}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>زمان آماده‌سازی (ساعت)</label>
            <input
              type="number"
              name="preparationTimeHours"
              value={formData.preparationTimeHours}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>اولویت</label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span>انبار فعال است</span>
          </label>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
            انصراف
          </button>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'در حال ذخیره...' : editingWarehouse ? 'ذخیره تغییرات' : 'ثبت انبار'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default WarehouseModal;
