// features/products/models/ProductInteraction.ts
export interface ProductReviewDto {
  productReviewId: number;
  productId: number;
  userId: number;
  title: string;
  content: string;
  rating: number; // 1 to 5
  isVerifiedPurchase: boolean;
  reviewStatus: string;
  helpfulCount: number;
  reportCount: number;
  createdAt: string;
}

export interface ProductQuestionDto {
  productQuestionId: number;
  productId: number;
  userId: number;
  questionText: string;
  isPublic: boolean;
  answerCount: number;
  createdAt: string;
}
