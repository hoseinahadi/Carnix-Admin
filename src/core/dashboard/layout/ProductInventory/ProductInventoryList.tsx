// features/products/components/ProductInventoryList/ProductInventoryList.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store/index';
import {
  selectInventories,
  selectInventoryLoading,
  selectInventoryActionLoading,
  selectInventoryError,
} from '@/redux/features/product/ProductInventorySelectors';
import {
  getInventoryByWarehouseId,
  updateInventory,
} from '@/redux/features/product/ProductInventoryThunks';
import { clearInventoryError } from '@/redux/features/product/ProductInventorySlice';
import type { WarehouseInventoryDto, UpdateInventoryDto } from '@/models/product/ProductInventory';

import ProductInventoryHeader from '../../components/ProductInventoryHeader/ProductInventoryHeader';
import ProductInventoryTable from '../ProductInventoryTable/ProductInventoryTable';
import ProductInventoryModal from '../../components/ProductInventoryModal/ProductInventoryModal';
import ConfirmModal from '@/layout/components/dasboard/ConfirmModal/ConfirmModal';

import { ProductApi } from '@/api/product/ProductApi';
import type { Product } from '@/models/product/Product';

import styles from './ProductInventoryList.module.scss';

interface ProductInventoryListProps {
  warehouseId: number;
  onBack: () => void;
}

const ProductInventoryList: React.FC<ProductInventoryListProps> = ({ warehouseId, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();

  const inventories = useSelector(selectInventories);
  const loading = useSelector(selectInventoryLoading);
  const actionLoading = useSelector(selectInventoryActionLoading);
  const error = useSelector(selectInventoryError);

  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<WarehouseInventoryDto | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  useEffect(() => {
    dispatch(getInventoryByWarehouseId(warehouseId));
  }, [dispatch, warehouseId]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsProductsLoading(true);
      try {
        const response = await ProductApi.getAll();
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (error) {
      console.error('Inventory Error:', error);
      const timer = setTimeout(() => dispatch(clearInventoryError()), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const filteredInventories = useMemo(() => {
    if (!searchValue.trim()) return inventories;
    const query = searchValue.toLowerCase();
    return inventories.filter(
      (inv) =>
        inv.productName?.toLowerCase().includes(query) ||
        inv.warehouseName?.toLowerCase().includes(query)
    );
  }, [inventories, searchValue]);

  const handleAddNew = () => {
    setEditingInventory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (inventory: WarehouseInventoryDto) => {
    setEditingInventory(inventory);
    setIsModalOpen(true);
  };

  const handleAdjust = async (inventory: WarehouseInventoryDto, amount: number) => {
    const newQuantity = inventory.quantity + amount;
    if (newQuantity < 0) return;

    const updateData: UpdateInventoryDto = {
      productId: inventory.productId,
      warehouseId: inventory.warehouseId,
      quantity: newQuantity,};

    await dispatch(updateInventory(updateData));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingInventory(null);
  };

  const handleModalSubmit = async (data: UpdateInventoryDto) => {
    const result = await dispatch(updateInventory({ ...data, warehouseId }));
    if (updateInventory.fulfilled.match(result)) handleModalClose();
  };

  const handleRefresh = () => {
    dispatch(getInventoryByWarehouseId(warehouseId));
  };

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={() => dispatch(clearInventoryError())}>✕</button>
        </div>
      )}

      <ProductInventoryHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onAddNew={handleAddNew}
        onRefresh={handleRefresh}
        onBack={onBack}
        totalCount={filteredInventories.length}
        loading={loading}
      />

      <ProductInventoryTable
        inventories={filteredInventories || []}
        loading={loading}
        onEdit={handleEdit}
        onAdjust={handleAdjust}
      />

      <ProductInventoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingInventory={editingInventory}
        loading={actionLoading}
        products={products || []}
        isProductsLoading={isProductsLoading}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => setIsConfirmOpen(false)}
        title="تایید عملیات"
        message="آیا از انجام این عملیات اطمینان دارید؟"
        confirmText="بله"
        cancelText="انصراف"
        variant="danger"
      />
    </div>
  );
};

export default ProductInventoryList;
