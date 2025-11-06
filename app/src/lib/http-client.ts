/**
 * HTTP Client Wrapper
 * Provides a consistent interface for all API calls with automatic cookie handling
 */

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
}

class HttpClient {
  private baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  /**
   * Build query string from object
   */
  private buildQueryString(params?: Record<string, string | number>): string {
    if (!params || Object.keys(params).length === 0) return "";
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    return `?${searchParams.toString()}`;
  }

  /**
   * Core fetch wrapper with error handling
   */
  private async request<T>(url: string, config: RequestConfig): Promise<T> {
    try {
      const response = await fetch(url, {
        method: config.method,
        headers: {
          ...this.baseHeaders,
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        credentials: config.credentials || "include", // Always send cookies
      });

      // Parse JSON response
      const data = await response.json();

      // Handle non-OK responses
      if (!response.ok) {
        const errorMessage =
          data.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data as T;
    } catch (error) {
      // Re-throw with more context
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network request failed");
    }
  }

  /**
   * GET request
   */
  async get<T>(
    url: string,
    params?: Record<string, string | number>
  ): Promise<T> {
    const queryString = this.buildQueryString(params);
    return this.request<T>(`${url}${queryString}`, {
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T>(url: string, body?: unknown): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body,
    });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, body?: unknown): Promise<T> {
    return this.request<T>(url, {
      method: "PUT",
      body,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    url: string,
    params?: Record<string, string | number>
  ): Promise<T> {
    const queryString = this.buildQueryString(params);
    return this.request<T>(`${url}${queryString}`, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const httpClient = new HttpClient();

// Export type for external use
export type { HttpClient };
