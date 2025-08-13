import type { SSEOptions, EventHandler, CodimirEvent } from '../types';

/**
 * Subscribe to Server-Sent Events from the Codimir API.
 * Works in both browser and Node.js environments.
 * 
 * @param options - SSE connection options
 * @param onMessage - Message handler function
 * @returns Cleanup function to close the connection
 * 
 * @example
 * ```typescript
 * const unsubscribe = subscribeSSE(
 *   { url: 'https://api.codimir.dev/api/v1/events/stream' },
 *   (event) => {
 *     const data = JSON.parse(event.data);
 *     console.log('Received event:', data);
 *   }
 * );
 * 
 * // Later, cleanup
 * unsubscribe();
 * ```
 */
export function subscribeSSE(options: SSEOptions, onMessage: EventHandler): () => void {
  // Check if we're in a browser environment
  if (typeof EventSource !== 'undefined') {
    return subscribeBrowserSSE(options, onMessage);
  } else {
    // For Node.js, we'd need a polyfill or custom implementation
    return subscribeNodeSSE(options, onMessage);
  }
}

/**
 * Browser-specific SSE implementation using EventSource.
 */
function subscribeBrowserSSE(options: SSEOptions, onMessage: EventHandler): () => void {
  const url = new URL(options.url);
  
  // Add token as query parameter if provided (alternative to auth header)
  if (options.token) {
    url.searchParams.set('token', options.token);
  }

  const eventSource = new EventSource(url.toString(), {
    withCredentials: !options.token, // Use cookies if no token provided
  });

  // Handle all message types
  eventSource.onmessage = onMessage;
  
  // Handle specific event types
  eventSource.addEventListener('connection', onMessage);
  eventSource.addEventListener('heartbeat', onMessage);
  eventSource.addEventListener('ticket', onMessage);

  // Handle errors
  eventSource.onerror = (error) => {
    console.warn('SSE connection error:', error);
    // EventSource automatically reconnects, so we don't need to handle this manually
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

/**
 * Node.js-specific SSE implementation using fetch with streaming.
 * This is a simplified implementation - for production use, consider using a proper SSE client library.
 */
function subscribeNodeSSE(options: SSEOptions, onMessage: EventHandler): () => void {
  let controller: AbortController | null = new AbortController();
  let isActive = true;

  const connect = async () => {
    try {
      const headers: Record<string, string> = {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      };

      if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
      }

      const response = await fetch(options.url, {
        headers,
        signal: controller?.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (isActive) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            try {
              // Create a mock MessageEvent-like object
              const mockEvent = {
                data,
                type: 'message',
                lastEventId: '',
                origin: new URL(options.url).origin,
              } as MessageEvent;
              
              onMessage(mockEvent);
            } catch (error) {
              console.warn('Error parsing SSE data:', error);
            }
          }
        }
      }
    } catch (error) {
      if (isActive && error instanceof Error && error.name !== 'AbortError') {
        console.warn('SSE connection error:', error);
        // Attempt to reconnect after a delay
        if (isActive) {
          setTimeout(() => {
            if (isActive) {
              connect();
            }
          }, 5000);
        }
      }
    }
  };

  // Start the connection
  connect();

  // Return cleanup function
  return () => {
    isActive = false;
    if (controller) {
      controller.abort();
      controller = null;
    }
  };
}

/**
 * Typed event subscription helper that parses events and provides type safety.
 * 
 * @param options - SSE connection options
 * @param onEvent - Typed event handler
 * @returns Cleanup function
 * 
 * @example
 * ```typescript
 * const unsubscribe = subscribeTypedEvents(
 *   { url: 'https://api.codimir.dev/api/v1/events/stream' },
 *   (event) => {
 *     switch (event.type) {
 *       case 'connected':
 *         console.log('Connected:', event.message);
 *         break;
 *       case 'ticket_updated':
 *         console.log('Ticket updated:', event.data.ticketId);
 *         break;
 *       case 'heartbeat':
 *         // Handle heartbeat
 *         break;
 *     }
 *   }
 * );
 * ```
 */
export function subscribeTypedEvents(
  options: SSEOptions,
  onEvent: (event: CodimirEvent) => void
): () => void {
  return subscribeSSE(options, (messageEvent) => {
    try {
      const parsedEvent = JSON.parse(messageEvent.data) as CodimirEvent;
      onEvent(parsedEvent);
    } catch (error) {
      console.warn('Failed to parse SSE event:', error, messageEvent.data);
    }
  });
}
