import { useState, useEffect, useCallback } from 'react';
import { 
  roomsApi, 
  bookingsApi, 
  dashboardApi,
  usersApi,
  Room, 
  Booking, 
  User,
  DashboardOverview, 
  RoomSummary, 
  BookingSummary,
  BookingStatus,
  CreateRoomDto,
  UpdateRoomDto,
  CreateBookingDto,
  UpdateBookingDto,
  UpdateUserDto,
  ApproveUserDto,
  ApiError
} from '@/lib/api';

// Generic hook for API calls with loading and error states
function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// Rooms hooks
export function useRooms() {
  return useApiCall(() => roomsApi.getAll());
}

export function useRoom(id: number) {
  return useApiCall(() => roomsApi.getById(id), [id]);
}

export function useAvailableRooms(startTime: string, endTime: string) {
  return useApiCall(() => roomsApi.getAvailable(startTime, endTime), [startTime, endTime]);
}

export function useCreateRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = useCallback(async (data: CreateRoomDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await roomsApi.create(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create room';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createRoom, loading, error };
}

export function useUpdateRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRoom = useCallback(async (id: number, data: UpdateRoomDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await roomsApi.update(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update room';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateRoom, loading, error };
}

export function useToggleRoomMaintenance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMaintenance = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await roomsApi.toggleMaintenance(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to toggle room maintenance';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { toggleMaintenance, loading, error };
}

export function useDeleteRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRoom = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await roomsApi.delete(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete room';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteRoom, loading, error };
}

// Bookings hooks
export function useBookings(filters?: {
  roomId?: number;
  startDate?: string;
  endDate?: string;
  status?: 'approved' | 'upcoming' | 'pending';
}) {
  return useApiCall(() => bookingsApi.getAll(filters), [filters]);
}

export function usePendingBookings() {
  return useApiCall(() => bookingsApi.getPending());
}

export function useBooking(id: number) {
  return useApiCall(() => bookingsApi.getById(id), [id]);
}

export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (data: CreateBookingDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.create(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createBooking, loading, error };
}

export function useUpdateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBooking = useCallback(async (id: number, data: UpdateBookingDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.update(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateBooking, loading, error };
}

export function useApproveBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveBooking = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.approve(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to approve booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { approveBooking, loading, error };
}

export function useRejectBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectBooking = useCallback(async (id: number, rejectionReason: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.reject(id, rejectionReason);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to reject booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { rejectBooking, loading, error };
}

export function useCompleteBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeBooking = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.complete(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to complete booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { completeBooking, loading, error };
}

export function useCancelBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBooking = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.cancel(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to cancel booking';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cancelBooking, loading, error };
}

// Dashboard hooks
export function useDashboardOverview() {
  return useApiCall(() => dashboardApi.getOverview());
}

export function useRoomsSummary() {
  return useApiCall(() => dashboardApi.getRoomsSummary());
}

export function useBookingsSummary() {
  return useApiCall(() => dashboardApi.getBookingsSummary());
}

// Room Status hooks - Removed since room status is now calculated from bookings

// User hooks (Admin only)
export function useUsers() {
  return useApiCall(() => usersApi.getAll());
}

export function usePendingUsers() {
  return useApiCall(() => usersApi.getPending());
}

export function useUser(id: number) {
  return useApiCall(() => usersApi.getById(id), [id]);
}

// User management hooks with actions
export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(async (id: number, data: UpdateUserDto) => {
    try {
      setLoading(true);
      setError(null);
      return await usersApi.update(id, data);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateUser, loading, error };
}

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await usersApi.delete(id);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteUser, loading, error };
}

export function useApproveUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveUser = useCallback(async (id: number, data: ApproveUserDto) => {
    try {
      setLoading(true);
      setError(null);
      return await usersApi.approve(id, data);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { approveUser, loading, error };
}

// Utility hook for managing multiple API calls
export function useMultipleApiCalls<T extends Record<string, any>>(
  calls: T
): { [K in keyof T]: ReturnType<typeof useApiCall> } {
  const results = {} as { [K in keyof T]: ReturnType<typeof useApiCall> };
  
  for (const [key, call] of Object.entries(calls)) {
    results[key as keyof T] = useApiCall(call);
  }
  
  return results;
}
