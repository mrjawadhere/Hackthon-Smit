/**
 * API Service Layer for Campus Admin Backend
 * Backend URL: http://127.0.0.1:5050
 */

const API_BASE_URL = 'http://127.0.0.1:5050';

// Types based on backend models
export interface User {
  name: string;
  email: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  new_password: string;
}

export interface Student {
  id: number;
  name: string;
  age?: number;
  email: string;
  department?: string;
  created_at?: string;
  last_active?: string;
  _id?: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  user_input: string;
}

export interface ChatResponse {
  thread_id: string;
  response: string;
  history: ChatMessage[];
}

export interface DepartmentCount {
  department: string;
  count: number;
}

export interface StudentsByDeptResponse {
  results: DepartmentCount[];
  total_departments: number;
  total_students: number;
  as_of: string;
}

export interface TotalStudentsResponse {
  total_students: number;
  as_of: string;
}

export interface RecentStudentsResponse {
  count: number;
  students: Student[];
}

export interface ActiveStudentsResponse {
  count: number;
  students: Student[];
}

// Generic API response type
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: 'success' | 'error';
}

export class ApiError extends Error {
  data?: unknown;
  status?: number;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// HTTP client with error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async parseResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined;
    }

    try {
      return isJson ? await response.json() : await response.text();
    } catch (error) {
      console.error('Failed to parse API response', error);
      return undefined;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Merge options but always preserve/merge headers so Content-Type isn't lost.
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      const payload = await this.parseResponse(response);

      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;

        if (typeof payload === 'string' && payload.trim()) {
          message = payload;
        } else if (payload && typeof payload === 'object') {
          const data = payload as Record<string, unknown>;

          if (typeof data.message === 'string' && data.message.trim()) {
            message = data.message;
          } else if (data.detail) {
            const detail = data.detail as unknown;

            if (Array.isArray(detail)) {
              const joined = detail
                .map((item) => {
                  if (!item) return '';
                  if (typeof item === 'string') return item;
                  if (typeof item === 'object' && item !== null && 'msg' in item) {
                    const msg = (item as { msg?: unknown }).msg;
                    if (typeof msg === 'string') {
                      return msg;
                    }
                  }
                  return JSON.stringify(item);
                })
                .filter(Boolean)
                .join('; ');

              if (joined.trim()) {
                message = joined;
              }
            } else if (typeof detail === 'string') {
              message = detail;
            } else if (typeof detail === 'object' && detail !== null && 'msg' in detail) {
              const msg = (detail as { msg?: unknown }).msg;
              if (typeof msg === 'string') {
                message = msg;
              }
            }
          }
        }

        if (!message || !message.trim()) {
          message = `HTTP error! status: ${response.status}`;
        }

        throw new ApiError(message, response.status, payload);
      }

      return payload as T;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  async register(credentials: RegisterCredentials): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>('/users/register', credentials);
  },

  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>('/users/login', credentials);
  },

  async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/users/reset-password', request);
  },
};

// Student API
export const studentApi = {
  async chat(threadId: string, request: ChatRequest): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>(`/students/chat/${threadId}`, request);
  },
};

// Analytics API
export const analyticsApi = {
  async getTotalStudents(): Promise<TotalStudentsResponse> {
    return apiClient.get<TotalStudentsResponse>('/analytics/analytics/total-students');
  },

  async getStudentsByDepartment(): Promise<StudentsByDeptResponse> {
    return apiClient.get<StudentsByDeptResponse>('/analytics/analytics/students-by-department');
  },

  async getRecentStudents(limit: number = 5): Promise<RecentStudentsResponse> {
    return apiClient.get<RecentStudentsResponse>(`/analytics/analytics/students/recent?limit=${limit}`);
  },

  async getActiveStudentsLast7Days(): Promise<ActiveStudentsResponse> {
    return apiClient.get<ActiveStudentsResponse>('/analytics/analytics/students/active_last_7_days');
  },
};

// Export the main API object
export const api = {
  auth: authApi,
  student: studentApi,
  analytics: analyticsApi,
};

export default api;


