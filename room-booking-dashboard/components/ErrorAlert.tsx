'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  title?: string;
}

export function ErrorAlert({ 
  error, 
  onDismiss, 
  onRetry, 
  className,
  title = 'Erreur'
}: ErrorAlertProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className={cn('mb-4', className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong>{title}:</strong> {error}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Réessayer
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface InlineErrorProps {
  error: string | null;
  className?: string;
}

export function InlineError({ error, className }: InlineErrorProps) {
  if (!error) return null;

  return (
    <div className={cn('text-sm text-red-600 mt-1', className)}>
      {error}
    </div>
  );
}
