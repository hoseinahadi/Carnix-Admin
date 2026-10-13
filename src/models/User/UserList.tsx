// src/models/auth/User.ts

export interface UserList {
  /** شناسه کاربر */
  userId: number
  
  /** نام کاربری */
  userName: string

  /** آدرس ایمیل کاربر */
  email: string

  /** شماره تلفن همراه کاربر */
  phoneNumber: string

  /** آیا حساب فعال است؟ */
  isActive: boolean

  /** آیا ایمیل تایید شده؟ */
  isEmailVerified: boolean

  /** آیا تلفن تایید شده؟ */
  isPhoneVerified: boolean

  /** تعداد تلاش‌های ناموفق ورود اخیر */
  failedLoginAttempts: number

  /** زمان پایان قفل موقت حساب */
  lockoutEnd?: string | null  // DateTime? → nullable string (ISO date)

  /** تاریخ آخرین ورود موفق */
  lastLoginAt?: string | null  // DateTime? → nullable string (ISO date)

  /** نقش کاربر */
  roleName: string

  /** نام */
  name: string

  /** نام خانوادگی */
  family: string

  /** جنسیت */
  gender: string
  Password: string
}
