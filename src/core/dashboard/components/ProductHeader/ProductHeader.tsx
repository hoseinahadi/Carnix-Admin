// features/products/components/ProductHeader/ProductHeader.tsx

import React from 'react';
import styles from './ProductHeader.module.scss';

interface ProductHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  totalCount: number;
  onRefresh: () => void; 
  loading: boolean;      
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  searchValue,
  onSearchChange,
  onAddNew,
  totalCount,
  onRefresh,
  loading,
}) => {
  return (
    <div className={styles.wrapper}>
      
      {/* ─── تیتر و دکمه‌ها ────────────────────────────── */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>مدیریت محصولات</h1>
          <span className={styles.badge}>{totalCount} محصول</span>
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
            + افزودن محصول
          </button>
        </div>
      </div>

      {/* ─── فیلتر جستجو ───────────────────────────────── */}
      <div className={styles.filterRow}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="جستجو در محصولات..."
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

        {/* نمایش تعداد نتایج در صورت جستجو */}
        {searchValue && (
          <span className={styles.filterResult}>
            {totalCount} نتیجه پیدا شد
          </span>
        )}
      </div>

    </div>
  );
};

export default ProductHeader;
