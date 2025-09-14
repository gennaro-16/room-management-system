'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  Building2,
  User
} from 'lucide-react';

export function UserDashboard() {
  const { user } = useAuth();

  // Mock data - replace with actual API calls
  const myBookings = [
    {
      id: 1,
      roomName: 'Conference Room A',
      purpose: 'Team Meeting',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T11:00:00Z',
      status: 'APPROVED'
    },
    {
      id: 2,
      roomName: 'Meeting Room B',
      purpose: 'Client Presentation',
      startTime: '2024-01-16T14:00:00Z',
      endTime: '2024-01-16T15:30:00Z',
      status: 'PENDING'
    }
  ];

  const availableRooms = [
    { id: 1, name: 'Conference Room A', capacity: 10, isAvailable: true },
    { id: 2, name: 'Meeting Room B', capacity: 6, isAvailable: true },
    { id: 3, name: 'Small Office', capacity: 4, isAvailable: false },
    { id: 4, name: 'Boardroom', capacity: 20, isAvailable: true }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[var(--albaraka-primary)] to-[var(--albaraka-secondary)] rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-6 w-6" />
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.firstName || user?.username}!
          </h1>
        </div>
        <p className="text-white/90">
          Manage your room bookings and find available spaces for your meetings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              My Bookings
            </CardTitle>
            <CardDescription>
              Your upcoming and recent room bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myBookings.length > 0 ? (
              myBookings.map((booking) => {
                const { date, time } = formatDateTime(booking.startTime);
                const endTime = formatDateTime(booking.endTime).time;
                
                return (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{booking.roomName}</div>
                      <div className="text-sm text-muted-foreground">{booking.purpose}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{date}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{time} - {endTime}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No bookings yet</p>
                <p className="text-sm">Book a room to get started</p>
              </div>
            )}
            <Button className="w-full btn-albaraka-primary">
              View All Bookings
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Book a Room
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Room Map
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              My Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Available Rooms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Available Rooms
          </CardTitle>
          <CardDescription>
            Rooms currently available for booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {availableRooms.map((room) => (
              <div key={room.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{room.name}</h3>
                  <Badge 
                    variant={room.isAvailable ? "default" : "secondary"}
                    className={room.isAvailable ? "bg-green-50 text-green-800 border-green-200" : "bg-gray-50 text-gray-800 border-gray-200"}
                  >
                    {room.isAvailable ? 'Available' : 'Occupied'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{room.capacity} seats</span>
                </div>
                {room.isAvailable && (
                  <Button size="sm" className="w-full mt-3 btn-albaraka-primary">
                    Book Now
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest booking activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Booking Approved</p>
                <p className="text-xs text-muted-foreground">Conference Room A - Jan 15, 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Booking Pending</p>
                <p className="text-xs text-muted-foreground">Meeting Room B - Jan 16, 2:00 PM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
