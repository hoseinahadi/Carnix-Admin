// src/core/dashboard/components/UserListHeader/UserListHeader.tsx
'use client'

import React from 'react'
import { Role } from '@/models/Role/Role' // اضافه کردن مدل Role
import styles from './UserListHeader.module.scss'

interface Props {
  totalCount: number
  filteredCount: number
  search: string
  onSearchChange: (v: string) => void
  roleFilter: string
  onRoleFilterChange: (v: string) => void
  statusFilter: string
  onStatusFilterChange: (v: string) => void
  roles: Role[] // تغییر تایپ از string[] به Role[]
  onAddUser: () => void
  onRefresh: () => void
  loading: boolean
}

const UserListHeader: React.FC<Props> = ({
  totalCount,
  filteredCount,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  roles, // حالا این یک آرایه از آبجکت‌های Role است
  onAddUser,
  onRefresh,
  loading,
}) => {
  return (
    <div className={styles.wrapper}>

      {/* تیتر و دکمه‌ها */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>مدیریت کاربران</h2>
          <span className={styles.badge}>{totalCount} کاربر</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.btnRefresh}
            onClick={onRefresh}
            disabled={loading}
            title="بارگذاری مجدد"
          >
            <span className={loading ? styles.spinning : ''}>↻</span>
          </button>

          <button className={styles.btnAdd} onClick={onAddUser}>
            + افزودن کاربر
          </button>
        </div>
      </div>

      {/* فیلترها */}
      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="جستجو بر اساس نام، ایمیل، شماره تماس..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => onSearchChange('')}>✕</button>
          )}
        </div>

        <select
          value={roleFilter}
          onChange={e => onRoleFilterChange(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">همه نقش‌ها</option>
          {/* خواندن مقادیر از آبجکت نقش */}
          {roles?.map(role => (
            <option key={role.RoleId} value={role.roleName}>
              {role.displayName || role.roleName}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => onStatusFilterChange(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
        </select>

        {/* نتیجه فیلتر */}
        {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
          <span className={styles.filterResult}>
            {filteredCount} نتیجه
          </span>
        )}
      </div>

    </div>
  )
}

export default UserListHeader
