// src/core/components/mui/Avatar.tsx
// wrapper سفارشی روی Avatar از MUI با کلاس پیش‌فرض

'use client'

import { Avatar, type AvatarProps } from '@mui/material'
import classnames from 'classnames'

export const CustomAvatar = ({ className, ...props }: AvatarProps) => {
  return <Avatar className={classnames('custom-avatar', className)} {...props} />
}
