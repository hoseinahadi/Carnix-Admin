// src/core/dashboard/brand/components/BrandHeader/BrandHeader.tsx
'use client'

import React from 'react'
import styles from './BrandHeader.module.scss'

interface Props {
  totalCount: number
  filteredCount: number
  search: string
  onSearchChange: (v: string) => void
  onAddBrand: () => void
  onRefresh: () => void
  loading: boolean
}

const BrandHeader: React.FC<Props> = ({
  totalCount,
  filteredCount,
  search,
  onSearchChange,
  onAddBrand,
  onRefresh,
  loading,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>مدیریت برندها</h2>
          <span className={styles.badge}>{totalCount} برند ثبت شده</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.btnRefresh}
            onClick={onRefresh}
            disabled={loading}
            title="به‌روزرسانی لیست"
          >
            <span className={loading ? styles.spinning : ''}>↻</span>
          </button>

          <button className={styles.btnAdd} onClick={onAddBrand} disabled={loading}>
            + تعریف برند جدید
          </button>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="جستجو در نام یا کشور سازنده برند..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button 
              className={styles.clearSearch} 
              onClick={() => onSearchChange('')}
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {search && (
          <div className={styles.filterResult}>
            <span className={styles.dot}></span>
            {filteredCount} مورد یافت شد
          </div>
        )}

        {loading && (
          <div className={styles.loadingPulse}>
            <span>در حال دریافت اطلاعات...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrandHeader
