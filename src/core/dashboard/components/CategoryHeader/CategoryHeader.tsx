import React from 'react';
import styles from './CategoryHeader.module.scss';

interface CategoryHeaderProps {
  onSearch: (query: string) => void;
  onAdd: () => void;
  onRefresh: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ onSearch, onAdd, onRefresh }) => {
  return (
    <div className={styles.headerContainer}>
      <h1>مدیریت دسته‌بندی‌ها</h1>
      <div className={styles.actions}>
        <input
          type="text"
          placeholder="جستجو..."
          className={styles.searchInput}
          onChange={(e) => onSearch(e.target.value)}
        />
        <button className={styles.refreshButton} onClick={onRefresh} title="بروزرسانی لیست">
          ↻ بروزرسانی
        </button>
        <button className={styles.addButton} onClick={onAdd}>
          + افزودن دسته‌بندی
        </button>
      </div>
    </div>
  );
};

export default CategoryHeader;
