// features/products/models/ProductInventory.ts
export interface WarehouseInventoryDto {
  warehouseInventoryId: number;
  warehouseId: number;
  warehouseName: string;
  productId: number;
  productName: string;
  reservedQuantity: number;
  quantity: number;
  modifiedAt: string;
}

export interface UpdateInventoryDto {
  warehouseId: number;
  productId: number;
  quantity: number;
}

export interface TransferInventoryDto {
  productId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  quantity: number;
}
