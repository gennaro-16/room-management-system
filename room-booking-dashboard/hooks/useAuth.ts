import { useState, useCallback } from 'react';
import { 
  authApi, 
  usersApi, 
  LoginDto, 
  RegisterDto, 
  UpdateUserDto,
  User,
  ApiError 
} from '@/lib/api';

// Authentication hooks
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authApi.login(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error };
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (data: RegisterDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authApi.register(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error };
}

export function useLogout() {
  const logout = useCallback(() => {
    authApi.logout();
  }, []);

  return { logout };
}

export function useGetProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await authApi.getProfile();
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to get profile';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getProfile, loading, error };
}

// User management hooks (Admin only)
export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await usersApi.getAll();
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to get users';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getUsers, loading, error };
}

export function useUser(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await usersApi.getById(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to get user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { getUser, loading, error };
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(async (id: number, data: UpdateUserDto) => {
    try {
      setLoading(true);
      setError(null);
      const result = await usersApi.update(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update user';
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
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteUser, loading, error };
}

export function useDeactivateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deactivateUser = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await usersApi.deactivate(id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to deactivate user';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deactivateUser, loading, error };
}
