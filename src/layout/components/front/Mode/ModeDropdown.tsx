// دکمه تغییر تم (light/dark/system) که حالت فعلی رو نشون می‌ده و تغییرش می‌ده

'use client'

import { useState } from 'react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'
import type { Mode } from '@core/types'

type Props = {
  mode: Mode
}

const modeIcons: Record<Mode, JSX.Element> = {
  light: <IconSun size={20} />,
  dark: <IconMoon size={20} />,
  system: <IconDeviceDesktop size={20} />,
}

const ModeDropdown = ({ mode }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [currentMode, setCurrentMode] = useState<Mode>(mode)

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleSelect = (selected: Mode) => {
    setCurrentMode(selected)
    document.cookie = `mode=${selected}; path=/`
    handleClose()
  }

  return (
    <>
      <IconButton onClick={handleOpen}>
        {modeIcons[currentMode]}
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleSelect('light')}>
          <IconSun size={16} style={{ marginInlineEnd: 8 }} /> روشن
        </MenuItem>
        <MenuItem onClick={() => handleSelect('dark')}>
          <IconMoon size={16} style={{ marginInlineEnd: 8 }} /> تاریک
        </MenuItem>
        <MenuItem onClick={() => handleSelect('system')}>
          <IconDeviceDesktop size={16} style={{ marginInlineEnd: 8 }} /> سیستم
        </MenuItem>
      </Menu>
    </>
  )
}

export default ModeDropdown
