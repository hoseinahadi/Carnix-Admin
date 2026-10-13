// src/core/dashboard/components/RoleModal/RoleModal.tsx
'use client'

import React, { useEffect, useState } from 'react'
import BaseModal from '@/layout/components/dasboard/BaseModal/BaseModal'
import { Role } from '@/models/Role/Role'
import styles from './RoleModal.module.scss' // فقط شامل استایل فرم و گریدها

interface Props {
  isOpen: boolean
  role?: Role | null 
  onClose: () => void
  onSubmit: (roleData: Role) => Promise<void>
}
// src/core/dashboard/components/RoleModal/RoleModal.tsx




const RoleModal: React.FC<Props> = ({ isOpen, role, onClose, onSubmit }) => {
  const isEdit = !!role;
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Role>(
    role || { RoleId: '', roleName: '', displayName: '', description: '', roleLevel: 1, isActive: true }
  )
  const [errors, setErrors] = useState<any>({})

  // ... (توابع validate و handleChange دقیقاً مثل قبل هستند) ...
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
useEffect(() => {
  if (role) {
    setForm(role);
  } else {
    setForm({ RoleId: '', roleName: '', displayName: '', description: '', roleLevel: 1, isActive: true });
  }
}, [role, isOpen]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // if (!validate()) return
    setLoading(true)
    try { await onSubmit(form) } 
    finally { setLoading(false) }
  }

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? 'ویرایش نقش' : 'تعریف نقش جدید'}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/* ... اینپوت‌های نام سیستمی، نام نمایشی و ... دقیقاً مثل قبل ... */}
          <div className={styles.formGroup}>
            <label>نام نمایشی</label>
            <input name="displayName" value={form.displayName} onChange={handleChange} />
          </div>
          {/* ... بقیه فیلدها ... */}
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
            انصراف
          </button>
          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? 'در حال ذخیره...' : (isEdit ? 'بروزرسانی نقش' : 'ایجاد نقش')}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}

export default RoleModal
