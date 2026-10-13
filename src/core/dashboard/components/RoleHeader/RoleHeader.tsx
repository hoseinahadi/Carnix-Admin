// src/core/dashboard/components/RoleHeader/RoleHeader.tsx
'use client'

import React from 'react'
import styles from './RoleHeader.module.scss'

interface Props {
  totalCount: number
  filteredCount: number
  search: string
  onSearchChange: (v: string) => void
  onAddRole: () => void
  onRefresh: () => void
  loading: boolean
}

const RoleHeader: React.FC<Props> = ({
  totalCount,
  filteredCount,
  search,
  onSearchChange,
  onAddRole,
  onRefresh,
  loading,
}) => {
  return (
    <div className={styles.wrapper}>
      
      {/* تیتر و دکمه‌های عملیاتی */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>مدیریت نقش‌ها و دسترسی‌ها</h2>
          <span className={styles.badge}>{totalCount} نقش تعریف شده</span>
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

          <button className={styles.btnAdd} onClick={onAddRole} disabled={loading}>
            + تعریف نقش جدید
          </button>
        </div>
      </div>

      {/* بخش جستجو و فیلتر */}
      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="جستجو در نام سیستمی یا نام نمایشی نقش..."
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

        {/* نمایش تعداد نتایج در صورت فیلتر شدن */}
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

export default RoleHeader
