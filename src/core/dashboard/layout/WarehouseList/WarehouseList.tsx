// features/warehouse/components/WarehouseList/WarehouseList.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store/index';
import {
  selectWarehouses,
  selectWarehousesLoading,
  selectWarehousesActionLoading,
  selectWarehousesError,
} from '@/redux/features/Warehous/WarehouseSelectors';
import {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '@/redux/features/Warehous/WarehouseThunks';
import { clearError } from '@/redux/features/Warehous/WarehouseSlice';
import type { WarehouseDto, CreateWarehouseDto, UpdateWarehouseDto } from '@/models/warehouse/Warehouse';

import WarehouseHeader from '../../components/WarehouseHeader/WarehouseHeader';
import WarehouseTable from '../WarehouseTable/WarehouseTable';
import WarehouseModal from '../../components/WarehouseModal/WarehouseModal';
import ConfirmModal from '@/layout/components/dasboard/ConfirmModal/ConfirmModal';

import styles from './WarehouseList.module.scss';

interface WarehouseListProps {
  onSelectWarehouse: (id: number) => void;
}

const WarehouseList: React.FC<WarehouseListProps> = ({ onSelectWarehouse }) => {
  const dispatch = useDispatch<AppDispatch>();

  const warehouses = useSelector(selectWarehouses);
  const loading = useSelector(selectWarehousesLoading);
  const actionLoading = useSelector(selectWarehousesActionLoading);
  const error = useSelector(selectWarehousesError);

  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getAllWarehouses());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const filteredWarehouses = useMemo(() => {
    if (!searchValue.trim()) return warehouses;
    const query = searchValue.toLowerCase();
    return warehouses.filter(
      (w) =>
        w.name?.toLowerCase().includes(query) ||
        w.city?.toLowerCase().includes(query) ||
        w.province?.toLowerCase().includes(query)
    );
  }, [warehouses, searchValue]);

  const handleAddNew = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (warehouse: WarehouseDto) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);};

  const handleModalSubmit = async (data: CreateWarehouseDto | UpdateWarehouseDto) => {
    const result = editingWarehouse
      ? await dispatch(updateWarehouse({ id: editingWarehouse.warehouseId, data: data as UpdateWarehouseDto }))
      : await dispatch(createWarehouse(data as CreateWarehouseDto));
    
    if (createWarehouse.fulfilled.match(result) || updateWarehouse.fulfilled.match(result)) {
      handleModalClose();
    }
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await dispatch(deleteWarehouse(deletingId));
      setIsConfirmOpen(false);
      setDeletingId(null);
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

      <WarehouseHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onAddNew={handleAddNew}
        onRefresh={() => dispatch(getAllWarehouses())}
        totalCount={filteredWarehouses.length}
        loading={loading}
      />

      <WarehouseTable
        warehouses={filteredWarehouses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewInventory={onSelectWarehouse}
      />

      <WarehouseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingWarehouse={editingWarehouse}
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="حذف انبار"
        message="آیا از حذف این انبار اطمینان دارید؟"
        confirmText="حذف"
        cancelText="انصراف"
        type="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default WarehouseList;
