// src/core/components/mui/IconButton.tsx
// wrapper سفارشی روی IconButton از MUI با کلاس پیش‌فرض

'use client'

import { IconButton, type IconButtonProps } from '@mui/material'
import classnames from 'classnames'

export const CustomIconButton = ({ className, ...props }: IconButtonProps) => {
  return <IconButton className={classnames('custom-icon-button', className)} {...props} />
}
