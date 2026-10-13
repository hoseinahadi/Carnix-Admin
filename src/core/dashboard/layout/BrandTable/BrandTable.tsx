// src/core/dashboard/brand/layout/BrandTable/BrandTable.tsx
import React from 'react'
import { Brand } from '@/models/Brand/Brand'
import styles from './BrandTable.module.scss'

interface Props {
  brands: Brand[]
  onEdit: (brand: Brand) => void
  onDelete: (brand: Brand) => void
}

const BrandTable: React.FC<Props> = ({ brands, onEdit, onDelete }) => {
  if (brands.length === 0) return <div className={styles.noData}>هیچ برندی یافت نشد.</div>

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.roleTable}>
        <thead>
          <tr>
            <th>نام برند</th>
            <th>کشور سازنده</th>
            <th>ترتیب نمایش</th>
            <th>توضیحات</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {brands.map(brand => (
            <tr key={brand.brandId}>
              <td className={styles.systemName}>{brand.name}</td>
              <td>{brand.countryOfOrigin || '-'}</td>
              <td>{brand.displayOrder}</td>
              <td className={styles.desc}>{brand.description || '-'}</td>
              <td>
                <span className={`${styles.badge} ${brand.isActive ? styles.active : styles.inactive}`}>
                  {brand.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button onClick={() => onEdit(brand)} className={styles.btnEdit}>ویرایش</button>
                  <button onClick={() => onDelete(brand)} className={styles.btnDelete}>حذف</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BrandTable
