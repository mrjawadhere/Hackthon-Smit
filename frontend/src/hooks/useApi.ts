/**
 * React Query hooks for API calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type LoginCredentials, type RegisterCredentials, type ResetPasswordRequest, type ChatRequest, ApiError } from '@/services/api';

// Query keys for cache management
export const queryKeys = {
  analytics: {
    totalStudents: ['analytics', 'total-students'],
    studentsByDepartment: ['analytics', 'students-by-department'],
    recentStudents: (limit?: number) => ['analytics', 'recent-students', limit],
    activeStudents: ['analytics', 'active-students'],
  },
  chat: {
    history: (threadId: string) => ['chat', 'history', threadId],
  },
} as const;

// Analytics Hooks
export const useAnalytics = () => {
  const totalStudents = useQuery({
    queryKey: queryKeys.analytics.totalStudents,
    queryFn: () => api.analytics.getTotalStudents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const studentsByDepartment = useQuery({
    queryKey: queryKeys.analytics.studentsByDepartment,
    queryFn: () => api.analytics.getStudentsByDepartment(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  const recentStudents = useQuery({
    queryKey: queryKeys.analytics.recentStudents(5),
    queryFn: () => api.analytics.getRecentStudents(5),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });

  const activeStudents = useQuery({
    queryKey: queryKeys.analytics.activeStudents,
    queryFn: () => api.analytics.getActiveStudentsLast7Days(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  return {
    totalStudents,
    studentsByDepartment,
    recentStudents,
    activeStudents,
    isLoading:
      totalStudents.isLoading ||
      studentsByDepartment.isLoading ||
      recentStudents.isLoading ||
      activeStudents.isLoading,
    isError:
      totalStudents.isError ||
      studentsByDepartment.isError ||
      recentStudents.isError ||
      activeStudents.isError,
  };
};

// Helper to surface API errors
const extractDetailMessage = (detail: unknown): string | undefined => {
  if (!detail) return undefined;
  if (typeof detail === 'string' && detail.trim()) return detail;

  if (Array.isArray(detail)) {
    const joined = detail
      .map((item) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null && 'msg' in item) {
          const msg = (item as { msg?: unknown }).msg;
          if (typeof msg === 'string' && msg.trim()) {
            return msg;
          }
        }
        return JSON.stringify(item);
      })
      .filter(Boolean)
      .join('; ');

    return joined.trim() ? joined : undefined;
  }

  if (typeof detail === 'object' && detail !== null && 'msg' in detail) {
    const msg = (detail as { msg?: unknown }).msg;
    if (typeof msg === 'string' && msg.trim()) {
      return msg;
    }
  }

  return undefined;
};

const extractPayloadMessage = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const data = payload as Record<string, unknown>;

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if ('detail' in data) {
    const detailMessage = extractDetailMessage((data as { detail?: unknown }).detail);
    if (detailMessage) {
      return detailMessage;
    }
  }

  return undefined;
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    if (error.message && error.message.trim()) {
      return error.message;
    }

    const payloadMessage = extractPayloadMessage(error.data);
    if (payloadMessage) {
      return payloadMessage;
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) {
      return msg;
    }
  }

  return fallback;
};

// Auth Hooks
export const useAuth = () => {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => api.auth.login(credentials),
    onSuccess: (data) => {
      if (data.status === 'success') {
        toast.success(data.message || 'Login successful!');
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data));
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, 'Login failed. Please check your credentials.'));
      console.error('Login error:', error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => api.auth.register(credentials),
    onSuccess: (data) => {
      if (data.status === 'success') {
        toast.success(data.message || 'Registration successful!');
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data));
        }
      } else {
        toast.error(data.message || 'Registration failed');
      }
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, 'Registration failed. Please try again.'));
      console.error('Registration error:', error);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (request: ResetPasswordRequest) => api.auth.resetPassword(request),
    onSuccess: (data) => {
      if (data.status === 'success') {
        toast.success(data.message || 'Password reset successful!');
      } else {
        toast.error(data.message || 'Password reset failed');
      }
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, 'Password reset failed. Please try again.'));
      console.error('Password reset error:', error);
    },
  });

  const login = async (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const registerUser = async (credentials: RegisterCredentials) => {
    return registerMutation.mutateAsync(credentials);
  };

  const resetUserPassword = async (request: ResetPasswordRequest) => {
    return resetPasswordMutation.mutateAsync(request);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  const getStoredUser = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  };

  const getStoredToken = () => {
    return localStorage.getItem('authToken');
  };

  return {
    login,
    register: registerUser,
    resetPassword: resetUserPassword,
    logout,
    getStoredUser,
    getStoredToken,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
  };
};

// Chat Hooks
export const useChat = (threadId: string) => {
  const queryClient = useQueryClient();

  const chatMutation = useMutation({
    mutationFn: (request: ChatRequest) => api.student.chat(threadId, request),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.chat.history(threadId), data.history);
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, 'Failed to send message. Please try again.'));
      console.error('Chat error:', error);
    },
  });

  return {
    sendMessage: chatMutation.mutate,
    isSending: chatMutation.isPending,
    chatData: chatMutation.data,
    error: chatMutation.error,
  };
};

// Custom hook for refresh all analytics data
export const useRefreshAnalytics = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    toast.success('Analytics data refreshed');
  };
};

// Custom hook for optimistic updates
export const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();

  const updateAnalytics = (updater: (oldData: any) => any, queryKey: any[]) => {
    queryClient.setQueryData(queryKey, updater);
  };

  return { updateAnalytics };
};

