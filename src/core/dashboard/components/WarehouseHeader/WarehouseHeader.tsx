// features/warehouse/components/WarehouseHeader/WarehouseHeader.tsx
import React from 'react';
import styles from './WarehouseHeader.module.scss';

interface WarehouseHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  totalCount: number;
  onRefresh: () => void;
  loading: boolean;
}

const WarehouseHeader: React.FC<WarehouseHeaderProps> = ({
  searchValue,
  onSearchChange,
  onAddNew,
  totalCount,
  onRefresh,
  loading,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>مدیریت انبارها</h1>
          <span className={styles.badge}>{totalCount} مورد</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.btnRefresh}
            onClick={onRefresh}
            disabled={loading}title="بارگذاری مجدد"
          >
            <span className={loading ? styles.spinning : ''}>↻</span>
          </button>

          <button className={styles.btnAdd} onClick={onAddNew}>
            + افزودن انبار
          </button>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="جستجو در انبارها..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          {searchValue && (
            <button
              className={styles.clearSearch}
              onClick={() => onSearchChange('')}
            >
              ✕
            </button>
          )}
        </div>

        {searchValue && (
          <span className={styles.filterResult}>
            {totalCount} نتیجه پیدا شد
          </span>
        )}
      </div>
    </div>
  );
};

export default WarehouseHeader;
