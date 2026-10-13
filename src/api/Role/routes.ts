// src/api/services/RoleApi.ts
import axiosInstance from '@/api/common/axiosInstance'
import { Role } from '@/models/Role/Role'




export const RoleApi = {
  getAll: async () => {
    
    return await axiosInstance.get<Role[]>('/Roles/GetAll')
  },

  getById: async (id: number) => {
    return await axiosInstance.get<Role>(`/Roles/GetById/${id}`)
  },

  update: async (id: number, payload: Role) => {
    return await axiosInstance.put<Role>(`/Roles/Update/${id}`, payload)
  },

  delete: async (id: number) => {
    return await axiosInstance.delete(`/Roles/Delete/${id}`)
  },
  create: async (payload: Role) => {
  return await axiosInstance.post<Role>('/Roles/Create', payload)
},
}
