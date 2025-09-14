'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--albaraka-accent)] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/baraka-logo-fr-1-133x62.png" 
              alt="Al Baraka Bank" 
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-[var(--albaraka-primary)]">Room Management</h1>
          <p className="mt-2 text-sm text-[var(--albaraka-muted)]">
            Create your account
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
