// features/warehouse/store/WarehouseSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WarehouseDto } from '@/models/warehouse/Warehouse';
import {
  getAllWarehouses,
  getActiveWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from './WarehouseThunks';

interface WarehouseState {
  warehouses: WarehouseDto[];
  activeWarehouses: WarehouseDto[];
  selectedWarehouse: WarehouseDto | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: WarehouseState = {
  warehouses: [],
  activeWarehouses: [],
  selectedWarehouse: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const warehouseSlice = createSlice({
  name: 'warehouses',
  initialState,
  reducers: {
    setSelectedWarehouse: (state, action: PayloadAction<WarehouseDto | null>) => {
      state.selectedWarehouse = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // GetAll
    builder
      .addCase(getAllWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(getAllWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // GetActive
    builder
      .addCase(getActiveWarehouses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActiveWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.activeWarehouses = action.payload;
      })
      .addCase(getActiveWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // GetById
    builder
      .addCase(getWarehouseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWarehouseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedWarehouse = action.payload;
      })
      .addCase(getWarehouseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createWarehouse.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.warehouses.unshift(action.payload);
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateWarehouse.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.warehouses.findIndex(w => w.warehouseId === action.payload.warehouseId);
        if (index !== -1) state.warehouses[index] = action.payload;
        if (state.selectedWarehouse?.warehouseId === action.payload.warehouseId) {
          state.selectedWarehouse = action.payload;
        }
      })
      .addCase(updateWarehouse.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Delete
    builder.addCase(deleteWarehouse.fulfilled, (state, action) => {
      state.warehouses = state.warehouses.filter(w => w.warehouseId !== action.payload);
    });
  },
});

export const { setSelectedWarehouse, clearError } = warehouseSlice.actions;
export default warehouseSlice.reducer;
