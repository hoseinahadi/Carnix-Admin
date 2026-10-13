// features/adminOrder/components/AdminOrderTable/AdminOrderTable.tsx

import React, { useMemo } from 'react';
import type { OrderDto } from '@/models/order/Order';
import styles from './OrderTable.module.scss';

interface AdminOrderTableProps {
  orders: OrderDto[];
  loading: boolean;
  onEdit: (order: OrderDto) => void;
  onDelete: (id: number) => void;
  onChangeStatus: (order: OrderDto) => void;
}

// تابع کمکی برای تعیین رنگ بر اساس نام وضعیت سفارش (statusName)
const getStatusStyles = (statusName?: string) => {
  switch (statusName) {
    case 'در انتظار تایید': // در انتظار تایید
      return { bg: 'red', color: 'white', border: '1px solid #ffeeba' };
    case 'تایید شده': // تایید شده
      return { bg: '#cce5ff', color: '#004085', border: '1px solid #b8daff' };
    case 'در حال پردازش': // در حال پردازش
      return { bg: '#e2e3e5', color: '#383d41', border: '1px solid #d6d8db' };
    case 'در انتظار پرداخت': // در انتظار پرداخت
      return { bg: '#fdfdfe', color: '#6c757d', border: '1px solid #e9ecef' };
    case 'پرداخت شده': // پرداخت شده
      return { bg: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
    case 'ارسال شده': // ارسال شده
      return { bg: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' };
    case 'تحویل داده شده': // تحویل داده شده
      return { bg: '#c3e6cb', color: '#155724', border: '1px solid #8fd19e' };
    case 'لغو شده': // لغو شده
      return { bg: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
    case 'مرجوع شده': // مرجوع شده
      return { bg: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' };
    case 'بازپرداخت شده': // بازپرداخت شده
      return { bg: '#e2e3e5', color: '#383d41', border: '1px solid #d6d8db' };
    default: // سایر وضعیت‌ها یا نامشخص
      return { bg: '#f8f9fa', color: '#212529', border: '1px solid #dee2e6' };
  }
};

// تابع کمکی برای نمایش متن فارسی وضعیت (اختیاری - اگر از بک‌اند فارسی نمی‌آید)
const getStatusPersianName = (statusName?: string) => {
  switch (statusName) {
    case 'PENDING': return 'در انتظار تایید';
    case 'CONFIRMED': return 'تایید شده';
    case 'PROCESSING': return 'در حال پردازش';
    case 'PAYMENT_PENDING': return 'در انتظار پرداخت';
    case 'PAID': return 'پرداخت شده';
    case 'SHIPPED': return 'ارسال شده';
    case 'DELIVERED': return 'تحویل داده شده';
    case 'CANCELLED': return 'لغو شده';
    case 'RETURNED': return 'مرجوع شده';
    case 'REFUNDED': return 'بازپرداخت شده';
    default: return statusName ?? 'نامشخص';
  }
};

const AdminOrderTable: React.FC<AdminOrderTableProps> = ({
  orders,
  loading,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  // مرتب‌سازی سفارشات: "PENDING" در بالا قرار می‌گیرند
  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
      const isAPending = a.statusName === 'PENDING';
      const isBPending = b.statusName === 'PENDING';
      
      if (isAPending && !isBPending) return -1;
      if (!isAPending && isBPending) return 1;
      return 0; // حفظ ترتیب بقیه موارد
    });
  }, [orders]);

  if (loading) {
    return <div className={styles.emptyState}><p>در حال بارگذاری سفارشات...</p></div>;
  }

  if (!sortedOrders || sortedOrders.length === 0) {
    return <div className={styles.emptyState}><p>🛍️ هیچ سفارشی یافت نشد</p></div>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>شماره سفارش</th>
            <th>شناسه کاربر</th>
            <th>مبلغ نهایی (تومان)</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order, index) => {
            const isPending = order.statusName === 'PENDING';
            const statusStyle = getStatusStyles(order.statusName);

            return (
              <tr 
                key={order.orderId}
                // رنگ پس زمینه ملایم برای سفارشات در انتظار جهت جلب توجه
                style={{ backgroundColor: isPending ? '#fffcf5' : 'transparent' }}
              >
                <td>{index + 1}</td>
                <td className={styles.boldText}>{order.orderNumber ?? '---'}</td>
                <td>{order.userId}</td>
                <td className={styles.boldText}>
                  {order.grandTotal?.toLocaleString() ?? '0'}
                </td>
                <td>
                  <span 
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      border: statusStyle.border,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      display: 'inline-block'
                    }}
                  >
                    {isPending && '⏳ '}
                    {/* اگر بک‌اند متن فارسی می‌فرستد از order.statusName استفاده کنید، در غیر اینصورت از getStatusPersianName */}
                    {getStatusPersianName(order.statusName)}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.statusBtn}
                      onClick={() => onChangeStatus(order)}
                      title="تغییر وضعیت"
                    >
                      🔄
                    </button>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => onEdit(order)}
                      title="ویرایش کامل"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => onDelete(order.orderId)}
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderTable;
