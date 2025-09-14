'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

type LoginFormData = {
  email: string;
  password: string;
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    mode: 'onSubmit',
  });

  // Debug: Watch form values (only log on submit)
  const watchedValues = watch();

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Form submitted with data:', data);
      console.log('Data type check - email:', typeof data.email, 'password:', typeof data.password);
      console.log('Data values - email:', data.email, 'password:', data.password);
      
      if (!data.email || !data.password) {
        console.error('Missing required fields:', { email: !!data.email, password: !!data.password });
        return;
      }
      
      clearError();
      await login(data);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Error is handled by the auth context
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto card-albaraka">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-[var(--albaraka-primary)]">Sign In</CardTitle>
        <CardDescription className="text-center text-[var(--albaraka-muted)]">
          Enter your credentials to access the room management system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email', { 
                required: 'Email is required'
              })}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password', { 
                  required: 'Password is required'
                })}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full btn-albaraka-primary" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Demo credentials:
          </p>
          <div className="mt-2 space-y-1 text-xs">
            <p><strong>Super Admin:</strong> admin@company.com / password123</p>
            <p><strong>Manager:</strong> manager@company.com / password123</p>
            <p><strong>User:</strong> john@company.com / password123</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
