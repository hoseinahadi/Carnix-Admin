// models/common/OperationResult.ts

export interface OperationResult<T = void> {
    /**
     * وضعیت موفقیت‌آمیز بودن عملیات
     */
    isSuccess: boolean;

    /**
     * پیام بازگشتی از سمت سرور (پیام موفقیت یا متن خطا)
     */
    message: string;

    /**
     * دیتای اصلی که از سرور برمی‌گردد (میتواند لیست، آبجکت یا خالی باشد)
     */
    data: T;

    /**
     * (اختیاری) کد وضعیت سفارشی اپلیکیشن یا کد HTTP
     */
    statusCode?: number;

    /**
     * (اختیاری) لیست خطاهای اعتبارسنجی (Validation Errors) در صورت وجود
     */
    errors?: string[] | Record<string, string[]>;
}
