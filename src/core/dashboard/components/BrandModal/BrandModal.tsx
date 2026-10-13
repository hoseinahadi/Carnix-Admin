// src/core/dashboard/brand/components/BrandModal/BrandModal.tsx
'use client'

import React, { useEffect, useState } from 'react'
import BaseModal from '@/layout/components/dasboard/BaseModal/BaseModal'
import { Brand } from '@/models/Brand/Brand'
import styles from './BrandModal.module.scss'

interface Props {
  isOpen: boolean
  brand?: Brand | null 
  onClose: () => void
  onSubmit: (brandData: Brand) => Promise<void>
}

const BrandModal: React.FC<Props> = ({ isOpen, brand, onClose, onSubmit }) => {
  const isEdit = !!brand;
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Brand>(
    brand || { brandId: 0, name: '', description: '', countryOfOrigin: '', websiteUrl: '', logoUrl: '', isActive: true, displayOrder: 1 }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: finalValue }))
  }

  useEffect(() => {
    if (brand) {
      setForm(brand);
    } else {
      setForm({ brandId: 0, name: '', description: '', countryOfOrigin: '', websiteUrl: '', logoUrl: '', isActive: true, displayOrder: 1 });
    }
  }, [brand, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { await onSubmit(form) } 
    finally { setLoading(false) }
  }

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? 'ویرایش برند' : 'تعریف برند جدید'}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          
          <div className={styles.formGroup}>
            <label>نام برند <span>*</span></label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label>کشور سازنده</label>
            <input name="countryOfOrigin" value={form.countryOfOrigin || ''} onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label>آدرس وب‌سایت</label>
            <input name="websiteUrl" dir="ltr" value={form.websiteUrl || ''} onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label>ترتیب نمایش</label>
            <input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} min="1" />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>توضیحات</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="isActive" 
                checked={form.isActive} 
                onChange={handleChange} 
                style={{ width: '16px', height: '16px' }}
              />
              برند فعال است
            </label>
          </div>

        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
            انصراف
          </button>
          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? 'در حال ذخیره...' : (isEdit ? 'بروزرسانی برند' : 'ایجاد برند')}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

export default BrandModal
