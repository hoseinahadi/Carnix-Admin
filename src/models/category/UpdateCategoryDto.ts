export interface UpdateCategoryDto {
  name: string;
  slug: string;
  description: string;
  parentCategoryId: number | null;
  displayOrder: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  // معمولاً ID از طریق URL پاس داده می‌شود، اما در صورت نیاز در کامپوننت مدیریت می‌شود
}