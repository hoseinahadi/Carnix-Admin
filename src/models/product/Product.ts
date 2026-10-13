// features/products/models/Product.ts

export interface Product {
  productId: number; // بهتر است شناسه همیشه عدد باشد
  productName: string; // نام نمایشی در جدول
  productCode?: string; // اگر در سرور نیست، اختیاری باشد
  fullDescription?: string;
  shortDescription?: string;
  basePrice: number;
  totalStock: number;
  categoryId: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt?: string;
  displayOrder?: number;
  isFeatured:boolean;
}

// 👈 اینترفیس دقیقا مطابق با ProductDto در C# تنظیم شد
export interface CreateProductDto {
  categoryId: number;
  brandId: number | null;
  productName: string; // 🔴 تغییر از name به productName
  shortDescription: string;
  fullDescription: string;
  basePrice: number;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  totalStock: number;
}

export interface UpdateProductDto extends CreateProductDto {
  productId: number;
}

export interface ProductFilters {
  search?: string;
  categoryId?: number | string;
  brandId?: number | string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}
