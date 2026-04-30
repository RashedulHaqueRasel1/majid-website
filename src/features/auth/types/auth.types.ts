// src/features/auth/types/auth.types.ts

export interface User {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  image?: string | Record<string, unknown> | null;
  isVerified?: boolean;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  user?: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  statusCode?: number;
  data?: T;
}

export interface VerifyEmailResponse {
  _id: string;
  email: string;
  role: string;
}

export interface ForgotPasswordResponse {
  accessToken: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  shopName?: string;
  shopAddress?: string;
  whatsappNumber?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
