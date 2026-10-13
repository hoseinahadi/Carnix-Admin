// src/app/dashboard/page.tsx
'use client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/layout/layout/dashboard/Admin/AdminLayout'
import Role from '../role/page';
import User from '../users/page';

// ایمپورت کامپوننت مدیریت دسترسی (مسیر ایمپورت را بر اساس ساختار پوشه‌های خود تنظیم کنید)
import PermissionManagement from '@/app/(pannelAdmin)/dashboard/Permission/page'; 
import Category from '../category/page';
import Product from '../products/page';
import Inventory from '../inventory/page';
import Brand from '../brand/page';
import Order from '../order/page';

export default function DashboardRoute() {
  return (
    <HashRouter>
      <AdminLayout>
        <Routes>
          <Route path="/dashboard/users" element={<User />} />
          <Route path="/dashboard/role" element={<Role />} />
          <Route path="/dashboard/category" element={<Category />} />
          <Route path="/dashboard/products" element={<Product />} />
          <Route path="/dashboard/inventory" element={<Inventory />} />
          <Route path="/dashboard/brand" element={<Brand />} />
          <Route path="/dashboard/order" element={<Order />} />
          
          {/* مسیر جدید برای مدیریت دسترسی‌های یک نقش خاص */}
          <Route path="/dashboard/role/:roleId/permissions" element={<PermissionManagement />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AdminLayout>
    </HashRouter>
  );
}
