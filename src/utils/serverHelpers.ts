// src/core/utils/serverHelpers.ts
// توابع کمکی سمت سرور برای خواندن کوکی‌ها و تنظیمات اولیه

import { cookies } from 'next/headers'
import type { Mode } from '@/core/types'

export const getServerMode = async (): Promise<Mode> => {
  const cookieStore = await cookies()
  const mode = cookieStore.get('mode')?.value
  return (mode as Mode) || 'light'
}
