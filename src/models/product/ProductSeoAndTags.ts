// features/products/models/ProductSeoAndTags.ts
export interface ProductSEODto {
  productSEOId: number;
  productId: number;
  pageTitle: string;
  metaDescription: string;
  metaKeywords: string;
  slug: string;
  mainImageAltText: string;
  h1Tag: string;
  h2Tag?: string | null;
}

export interface TagDto {
  tagId: number;
  name: string;
  description?: string | null;
}

export interface ProductTagDto {
  productTagId: number;
  productId: number;
  tagId: number;
}

export interface ProductSimilarityDto {
  productSimilarityId: number;
  productId1: number;
  productId2: number;
  similarityScore: number;
  metricType: string;
}
