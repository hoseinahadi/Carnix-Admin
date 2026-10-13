// src/components/AdminLayout/AdminLayout.tsx
'use client'
import React, { ReactNode, useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import styles from './AdminLayout.module.scss';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box className={styles.adminLayout}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <Box className={`${styles.mainContent} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <Header />
        
        <main className={styles.pageContent}>
          {children}
        </main>
        
        <footer className={styles.footer}>
          <p>© ۱۴۰۴ پنل ادمین - تمامی حقوق محفوظ است</p>
        </footer>
      </Box>
    </Box>
  );
};

export default AdminLayout;
