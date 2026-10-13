// src/core/dashboard/layout/roleTable/RoleTable.tsx
import React from 'react'
import { Role } from '@/models/Role/Role'
import styles from './RoleTable.module.scss'

interface Props {
  roles: Role[]
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onManagePermissions: (roleId: number) => void // پراپ جدید برای هدایت به صفحه دسترسی‌ها
}

const RoleTable: React.FC<Props> = ({ roles, onEdit, onDelete, onManagePermissions }) => {
  if (roles.length === 0) return <div className={styles.noData}>هیچ نقشی یافت نشد.</div>

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.roleTable}>
        <thead>
          <tr>
            <th>نام سیستمی</th>
            <th>نام نمایشی</th>
            <th>سطح دسترسی</th>
            <th>توضیحات</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.RoleId}>
              <td className={styles.systemName}>{role.roleName}</td>
              <td>{role.displayName}</td>
              <td>
                <div className={styles.levelWrapper}>
                  <div 
                    className={styles.levelBar} 
                    style={{ width: `${(role.roleLevel / 10) * 100}%` }} 
                  />
                  <span>{role.roleLevel}</span>
                </div>
              </td>
              <td className={styles.desc}>{role.description || '-'}</td>
              <td>
                <span className={`${styles.badge} ${role.isActive ? styles.active : styles.inactive}`}>
                  {role.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  {/* دکمه جدید برای مدیریت دسترسی‌ها */}
                  <button 
                    onClick={() => onManagePermissions(role.roleId)} 
                    className={styles.btnPermission}
                  >
                    دسترسی‌ها
                  </button>
                  <button onClick={() => onEdit(role)} className={styles.btnEdit}>ویرایش</button>
                  <button onClick={() => onDelete(role)} className={styles.btnDelete}>حذف</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RoleTable
