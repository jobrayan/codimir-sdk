/**
 * Codimir SDK - TypeScript client library for the Codimir API
 * 
 * This SDK provides a typed, framework-agnostic way to interact with Codimir
 * from web apps, CLI tools, VSCode extensions, and other integrations.
 * 
 * @example
 * ```typescript
 * import { CodimirClient, ApiError } from '@codimir/sdk';
 * 
 * const client = new CodimirClient({
 *   baseUrl: 'https://api.codimir.dev',
 *   getToken: () => process.env.CODIMIR_API_KEY
 * });
 * 
 * try {
 *   const ticket = await client.tickets.create({
 *     title: 'Fix login issue',
 *     priority: 'high'
 *   });
 *   console.log('Created ticket:', ticket.id);
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(`API Error: ${error.message} (${error.code})`);
 *   }
 * }
 * ```
 */

// Main client
export { CodimirClient, createCodimirClient } from './client';

// Core types
export type {
  // Domain types
  Ticket,
  TicketId,
  ProjectId,
  UserId,
  ISODate,
  TicketStatus,
  TicketPriority,
  
  // Input/Output types
  CreateTicketInput,
  UpdateTicketInput,
  ListTicketsParams,
  PaginatedResponse,
  
  // Event types
  CodimirEvent,
  ConnectionEvent,
  HeartbeatEvent,
  TicketUpdatedEvent,
  
  // Configuration types
  TransportOptions,
  SSEOptions,
  EventHandler,
  ApiErrorResponse,
} from './types';

// Error handling
export { ApiError } from './errors';

// Real-time events
export { subscribeSSE, subscribeTypedEvents } from './realtime/sse';

// API classes (for advanced usage)
export { TicketsApi } from './endpoints/tickets';
export { Transport } from './transport';

// Version information
export const SDK_VERSION = '0.1.0';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  timeoutMs: 15000,
  retry: {
    attempts: 2,
    minDelayMs: 300,
    factor: 2,
  },
} as const;
