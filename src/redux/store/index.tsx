import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import userReducer from '../features/user/userSlice';
import roleReducer from '../features/Role/roleSlice';
import permissionReducer from '../features/Permission/PermissionSlice';
import categoryReducer from '../features/Category/categorySlice';

// Product Reducers
import productsReducer from '../features/product/ProductSlice';
import productSkuReducer from '../features/product/ProductSkuSlice';
import productInventoryReducer from '../features/product/ProductInventorySlice';
import productMediaReducer from '../features/product/ProductMediaSlice';
import productMarketingReducer from '../features/product/ProductMarketingSlice';
import productMetaReducer from '../features/product/ProductMetaSlice';
import warehouseReducer from '../features/Warehous/WarehouseSlice';
import brandsReducer from '../features/brand/BrandSlice';
import orderReducer from '../features/order/OrderSlice';
import orderStatusReducer from '../features/OrderStatus/OrderStatusSlice';

// پیکربندی persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // فقط auth را persist می‌کنیم
};

// ترکیب reducerها
const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  user: userReducer,
  role: roleReducer,
  permission: permissionReducer,
  category: categoryReducer,
  
  // Product Module
  products: productsReducer,
  productSku: productSkuReducer,
  productInventory: productInventoryReducer,
  productMedia: productMediaReducer,
  productMarketing: productMarketingReducer,
  productMeta: productMetaReducer,
  warehouses : warehouseReducer,
  brands : brandsReducer,
  orders : orderReducer,
  orderStatuses : orderStatusReducer,
});

// ایجاد persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ایجاد store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// انواع TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ایجاد persistor
export const persistor = persistStore(store);
