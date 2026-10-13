// pages/Inventory.tsx
import React, { useState } from 'react';

import ProductInventoryList from '@/core/dashboard/layout/ProductInventory/ProductInventoryList';
import WarehouseList from '@/core/dashboard/layout/WarehouseList/WarehouseList';

const Inventory = () => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);

  if (selectedWarehouseId) {
    return (
      <ProductInventoryList 
        warehouseId={selectedWarehouseId}
        onBack={() => setSelectedWarehouseId(null)}
      />
    );
  }

  return <WarehouseList onSelectWarehouse={setSelectedWarehouseId} />;
};

export default Inventory;
