import React from 'react';
import styles from './CategoryTable.module.scss';

export interface Category {
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  parentCategoryId: number | null;
  parentCategoryName: string;
  displayOrder: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  imageUrl: string;
  createdAt: string;
  modifiedAt: string;
}

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ categories, onEdit, onDelete }) => {
  if (!categories || categories.length === 0) {
    return <div className={styles.emptyState}>داده‌ای برای نمایش وجود ندارد.</div>;
  }

  // تابع کمکی برای فرمت تاریخ به شمسی
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>شناسه</th>
            <th>تصویر</th>
            <th>نام دسته‌بندی</th>
            <th>نامک (Slug)</th>
            <th>دسته‌بندی والد</th>
            <th>ترتیب</th>
            <th>وضعیت</th>
            <th>تاریخ ایجاد</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.categoryId}>
              <td>{cat.categoryId}</td>
              <td className={styles.imageCell}>
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className={styles.thumbnail} />
                ) : (
                  <span className={styles.noImage}>بدون تصویر</span>
                )}
              </td>
              <td className={styles.boldText}>{cat.name}</td>
              <td dir="ltr" className={styles.ltrText}>{cat.slug}</td>
              <td>{cat.parentCategoryId || '-'}</td>
              <td>{cat.displayOrder}</td>
              <td>
                <span className={`${styles.badge} ${cat.isActive ? styles.activeBadge : styles.inactiveBadge}`}>
                  {cat.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </td>
              <td>{formatDate(cat.createdAt)}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => onEdit(cat)}>ویرایش</button>
                  <button className={styles.deleteBtn} onClick={() => onDelete(cat)}>حذف</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
