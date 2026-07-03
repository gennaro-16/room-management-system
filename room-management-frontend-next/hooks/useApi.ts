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
import { departmentsApi, Department, CreateDepartmentDto, UpdateDepartmentDto } from '@/lib/api';

// Generic hook for API calls with loading and error states
function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    if (!enabled) {
      return;
    }
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
    if (enabled) {
      execute();
    } else {
      setLoading(false);
    }
  }, [execute, enabled]);

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
  // Stabilize dependency to avoid infinite loops caused by object identity changes
  const stableKey = JSON.stringify(filters || {});
  return useApiCall(() => bookingsApi.getAll(filters), [stableKey]);
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
      let errorMessage = 'Échec de la création de la réservation';
      
      if (err instanceof ApiError) {
        // Translate specific error messages to French
        if (err.message.includes('Room is already booked for this time period')) {
          errorMessage = 'Il y a une réservation dans ce temps choisi, choisissez un autre svp';
        } else if (err.message.includes('Room is under maintenance')) {
          errorMessage = 'La salle est en maintenance et ne peut pas être réservée';
        } else if (err.message.includes('End time must be after start time')) {
          errorMessage = 'L\'heure de fin doit être après l\'heure de début';
        } else if (err.message.includes('Cannot book rooms in the past')) {
          errorMessage = 'Impossible de réserver des salles dans le passé';
        } else {
          errorMessage = err.message;
        }
      }
      
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
export function useUsers(enabled: boolean = true) {
  return useApiCall(() => usersApi.getAll(), [], enabled);
}

export function usePendingUsers(enabled: boolean = true) {
  return useApiCall(() => usersApi.getPending(), [], enabled);
}

export function useUser(id: number, enabled: boolean = true) {
  return useApiCall(() => usersApi.getById(id), [id], enabled);
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

// Departments hooks (ADMIN for mutating)
export function useDepartments(enabled: boolean = true) {
  return useApiCall(() => departmentsApi.getAll(), [], enabled);
}

export function useCreateDepartment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDepartment = useCallback(async (data: CreateDepartmentDto) => {
    try {
      setLoading(true);
      setError(null);
      return await departmentsApi.create(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create department';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createDepartment, loading, error };
}

export function useUpdateDepartment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDepartment = useCallback(async (id: number, data: UpdateDepartmentDto) => {
    try {
      setLoading(true);
      setError(null);
      return await departmentsApi.update(id, data);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update department';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateDepartment, loading, error };
}

export function useDeleteDepartment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDepartment = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await departmentsApi.remove(id);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete department';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteDepartment, loading, error };
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
