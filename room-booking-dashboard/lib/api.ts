// API client for connecting to NestJS backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Authentication types
export interface User {
  id: number;
  employeeId: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  title?: string;
  phone?: string;
  departmentId?: number | null;
  department?: { id: number; name: string } | null;
  isActive: boolean;
  isApproved: boolean;
  approvedById?: number | null;
  approvedAt?: string | null;
  rejectedById?: number | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'GUEST';
export type RoomStatus = 'FREE' | 'BUSY' | 'MAINTENANCE';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  employeeId: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title?: string;
  phone?: string;
  departmentId?: number;
  role?: UserRole;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// Types matching the NestJS API
export interface Room {
  id: number;
  name: string;
  capacity: number;
  description?: string;
  amenities: string[];
  floor: number;
  building?: string; // Optional - excluded from API responses
  departmentId?: number | null;
  department?: Department;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  status: RoomStatus;
  isUnderMaintenance: boolean;
  maintenanceNotes?: string;
  isAvailable?: boolean;
  currentBooking?: Booking;
  createdAt: string;
  updatedAt: string;
  bookings?: Booking[];
}

// Department types
export interface Department {
  id: number;
  name: string;
  description?: string | null;
  floor?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  floor?: number;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string | null;
  floor?: number | null;
}

export interface Booking {
  id: number;
  roomId: number;
  room?: Room;
  organizerId: number;
  organizer?: User;
  title: string;
  purpose: string;
  agenda?: string | null;
  expectedAttendees: number;
  internalAttendees?: string[]; // names of internal participants
  externalAttendees?: string[];
  requiredAmenities?: string[];
  isRecurring?: boolean;
  recurrenceRule?: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  approvedById?: number | null;
  approvedAt?: string;
  rejectedById?: number | null;
  rejectedAt?: string;
  rejectionReason?: string;
  approvedBy?: User;
  rejectedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'ONGOING';

export interface CreateRoomDto {
  name: string;
  capacity: number;
  description?: string;
  amenities: string[];
  floor: number;
  building?: string;
  departmentId?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isUnderMaintenance?: boolean;
  maintenanceNotes?: string;
}

export interface UpdateRoomDto {
  name?: string;
  capacity?: number;
  description?: string;
  amenities?: string[];
  floor?: number;
  building?: string;
  departmentId?: number | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isUnderMaintenance?: boolean;
  maintenanceNotes?: string | null;
}

export interface CreateBookingDto {
  roomId: number;
  title: string;
  purpose: string;
  agenda?: string;
  startTime: string;
  endTime: string;
  expectedAttendees: number;
  internalAttendees?: string[]; // names
  externalAttendees?: string[];
  requiredAmenities?: string[];
  isRecurring?: boolean;
  recurrenceRule?: string;
}

export interface UpdateBookingDto {
  roomId?: number;
  title?: string;
  purpose?: string;
  agenda?: string;
  startTime?: string;
  endTime?: string;
  expectedAttendees?: number;
  internalAttendees?: string[]; // names
  externalAttendees?: string[];
  requiredAmenities?: string[];
  isRecurring?: boolean;
  recurrenceRule?: string;
  status?: BookingStatus;
}

export interface MoveBookingDto {
  newRoomId: number;
  startTime?: string;
  endTime?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  phone?: string;
  departmentId?: number | null;
  role?: UserRole;
  isActive?: boolean;
  isApproved?: boolean;
}

export interface ApproveUserDto {
  isApproved: boolean;
  rejectionReason?: string;
}

export interface DashboardOverview {
  totalRooms: number;
  totalBookings: number;
  activeBookings: number;
  roomsByStatus: Array<{
    status: RoomStatus;
    count: number;
  }>;
  bookingsByStatus: Array<{
    status: BookingStatus;
    count: number;
  }>;
}

export interface RoomSummary {
  id: number;
  name: string;
  capacity: number;
  status: RoomStatus;
  currentBookings: number;
  isAvailable: boolean;
}

export interface DashboardBookingItem {
  id: number;
  user: string;
  room: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  purpose?: string;
}

export interface BookingSummary {
  todayBookings: DashboardBookingItem[];
  upcomingBookings: DashboardBookingItem[];
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
};

// // Visitors API
// export interface VisitBooking {
//   id: number;
//   title: string;
//   room: { id?: number; name: string };
//   organizer: { id?: number; firstName: string; lastName: string };
// }

// export interface VisitItem {
//   id: number;
//   checkedIn: string; // ISO string from backend
//   checkedOut?: string | null;
//   purpose?: string | null;
//   bookingId: number;
//   booking: VisitBooking;
//   visitorId: number;
// }

// export interface VisitorItem {
//   id: number;
//   firstName: string;
//   lastName: string;
//   email?: string | null;
//   phone?: string | null;
//   visits: VisitItem[];
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface CreateVisitorDto {
//   firstName: string;
//   lastName: string;
//   email?: string;
//   phone?: string;
// }

// export interface UpdateVisitorDtoFront {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   phone?: string;
// }

// export interface CreateVisitDto {
//   bookingId: number;
//   checkedIn?: string; // ISO
//   purpose?: string;
// }

// export const visitorsApi = {
//   getAll: (
//     params?: { search?: string; status?: 'active' | 'checkedout' | 'all'; date?: string }
//   ): Promise<VisitorItem[]> => {
//     const qs = new URLSearchParams();
//     if (params?.search) qs.set('search', params.search);
//     if (params?.status) qs.set('status', params.status);
//     if (params?.date) qs.set('date', params.date);
//     const query = qs.toString();
//     return apiRequest<VisitorItem[]>(`/visitors${query ? `?${query}` : ''}`);
//   },

//   getById: (id: number): Promise<VisitorItem> => apiRequest<VisitorItem>(`/visitors/${id}`),

//   create: (data: CreateVisitorDto): Promise<VisitorItem> =>
//     apiRequest<VisitorItem>('/visitors', { method: 'POST', body: JSON.stringify(data) }),

//   update: (id: number, data: UpdateVisitorDtoFront): Promise<VisitorItem> =>
//     apiRequest<VisitorItem>(`/visitors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

//   createVisit: (visitorId: number, data: CreateVisitDto): Promise<VisitItem> =>
//     apiRequest<VisitItem>(`/visitors/${visitorId}/visits`, { method: 'POST', body: JSON.stringify(data) }),

//   checkout: (visitId: number): Promise<VisitItem> =>
//     apiRequest<VisitItem>(`/visitors/visits/${visitId}/checkout`, { method: 'PATCH' }),
// };
export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        // Just clear token; let route guards/components decide navigation
        setAuthToken(null);
      }
      
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response.statusText
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      'Network Error'
    );
  }
}

