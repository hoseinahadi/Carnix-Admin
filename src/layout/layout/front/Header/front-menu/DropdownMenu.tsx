'use client'

import { Fragment, useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import Button from '@mui/material/Button'
import classnames from 'classnames'
import {
  useFloating,
  useDismiss,
  useRole,
  useInteractions,
  useHover,
  offset,
  flip,
  size,
  autoUpdate,
  FloatingPortal,
  safePolygon,
  useTransitionStyles
} from '@floating-ui/react'
import { Link } from '@/layout/components/front/Link/Link'
import { CustomAvatar } from '@/core/front/components/mui/Avatar'
import type { CategoryType, Mode } from '@/core/types'
import styles from './DropdownMenu.module.scss'



type Props = {
  mode: Mode
  isBelowLgScreen: boolean
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  title: string
  categories: CategoryType[]
  onCategoryClick?: (category: CategoryType) => void
}

type MenuWrapperProps = {
  children: ReactNode
  refs: any
  isBelowLgScreen: boolean
  isOpen: boolean
  getFloatingProps: any
  floatingStyles: CSSProperties
  isMounted: boolean
  styles: CSSProperties
}

type MenuItemProps = {
  category: CategoryType
  depth?: number
  onLinkClick: () => void
  pathname: string
  isBelowLgScreen: boolean
  onSubmenuToggle?: (categoryId: string | number) => void
  openSubmenus?: (string | number)[]
}

const MenuWrapper = ({ children, refs, isBelowLgScreen, isOpen, getFloatingProps, floatingStyles, isMounted, styles: transitionStyles }: MenuWrapperProps) => {
  if (!isBelowLgScreen) {
    return (
      <FloatingPortal>
        {isMounted && (
          <div ref={refs.setFloating} style={{ ...floatingStyles, ...transitionStyles }} {...getFloatingProps()} className={styles.floatingMenu}>
            {children}
          </div>
        )}
      </FloatingPortal>
    )
  }

  return (
    <Collapse in={isOpen}>
      <div className={styles.mobileMenu}>{children}</div>
    </Collapse>
  )
}

const MenuItem = ({ category, depth = 0, onLinkClick, pathname, isBelowLgScreen, onSubmenuToggle, openSubmenus = [] }: MenuItemProps) => {
  const [localOpen, setLocalOpen] = useState(false)
  const hasSubcategories = category.parentCategoryName 
  const isOpen = openSubmenus.includes(category.categoryId) || localOpen
  const isActive = category.isActive && pathname.includes(category.imageUrl)

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubcategories && isBelowLgScreen) {
      e.preventDefault()
      onSubmenuToggle ? onSubmenuToggle(category.categoryId) : setLocalOpen(!localOpen)
    } else {
      onLinkClick()
    }
  }

  return (
    <div className={styles.menuItem} style={{ paddingInlineStart: `${depth * 1}rem` }}>
      <Link href={category.imageUrl || '#'} onClick={handleClick} className={classnames(styles.menuLink, { [styles.active]: isActive })}>
        {category.imageUrl && <CustomAvatar src={category.imageUrl} size={20} />}
        <Typography variant='body2'>{category.name}</Typography>{hasSubcategories && isBelowLgScreen && (
          <Button size='small' className={styles.chevron}>
            <i className={classnames('tabler-chevron-down', { [styles.rotated]: isOpen })} />
          </Button>
        )}
      </Link>
      {/* {hasSubcategories && (<Collapse in={isOpen}>
          <div className={styles.submenu}>
            {category.subcategories!.map(sub => (
              <MenuItem
                key={sub.id}
                category={sub}
                depth={depth + 1}
                onLinkClick={onLinkClick}
                pathname={pathname}
                isBelowLgScreen={isBelowLgScreen}
                onSubmenuToggle={onSubmenuToggle}
                openSubmenus={openSubmenus}
              />
            ))}
          </div>
        </Collapse>
      )} */}
    </div>
  )
}

const DropdownMenu = ({ mode, isBelowLgScreen, isDrawerOpen, setIsDrawerOpen, title, categories, onCategoryClick }: Props) => {
  console.log("categories")
  console.log(categories)
  const [isOpen, setIsOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<(string | number)[]>([])
  const pathname = usePathname()

  const { refs, floatingStyles, context } = useFloating<HTMLElement>({
    placement: 'bottom-start',
    open: isOpen,
    onOpenChange: isBelowLgScreen ? undefined : setIsOpen,
    middleware: [
      offset(14),
      flip({ padding: 0 }),
      size({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
            minWidth: '88%',
            height: '90%'
          })
        }
      })
    ],
    whileElementsMounted: autoUpdate
  })

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 300,
    initial: { opacity: 0, transform: 'translateY(-8px)' },
    open: { opacity: 1, transform: 'translateY(0)' },
    close: { opacity: 0, transform: 'translateY(-8px)' }
  })

  const hover = useHover(context, { enabled: !isBelowLgScreen, handleClose: safePolygon() })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'menu' })
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role, hover])

  const handleLinkClick = (category?: CategoryType) => {
    if (category && onCategoryClick) onCategoryClick(category)
    isBelowLgScreen ? setIsDrawerOpen(false) : setIsOpen(false)
  }

  const handleSubmenuToggle = (categoryId: string | number) => {
    setOpenSubmenus(prev => (prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]))
  }

  useEffect(() => {
    if (!isDrawerOpen && isOpen) setIsOpen(false)
  }, [isDrawerOpen])

  if (categories.length === 0) return null

  const Tag = isBelowLgScreen ? 'div' : Fragment

  return (
    <Tag>
      <div ref={refs.setReference} {...(isBelowLgScreen ? {} : getReferenceProps())} onClick={() => isBelowLgScreen && setIsOpen(!isOpen)} className={styles.trigger}>
        <Typography variant='body1' className={styles.title}>
          {title}
        </Typography>
        <i className={classnames('tabler-chevron-down', { [styles.rotated]: isOpen })} />
      </div>

      <MenuWrapper refs={refs} isBelowLgScreen={isBelowLgScreen} isOpen={isOpen} getFloatingProps={getFloatingProps} floatingStyles={floatingStyles} isMounted={isMounted} styles={transitionStyles}>
        {categories.map(cat => (
          <MenuItem key={cat.categoryId} category={cat} onLinkClick={() => handleLinkClick(cat)} pathname={pathname} isBelowLgScreen={isBelowLgScreen} onSubmenuToggle={handleSubmenuToggle} openSubmenus={openSubmenus} />
        ))}
      </MenuWrapper>
    </Tag>
  )
}

export default DropdownMenu
