'use client'

import type { Mode } from '@/core/types'
import Logo from '@/layout/components/front/Logo/Logo'
import Search from '@/layout/components/front/search'
import HeaderAction from '@/layout/components/front/headerAction'
import styles from './TopHeader.module.scss'

const TopHeader = ({ mode }: { mode: Mode }) => {
  return (
    <div className={styles.topHeader}>
      <div className={styles.logoWrapper}>
        <Logo />
      </div>
      <div className={styles.searchWrapper}>
        <Search />
      </div>
      <div className={styles.actionsWrapper}>
        <HeaderAction />
      </div>
    </div>
  )
}

export default TopHeader
