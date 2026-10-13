// features/products/components/ProductInventoryModal/ProductInventoryModal.tsx

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks/hooks';
import { getAllProducts } from '@/redux/features/product/ProductThunks';
import { getActiveWarehouses } from '@/redux/features/Warehous/WarehouseThunks';
import { selectActiveWarehouses, selectWarehousesLoading } from '@/redux/features/Warehous/WarehouseSelectors';
import BaseModal from '@/layout/components/dasboard/BaseModal/BaseModal';
import type { WarehouseInventoryDto, UpdateInventoryDto } from '@/models/product/ProductInventory';
import styles from './ProductInventoryModal.module.scss';

interface ProductInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateInventoryDto) => void;
  editingInventory?: WarehouseInventoryDto | null;
  loading: boolean;
}

const initialFormState = {
  productId: '',
  warehouseId: '',
  quantity: '',
};

const ProductInventoryModal: React.FC<ProductInventoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingInventory,
  loading,
}) => {
  const dispatch = useAppDispatch();
  const { products, loading: productsLoading } = useAppSelector((state) => state.products);
  const warehouses = useAppSelector(selectActiveWarehouses);
  const warehousesLoading = useAppSelector(selectWarehousesLoading);
  
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (products.length === 0) {
        dispatch(getAllProducts(undefined));
      }
      if (warehouses.length === 0) {
        dispatch(getActiveWarehouses());
      }
    }
  }, [isOpen, dispatch, products.length, warehouses.length]);

  useEffect(() => {
    if (isOpen) {
      if (editingInventory) {
        setFormData({
          productId: editingInventory.productId?.toString() || '',
          warehouseId: editingInventory.warehouseId?.toString() || '',
          quantity: editingInventory.quantity?.toString() || '',
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [isOpen, editingInventory]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.productId) newErrors.productId = 'انتخاب محصول الزامی است';
    if (!formData.warehouseId) newErrors.warehouseId = 'انتخاب انبار الزامی است';
    if (!formData.quantity || Number(formData.quantity) < 0)
      newErrors.quantity = 'موجودی نمی‌تواند منفی باشد';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: UpdateInventoryDto = {
      productId: Number(formData.productId),
      warehouseId: Number(formData.warehouseId),
      quantity: Number(formData.quantity),
    };

    onSubmit(payload);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingInventory ? 'ویرایش موجودی' : 'افزودن موجودی جدید'}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            محصول <span className={styles.required}>*</span>
          </label>
          <select
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            className={`${styles.select} ${errors.productId ? styles.inputError : ''}`}
            disabled={!!editingInventory || productsLoading}
          >
            <option value="">
              {productsLoading ? 'در حال بارگذاری...' : 'انتخاب کنید...'}
            </option>
            {products.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.productName}
              </option>
            ))}
          </select>
          {errors.productId && <span className={styles.errorMsg}>{errors.productId}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            انبار <span className={styles.required}>*</span>
          </label>
          <select
            name="warehouseId"
            value={formData.warehouseId}
            onChange={handleChange}
            className={`${styles.select} ${errors.warehouseId ? styles.inputError : ''}`}
            disabled={!!editingInventory || warehousesLoading}
          >
            <option value="">
              {warehousesLoading ? 'در حال بارگذاری...' : 'انتخاب کنید...'}
            </option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                {warehouse.name} - {warehouse.city}
              </option>
            ))}
          </select>
          {errors.warehouseId && <span className={styles.errorMsg}>{errors.warehouseId}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            موجودی <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="تعداد"
            className={`${styles.input} ${errors.quantity ? styles.inputError : ''}`}
          />
          {errors.quantity && <span className={styles.errorMsg}>{errors.quantity}</span>}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
            انصراف
          </button>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'در حال ذخیره...' : editingInventory ? 'ذخیره تغییرات' : 'ثبت موجودی'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ProductInventoryModal;
