// features/products/api/ProductMediaApi.ts

import axiosInstance from '@/services/api/common/axiosInstance';
import type { 
  ProductImageDto, 
  ProductVideoDto, 
  Product360ViewDto,
  AddProductMediaDto
} from '@/models/product/ProductMedia';
import type { OperationResult } from '@/models/common/OperationResult';

export const ProductMediaApi = {
  // ─── آپلود فایل واقعی (IFormFile) ──────────────────────────────────
  uploadMedia: async (formData: FormData) =>
    await axiosInstance.post<OperationResult<any>>('/product-medias/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // ─── دریافت و حذف مدیاها ───────────────────────────────────────────
  getMediaByProductId: async (productId: number | string) =>
    await axiosInstance.get<OperationResult<any[]>>(`/product-medias/get-by-product/${productId}`),

  deleteMedia: async (id: number | string) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/product-medias/delete/${id}`),

  setPrimary: async (productMediaId: number, productId: number) =>
    await axiosInstance.put<OperationResult<boolean>>('/product-medias/set-primary', {
      productMediaId,
      productId
    }),

  // ─── متدهای قدیمی (در صورت نیاز برای ویدیو یا URL) ────────────────
  getImagesByProductId: async (productId: number | string) =>
    await axiosInstance.get<OperationResult<ProductImageDto[]>>(`/product-images/get-by-product/${productId}`),
  
  addImage: async (data: AddProductMediaDto) =>
    await axiosInstance.post<OperationResult<ProductImageDto>>('/product-images/Create', data),

  deleteImage: async (id: number | string) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/product-images/Delete/${id}`),

  getVideosByProductId: async (productId: number | string) =>
    await axiosInstance.get<OperationResult<ProductVideoDto[]>>(`/product-videos/get-by-product/${productId}`),

  addVideo: async (data: AddProductMediaDto) =>
    await axiosInstance.post<OperationResult<ProductVideoDto>>('/product-videos/Create', data),

  deleteVideo: async (id: number | string) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/product-videos/Delete/${id}`),
};