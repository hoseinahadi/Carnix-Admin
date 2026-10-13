'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import IconButton from '@mui/material/IconButton'
import classnames from 'classnames'
import type { CategoryType, Mode } from '@/core/types'
import useIntersection from '@/hooks/useIntersection'
import { CategoryApi } from '@/api/category/routes'
import styles from './FrontMenu.module.scss'
import { Category } from '@/models/category/Category'
import DropdownMenu from './DropdownMenu'

type Props = {
  mode: Mode
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  categories?: CategoryType[]
}

type WrapperProps = {
  children: React.ReactNode
  isBelowLgScreen: boolean
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
}

const Wrapper = ({ children, isBelowLgScreen, isDrawerOpen, setIsDrawerOpen }: WrapperProps) => {
  if (isBelowLgScreen) {
    return (
      <Drawer
        variant='temporary'
        anchor='left'
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: ['100%', 300] } }}
      >
        <div className={styles.drawerContent}>
          <IconButton onClick={() => setIsDrawerOpen(false)} className={styles.closeBtn}>
            <i className='tabler-x' />
          </IconButton>
          {children}
        </div>
      </Drawer>
    )
  }

  return <div className={styles.menuWrapper}>{children}</div>
}

const FrontMenu = ({ isDrawerOpen, setIsDrawerOpen, mode }: Props) => {
  const pathname = usePathname()
const isBelowLgScreen = useMediaQuery('(max-width: 1200px)')
  const [defaultCategories, setDefaultCategories] = useState<Category[]>([])

  useEffect(() => {
    if (!isBelowLgScreen && isDrawerOpen) {
      setIsDrawerOpen(false)
    }
  }, [isBelowLgScreen])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryApi.getAll();
        console.log("response")
        var data  = response.data
        console.log(data)
        setDefaultCategories(data) // ✅ رفع مشکل: ذخیره داده‌ها
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  return (
    <Wrapper isBelowLgScreen={isBelowLgScreen} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen}>
      <DropdownMenu
        mode={mode}
        isBelowLgScreen={isBelowLgScreen}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        title='دسته‌بندی محصولات'
        categories={defaultCategories}
      />
    </Wrapper>
  )
}

export default FrontMenu
