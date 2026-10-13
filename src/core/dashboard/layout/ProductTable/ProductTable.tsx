import React from 'react';
import type { Product } from '@/models/product/Product';
import styles from './ProductTable.module.scss';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  onView: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onView
}) => {
  if (loading) {
    return (
      <div className={styles.emptyState}>
        <p>در حال بارگذاری محصولات...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>📦 هیچ محصولی یافت نشد</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>تصویر</th>
            <th>نام محصول</th>
            <th>کد محصول</th>
            <th>دسته‌بندی</th>
            <th>برند</th>
            <th>قیمت پایه</th>
            <th>موجودی کل</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.productId || index}>
              <td>{product.productId}</td>

              <td className={styles.imageCell}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.productName} 
                    className={styles.thumbnail}
                  />
                ) : (
                  <span className={styles.noImage}>بدون عکس</span>
                )}
              </td>

              <td>
                <div className={styles.boldText}>{product.productName}</div> 
                {product.fullDescription && (
                  <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '4px' }}>
                    {product.fullDescription.length > 40
                      ? `${product.fullDescription.slice(0, 40)}...`
                      : product.fullDescription}
                  </div>
                )}
              </td>

              <td className={styles.ltrText}>
                {product.productCode || '—'}
              </td>

              <td>{product.categoryName || '—'}</td>
              <td>{product.brandName || '—'}</td>

              <td className={styles.boldText}>
                {product.basePrice ? `${product.basePrice.toLocaleString('fa-IR')} تومان` : '—'}
              </td>

              <td>
                <span style={{ fontWeight: 500, color: product.totalStock === 0 ? '#dc3545' : 'inherit' }}>
                  {product.totalStock === 0
                    ? 'ناموجود'
                    : `${product.totalStock} عدد`}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  className={`${styles.badge} ${product.isActive ? styles.activeBadge : styles.inactiveBadge}`}
                  onClick={() => onToggleStatus(product)}
                  title={product.isActive ? 'برای غیرفعال کردن کلیک کنید' : 'برای فعال کردن کلیک کنید'}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {product.isActive ? 'فعال' : 'غیرفعال'}
                </button>
              </td>

              <td className={styles.actionCell}>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.viewBtn}`}
                    onClick={() => onView(product)}
                    title="مشاهده جزئیات کامل"
                  >
                    👁️
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={() => onEdit(product)}
                    title="ویرایش محصول"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => onDelete(product)}
                    title="حذف محصول"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;