// Enhanced Conflict Resolution Types
export interface ConflictInfo {
  hasConflict: boolean;
  conflictingBookings: Array<{
    id: number;
    title: string;
    organizer: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  conflictReason?: string;
}

export interface AlternativeSuggestion {
  roomId: number;
  roomName: string;
  suggestedStartTime: string;
  suggestedEndTime: string;
  capacity: number;
  available: boolean;
  reason: 'same_time_different_room' | 'time_shift_same_room' | 'time_shift_different_room';
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface ConflictResolutionResult {
  bookingId: number;
  status: 'APPROVED' | 'CONFLICT' | 'REJECTED';
  alternatives: AlternativeSuggestion[];
  conflictInfo?: ConflictInfo;
  rejectionReason?: string;
}

// Conflicts API
export const conflictsApi = {
  // Basic conflicts API
  getConflictingBookings: () => apiRequest<{
    conflictingBookings: any[];
    rejectedBookings: any[];
  }>('/conflicts/bookings', {
    method: 'GET',
  }),
  
  checkBookingConflicts: (bookingId: number) => apiRequest<{
    booking: any;
    conflictInfo: any;
    alternatives: any[];
  }>(`/conflicts/check/${bookingId}`, {
    method: 'GET',
  }),
  
  resolveConflict: (bookingId: number, data: {
    alternativeRoomId: number;
    alternativeStartTime: string;
    alternativeEndTime: string;
  }) => apiRequest(`/conflicts/resolve/${bookingId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Enhanced conflicts API
  processBookingConflict: (data: {
    roomId: number;
    startTime: string;
    endTime: string;
    requiredCapacity: number;
  }) => apiRequest<ConflictResolutionResult>('/conflicts/process', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getEnhancedConflictAnalysis: (bookingId: number) => apiRequest<ConflictResolutionResult>(`/conflicts/enhanced/${bookingId}`, {
    method: 'GET',
  }),

  findAlternatives: (data: {
    roomId: number;
    startTime: string;
    endTime: string;
    requiredCapacity: number;
    excludeBookingId?: number;
  }) => apiRequest<AlternativeSuggestion[]>('/conflicts/alternatives', {
    method: 'GET',
    body: JSON.stringify(data),
  }),
};

// Authentication API
export const authApi = {
  // Login
  login: (data: LoginDto): Promise<AuthResponse> => {
    console.log('authApi.login called with data:', data);
    console.log('Sending to backend:', JSON.stringify(data));
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Register
  register: (data: RegisterDto): Promise<User> => {
    return apiRequest<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get current user profile
  getProfile: (): Promise<User> => {
    return apiRequest<User>('/auth/profile');
  },

  // Logout (client-side only)
  logout: () => {
    setAuthToken(null);
  },
};

// Users API (Admin only)
export const usersApi = {
  // Get all users
  getAll: (): Promise<User[]> => {
    return apiRequest<User[]>('/users');
  },

  // Get user by ID
  getById: (id: number): Promise<User> => {
    return apiRequest<User>(`/users/${id}`);
  },

  // Update user
  update: (id: number, data: UpdateUserDto): Promise<User> => {
    return apiRequest<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete user
  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Deactivate user
  deactivate: (id: number): Promise<User> => {
    return apiRequest<User>(`/users/${id}/deactivate`, {
      method: 'PATCH',
    });
  },

  // Get pending users (Super Admin only)
  getPending: (): Promise<User[]> => {
    return apiRequest<User[]>('/users/pending', {
      method: 'GET',
    });
  },

  // Approve or reject user (Super Admin only)
  approve: (id: number, data: ApproveUserDto): Promise<User> => {
    return apiRequest<User>(`/users/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Rooms API
export const roomsApi = {
  // Get all rooms
  getAll: (status?: RoomStatus): Promise<Room[]> => {
    const params = status ? `?status=${status}` : '';
    return apiRequest<Room[]>(`/rooms${params}`);
  },

  // Get room by ID
  getById: (id: number): Promise<Room> => {
    return apiRequest<Room>(`/rooms/${id}`);
  },

  // Get available rooms for time period
  getAvailable: (startTime: string, endTime: string): Promise<Room[]> => {
    return apiRequest<Room[]>(
      `/rooms/available?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
    );
  },

  // Create room
  create: (data: CreateRoomDto): Promise<Room> => {
    return apiRequest<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update room
  update: (id: number, data: UpdateRoomDto): Promise<Room> => {
    return apiRequest<Room>(`/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Toggle maintenance status
  toggleMaintenance: (id: number): Promise<Room> => {
    return apiRequest<Room>(`/rooms/${id}/maintenance`, {
      method: 'PATCH',
    });
  },

  // Check room availability
  getAvailability: (id: number, startTime: string, endTime: string): Promise<{
    isAvailable: boolean;
    reason: string;
    conflictingBooking?: Booking;
  }> => {
    return apiRequest<{
      isAvailable: boolean;
      reason: string;
      conflictingBooking?: Booking;
    }>(`/rooms/${id}/availability?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`);
  },

  // Delete room
  delete: (id: number): Promise<Room> => {
    return apiRequest<Room>(`/rooms/${id}`, {
      method: 'DELETE',
    });
  },
};

// Bookings API
export const bookingsApi = {
  // Get all bookings with optional filters
  getAll: (filters?: {
    roomId?: number;
    startDate?: string;
    endDate?: string;
    status?: 'approved' | 'upcoming' | 'pending';
    organizerId?: number;
  }): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (filters?.roomId) params.append('roomId', filters.roomId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.organizerId) params.append('organizerId', filters.organizerId.toString());

    const queryString = params.toString();
    return apiRequest<Booking[]>(`/bookings${queryString ? `?${queryString}` : ''}`);
  },

  // Get pending bookings (Admin only)
  getPending: (): Promise<Booking[]> => {
    return apiRequest<Booking[]>('/bookings/pending');
  },

  // Get booking by ID
  getById: (id: number): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}`);
  },

  // Create booking
  create: (data: CreateBookingDto): Promise<Booking> => {
    return apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update booking
  update: (id: number, data: UpdateBookingDto): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Move booking: create a new booking in another room and cancel old
  move: (id: number, data: MoveBookingDto): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Approve booking (Admin only)
  approve: (id: number): Promise<Booking> => {
    return apiRequest<Booking>(`/approvals/bookings/${id}`, {
      method: 'POST',
      body: JSON.stringify({ status: 'APPROVED' as BookingStatus }),
    });
  },

  // Reject booking (Admin only)
  reject: (id: number, rejectionReason: string): Promise<Booking> => {
    return apiRequest<Booking>(`/approvals/bookings/${id}`, {
      method: 'POST',
      body: JSON.stringify({ status: 'REJECTED' as BookingStatus, rejectionReason }),
    });
  },

  // Complete booking
  complete: (id: number): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}/complete`, {
      method: 'PATCH',
    });
  },

  // Cancel booking
  cancel: (id: number): Promise<Booking> => {
    return apiRequest<Booking>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    });
  },
};

