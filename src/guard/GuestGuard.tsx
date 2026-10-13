// src/guard/GuestGuard.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/redux/hooks'
import { selectToken } from '@/redux/features/auth/authSelectors'

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useAppSelector(selectToken)

  useEffect(() => {
    if (token) {
      router.push('/dashboard')
    }
  }, [token, router])

  if (token) return null

  return <>{children}</>
}
