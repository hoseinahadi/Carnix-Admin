// src/models/Role/Role.ts

// اگر مدل‌های زیر را دارید، می‌توانید آن‌ها را ایمپورت کنید
// import { UserRole } from './UserRole';
// import { ProjectAreaControllerAction } from '../Permissions/ProjectAreaControllerAction';

export interface Role {
  /** شناسه یکتای نقش */
  RoleId: number;

  /** نام نقش - به‌صورت انگلیسی و یکتا */
  roleName: string;

  /** عنوان فارسی برای نمایش در پنل مدیریت */
  displayName: string;

  /** توضیح کوتاه درباره وظایف یا کاربرد نقش */
  description: string;

  /** آیا این نقش فعال است؟ */
  isActive: boolean;

  /** سطح نقش برای تعیین سلسله‌مراتب */
  roleLevel?: number | null;


}
