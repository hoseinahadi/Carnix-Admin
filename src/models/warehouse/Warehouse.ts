// models/warehouse/Warehouse.ts

export interface WarehouseDto {
  warehouseId: number;
  name: string;
  address: string;
  description: string;
  province: string;
  city: string;
  postalCode: string;
  preparationTimeHours: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateWarehouseDto {
  name: string;
  address: string;
  description?: string;
  province: string;
  city: string;
  postalCode?: string;
  preparationTimeHours?: number; // default: 24
  priority?: number;             // default: 100
  isActive?: boolean;            // default: true
}

export interface UpdateWarehouseDto {
  warehouseId: number;
  name: string;
  address: string;
  description?: string;
  province: string;
  city: string;
  postalCode?: string;
  preparationTimeHours: number;
  priority: number;
  isActive: boolean;
}

export interface WarehouseListItemDto {
  warehouseId: number;
  name: string;
  city: string;
  isActive: boolean;
  priority: number;
}
