import { Transport } from '../transport';
import type { 
  Ticket, 
  TicketId, 
  CreateTicketInput, 
  UpdateTicketInput, 
  ListTicketsParams, 
  PaginatedResponse 
} from '../types';

/**
 * Tickets API - provides methods for managing tickets via the Codimir API.
 * All methods return typed responses and handle errors consistently.
 */
export class TicketsApi {
  constructor(private readonly transport: Transport) {}

  /**
   * Create a new ticket.
   * 
   * @param input - Ticket creation data
   * @returns Promise resolving to the created ticket
   * 
   * @example
   * ```typescript
   * const ticket = await client.tickets.create({
   *   title: "Fix login bug",
   *   description: "Users can't log in with special characters",
   *   priority: "high",
   *   status: "open"
   * });
   * ```
   */
  async create(input: CreateTicketInput): Promise<Ticket> {
    return this.transport.request<Ticket>('POST', '/api/v1/tickets', input);
  }

  /**
   * Get a ticket by ID.
   * 
   * @param id - Ticket ID
   * @returns Promise resolving to the ticket
   * 
   * @example
   * ```typescript
   * const ticket = await client.tickets.get('TKT-123');
   * ```
   */
  async get(id: TicketId): Promise<Ticket> {
    return this.transport.request<Ticket>('GET', `/api/v1/tickets/${id}`);
  }

  /**
   * List tickets with optional filtering and pagination.
   * 
   * @param params - Optional filtering and pagination parameters
   * @returns Promise resolving to paginated tickets list
   * 
   * @example
   * ```typescript
   * // List all tickets
   * const result = await client.tickets.list();
   * 
   * // List with filters
   * const filtered = await client.tickets.list({
   *   status: 'open',
   *   priority: 'high',
   *   limit: 10
   * });
   * 
   * // Handle pagination
   * if (result.nextCursor) {
   *   const nextPage = await client.tickets.list({
   *     cursor: result.nextCursor,
   *     limit: 10
   *   });
   * }
   * ```
   */
  async list(params: ListTicketsParams = {}): Promise<PaginatedResponse<Ticket>> {
    const searchParams = new URLSearchParams();
    
    // Add parameters to query string
    if (params.projectId) searchParams.set('projectId', params.projectId);
    if (params.cursor) searchParams.set('cursor', params.cursor);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);
    if (params.priority) searchParams.set('priority', params.priority);
    if (params.assignee) searchParams.set('assignee', params.assignee);
    if (params.search) searchParams.set('search', params.search);

    const queryString = searchParams.toString();
    const path = `/api/v1/tickets${queryString ? `?${queryString}` : ''}`;

    return this.transport.request<PaginatedResponse<Ticket>>('GET', path);
  }

  /**
   * Update a ticket by ID (partial update).
   * 
   * @param id - Ticket ID
   * @param update - Partial ticket update data
   * @returns Promise resolving to the updated ticket
   * 
   * @example
   * ```typescript
   * const updated = await client.tickets.update('TKT-123', {
   *   status: 'in-progress',
   *   assignee: 'john@example.com'
   * });
   * ```
   */
  async update(id: TicketId, update: UpdateTicketInput): Promise<Ticket> {
    return this.transport.request<Ticket>('PATCH', `/api/v1/tickets/${id}`, update);
  }

  /**
   * Delete a ticket by ID.
   * 
   * @param id - Ticket ID
   * @returns Promise that resolves when deletion is complete
   * 
   * @example
   * ```typescript
   * await client.tickets.remove('TKT-123');
   * ```
   */
  async remove(id: TicketId): Promise<void> {
    return this.transport.request<void>('DELETE', `/api/v1/tickets/${id}`);
  }

  /**
   * Convenience method to get all tickets (handles pagination automatically).
   * Use with caution on large datasets.
   * 
   * @param params - Optional filtering parameters (cursor and limit are ignored)
   * @returns Promise resolving to all tickets matching the filters
   * 
   * @example
   * ```typescript
   * const allOpenTickets = await client.tickets.getAll({ status: 'open' });
   * ```
   */
  async getAll(params: Omit<ListTicketsParams, 'cursor' | 'limit'> = {}): Promise<Ticket[]> {
    const allTickets: Ticket[] = [];
    let cursor: string | undefined;
    const limit = 100; // Use large page size for efficiency

    do {
      const result = await this.list({ ...params, cursor, limit });
      allTickets.push(...result.items);
      cursor = result.nextCursor;
    } while (cursor);

    return allTickets;
  }

  /**
   * Search tickets by text query.
   * 
   * @param query - Search query
   * @param params - Additional filtering parameters
   * @returns Promise resolving to matching tickets
   * 
   * @example
   * ```typescript
   * const results = await client.tickets.search('login bug', {
   *   status: 'open',
   *   limit: 20
   * });
   * ```
   */
  async search(query: string, params: Omit<ListTicketsParams, 'search'> = {}): Promise<PaginatedResponse<Ticket>> {
    return this.list({ ...params, search: query });
  }
}
