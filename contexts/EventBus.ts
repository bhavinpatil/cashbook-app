// contexts/EventBus.ts

/** 
 * Define all valid event categories here.
 * Add new ones as your app grows (e.g., "books", "businesses", etc.)
 */
export type EventType = 'transactions' | 'books' | 'businesses' | 'categories';

type EventCallback = () => void;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /** Emit an update event for a specific data type */
  emitUpdate(type: EventType) {
    const eventKey = `update:${type}`;
    const callbacks = this.listeners.get(eventKey);
    if (callbacks) {
      callbacks.forEach((cb) => cb());
    }
  }

  /** Listen for updates to a specific data type */
  onUpdate(type: EventType, callback: EventCallback) {
    const eventKey = `update:${type}`;
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, new Set());
    }
    this.listeners.get(eventKey)!.add(callback);

    // Return cleanup function
    return () => {
      this.listeners.get(eventKey)?.delete(callback);
    };
  }
}

export const eventBus = new EventBus();
