// src/components/ui/Modal/ConfirmModal.tsx
'use client'

import React from 'react'
import BaseModal from '../BaseModal/BaseModal'
import styles from './ConfirmModal.module.scss'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string | React.ReactNode
  isLoading?: boolean
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'تایید عملیات',
  message,
  isLoading = false,
  confirmText = 'تایید',
  cancelText = 'انصراف',
  type = 'danger'
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="450px">
      <div className={styles.confirmContainer}>
        
        <div className={`${styles.iconWrapper} ${styles[type]}`}>
          {type === 'danger' && '🗑️'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </div>

        <div className={styles.message}>
          {message}
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.btnCancel} 
            onClick={onClose} 
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.btnConfirm} ${styles[type]}`} 
            onClick={onConfirm} 
            disabled={isLoading}
          >
            {isLoading ? 'در حال پردازش...' : confirmText}
          </button>
        </div>

      </div>
    </BaseModal>
  )
}

export default ConfirmModal
