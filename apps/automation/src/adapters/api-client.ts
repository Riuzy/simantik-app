import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ILogger } from '../core/interfaces';
import { ZodSchema } from 'zod';
import { ApiException, NetworkException, InvalidResponseException } from './api-exceptions';

export interface ApiClientConfig {
  baseUrl: string;
  token?: string;
  apiKey?: string;
  requestTimeout: number;
  retryCount: number;
  retryDelay: number;
}

export class ApiClient {
  private _client: AxiosInstance;
  private _config: ApiClientConfig;
  private _logger: ILogger;

  constructor(config: ApiClientConfig, logger: ILogger) {
    this._config = config;
    this._logger = logger.child({ module: 'api-client' });

    this._client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.requestTimeout,
      headers: { 'Content-Type': 'application/json' },
    });

    this._client.interceptors.request.use((req: any) => {
      if (config.token) {
        req.headers.Authorization = `Bearer ${config.token}`;
      } else if (config.apiKey) {
        req.headers['X-API-Key'] = config.apiKey;
      }
      this._logger.debug({ method: req.method, url: req.url }, 'API request');
      return req;
    });

    this._client.interceptors.response.use(
      (res: any) => {
        this._logger.debug({ status: res.status, url: res.config?.url }, 'API response');
        return res;
      },
      (error: AxiosError) => {
        this._logger.warn({ status: error.response?.status, url: error.config?.url }, 'API error');
        return Promise.reject(this._mapError(error));
      },
    );
  }

  private _mapError(error: AxiosError): Error {
    if (!error.response) {
      return new NetworkException(error.message, error);
    }
    const status = error.response.status;
    const data = error.response.data as any;
    const message = data?.message || data?.error || error.message;
    return new ApiException(status, message);
  }

  private async _executeWithRetry<T>(request: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await request();
    } catch (err) {
      if (attempt >= this._config.retryCount) throw err;
      const isRetryable = err instanceof NetworkException ||
        (err instanceof ApiException && err.statusCode >= 500);
      if (!isRetryable) throw err;
      this._logger.warn({ attempt, error: (err as Error).message }, 'Retrying API request');
      await new Promise(r => setTimeout(r, this._config.retryDelay * attempt));
      return this._executeWithRetry(request, attempt + 1);
    }
  }

  private _buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    if (!params) return path;
    const filtered = Object.entries(params).filter(([_, v]) => v !== undefined);
    if (filtered.length === 0) return path;
    const qs = filtered.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
    return `${path}?${qs}`;
  }

  async get<T>(path: string, schema: ZodSchema<T>, params?: Record<string, string | number | undefined>): Promise<T> {
    return this._executeWithRetry(async () => {
      const url = this._buildUrl(path, params);
      const res = await this._client.get(url);
      return this._validate(res.data, schema);
    });
  }

  async post<T>(path: string, schema: ZodSchema<T>, body?: unknown): Promise<T> {
    return this._executeWithRetry(async () => {
      const res = await this._client.post(path, body);
      return this._validate(res.data, schema);
    });
  }

  async patch<T>(path: string, schema: ZodSchema<T>, body?: unknown): Promise<T> {
    return this._executeWithRetry(async () => {
      const res = await this._client.patch(path, body);
      return this._validate(res.data, schema);
    });
  }

  async put<T>(path: string, schema: ZodSchema<T>, body?: unknown): Promise<T> {
    return this._executeWithRetry(async () => {
      const res = await this._client.put(path, body);
      return this._validate(res.data, schema);
    });
  }

  async delete(path: string): Promise<void> {
    return this._executeWithRetry(async () => {
      await this._client.delete(path);
    });
  }

  private _validate<T>(data: unknown, schema: ZodSchema<T>): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.issues;
      throw new InvalidResponseException('API response validation failed', errors);
    }
    return result.data;
  }
}
