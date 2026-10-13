// src/components/UserTable.tsx
import React from 'react'
import { UserList } from '@/models/User/UserList'
import styles from './UserTable.module.scss'

interface UserProps {
  userState: {
    users: UserList[]
    loading: boolean
    error: string | null
  }
  onEdit: (user: UserList) => void
  onDelete: (userId: number) => void
}

const UserTable: React.FC<UserProps> = ({ userState, onEdit, onDelete }) => {
  const { users, loading, error } = userState || null
console.log("userState")
console.log(userState)
  if (loading) return <div className={styles.loading}>در حال بارگذاری...</div>
  if (error) return <div className={styles.error}>خطا: {error}</div>

  return (
    <div className={styles.userTableContainer}>
      <div className={styles.tableHeader}>
        <h2>لیست کاربران</h2>
        <span className={styles.userCount}>تعداد: {users.length} کاربر</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>ردیف</th>
              <th>نام کاربری</th>
              <th>نام و نام خانوادگی</th>
              <th>ایمیل</th>
              <th>شماره تماس</th>
              <th>نقش</th>
              <th>جنسیت</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.userId}>
                <td>{index + 1}</td>
                <td>{user.userName}</td>
                <td>{`${user.name} ${user.family}`}</td>
                <td>
                  <div className={styles.emailCell}>
                    {user.email}
                    {user.isEmailVerified && <span className={styles.verifiedBadge}>✓</span>}
                  </div>
                </td>
                <td>
                  <div className={styles.phoneCell}>
                    {user.phoneNumber}
                    {user.isPhoneVerified && <span className={styles.verifiedBadge}>✓</span>}
                  </div>
                </td>
                <td>
                  <span className={styles.roleBadge}>{user.roleName}</span>
                </td>
                <td>{user.gender}</td>
                <td>
                  <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                    {user.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.btnEdit}
                      onClick={() => onEdit(user)}
                      title="ویرایش"
                    >
                      ویرایش
                    </button>
                    <button 
                      className={styles.btnDelete}
                      onClick={() => onDelete(user.userId)}
                      title="حذف"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className={styles.emptyState}>
          هیچ کاربری یافت نشد
        </div>
      )}
    </div>
  )
}

export default UserTable
