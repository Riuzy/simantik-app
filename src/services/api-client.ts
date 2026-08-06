import axios from 'axios';
import { appConfig } from '../config';
import { API } from '../constants/api';

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
}

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(appConfig.auth.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLoginRequest =
      typeof originalRequest?.url === 'string' && originalRequest.url.includes(API.AUTH.LOGIN);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined' &&
      !isLoginRequest
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = localStorage.getItem(appConfig.auth.refreshTokenKey);
      if (!refreshTokenValue) {
        processQueue(new Error('No refresh token available'), null);
        localStorage.removeItem(appConfig.auth.tokenKey);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${appConfig.apiBaseUrl}${API.AUTH.REFRESH}`, {
          refreshToken: refreshTokenValue,
        });
        const { accessToken, refreshToken } = res.data.data;
        localStorage.setItem(appConfig.auth.tokenKey, accessToken);
        localStorage.setItem(appConfig.auth.refreshTokenKey, refreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem(appConfig.auth.tokenKey);
        localStorage.removeItem(appConfig.auth.refreshTokenKey);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