// Dashboard API
export const dashboardApi = {
  // Get overview statistics
  getOverview: (): Promise<DashboardOverview> => {
    return apiRequest<DashboardOverview>('/dashboard/overview');
  },

  // Get rooms summary
  getRoomsSummary: (): Promise<RoomSummary[]> => {
    return apiRequest<RoomSummary[]>('/dashboard/rooms-summary');
  },

  // Get bookings summary
  getBookingsSummary: (): Promise<BookingSummary> => {
    return apiRequest<BookingSummary>('/dashboard/bookings-summary');
  },
};

// Departments API
export const departmentsApi = {
  getAll: (): Promise<Department[]> => apiRequest<Department[]>('/departments'),
  getPublic: (): Promise<Department[]> => apiRequest<Department[]>('/departments/public'),
  getById: (id: number): Promise<Department> => apiRequest<Department>(`/departments/${id}`),
  create: (data: CreateDepartmentDto): Promise<Department> =>
    apiRequest<Department>('/departments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UpdateDepartmentDto): Promise<Department> =>
    apiRequest<Department>(`/departments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: number): Promise<void> =>
    apiRequest<void>(`/departments/${id}`, { method: 'DELETE' }),
};

// Room Status API - Removed since room status is now calculated from bookings

// Calendar API
export const calendarApi = {
  // Get bookings for a specific date range
  getBookingsForDateRange: (startDate: string, endDate: string, roomId?: number): Promise<Booking[]> => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (roomId) params.append('roomId', roomId.toString());
    
    return apiRequest<Booking[]>(`/bookings?${params.toString()}`);
  },

  // Get bookings for a specific month
  getBookingsForMonth: (year: number, month: number, roomId?: number): Promise<Booking[]> => {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
    return calendarApi.getBookingsForDateRange(startDate, endDate, roomId);
  },

  // Get bookings for a specific week
  getBookingsForWeek: (startOfWeek: string, roomId?: number): Promise<Booking[]> => {
    const startDate = new Date(startOfWeek);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    return calendarApi.getBookingsForDateRange(startDate.toISOString(), endDate.toISOString(), roomId);
  },

  // Get bookings for a specific day
  getBookingsForDay: (date: string, roomId?: number): Promise<Booking[]> => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return calendarApi.getBookingsForDateRange(startDate.toISOString(), endDate.toISOString(), roomId);
  },

  // Get room availability for a time slot
  getRoomAvailability: (startTime: string, endTime: string): Promise<Room[]> => {
    return apiRequest<Room[]>(
      `/rooms/available?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
    );
  },
};

