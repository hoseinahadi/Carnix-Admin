// src/core/dashboard/roles/components/RoleList/RoleList.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom' // اضافه شدن useNavigate
import { useAppDispatch, useAppSelector } from '@/redux/hooks/hooks' 
import { 
  getAllRole, 
  createRole, 
  updateRole, 
  deleteRole
} from '@/redux/features/Role/roleThunks' 
import { 
  selectRoles, 
  selectRolesLoading 
} from '@/redux/features/Role/roleSlice'
import { Role } from '@/models/Role/Role'

// ایمپورت کامپوننت‌ها
import RoleHeader from '../../components/RoleHeader/RoleHeader'
import RoleTable from '../../layout/RoleTable/RoleTable'
import RoleModal from '../../components/RoleModal/RoleModal'
import ConfirmModal from '@/layout/components/dasboard/ConfirmModal/ConfirmModal'

import styles from './RoleList.module.scss'

const RoleList: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate() // مقداردهی هوک مسیریابی
  
  // استیت‌های ریداکس
  const roles = useAppSelector(selectRoles) || []
  const isLoading = useAppSelector(selectRolesLoading)
console.log("FDFDDFDFDFDFDF")
console.log(roles)
  // استیت‌های محلی برای مدیریت جستجو و مودال‌ها
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // دریافت لیست نقش‌ها در بدو ورود
  useEffect(() => {
    dispatch(getAllRole())
  }, [dispatch])

  // فیلتر کردن نقش‌ها (Memoized برای بهینه‌سازی)
  const filteredRoles = useMemo(() => {
    return roles.filter((role: Role) => 
      role.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.roleName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [roles, searchQuery])

  // --- مدیریت مودال ایجاد و ویرایش ---
  const handleOpenCreateModal = () => {
    setSelectedRole(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (role: Role) => {
    setSelectedRole(role)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRole(null)
  }

  const handleModalSubmit = async (roleData: Role) => {
    try {
      if (selectedRole) {
        // ویرایش
        await dispatch(updateRole({ 
          id: selectedRole.RoleId, 
          payload: roleData 
        })).unwrap()
      } else {
        // ایجاد: حذف RoleId و تبدیل فیلدها به فرمت مورد نیاز سرور
        const { RoleId, ...createPayload } = roleData; 
        
        // تبدیل فیلدهای عددی و منطقی (مطمئن شوید استرینگ رد نشوند)
        const sanitizedPayload = {
          ...createPayload,
          roleLevel: Number(createPayload.roleLevel),
          isActive: Boolean(createPayload.isActive)
        };

        if(!sanitizedPayload.roleName || !sanitizedPayload.displayName) {
            alert("لطفاً نام سیستمی و نام نمایشی را وارد کنید");
            return;
        }

        await dispatch(createRole(sanitizedPayload)).unwrap()
      }
      handleCloseModal()
    } catch (error: any) {
      console.error('جزئیات خطای سرور:', error.response?.data || error);
      alert(error.response?.data?.message || "خطا در برقراری ارتباط با سرور");
    }
  }

  // --- مدیریت حذف نقش ---
  const handleOpenDeleteModal = (role: Role) => {
    setRoleToDelete(role)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return
    setIsDeleting(true)
    try {
      await dispatch(deleteRole(roleToDelete.RoleId)).unwrap()
      setIsDeleteModalOpen(false)
      setRoleToDelete(null)
    } catch (error) {
      console.error('خطا در حذف نقش:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // --- مدیریت انتقال به صفحه دسترسی‌ها ---
  const handleManagePermissions = (roleId: number) => {
    navigate(`/dashboard/role/${roleId}/permissions`)
  }

  return (
    <div className={styles.roleListContainer}>
      
      <RoleHeader 
        totalCount={roles.length}
        filteredCount={filteredRoles.length}
        search={searchQuery}
        onSearchChange={setSearchQuery}
        onAddRole={handleOpenCreateModal}
        onRefresh={() => dispatch(getAllRole())}
        loading={isLoading}
      />

      <div className={styles.tableWrapper}>
        {isLoading && roles.length === 0 ? (
          <div className={styles.loadingContainer}>
             <div className={styles.spinner}></div>
             <p>در حال بارگذاری لیست نقش‌ها...</p>
          </div>
        ) : (
          <RoleTable 
            roles={filteredRoles} 
            onEdit={handleOpenEditModal} 
            onDelete={handleOpenDeleteModal}
            onManagePermissions={handleManagePermissions} // پاس دادن پراپ جدید
          />
        )}
      </div>

      {/* مودال فرم ایجاد/ویرایش */}
      {isModalOpen && (
        <RoleModal
          isOpen={isModalOpen}
          role={selectedRole}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* مودال تایید حذف */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="حذف نقش از سیستم"
        message={
          <>
            آیا از حذف نقش <strong>{roleToDelete?.displayName || roleToDelete?.roleName}</strong> اطمینان دارید؟
            <br />
            این عمل باعث سلب دسترسی تمام کاربران مرتبط با این نقش خواهد شد.
          </>
        }
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default RoleList
