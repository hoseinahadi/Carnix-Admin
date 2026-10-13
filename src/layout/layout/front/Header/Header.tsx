'use client'

import { useState } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import IconButton from '@mui/material/IconButton'
import type { Mode } from '@/core/types'
import Logo from '@/layout/components/front/Logo/Logo'
import HeaderAction from '@/layout/components/front/headerAction'
import FrontMenu from './front-menu/FrontMenu'
import TopHeader from './top/index'
import styles from './Header.module.scss'

const Header = ({ mode }: { mode: Mode }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const isBelowLgScreen = useMediaQuery('(max-width: 1200px)')

  return (
    <header className={styles.header}>
      {isBelowLgScreen ? (
        <div className={styles.mobile}>
          {/* <IconButton onClick={() => setIsDrawerOpen(true)}>
            <i className='tabler-menu-2' />
          </IconButton>
          <Logo />
          <HeaderAction />
          <FrontMenu mode={mode} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} /> */}
        </div>
      ) : (
        <div className={styles.desktop}>
          <TopHeader mode={mode} />
          <FrontMenu isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
        </div>
      )}
    </header>
  )
}

export default Header
