import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, ApiError, AuthTokens } from '../types';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'app_access_token';
const REFRESH_TOKEN_KEY = 'app_refresh_token';

// ============================================================================
// AXIOS INSTANCE
// ============================================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && originalRequest) {
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post<AuthTokens>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(accessToken, newRefreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isTokenExpired(): boolean {
  const token = getAccessToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// ============================================================================
// API HELPER FUNCTIONS
// ============================================================================

export async function apiGet<T>(
  url: string,
  config?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: {
          statusCode: error.response?.status || 500,
          message: error.response?.data?.error?.message || error.message,
        },
      };
    }
    return {
      error: {
        statusCode: 500,
        message: 'An unexpected error occurred',
      },
    };
  }
}

export async function apiPost<T>(
  url: string,
  data?: any,
  config?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: {
          statusCode: error.response?.status || 500,
          message: error.response?.data?.error?.message || error.message,
          details: error.response?.data?.error?.details,
        },
      };
    }
    return {
      error: {
        statusCode: 500,
        message: 'An unexpected error occurred',
      },
    };
  }
}

export async function apiPatch<T>(
  url: string,
  data?: any,
  config?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: {
          statusCode: error.response?.status || 500,
          message: error.response?.data?.error?.message || error.message,
          details: error.response?.data?.error?.details,
        },
      };
    }
    return {
      error: {
        statusCode: 500,
        message: 'An unexpected error occurred',
      },
    };
  }
}

export async function apiDelete<T>(
  url: string,
  config?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        error: {
          statusCode: error.response?.status || 500,
          message: error.response?.data?.error?.message || error.message,
        },
      };
    }
    return {
      error: {
        statusCode: 500,
        message: 'An unexpected error occurred',
      },
    };
  }
}

export default apiClient;
