import { ApiError } from './errors';
import type { TransportOptions, ApiErrorResponse } from './types';

/**
 * HTTP transport layer for the Codimir SDK.
 * Handles authentication, retries, timeouts, and error normalization.
 */
export class Transport {
  private readonly baseUrl: string;
  private readonly getToken?: TransportOptions['getToken'];
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly retryConfig: Required<NonNullable<TransportOptions['retry']>>;

  constructor(options: TransportOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    this.getToken = options.getToken;
    this.fetchImpl = options.fetch ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 15000; // 15 second default
    this.retryConfig = {
      attempts: 2,
      minDelayMs: 300,
      factor: 2,
      ...options.retry,
    };
  }

  /**
   * Make an HTTP request with automatic retry, timeout, and error handling.
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    // Get authentication token if available
    const token = typeof this.getToken === 'function' 
      ? await this.getToken() 
      : this.getToken;

    let attempt = 0;
    const maxAttempts = this.retryConfig.attempts;

    while (attempt <= maxAttempts) {
      try {
        const response = await this.makeRequest(url, method, body, token);
        
        if (response.ok) {
          // Handle successful responses
          if (response.status === 204) {
            return undefined as T; // No content
          }
          
          const data = await response.json().catch(() => ({}));
          return data as T;
        }

        // Handle error responses
        if (this.shouldRetry(method, response.status) && attempt < maxAttempts) {
          await this.delay(this.retryConfig.minDelayMs * Math.pow(this.retryConfig.factor, attempt));
          attempt++;
          continue;
        }

        // Parse error response
        throw await this.createApiError(response);
        
      } catch (error) {
        // Handle network errors and other exceptions
        if (error instanceof ApiError) {
          throw error; // Re-throw API errors
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408, 'TIMEOUT');
        }
        
        if (this.shouldRetry(method, 0) && attempt < maxAttempts) {
          await this.delay(this.retryConfig.minDelayMs * Math.pow(this.retryConfig.factor, attempt));
          attempt++;
          continue;
        }
        
        // Convert unknown errors to ApiError
        throw new ApiError(
          error instanceof Error ? error.message : 'Unknown error',
          500,
          'NETWORK_ERROR'
        );
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new ApiError('Max retry attempts exceeded', 500, 'MAX_RETRIES_EXCEEDED');
  }

  /**
   * Make a single HTTP request with timeout handling.
   */
  private async makeRequest(
    url: string,
    method: string,
    body: unknown,
    token?: string
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Create an ApiError from a Response object.
   */
  private async createApiError(response: Response): Promise<ApiError> {
    let errorData: ApiErrorResponse | null = null;
    
    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parsing errors
    }

    const message = errorData?.error?.message ?? `HTTP ${response.status}`;
    const code = errorData?.error?.code ?? this.getDefaultErrorCode(response.status);
    const details = errorData?.error?.details;

    return new ApiError(message, response.status, code, details);
  }

  /**
   * Get a default error code based on HTTP status.
   */
  private getDefaultErrorCode(status: number): string {
    switch (status) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 422: return 'VALIDATION_ERROR';
      case 429: return 'RATE_LIMITED';
      case 500: return 'INTERNAL_ERROR';
      case 502: return 'BAD_GATEWAY';
      case 503: return 'SERVICE_UNAVAILABLE';
      case 504: return 'GATEWAY_TIMEOUT';
      default: return 'UNKNOWN_ERROR';
    }
  }

  /**
   * Determine if a request should be retried based on method and status.
   */
  private shouldRetry(method: string, status: number): boolean {
    // Only retry idempotent methods
    if (!['GET', 'HEAD', 'PUT', 'DELETE'].includes(method)) {
      return false;
    }

    // Retry on rate limiting and server errors
    return status === 429 || (status >= 500 && status < 600);
  }

  /**
   * Sleep for the specified number of milliseconds.
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
