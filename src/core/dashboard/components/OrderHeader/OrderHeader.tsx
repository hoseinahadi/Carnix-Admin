// features/adminOrder/components/AdminOrderHeader/AdminOrderHeader.tsx

import React from 'react';
import styles from './OrderHeader.module.scss';

interface AdminOrderHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  onRefresh: () => void;
  totalCount: number;
  loading: boolean;
}

const AdminOrderHeader: React.FC<AdminOrderHeaderProps> = ({
  searchValue,
  onSearchChange,
  onAddNew,
  onRefresh,
  totalCount,
  loading,
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.topSection}>
        <h1 className={styles.title}>
          مدیریت سفارشات
          <span className={styles.badge}>{totalCount} سفارش</span>
        </h1>
        <div className={styles.actions}>
          <button
            className={styles.refreshBtn}
            onClick={onRefresh}
            disabled={loading}
            title="بروزرسانی لیست"
          >
            {loading ? '⏳' : '🔄'} بروزرسانی
          </button>
          <button
            className={styles.addBtn}
            onClick={onAddNew}
            title="ثبت سفارش جدید"
          >
            ➕ سفارش جدید
          </button>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="جستجو بر اساس شماره سفارش، شناسه کاربر یا وضعیت..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminOrderHeader;
