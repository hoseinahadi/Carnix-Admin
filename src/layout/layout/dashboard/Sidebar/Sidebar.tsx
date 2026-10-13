// src/components/Sidebar/Sidebar.tsx
'use client'
import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  Settings as SettingsIcon,
  BarChart as ChartIcon,
  Notifications as NotificationsIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>({});

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'داشبورد',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      id: 'users',
      title: 'مدیریت کاربران',
      icon: <PeopleIcon />,
      children: [
      { id: 'users-list', title: 'لیست کاربران', path: '/dashboard/users', icon: undefined },
      { id: 'users-roles', title: 'نقش‌های کاربری', path: '/dashboard/role', icon: undefined },
    ]
    },
    {
      id: 'products',
      title: 'مدیریت محصولات',
      icon: <InventoryIcon />,
      children: [
        { id: 'products-list', title: 'لیست محصولات', path: '/dashboard/products', icon: undefined },
      ]
    },
    {
      id: 'orders',
      title: 'مدیریت سفارشات',
      icon: <OrdersIcon />,
      path: '/dashboard/order'
    },
    {
      id: 'category',
      title: 'دسته بندی ها',
      icon: <OrdersIcon />,
      path: '/dashboard/category'
    },
    {
      id: 'inventury',
      title: 'انبار داری',
      icon: <OrdersIcon />,
      path: '/dashboard/inventory'
    },
    {
      id: 'analytics',
      title: 'تحلیل و گزارش',
      icon: <ChartIcon />,
      path: '/dashboard/analytics'
    },
    {
      id: 'brand',
      title: 'برند ها',
      icon: <ChartIcon />,
      path: '/dashboard/brand'
    },
    {
      id: 'notifications',
      title: 'اعلان‌ها',
      icon: <NotificationsIcon />,
      path: '/dashboard/notifications'
    },
    {
      id: 'settings',
      title: 'تنظیمات',
      icon: <SettingsIcon />,
      path: '/dashboard/settings'
    }
  ];

  const handleSubmenuToggle = (itemId: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path?: string): boolean => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.path);
    const submenuOpen = openSubmenus[item.id];

    return (
      <React.Fragment key={item.id}>
        <ListItem
          className={`${styles.menuItem} ${active ? styles.active : ''}`}
          style={{ paddingRight: `${depth * 24 + 16}px`, cursor: 'pointer' }}
          onClick={() => {
            if (hasChildren) {
              handleSubmenuToggle(item.id);
            } else if (item.path) {
              handleNavigation(item.path);
            }
          }}
        >
          <ListItemIcon className={styles.menuIcon}>
            {item.icon}
          </ListItemIcon>
          
          {isOpen && (
            <>
              <ListItemText 
                primary={item.title} 
                primaryTypographyProps={{ className: styles.menuText }}
              />
              {hasChildren && (
                submenuOpen ? <ExpandLess /> : <ExpandMore />
              )}
            </>
          )}
        </ListItem>

        {hasChildren && isOpen && (
          <Collapse in={submenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <Box className={styles.sidebarHeader}>
        {isOpen ? (
          <Typography variant="h6" className={styles.logo}>
            پنل مدیریت
          </Typography>
        ) : (
          <Typography variant="h6" className={styles.logoCollapsed}>
            PM
          </Typography>
        )}
      </Box>

      <List className={styles.menuList}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>

      {isOpen && (
        <Box className={styles.sidebarFooter}>
          <Typography variant="body2" className={styles.version}>
            نسخه ۱.۰.۰
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
