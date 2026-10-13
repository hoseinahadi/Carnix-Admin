// src/api/services/userApi.ts
import axiosInstance from '@/api/common/axiosInstance'
import { UserList } from '@/models/User/UserList'

export interface UserUpdatePayload {
  userName: string
  email: string
  name?: string
  family?: string
  phoneNumber?: string
  gender?: string
  roleName?: string
  isActive: boolean
  password?: string
}
export interface UserCreatePayload {
  userName: string
  email: string
  password: string
  name?: string
  family?: string
  phoneNumber?: string
  gender?: string
  roleName?: string
}

export const userApi = {
  getAll: async () => {
    
    return await axiosInstance.get<UserList[]>('/Users/GetAll')
  },

  getById: async (id: number) => {
    return await axiosInstance.get<UserList>(`/Users/GetById/${id}`)
  },

  update: async (id: number, payload: UserUpdatePayload) => {
    return await axiosInstance.put<UserList>(`/Users/Update/${id}`, payload)
  },

  delete: async (id: number) => {
    return await axiosInstance.delete(`/Users/Delete/${id}`)
  },
  create: async (payload: UserCreatePayload) => {
  return await axiosInstance.post<UserList>('/Users/Create', payload)
},
}
