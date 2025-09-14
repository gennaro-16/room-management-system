'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Room, Booking, BookingStatus } from '@/lib/api';

// State types
interface AppState {
  rooms: Room[];
  bookings: Booking[];
  selectedRoom: Room | null;
  selectedBooking: Booking | null;
  filters: {
    bookingStatus: BookingStatus | 'all';
    searchTerm: string;
    dateRange: {
      start: string | null;
      end: string | null;
    };
  };
  ui: {
    sidebarOpen: boolean;
    activeSection: string;
    loading: boolean;
    error: string | null;
  };
}

// Action types
type AppAction =
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'SET_SELECTED_ROOM'; payload: Room | null }
  | { type: 'SET_SELECTED_BOOKING'; payload: Booking | null }
  | { type: 'SET_BOOKING_STATUS_FILTER'; payload: BookingStatus | 'all' }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_DATE_RANGE'; payload: { start: string | null; end: string | null } }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_ACTIVE_SECTION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  rooms: [],
  bookings: [],
  selectedRoom: null,
  selectedBooking: null,
  filters: {
    bookingStatus: 'all',
    searchTerm: '',
    dateRange: {
      start: null,
      end: null,
    },
  },
  ui: {
    sidebarOpen: false,
    activeSection: 'dashboard',
    loading: false,
    error: null,
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    
    case 'SET_SELECTED_ROOM':
      return { ...state, selectedRoom: action.payload };
    
    case 'SET_SELECTED_BOOKING':
      return { ...state, selectedBooking: action.payload };
    
    
    case 'SET_BOOKING_STATUS_FILTER':
      return {
        ...state,
        filters: { ...state.filters, bookingStatus: action.payload },
      };
    
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        filters: { ...state.filters, searchTerm: action.payload },
      };
    
    case 'SET_DATE_RANGE':
      return {
        ...state,
        filters: { ...state.filters, dateRange: action.payload },
      };
    
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: action.payload },
      };
    
    case 'SET_ACTIVE_SECTION':
      return {
        ...state,
        ui: { ...state.ui, activeSection: action.payload },
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        ui: { ...state.ui, error: action.payload },
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          bookingStatus: 'all',
          searchTerm: '',
          dateRange: { start: null, end: null },
        },
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Selector hooks for specific parts of state
export function useRooms() {
  const { state } = useApp();
  return state.rooms;
}

export function useBookings() {
  const { state } = useApp();
  return state.bookings;
}

export function useSelectedRoom() {
  const { state } = useApp();
  return state.selectedRoom;
}

export function useSelectedBooking() {
  const { state } = useApp();
  return state.selectedBooking;
}

export function useFilters() {
  const { state } = useApp();
  return state.filters;
}

export function useUI() {
  const { state } = useApp();
  return state.ui;
}

// Action creators
export function useAppActions() {
  const { dispatch } = useApp();

  return {
    setRooms: (rooms: Room[]) => dispatch({ type: 'SET_ROOMS', payload: rooms }),
    setBookings: (bookings: Booking[]) => dispatch({ type: 'SET_BOOKINGS', payload: bookings }),
    setSelectedRoom: (room: Room | null) => dispatch({ type: 'SET_SELECTED_ROOM', payload: room }),
    setSelectedBooking: (booking: Booking | null) => dispatch({ type: 'SET_SELECTED_BOOKING', payload: booking }),
    setBookingStatusFilter: (status: BookingStatus | 'all') => dispatch({ type: 'SET_BOOKING_STATUS_FILTER', payload: status }),
    setSearchTerm: (term: string) => dispatch({ type: 'SET_SEARCH_TERM', payload: term }),
    setDateRange: (start: string | null, end: string | null) => dispatch({ type: 'SET_DATE_RANGE', payload: { start, end } }),
    setSidebarOpen: (open: boolean) => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open }),
    setActiveSection: (section: string) => dispatch({ type: 'SET_ACTIVE_SECTION', payload: section }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearFilters: () => dispatch({ type: 'CLEAR_FILTERS' }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  };
}
