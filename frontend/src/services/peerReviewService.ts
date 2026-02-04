import api from './api';
import {
  ApiResponse,
  EmployeeListItem,
  DimensionWithStatements,
  ArisePeerReview,
  SubmitPeerReviewRequest,
  AriseRadarData,
  ReviewJourney,
  UserAriseBadge,
} from '@/types';

export const peerReviewService = {
  // Get all employees available to review
  async getEmployees(): Promise<EmployeeListItem[]> {
    const { data } = await api.get<ApiResponse<EmployeeListItem[]>>('/peer-review/employees');
    return data.data;
  },

  // Get ARISE dimensions with statements
  async getDimensions(): Promise<DimensionWithStatements[]> {
    const { data } = await api.get<ApiResponse<DimensionWithStatements[]>>('/peer-review/dimensions');
    return data.data;
  },

  // Submit a peer review
  async submitReview(reviewData: SubmitPeerReviewRequest): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post<ApiResponse<{ success: boolean; message: string }>>(
      '/peer-review/submit',
      reviewData
    );
    return data.data;
  },

  // Get reviews I've submitted
  async getMyReviews(): Promise<ArisePeerReview[]> {
    const { data } = await api.get<ApiResponse<ArisePeerReview[]>>('/peer-review/my-reviews');
    return data.data;
  },

  // Get reviews others submitted about me
  async getReviewsAboutMe(): Promise<ArisePeerReview[]> {
    const { data } = await api.get<ApiResponse<ArisePeerReview[]>>('/peer-review/reviews-about-me');
    return data.data;
  },

  // Get ARISE radar chart data
  async getAriseRadar(userId?: string): Promise<AriseRadarData> {
    const url = userId ? `/peer-review/arise-radar/${userId}` : '/peer-review/arise-radar';
    const { data } = await api.get<ApiResponse<AriseRadarData>>(url);
    return data.data;
  },

  // Get review journey/history
  async getReviewJourney(userId?: string): Promise<ReviewJourney> {
    const url = userId ? `/peer-review/journey/${userId}` : '/peer-review/journey';
    const { data } = await api.get<ApiResponse<ReviewJourney>>(url);
    return data.data;
  },

  // Get my ARISE badges
  async getMyBadges(): Promise<UserAriseBadge[]> {
    const { data } = await api.get<ApiResponse<UserAriseBadge[]>>('/badges/arise-badges');
    return data.data;
  },
};
