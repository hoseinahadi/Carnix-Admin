// src/components/ui/Modal/BaseModal.tsx
'use client'

import React, { useEffect } from 'react'
import styles from './BaseModal.module.scss'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string // برای کنترل عرض مودال‌های مختلف
}

const BaseModal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children, maxWidth = '600px' }) => {
  // بستن با کلید Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      // جلوگیری از اسکرول شدن صفحه پشتی هنگام باز بودن مودال
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.modalContent} 
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()} // جلوگیری از بسته شدن با کلیک روی خود مودال
      >
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="بستن">
            ✕
          </button>
        </div>
        
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default BaseModal
