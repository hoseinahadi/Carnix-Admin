export interface Category {
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  parentCategoryId: number | null;
  parentCategoryName: string;
  displayOrder: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  imageUrl: string;
  createdAt: string;
  modifiedAt: string;
}