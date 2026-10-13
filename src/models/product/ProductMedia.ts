// features/products/models/ProductMedia.ts
export interface ProductMediaDto {
  productMediaId: number;
  productId?: number | null;
  skuId?: number | null;
  mediaType: string;
  mediaUrl: string;
  caption?: string | null;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
  isActive: boolean;
}

export interface AddProductMediaDto extends Omit<ProductMediaDto, 'productMediaId'> {}

export interface ProductImageDto {
  productImageId: number;
  productId: number;
  imageUrl: string;
  title?: string | null;
  altText: string;
  isMain: boolean;
  displayOrder: number;
  imageType: string;
}

export interface ProductVideoDto {
  productVideoId: number;
  productId: number;
  title: string;
  description?: string | null;
  videoUrl: string;
  displayType: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Product360ViewDto {
  product360ViewId: number;
  productId: number;
  title: string;
  description?: string | null;
  viewUrl: string;
  isActive: boolean;
  displayOrder: number;
}
