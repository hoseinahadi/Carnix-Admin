// src/api/services/productMediaApi.ts
import axiosInstance from '@/api/common/axiosInstance';

// ══════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════
export interface ProductMediaDto {
  productMediaId : number;
  productId     ?: number;
  skuId         ?: number;
  mediaType      : 'Image' | 'Video' | '360';
  mediaUrl       : string;
  caption        : string;
  altText        : string;
  displayOrder   : number;
  isPrimary      : boolean;
  isActive       : boolean;
}

export interface AddProductMediaDto {
  productId   ?: number;
  skuId       ?: number;
  mediaType    : 'Image' | 'Video' | '360';
  mediaUrl     : string;
  caption      : string;
  altText      : string;
  displayOrder : number;
  isPrimary    : boolean;
  isActive     : boolean;
}

export interface UploadMediaRequest {
  file         : File;
  mediaType    : 'Image' | 'Video' | '360';
  productId   ?: number;
  skuId       ?: number;
  caption      : string;
  altText      : string;
  displayOrder : number;
  isPrimary    : boolean;
  isActive     : boolean;
}

export interface UploadMediaResponse {
  success  : boolean;
  mediaUrl : string;
  fileName : string;
  fileSize : number;
  fileType : string;
  media    : ProductMediaDto;
}

export interface OperationResult<T> {
  isSuccess : boolean;
  message   : string;
  errors    : string[];
  data      : T;
  recordId ?: number;
}

// ══════════════════════════════════════════════
// Upload با XHR
// ══════════════════════════════════════════════
export const uploadMediaWithProgress = (
  payload    : UploadMediaRequest,
  onProgress?: (percent: number) => void,
  signal?    : AbortSignal,
): { promise: Promise<OperationResult<UploadMediaResponse>>; xhr: XMLHttpRequest } => {

  const xhr     = new XMLHttpRequest();
  const baseURL = (axiosInstance.defaults.baseURL || '').replace(/\/$/, '');
  const token   = localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? '';

  const promise = new Promise<OperationResult<UploadMediaResponse>>((resolve, reject) => {

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('پاسخ نامعتبر از سرور'));
        }
      } else {
        let msg = `خطا در آپلود (${xhr.status})`;
        try { msg = JSON.parse(xhr.responseText)?.message ?? msg; } catch { /* skip */ }
        reject(new Error(msg));
      }
    };

    xhr.onerror = () => reject(new Error('خطای شبکه'));
    xhr.onabort = () => reject(new DOMException('آپلود لغو شد', 'AbortError'));

    signal?.addEventListener('abort', () => xhr.abort());

    const fd = new FormData();
    fd.append('file',                    payload.file);
    fd.append('request.mediaType',       payload.mediaType);
    fd.append('request.caption',         payload.caption);
    fd.append('request.altText',         payload.altText);
    fd.append('request.displayOrder',    String(payload.displayOrder));
    fd.append('request.isPrimary',       String(payload.isPrimary));
    fd.append('request.isActive',        String(payload.isActive));
    if (payload.productId != null) fd.append('request.productId', String(payload.productId));
    if (payload.skuId     != null) fd.append('request.skuId',     String(payload.skuId));

    xhr.open('POST', `${baseURL}/api/product-medias/upload`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(fd);
  });

  return { promise, xhr };
};

// ══════════════════════════════════════════════
// API Service
// ══════════════════════════════════════════════
export const productMediaApi = {

  getAll: (): Promise<OperationResult<ProductMediaDto[]>> =>
    axiosInstance.get('/api/product-medias/get-all').then(r => r.data),

  getById: (id: number): Promise<OperationResult<ProductMediaDto>> =>
    axiosInstance.get(`/api/product-medias/get-by-id/${id}`).then(r => r.data),

  getByProductId: (productId: number): Promise<OperationResult<ProductMediaDto[]>> =>
    axiosInstance.get(`/api/product-medias/get-by-product/${productId}`).then(r => r.data),

  getBySkuId: (skuId: number): Promise<OperationResult<ProductMediaDto[]>> =>
    axiosInstance.get(`/api/product-medias/get-by-sku/${skuId}`).then(r => r.data),

  create: (dto: AddProductMediaDto): Promise<OperationResult<ProductMediaDto>> =>
    axiosInstance.post('/api/product-medias/create', dto).then(r => r.data),

  update: (id: number, dto: ProductMediaDto): Promise<OperationResult<ProductMediaDto>> =>
    axiosInstance.put(`/api/product-medias/update/${id}`, dto).then(r => r.data),

  delete: (id: number): Promise<OperationResult<boolean>> =>
    axiosInstance.delete(`/api/product-medias/delete/${id}`).then(r => r.data),

  upload: async (payload: UploadMediaRequest): Promise<OperationResult<UploadMediaResponse>> => {
    const fd = new FormData();
    fd.append('file',                    payload.file);
    fd.append('request.mediaType',       payload.mediaType);
    fd.append('request.caption',         payload.caption);
    fd.append('request.altText',         payload.altText);
    fd.append('request.displayOrder',    String(payload.displayOrder));
    fd.append('request.isPrimary',       String(payload.isPrimary));
    fd.append('request.isActive',        String(payload.isActive));
    if (payload.productId != null) fd.append('request.productId', String(payload.productId));
    if (payload.skuId     != null) fd.append('request.skuId',     String(payload.skuId));

    const res = await axiosInstance.post('/api/product-medias/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  deleteByUrl: (mediaUrl: string): Promise<OperationResult<boolean>> =>
    axiosInstance.delete('/api/product-medias/delete-by-url', { data: { mediaUrl } }).then(r => r.data),

  bulkCreate: (items: AddProductMediaDto[]): Promise<OperationResult<ProductMediaDto[]>> =>
    axiosInstance.post('/api/product-medias/bulk-create', { items }).then(r => r.data),

  bulkDelete: (ids: number[]): Promise<OperationResult<boolean>> =>
    axiosInstance.delete('/api/product-medias/bulk-delete', { data: ids }).then(r => r.data),

  reorder: (items: { productMediaId: number; displayOrder: number }[]): Promise<OperationResult<boolean>> =>
    axiosInstance.put('/api/product-medias/reorder', { items }).then(r => r.data),

  setPrimary: (productMediaId: number, productId: number): Promise<OperationResult<boolean>> =>
    axiosInstance.put('/api/product-medias/set-primary', { productMediaId, productId }).then(r => r.data),
};
