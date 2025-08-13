import { Transport } from './transport';
import { TicketsApi } from './endpoints/tickets';
import type { TransportOptions } from './types';

/**
 * Main Codimir SDK client.
 * 
 * This is the primary entry point for interacting with the Codimir API.
 * It provides typed access to all endpoints and handles authentication,
 * retries, and error normalization consistently.
 * 
 * @example
 * ```typescript
 * // For web app (server-side)
 * const client = new CodimirClient({
 *   baseUrl: process.env.CODIMIR_API_URL!,
 *   getToken: () => cookies().get("auth_token")?.value
 * });
 * 
 * // For CLI/Node.js
 * const client = new CodimirClient({
 *   baseUrl: 'https://api.codimir.dev',
 *   getToken: () => process.env.CODIMIR_API_KEY
 * });
 * 
 * // For browser (public endpoints)
 * const client = new CodimirClient({
 *   baseUrl: '/api' // Same-origin, uses cookies
 * });
 * ```
 */
export class CodimirClient {
  /**
   * Tickets API - manage tickets (create, read, update, delete, list).
   */
  public readonly tickets: TicketsApi;

  private readonly transport: Transport;

  /**
   * Create a new Codimir SDK client.
   * 
   * @param options - Transport configuration options
   */
  constructor(options: TransportOptions) {
    // Validate required options
    if (!options.baseUrl) {
      throw new Error('baseUrl is required');
    }

    // Create transport layer
    this.transport = new Transport(options);

    // Initialize API endpoints
    this.tickets = new TicketsApi(this.transport);
  }

  /**
   * Test the connection to the Codimir API.
   * 
   * @returns Promise that resolves if the connection is successful
   * 
   * @example
   * ```typescript
   * try {
   *   await client.testConnection();
   *   console.log('✅ Connected to Codimir API');
   * } catch (error) {
   *   console.error('❌ Connection failed:', error.message);
   * }
   * ```
   */
  async testConnection(): Promise<void> {
    try {
      // Try to list tickets with a small limit to test connectivity
      await this.tickets.list({ limit: 1 });
    } catch (error) {
      throw new Error(`Failed to connect to Codimir API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get information about the current API configuration.
   * 
   * @returns Configuration information
   */
  getConfig(): { baseUrl: string; hasAuth: boolean } {
    return {
      baseUrl: (this.transport as { baseUrl: string }).baseUrl,
      hasAuth: !!(this.transport as { getToken?: unknown }).getToken,
    };
  }
}

/**
 * Factory function to create a Codimir client with common configurations.
 * 
 * @param baseUrl - API base URL
 * @param getToken - Optional token getter function
 * @returns Configured CodimirClient instance
 * 
 * @example
 * ```typescript
 * // Simple client without auth
 * const client = createCodimirClient('https://api.codimir.dev');
 * 
 * // Client with token
 * const authenticatedClient = createCodimirClient(
 *   'https://api.codimir.dev',
 *   () => localStorage.getItem('token')
 * );
 * ```
 */
export function createCodimirClient(
  baseUrl: string,
  getToken?: TransportOptions['getToken']
): CodimirClient {
  return new CodimirClient({ baseUrl, getToken });
}
