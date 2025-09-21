export const BOOKINGS_CHANGED_EVENT = 'bookings:changed';

export function emitBookingsChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BOOKINGS_CHANGED_EVENT));
  }
}

export function onBookingsChanged(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = () => handler();
  window.addEventListener(BOOKINGS_CHANGED_EVENT, listener);
  return () => window.removeEventListener(BOOKINGS_CHANGED_EVENT, listener);
}


