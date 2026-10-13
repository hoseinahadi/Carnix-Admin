// src/app/(admin)/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { loginThunk } from '@/redux/features/auth/authThunks'
import { clearError } from '@/redux/features/auth/authSlice'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, isAuthenticated } = useSelector((s: RootState) => s.auth)

  const [form, setForm] = useState({ username: '', password: '' })

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated])

  useEffect(() => {
    return () => { dispatch(clearError()) }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(loginThunk(form))
  }

  return (
    <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh' bgcolor='#f5f5f5'>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Typography variant='h5' fontWeight='bold' mb={3} textAlign='center'>
            ورود به پنل مدیریت
          </Typography>

          {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}

          <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2}>
            <TextField
              label='نام کاربری'
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              fullWidth
              required
              dir='rtl'
            />
            <TextField
              label='رمز عبور'
              type='password'
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              fullWidth
              required
              dir='rtl'
            />
            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} color='inherit' /> : 'ورود'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
