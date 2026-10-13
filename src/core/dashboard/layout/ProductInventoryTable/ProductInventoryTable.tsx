// features/products/components/ProductInventoryTable/ProductInventoryTable.tsx

import React from 'react';
import type { WarehouseInventoryDto } from '@/models/product/ProductInventory';
import styles from './ProductInventoryTable.module.scss';

interface ProductInventoryTableProps {
  inventories: WarehouseInventoryDto[];
  loading: boolean;
  onEdit: (inventory: WarehouseInventoryDto) => void;
  onAdjust: (inventory: WarehouseInventoryDto, amount: number) => void;
}

const ProductInventoryTable: React.FC<ProductInventoryTableProps> = ({
  inventories,
  loading,
  onEdit,
  onAdjust,
}) => {
  if (loading) {
    return (
      <div className={styles.emptyState}>
        <p>در حال بارگذاری موجودی...</p>
      </div>
    );
  }

  if (!inventories || inventories.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>📦 هیچ موجودی یافت نشد</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>نام محصول</th>
            <th>انبار</th>
            <th>موجودی</th>
            <th>رزرو شده</th>
            <th>در دسترس</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {inventories.map((inventory, index) => (
            <tr key={`${inventory.productId}-${inventory.warehouseId}`}>
              <td>{index + 1}</td>
              <td className={styles.boldText}>{inventory.productName || '—'}</td>
              <td>{inventory.warehouseName || '—'}</td>
              <td className={styles.boldText}>{inventory.quantity || 0}</td>
              <td>{inventory.reservedQuantity || 0}</td>
              <td>
                <span style={{ fontWeight: 500, color: (inventory.quantity - inventory.reservedQuantity) === 0 ? '#dc3545' : 'inherit' }}>
                  {inventory.quantity - inventory.reservedQuantity}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.decreaseBtn}
                    onClick={() => onAdjust(inventory, -1)}
                    title="کاهش موجودی"
                    disabled={inventory.quantity <= 0}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className={styles.increaseBtn}
                    onClick={() => onAdjust(inventory, 1)}
                    title="افزایش موجودی"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => onEdit(inventory)}
                    title="ویرایش موجودی"
                  >
                    ✏️
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

export default ProductInventoryTable;
