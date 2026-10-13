// features/products/api/ProductInventoryApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { OperationResult } from '@/models/common/OperationResult';
import type { 
  WarehouseInventoryDto, 
  UpdateInventoryDto, 
  TransferInventoryDto 
} from '@/models/product/ProductInventory';

export const ProductInventoryApi = {
  getByProductId: async (productId: number | string) =>
    await axiosInstance.get<OperationResult<WarehouseInventoryDto[]>>(`/ProductInventory/GetByProductId/${productId}`),

  getBySkuId: async (skuId: number | string) =>
    await axiosInstance.get<OperationResult<WarehouseInventoryDto[]>>(`/ProductInventory/GetBySkuId/${skuId}`),

  updateInventory: async (data: UpdateInventoryDto) =>
    await axiosInstance.put<OperationResult<WarehouseInventoryDto>>('/ProductInventory/setInventory', data),

  transferInventory: async (data: TransferInventoryDto) =>
    await axiosInstance.post<OperationResult<boolean>>('/ProductInventory/transfer', data),

  getWithWrehouseId: async (warehouseId: number | string) =>
    await axiosInstance.get<OperationResult<WarehouseInventoryDto[]>>(`/ProductInventory/warehouse/${warehouseId}`),

  adjustInventory: async (warehouseId: number | string, productId: number | string, delta: number | string) =>
    await axiosInstance.patch<OperationResult<boolean>>(`/ProductInventory/warehouse/${warehouseId}/${productId}`, {
      delta: delta
    }),

  lowstock: async (threshold: number | string) =>
    await axiosInstance.get<OperationResult<WarehouseInventoryDto[]>>(`/ProductInventory/low-stock?threshold=${threshold}`),

  reserve: async (productId: number | string, quantity: number | string) =>
    await axiosInstance.post<OperationResult<boolean>>('/ProductInventory/reserve', {
      productId: productId,
      quantity: quantity
    }),

  release: async (productId: number | string, quantity: number | string) =>
    await axiosInstance.post<OperationResult<boolean>>('/ProductInventory/release', {
      productId: productId,
      quantity: quantity
    }),
};
