// features/products/api/ProductInteractionApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { ProductReviewDto, ProductQuestionDto } from '@/models/product/ProductInteraction';

export const ProductInteractionApi = {
  // Reviews
  getReviewsByProductId: async (productId: number | string) =>
    await axiosInstance.get<ProductReviewDto[]>(`/ProductReview/GetByProductId/${productId}`),

  approveReview: async (reviewId: number | string) =>
    await axiosInstance.patch(`/ProductReview/Approve/${reviewId}`),

  deleteReview: async (reviewId: number | string) =>
    await axiosInstance.delete(`/ProductReview/Delete/${reviewId}`),

  // Questions
  getQuestionsByProductId: async (productId: number | string) =>
    await axiosInstance.get<ProductQuestionDto[]>(`/ProductQuestion/GetByProductId/${productId}`),

  answerQuestion: async (questionId: number | string, answerText: string) =>
    await axiosInstance.post(`/ProductQuestion/Answer/${questionId}`, { answerText }),

  deleteQuestion: async (questionId: number | string) =>
    await axiosInstance.delete(`/ProductQuestion/Delete/${questionId}`),
};
