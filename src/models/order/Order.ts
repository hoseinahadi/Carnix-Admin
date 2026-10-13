// models/order/Order.ts

/**
 * آیتم‌های ارسالی برای ثبت سفارش
 */
export interface OrderItemRequestDto {
  productId: number;
  /** اگر کالا دارای تنوع (رنگ/سایز) است، شناسه SKU ارسال می‌شود */
  productSKUId?: number | null;
  quantity: number;
  /** قیمت واحد کالا در لحظه ثبت سفارش */
  unitPrice: number;
  /** مبلغ تخفیف اعمال شده روی این ردیف */
  discountAmount: number;
  /** مالیات محاسبه شده برای این ردیف */
  taxAmount: number;
  /** وزن کالا (جهت محاسبات احتمالی حمل و نقل) */
  weight?: number | null;
}

/**
 * مدل درخواست ثبت سفارش جدید
 */
export interface PlaceOrderRequestDto {
userId: number; 
  cartId: number;
  zipCode: string;
  phoneNumber: string;
  // اطلاعات مالی
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  items: OrderItemRequestDto[];
}

/**
 * مدل داده‌ای اصلی برای سفارش
 * معادل کلاس OrderDto در سی‌شارپ
 */
export interface OrderDto {
  orderId: number;
  orderNumber: string;
  userId: number;
  statusName: string;
  
  // اطلاعات مالی
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  
  // تاریخ‌ها (در API به صورت ISO 8601 String برمی‌گردند)
  createdAt: string;
  lastUpdatedAt: string;
  
  // لیست آیتم‌های سفارش
  items: OrderItemRequestDto[];
}

// ==========================================
// مدل‌های مربوط به عملیات بیزینسی (از فایل کنترلر استخراج شد)
// ==========================================

/**
 * مدل درخواست تغییر وضعیت سفارش
 */
export interface ChangeOrderStatusRequestDto {
  StatusId: number;
  CarrierId: number;
}

/**
 * مدل درخواست لغو سفارش توسط ادمین
 */
export interface CancelOrderAdminRequestDto {
  reason: string;
}

/**
 * مدل خروجی رهگیری سفارش (فعلاً به صورت پایه ایجاد شده، در صورت نیاز فیلدهایش را تکمیل کن)
 */
export interface OrderTrackingResponseDto {
  orderId: number;
  ShipmentStatus: string;
  CarrierName: string;
  CarrierPhone: string;
  Events: TrackingEventDto[];
  
}

export interface TrackingEventDto {
  Status: string;
  Description: string;
  EventTime: string;
  
}
