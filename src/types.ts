/**
 * Core domain types for Codimir SDK.
 * These match the API response formats and existing frontend interfaces.
 */

// Branded types for better type safety
export type TicketId = string & { __brand: "TicketId" };
export type ProjectId = string & { __brand: "ProjectId" };
export type UserId = string & { __brand: "UserId" };
export type ISODate = string & { __brand: "ISODate" };

// Ticket status and priority enums matching the API
export type TicketStatus = "open" | "in-progress" | "review" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

// Core Ticket interface matching your existing structure
export interface Ticket {
  id: TicketId;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  reporter: string;
  createdAt: ISODate;
  updatedAt: ISODate;
  dueDate?: ISODate;
  labels: string[];
  sprint?: string;
  comments: number;
  linkedPRs: number;
}

// Input types for creating/updating tickets
export interface CreateTicketInput {
  title: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee?: string;
  reporter?: string;
  dueDate?: string;
  labels?: string[];
  sprint?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee?: string;
  reporter?: string;
  dueDate?: string;
  labels?: string[];
  sprint?: string;
}

// Pagination and listing
export interface ListTicketsParams {
  projectId?: ProjectId;
  cursor?: string;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignee?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  total?: number;
}

// Event types for real-time updates
export interface BaseEvent {
  type: string;
  timestamp: ISODate;
}

export interface ConnectionEvent extends BaseEvent {
  type: "connected";
  message: string;
  userId: UserId;
}

export interface HeartbeatEvent extends BaseEvent {
  type: "heartbeat";
}

export interface TicketUpdatedEvent extends BaseEvent {
  type: "ticket_updated";
  data: {
    ticketId: TicketId;
    changes: string[];
    updatedBy: string;
    timestamp: ISODate;
  };
}

export type CodimirEvent = ConnectionEvent | HeartbeatEvent | TicketUpdatedEvent;

// Error types
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Event handler types
export type EventHandler = (event: MessageEvent) => void;

// SSE subscription options
export interface SSEOptions {
  url: string;
  token?: string;
}

// Transport configuration
export interface TransportOptions {
  baseUrl: string;
  getToken?: () => Promise<string | undefined> | string | undefined;
  fetch?: typeof fetch;
  timeoutMs?: number;
  retry?: {
    attempts: number;
    minDelayMs: number;
    factor: number;
  };
}
