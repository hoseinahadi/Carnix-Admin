// src/core/dashboard/layout/userTable/DeleteUserModal.tsx
'use client'

import React, { useEffect } from 'react'
import styles from './DeleteUserModal.module.scss'

interface Props {
  onClose: () => void
  onConfirm: () => void
}

const DeleteUserModal: React.FC<Props> = ({ onClose, onConfirm }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.iconWrapper}>
          <span className={styles.warningIcon}>⚠️</span>
        </div>

        <h3>حذف کاربر</h3>
        <p>آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟ این عمل قابل بازگشت نیست.</p>

        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onClose}>لغو</button>
          <button className={styles.btnConfirm} onClick={onConfirm}>بله، حذف کن</button>
        </div>

      </div>
    </div>
  )
}

export default DeleteUserModal
