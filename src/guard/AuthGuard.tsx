// src/components/auth/AuthGuard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { getCurrentUserThunk } from '@/redux/features/auth/authThunks'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, token, loading } = useSelector((s: RootState) => s.auth)
  
  // ۱. اضافه کردن استیت برای تشخیص رندر کلاینت
  const [isMounted, setIsMounted] = useState(false)

  // ۲. تغییر استیت به true فقط در محیط مرورگر
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // اگر هنوز در مرورگر مانت نشده‌ایم، هیچ اکشن احراز هویتی اجرا نشود
    if (!isMounted) return

    if (!token) {
      router.replace('/dashboard/login')
      return
    }
    if (!isAuthenticated) {
      dispatch(getCurrentUserThunk())
    }
  }, [token, isAuthenticated, isMounted, router, dispatch])

  // ۳. تا زمانی که کامپوننت در کلاینت مانت نشده، سرور و کلاینت هر دو این لودینگ را رندر می‌کنند
  // این کار باعث رفع قطعی خطای Hydration می‌شود
  if (!isMounted) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    )
  }

  // نمایش لودینگ در زمان دریافت اطلاعات کاربر
  if (loading || (token && !isAuthenticated)) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    )
  }

  // اگر توکن نبود و لاگین نبود، چیزی رندر نشود (چون به صفحه لاگین ریدایرکت می‌شود)
  if (!isAuthenticated) return null

  // در نهایت اگر احراز هویت موفق بود، فرزندان نمایش داده شوند
  return <>{children}</>
}
