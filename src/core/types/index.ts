// src/core/types/index.ts
// تعریف تایپ‌های پایه‌ای که در سراسر پروژه استفاده می‌شن

import { ReactNode } from 'react'

export type Mode = 'light' | 'dark' | 'system'

export type ChildrenType = {
  children: ReactNode
}

export type CategoryType = {
  categoryId: number
  name: string
  slug: string
  description: string
  parentCategoryId: number | null
  parentCategoryName: string
  displayOrder: number
  isActive: boolean
  metaTitle: string
  metaDescription: string
  imageUrl: string
  createdAt: string
  modifiedAt: string
}
