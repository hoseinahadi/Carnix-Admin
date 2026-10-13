// features/adminOrder/components/AdminOrderStatusModal/AdminOrderStatusModal.tsx

import React, { useState, useEffect } from 'react';
import BaseModal from '@/layout/components/dasboard/BaseModal/BaseModal';
import styles from './OrderStatusModal.module.scss';

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks/hooks'; // مسیر را بر اساس پروژه خود اصلاح کنید
import { getAllOrderStatuses } from '@/redux/features/OrderStatus/OrderStatusThunks';
import { 
  selectOrderStatuses, 
  selectOrderStatusesLoading 
} from '@/redux/features/OrderStatus/OrderStatusSelectors';

interface AdminOrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  // تغییر به number بر اساس تغییرات بک‌اند (OrderStatusId)
  onSubmit: (newStatusCode: number) => void; 
  currentStatus: number; 
  loading: boolean;
}

const AdminOrderStatusModal: React.FC<AdminOrderStatusModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  loading,
}) => {
  const dispatch = useAppDispatch();
  const orderStatuses = useAppSelector(selectOrderStatuses);
  const isStatusesLoading = useAppSelector(selectOrderStatusesLoading);

  const [selectedStatus, setSelectedStatus] = useState<number>(currentStatus);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
      // اگر لیست وضعیت‌ها هنوز در ریداکس لود نشده است، آن را دریافت کن
      if (orderStatuses.length === 0) {
        dispatch(getAllOrderStatuses());
      }
    }
  }, [isOpen, currentStatus, dispatch, orderStatuses.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus !== currentStatus) {
      onSubmit(selectedStatus);
    } else {
      onClose(); // اگر تغییری نکرده فقط ببند
    }
  };

  // پیدا کردن عنوان وضعیت فعلی برای نمایش کاربرپسند
  const currentStatusObj = orderStatuses.find(s => s.orderStatusId === currentStatus);
  const currentStatusTitle = currentStatusObj ? currentStatusObj.title : currentStatus;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="تغییر وضعیت سفارش" maxWidth="400px">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>وضعیت فعلی: {currentStatusTitle}</label>
          
          {isStatusesLoading ? (
            <div style={{ padding: '8px', fontSize: '14px', color: '#666' }}>
              در حال بارگذاری وضعیت‌ها...
            </div>
          ) : (
            <select
              className={styles.select}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(Number(e.target.value))} // تبدیل به عدد
            >
              {orderStatuses.map((status) => (
                <option key={status.orderStatusId} value={status.orderStatusId}>
                  {status.title} {/* اگر می‌خواهید می‌توانید status.code را هم کنارش نشان دهید */}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button 
             type="button" 
             className={styles.cancelButton} 
             onClick={onClose} 
             disabled={loading}
          >
            انصراف
          </button>
          <button 
             type="submit" 
             className={styles.submitButton} 
             disabled={loading || isStatusesLoading}
          >
            {loading ? 'در حال ثبت...' : 'بروزرسانی وضعیت'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AdminOrderStatusModal;
