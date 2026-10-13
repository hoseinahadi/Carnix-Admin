// features/warehouse/components/WarehouseTable/WarehouseTable.tsx
import React from 'react';
import type { WarehouseDto } from '@/models/warehouse/Warehouse';
import styles from './WarehouseTable.module.scss';

interface WarehouseTableProps {
  warehouses: WarehouseDto[];
  loading: boolean;
  onEdit: (warehouse: WarehouseDto) => void;
  onDelete: (id: number) => void;
  onViewInventory: (id: number) => void;
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({
  warehouses,
  loading,
  onEdit,
  onDelete,
  onViewInventory,
}) => {
  if (loading) {
    return (
      <div className={styles.emptyState}>
        <p>در حال بارگذاری انبارها...</p>
      </div>
    );
  }

  if (!warehouses || warehouses.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>📦 هیچ انباری یافت نشد</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>نام انبار</th>
            <th>شهر</th>
            <th>استان</th>
            <th>اولویت</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((warehouse, index) => (
            <tr key={warehouse.warehouseId}>
              <td>{index + 1}</td>
              <td className={styles.boldText}>{warehouse.name}</td>
              <td>{warehouse.city}</td>
              <td>{warehouse.province}</td>
              <td>{warehouse.priority}</td>
              <td>
                <span className={warehouse.isActive ? styles.activeStatus : styles.inactiveStatus}>
                  {warehouse.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.inventoryBtn}
                    onClick={() => onViewInventory(warehouse.warehouseId)}
                    title="مشاهده موجودی‌ها"
                  >📦
                  </button>
                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => onEdit(warehouse)}
                    title="ویرایش"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => onDelete(warehouse.warehouseId)}
                    title="حذف"
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

export default WarehouseTable;