// Utility functions
export const apiUtils = {
  // Format date for API
  formatDateForApi: (date: Date): string => {
    return date.toISOString();
  },

  // Format date for display
  formatDateForDisplay: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  },

  // Format time for display
  formatTimeForDisplay: (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },

  // Check if booking is active now
  isBookingActive: (startTime: string, endTime: string): boolean => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now <= end;
  },

  // Check if booking is upcoming
  isBookingUpcoming: (startTime: string): boolean => {
    const now = new Date();
    const start = new Date(startTime);
    return start > now;
  },

  // Get status color class using Al Baraka colors
  getStatusColor: (status: BookingStatus): string => {
    switch (status) {
      case 'PENDING':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'APPROVED':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-gray-50 text-gray-800 border-gray-200';
      case 'CANCELLED':
        return 'bg-slate-50 text-slate-800 border-slate-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  },

  // Get role color class using Al Baraka colors
  getRoleColor: (role: UserRole): string => {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'EMPLOYEE':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'EMPLOYEE':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'GUEST':
        return 'bg-gray-50 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  },
};


export type CreateVisitorDto = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

export type UpdateVisitorDtoFront = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type Visit = {
  id: number;
  checkedIn: string;
  checkedOut?: string;
  purpose?: string;
  booking?: any;
  visitor?: any;
};

export type VisitorItem = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  visits: Visit[];
};

export type PaginatedVisitsResponse = {
  data: Visit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateVisitorWithVisitDto = {
  visitorId?: number; // visiteur existant
  firstName?: string; // requis si pas de visitorId
  lastName?: string;  // requis si pas de visitorId
  email?: string;
  phone?: string;
  purpose: string;
  bookingId?: number;
};

export const visitorsApi = {
  // Récupérer toutes les visites d’un visiteur
  async getAllVisitsOfVisitor(visitorId: number): Promise<VisitorItem> {
    return apiRequest<VisitorItem>(`/visitors/${visitorId}/visits`);
  },

  // Créer un visiteur avec une visite
  async createVisitorWithVisit(payload: CreateVisitorWithVisitDto) {
    return apiRequest(`/visitors/visit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Récupérer tous les visiteurs (avec pagination + filtres)
  async getAll({
    startDate,
    endDate,
    status,
    search,
    room,
    department,
    page = 1,
    limit = 8,
  }: {
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
    room?: string;
    department?: string;
    page?: number;
    limit?: number;
  }): Promise<{ visitors: VisitorItem[]; pagination: Omit<PaginatedVisitsResponse, "data"> }> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    if (status === "isActive" || status === "isCheckedOut") {
      params.append("status", status);
    }

    if (search) params.append("visitorName", search);
    if (room) params.append("room", room);
    if (department) params.append("department", department);

    console.log("Fetching visits with params:", params.toString());

    const json = await apiRequest<PaginatedVisitsResponse>(`/visits?${params.toString()}`);
    const visits = json.data;
console.log("visits",visits);
    const visitorMap: Record<number, VisitorItem> = {};
    for (const visit of visits) {
      const v = visit.visitor;
      if (!v) continue;
      if (!visitorMap[v.id]) {
        visitorMap[v.id] = { ...v, visits: [] };
      }
      visitorMap[v.id].visits.push(visit);
    }

    return {
      visitors: Object.values(visitorMap),
      pagination: {
        total: json.total,
        page: json.page,
        limit: json.limit,
        totalPages: json.totalPages,
      },
    };
  },

  // Créer un visiteur
  async create(data: CreateVisitorDto): Promise<VisitorItem> {
    return apiRequest<VisitorItem>(`/visitors`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Mettre à jour un visiteur
  async update(id: number, data: UpdateVisitorDtoFront): Promise<VisitorItem> {
    return apiRequest<VisitorItem>(`/visitors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Créer une visite pour un visiteur
  async createVisit(
    visitorId: number,
    data: { bookingId?: number; checkedIn: string; purpose?: string }
  ): Promise<Visit> {
    return apiRequest<Visit>(`/visits`, {
      method: "POST",
      body: JSON.stringify({
        visitorId,
        bookingId: data.bookingId,
        checkedIn: data.checkedIn,
        purpose: data.purpose,
      }),
    });
  },

  // Checkout d’un visiteur
  async checkout(visitId: number): Promise<Visit> {
    return apiRequest<Visit>(`/visits/${visitId}/checkout`, {
      method: "PATCH",
    });
  },
    // 🔹 Récupérer les filtres (rooms + departments)
  async getFilters(): Promise<{ rooms: string[]; departments: string[] }> {
    return apiRequest<{ rooms: string[]; departments: string[] }>(`/visits/filters`)
  },
};

export interface StatsData {
  dailyStats: Array<{ date: string; visitors: number; avgDuration: number }>
  monthlyStats: Array<{ month: string; visitors: number; avgDuration: number }>
  yearlyStats: Array<{ year: string; visitors: number; avgDuration: number }>
  peakHours: Array<{ hour: string; visitors: number }>
  departmentStats: Array<{ department: string; visitors: number; percentage: number }>
  roomStats: Array<{ room: string; visitors: number; percentage: number }>
  purposeStats: Array<{ purpose: string; visitors: number; percentage: number }>
  summary: {
    totalVisitors: number
    avgVisitDuration: number
    avgDailyVisitors: number
    peakHour: string
    mostVisitedDepartment: string
    mostVisitedRoom: string
  }
}

export const statisticsApi = {
  async getVisitorStats({
    timeRange,
    startDate,
    endDate,
  }: {
    timeRange: "day" | "month" | "year" | "custom"
    startDate?: string
    endDate?: string
  }): Promise<StatsData> {
    const params = new URLSearchParams()
    params.append("timeRange", timeRange)

    if (timeRange === "custom") {
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
    }

    return apiRequest<StatsData>(`/statistics/visitors?${params.toString()}`)
  },
}