'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarSection } from './CalendarSection';

/**
 * Demo component showing the calendar implementation
 * This can be used for testing or as a standalone calendar page
 */
export function CalendarDemo() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Room Booking Calendar</h1>
        <p className="text-muted-foreground mt-2">
          View and manage room reservations with our interactive calendar
        </p>
      </div>
      
      <CalendarSection />
    </div>
  );
}
