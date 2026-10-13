// src/redux/features/users/userThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { userApi, UserCreatePayload, UserUpdatePayload } from '@/api/user/routes'
import { AxiosError } from 'axios'

const handleError = (error: unknown) => {
  const axiosError = error as AxiosError<{ message: string }>
  return axiosError.response?.data?.message || 'خطای ناشناخته'
}

export const getAllUsers = createAsyncThunk(
  'users/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await userApi.getAll()
      return res.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, payload }: { id: number; payload: UserUpdatePayload }, { rejectWithValue }) => {
    try {
      const res = await userApi.update(id, payload)
      return res.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)
export const createUser = createAsyncThunk(
  'users/create',
  async (payload: UserCreatePayload, { rejectWithValue }) => {
    try {
      const res = await userApi.create(payload)
      return res.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)
export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await userApi.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)
