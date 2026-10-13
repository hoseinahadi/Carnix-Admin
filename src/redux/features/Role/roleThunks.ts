// src/redux/features/Roles/RoleThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { RoleApi } from '@/api/Role/routes' // مسیر اصلاح شد
import { AxiosError } from 'axios'
import { Role } from '@/models/Role/Role'

const handleError = (error: unknown) => {
  const axiosError = error as AxiosError<{ message: string }>
  return axiosError.response?.data?.message || 'خطای ناشناخته در ارتباط با سرور'
}

export const getAllRole = createAsyncThunk(
  'Roles/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await RoleApi.getAll()
      console.log("FFFFFFFSDSDSDSSD")
      console.log(res.data)
      return res.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

export const updateRole = createAsyncThunk(
  'Roles/update',
  async ({ id, payload }: { id: number; payload: Role }, { rejectWithValue }) => {
    try {
      const res = await RoleApi.update(id, payload)
      return res.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

export const createRole = createAsyncThunk(
  'Roles/create',
  async (payload: Role, { rejectWithValue }) => {
    try {
      const res = await RoleApi.create(payload)
      return res.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

export const deleteRole = createAsyncThunk(
  'Roles/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await RoleApi.delete(id)
      return id // برگرداندن آیدی برای حذف از استیت
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)
