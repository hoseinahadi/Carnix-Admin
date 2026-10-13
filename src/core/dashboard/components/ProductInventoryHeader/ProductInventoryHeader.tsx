// features/products/components/ProductInventoryHeader/ProductInventoryHeader.tsx

import React from 'react';
import styles from './ProductInventoryHeader.module.scss';

interface ProductInventoryHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  onRefresh: () => void;
  onBack: () => void;
  totalCount: number;
  loading: boolean;
}

const ProductInventoryHeader: React.FC<ProductInventoryHeaderProps> = ({
  searchValue,
  onSearchChange,
  onAddNew,
  onRefresh,
  onBack,
  totalCount,
  loading,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <button className={styles.btnBack} onClick={onBack}>
            ← بازگشت
          </button>
          <h1 className={styles.title}>مدیریت موجودی انبار</h1>
          <span className={styles.badge}>{totalCount} مورد</span>
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

          <button className={styles.btnAdd} onClick={onAddNew}>
            + افزودن موجودی
          </button>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="جستجو در موجودی..."
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

export default ProductInventoryHeader;
