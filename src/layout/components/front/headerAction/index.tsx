// اکشن‌های سمت راست header مثل پروفایل، نوتیفیکیشن و سبد خرید

'use client'

import { IconButton, Badge } from '@mui/material'
import { IconBell, IconShoppingCart, IconUser } from '@tabler/icons-react'

const HeaderAction = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <IconButton>
        <Badge badgeContent={3} color='error'>
          <IconBell size={20} />
        </Badge>
      </IconButton>

      <IconButton>
        <Badge badgeContent={2} color='primary'>
          <IconShoppingCart size={20} />
        </Badge>
      </IconButton>

      <IconButton>
        <IconUser size={20} />
      </IconButton>
    </div>
  )
}

export default HeaderAction
