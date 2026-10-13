// models/product/ProductDetails.ts (یا داخل فایل Product.ts اضافه کنید)

export interface ProductSkuSimple {
    skuId: number;
    skuCode: string;
    price: number;
    stockQuantity: number;
    colorName?: string;
    sizeName?: string;
}

export interface ProductImageSimple {
    imageId: number;
    imageUrl: string;
    isMain: boolean;
    displayOrder: number;
}

export interface ProductDetails {
    productId: number;
    productName: string;
    productCode: string;
    fullDescription?: string;
  shortDescription?: string;
    categoryName: string;
    brandName: string;
    categoryId: number;
    brandId: number;
    totalStock: number;
    isActive: boolean;
    // لیست‌های مرتبط
    skus: ProductSkuSimple[];
    images: ProductImageSimple[];
}

// این اینترفیس برای پاسخ‌های استاندارد OperationResult شماست
export interface OperationResult<T> {
    isSuccess: boolean;
    message: string;
    data: T;
    recordId?: number;
}
