import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk } from '@/redux/features/auth/authThunks';
import { selectIsAuthenticated, selectUser } from '@/redux/features/auth/authSelectors';
import { AppDispatch } from '@/redux/store';
import styles from './Header.module.scss';

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // خواندن از Redux به جای localStorage
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // وقتی وضعیت احراز هویت تغییر کرد، به صفحه مناسب هدایت شو
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      // نیازی به navigate نیست، useEffect آن را انجام می‌دهد
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleName = (roleId?: string) => {
    switch (roleId) {
      case '6': return 'Super Admin';
      case '7': return 'Admin';
      case '8': return 'Manager';
      default: return roleId ? `Role ID: ${roleId}` : 'کاربر عادی';
    }
  };

  // اگر کاربر لاگین نیست، هدر را نمایش نده
  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.innerWrapper}>
          
          <div className={styles.logoSection}>
            <h1 className={styles.logoText}>پنل مدیریت</h1>
          </div>

          <div className={styles.userInfoSection}>
            <div className={styles.userTextWrapper}>
              <span className={styles.userName}>
                {user?.fullName || user?.userName || 'کاربر مهمان'}
              </span>
              <span className={styles.userRole}>
                {getRoleName(user?.roleId?.toString())}
              </span>
            </div>
            
            <div className={styles.avatar}>
              {(user?.userName || 'U')[0].toUpperCase()}
            </div>

            <button onClick={handleLogout} className={styles.logoutButton}>
              خروج
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;