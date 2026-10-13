// features/adminOrder/components/AdminOrderList/AdminOrderList.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store/index';
import {
  selectOrders,
  selectOrdersLoading,
  selectOrdersActionLoading,
  selectOrdersError,
} from '@/redux/features/order/OrderSelectors';
import {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  changeOrderStatus,
} from '@/redux/features/order/OrderThunks';
import { clearError } from '@/redux/features/order/OrderSlice';
import type { OrderDto } from '@/models/order/Order';

import AdminOrderHeader from '../OrderHeader/OrderHeader';
import AdminOrderTable from '../../layout/OrderTable/OrderTable';
import AdminOrderModal from '../OrderModal/AdminOrderModal';
import AdminOrderStatusModal from '../OrderStatusModal/OrderStatusModal';
import ConfirmModal from '@/layout/components/dasboard/ConfirmModal/ConfirmModal';

import styles from './OrderList.module.scss';

const AdminOrderList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const orders = useSelector(selectOrders);
  console.log("orders",orders)
  const loading = useSelector(selectOrdersLoading);
  const actionLoading = useSelector(selectOrdersActionLoading);
  const error = useSelector(selectOrdersError);

  const [searchValue, setSearchValue] = useState('');
  
  // States for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Selected Data
  const [editingOrder, setEditingOrder] = useState<OrderDto | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // ✅ Fix: guard against undefined status/orderNumber in filter
const filteredOrders = useMemo(() => {
  if (!searchValue.trim()) return orders;
  const query = searchValue.toLowerCase();
  return orders.filter(
    (o) =>
      o.orderNumber?.toLowerCase().includes(query) ||
      o.statusName?.toLowerCase().includes(query) ||         // already safe with ?.
      o.userId?.toString().includes(query)
  );
}, [orders, searchValue]);


  // --- Handlers ---

  const handleAddNew = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleEdit = (order: OrderDto) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setSelectedOrderId(id);
    setIsConfirmOpen(true);
  };

  const handleChangeStatusOpen = (order: OrderDto) => {
    setEditingOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  const handleStatusModalClose = () => {
    setIsStatusModalOpen(false);
    setEditingOrder(null);
  };

  // --- Submit Actions ---

  const handleModalSubmit = async (data: OrderDto) => {
    console.log("OrderDto",data)
    const result = editingOrder
      ? await dispatch(updateOrder({ id: editingOrder.orderId, data }))
      : await dispatch(createOrder(data));
    
    if (createOrder.fulfilled.match(result) || updateOrder.fulfilled.match(result)) {
      handleModalClose();
    }
  };

  const handleStatusSubmit = async (stusId: number,carrierId: number) => {
    if (editingOrder) {
      const result = await dispatch(
        changeOrderStatus({ id: editingOrder.orderId, data: { StatusId:stusId , CarrierId : carrierId } })
      );
      if (changeOrderStatus.fulfilled.match(result)) {
        handleStatusModalClose();
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedOrderId) {
      await dispatch(deleteOrder(selectedOrderId));
      setIsConfirmOpen(false);
      setSelectedOrderId(null);
    }
  };

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={() => dispatch(clearError())}>✕</button>
        </div>
      )}

      <AdminOrderHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onAddNew={handleAddNew}
        onRefresh={() => dispatch(getAllOrders())}
        totalCount={filteredOrders.length}
        loading={loading}
      />

      <AdminOrderTable
        orders={filteredOrders}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChangeStatus={handleChangeStatusOpen}
      />

      {/* Modal for Create/Edit Full Order Details */}
      <AdminOrderModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingOrder={editingOrder}
        loading={actionLoading}
      />

      {/* Modal specifically for changing Order Status */}
      <AdminOrderStatusModal
        isOpen={isStatusModalOpen}
        onClose={handleStatusModalClose}
        onSubmit={handleStatusSubmit}
        currentStatus={editingOrder?.statusName || ''}
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="حذف سفارش"
        message="آیا از حذف کامل این سفارش اطمینان دارید؟ این عمل غیرقابل بازگشت است."
        confirmText="حذف سفارش"
        cancelText="انصراف"
        type="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminOrderList;
