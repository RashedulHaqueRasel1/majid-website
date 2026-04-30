export interface INotification {
  _id: string;
  to: string;
  message: string;
  isViewed: boolean;
  type: string;
  id?: string; // Reference to related entity ID
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: INotification[];
  meta: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
}

export interface SingleNotificationResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: INotification;
}
