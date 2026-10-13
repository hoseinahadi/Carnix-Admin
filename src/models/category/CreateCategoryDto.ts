export interface CreateCategoryDto {
  name: string;
  slug: string;
  description: string;
  parentCategoryId: number | null;
  displayOrder: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  imageUrl: string;
}