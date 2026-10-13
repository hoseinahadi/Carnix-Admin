// src/components/UserList.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks/hooks'
import { getAllUsers, updateUser, deleteUser } from '@/redux/features/user/userThunks'
import { getAllRole } from '@/redux/features/Role/roleThunks'

import UserTable from '@/core/dashboard/layout/userTable/UserTable'
import EditUserModal from '@/core/dashboard/components/EditUserModal/EditUserModal'
import DeleteUserModal from '@/core/dashboard/components/DeleteUserModal/DeleteUserModal'
import CreateUserModal from '@/core/dashboard/components/CreateUserModal/CreateUserModal'
import UserListHeader from '@/core/dashboard/components/UserListHeader/UserListHeader'
import { UserList as UserListModel } from '@/models/User/UserList'
import styles from './UserList.module.scss'

const UserList = () => {
  const dispatch = useAppDispatch()
  
  // ۱. دریافت ایمن استیت‌ها از ریداکس (جلوگیری از خطای undefined)
  const userState = useAppSelector(state => state.user)
  const State = useAppSelector(state => state)
  const roleState = useAppSelector(state => state.role)
console.log("state")
console.log(State)
console.log(roleState)
  // استخراج لیست‌ها با مقدار پیش‌فرض آرایه خالی
  const allUsers = userState?.users || []
  const allRoles = roleState?.Roles || []
  const isLoading = (userState?.loading || roleState?.loading) || false

  // ۲. استیت‌های داخلی کامپوننت
  const [editUser, setEditUser] = useState<UserListModel | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // ۳. فراخوانی داده‌ها در هنگام لود صفحه
  useEffect(() => {
    dispatch(getAllUsers())
    dispatch(getAllRole())
  }, [dispatch])

  // ۴. ریست کردن صفحه هنگام تغییر فیلترها
  useEffect(() => {
    setCurrentPage(1)
  }, [search, roleFilter, statusFilter])

  // ۵. منطق فیلترینگ کاربران
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const matchSearch =
        search === '' ||
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.family?.toLowerCase().includes(search.toLowerCase()) ||
        user.userName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.phoneNumber?.includes(search)

      const matchRole = roleFilter === 'all' || user.roleName === roleFilter
      
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive)

      return matchSearch && matchRole && matchStatus
    })
  }, [allUsers, search, roleFilter, statusFilter])

  // ۶. منطق صفحه‌بندی (Pagination)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage])

  const totalPages = Math.ceil(filteredUsers.length / pageSize)

  // ۷. هندلرهای عملیات (Action Handlers)
  const handleEditSubmit = (updatedUser: UserListModel) => {
    dispatch(updateUser({
      id: updatedUser.userId,
      payload: {
        userName: updatedUser.userName,
        email: updatedUser.email,
        name: updatedUser.name,
        family: updatedUser.family,
        phoneNumber: updatedUser.phoneNumber,
        gender: updatedUser.gender,
        roleName: updatedUser.roleName,
        isActive: updatedUser.isActive,
      }
    }))
    setEditUser(null)
  }

  const handleDeleteConfirm = () => {
    if (deleteUserId !== null) {
      dispatch(deleteUser(deleteUserId))
      setDeleteUserId(null)
    }
  }

  const handleRefresh = () => {
    dispatch(getAllUsers())
    dispatch(getAllRole())
  }

  return (
    <div className={styles.container}>

      {/* هدر صفحه شامل جستجو، فیلترها و دکمه افزودن */}
      <UserListHeader
        totalCount={allUsers.length}
        filteredCount={filteredUsers.length}
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roles={allRoles} 
        onAddUser={() => setShowCreateModal(true)}
        onRefresh={handleRefresh}
        loading={isLoading}
      />

      {/* جدول نمایش کاربران */}
      <UserTable
        userState={{ ...userState, users: paginatedUsers }}
        onEdit={(user) => setEditUser(user)}
        onDelete={(id) => setDeleteUserId(id)}
      />

      {/* بخش صفحه‌بندی */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            ‹ قبلی
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === '...'
                  ? <span key={`dots-${idx}`} className={styles.dots}>...</span>
                  : (
                    <button
                      key={p}
                      className={`${styles.pageBtn} ${currentPage === p ? styles.active : ''}`}
                      onClick={() => setCurrentPage(p as number)}
                    >
                      {p}
                    </button>
                  )
              )}
          </div>

          <button
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            بعدی ›
          </button>

          <span className={styles.pageInfo}>
            {filteredUsers.length} کاربر | صفحه {currentPage} از {totalPages}
          </span>
        </div>
      )}

      {/* مودال ویرایش کاربر */}
      {editUser && (
        <EditUserModal
          roles={allRoles}
          user={editUser}
          onClose={() => setEditUser(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* مودال تایید حذف */}
      {deleteUserId !== null && (
        <DeleteUserModal
          onClose={() => setDeleteUserId(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* مودال ایجاد کاربر جدید */}
      {showCreateModal && (
        <CreateUserModal
          roles={allRoles}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            dispatch(getAllUsers())
          }}
        />
      )}

    </div>
  )
}

export default UserList
