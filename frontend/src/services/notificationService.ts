import api from './api';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  icon?: string;
  is_read: boolean;
  created_at: string;
}

const notificationService = {
  // Get notifications
  async getNotifications(limit = 20, offset = 0, unreadOnly = false): Promise<{
    success: boolean;
    data: Notification[];
    unread_count: number;
  }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    params.append('unread_only', unreadOnly.toString());

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: number) {
    const response = await api.post('/notifications/read', { notificationId });
    return response.data;
  },

  // Mark all as read
  async markAllAsRead() {
    const response = await api.post('/notifications/read-all');
    return response.data;
  }
};

export default notificationService;
