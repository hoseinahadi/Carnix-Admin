// src/core/dashboard/layout/userTable/EditUserModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { UserList } from '@/models/User/UserList'
import { Role } from '@/models/Role/Role' // اضافه کردن مدل Role
import styles from './EditUserModal.module.scss'

interface Props {
  user: UserList
  roles: Role[] // دریافت لیست نقش‌ها از ریداکس (از طریق Parent)
  onClose: () => void
  onSubmit: (updatedUser: UserList) => Promise<void> // تغییر به Promise برای هندل کردن وضعیت Loading
}

const EditUserModal: React.FC<Props> = ({ user, roles, onClose, onSubmit }) => {
  console.log("FFFFFFFFFFFFFFF")
  console.log(user)
  const [form, setForm] = useState<UserList>(user)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof UserList, string>>>({})

  // بستن با کلید Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserList, string>> = {}
    if (!form.name.trim()) newErrors.name = 'نام الزامی است'
    if (!form.family.trim()) newErrors.family = 'نام خانوادگی الزامی است'
    if (!form.userName.trim()) newErrors.userName = 'نام کاربری الزامی است'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'فرمت ایمیل نامعتبر است'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    
    // پاک کردن خطا هنگام تایپ مجدد
    if (errors[name as keyof UserList]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);
  try {
    // ایجاد یک کپی از فرم بدون فیلدهای اضافی که بک‌اند لازم ندارد (مثل پسورد)
    const { ...payload } = form;
    
    await onSubmit(payload); 
  } catch (error) {
    console.error("Error updating user", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <h3>ویرایش اطلاعات کاربر</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGrid}>

            <div className={styles.formGroup}>
              <label>نام <span>*</span></label>
              <input name="name" value={form.name} onChange={handleChange} />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>نام خانوادگی <span>*</span></label>
              <input name="family" value={form.family} onChange={handleChange} />
              {errors.family && <span className={styles.error}>{errors.family}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>نام کاربری <span>*</span></label>
              <input name="userName" value={form.userName} onChange={handleChange} />
              {errors.userName && <span className={styles.error}>{errors.userName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>ایمیل</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>شماره تماس</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
              <label>نقش سیستم</label>
              <select name="roleName" value={form.roleName} onChange={handleChange}>
                {roles?.map(role => (
                  <option key={role.RoleId} value={role.roleName}>
                    {role.displayName || role.roleName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>وضعیت حساب</label>
              <select
                name="isActive"
                value={String(form.isActive)}
                onChange={e => setForm(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
              >
                <option value="true">فعال</option>
                <option value="false">غیرفعال</option>
              </select>
            </div>

            {/* در صورت نیاز به فیلد جنسیت در UserList، اینجا باقی بماند */}
            <div className={styles.formGroup}>
              <label>جنسیت</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="مرد">مرد</option>
                <option value="زن">زن</option>
                <option value="">نامشخص</option>
              </select>
            </div>

          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
              لغو
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? 'در حال بروزرسانی...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default EditUserModal
