// src/core/dashboard/components/CreateUserModal/CreateUserModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useAppDispatch } from '@/redux/hooks/hooks'
import { createUser } from '@/redux/features/user/userThunks'
import { Role } from '@/models/Role/Role' // اضافه کردن مدل Role
import styles from './CreateUserModal.module.scss'
import { UserCreate } from '@/models/User/UserCreate'

interface Props {
  onClose: () => void
  onSuccess: () => void
  roles: Role[] // دریافت لیست نقش‌ها از کامپوننت والد
}


const initialForm: UserCreate = {
  userName: '',
  email: '',
  password: '',
  confirmPassword: '', // مقداردهی اولیه
  name: '',
  family: '',
  phoneNumber: '',
  roleName: '', // به صورت پیش‌فرض خالی است تا کاربر مجبور به انتخاب شود
}

const CreateUserModal: React.FC<Props> = ({ onClose, onSuccess, roles }) => {
  const dispatch = useAppDispatch()
  const [form, setForm] = useState<UserCreate>(initialForm)
  const [errors, setErrors] = useState<Partial<UserCreate>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // در صورت نیاز می‌توان اولین نقش را به عنوان پیش‌فرض انتخاب کرد
  useEffect(() => {
    if (roles && roles.length > 0 && !form.roleName) {
      setForm(prev => ({ ...prev, roleName: roles[0].roleName }))
    }
  }, [roles, form.roleName])

  const validate = (): boolean => {
    const newErrors: Partial<UserCreate> = {}
    
    if (!form.userName.trim()) newErrors.userName = 'نام کاربری الزامی است'
    
    if (!form.email.trim()) newErrors.email = 'ایمیل الزامی است'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'فرمت ایمیل نامعتبر است'
    
    if (!form.password.trim()) newErrors.password = 'رمز عبور الزامی است'
    else if (form.password.length < 6) newErrors.password = 'رمز عبور حداقل ۶ کاراکتر باشد'
    
    // اعتبارسنجی تکرار رمز عبور
    if (!form.confirmPassword.trim()) newErrors.confirmPassword = 'تکرار رمز عبور الزامی است'
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'رمز عبور و تکرار آن یکسان نیستند'

    if (!form.name.trim()) newErrors.name = 'نام الزامی است'
    if (!form.family.trim()) newErrors.family = 'نام خانوادگی الزامی است'
    
    

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof UserCreate]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      // ارسال مستقیم فرم که اکنون دقیقاً منطبق با UserCreate است
      await dispatch(createUser(form)).unwrap()
      onSuccess()
    } catch {
      // خطا توی redux state هندل میشه
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <h3>افزودن کاربر جدید</h3>
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
              <label>ایمیل <span>*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>رمز عبور <span>*</span></label>
              <input name="password" type="password" value={form.password} onChange={handleChange} />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            {/* فیلد جدید تکرار رمز عبور */}
            <div className={styles.formGroup}>
              <label>تکرار رمز عبور <span>*</span></label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>شماره تماس</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </div>

            {/* فیلد جنسیت حذف شد */}

            {/* خواندن نقش‌ها از پراپ دریافت شده */}
            <div className={styles.formGroup}>
              <label>نقش <span>*</span></label>
              <select name="roleName" value={form.roleName} onChange={handleChange}>
                <option value="" disabled>انتخاب کنید</option>
                {roles?.map(role => (
                  <option key={role.RoleId} value={role.roleName}>
                    {role.displayName || role.roleName}
                  </option>
                ))}
              </select>
              {errors.roleName && <span className={styles.error}>{errors.roleName}</span>}
            </div>

          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>لغو</button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? 'در حال ذخیره...' : 'افزودن کاربر'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default CreateUserModal
