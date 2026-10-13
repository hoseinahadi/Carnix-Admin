// src/models/brand/Brand.ts

export interface Brand {
  brandId: number;
  name: string;
  description?: string | null;
  countryOfOrigin?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
}
