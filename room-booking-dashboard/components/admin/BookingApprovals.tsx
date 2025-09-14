'use client';

import { useState } from 'react';
import { usePendingBookings, useApproveBooking, useRejectBooking } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, User, Calendar, MapPin } from 'lucide-react';
import { apiUtils } from '@/lib/api';

export function BookingApprovals() {
  const { data: pendingBookings, loading, error, refetch } = usePendingBookings();
  const { approveBooking, loading: approving } = useApproveBooking();
  const { rejectBooking, loading: rejecting } = useRejectBooking();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async (bookingId: number) => {
    try {
      await approveBooking(bookingId);
      refetch();
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) return;
    
    try {
      await rejectBooking(selectedBooking.id, rejectionReason);
      setRejectDialogOpen(false);
      setSelectedBooking(null);
      setRejectionReason('');
      refetch();
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const openRejectDialog = (booking: any) => {
    setSelectedBooking(booking);
    setRejectDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!pendingBookings || pendingBookings.length === 0) {
  return (
    <Card className="card-albaraka">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[var(--albaraka-primary)]">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Booking Approvals
        </CardTitle>
        <CardDescription className="text-[var(--albaraka-muted)]">
          Manage pending booking requests
        </CardDescription>
      </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              There are no pending booking requests at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-albaraka">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[var(--albaraka-primary)]">
          <Clock className="h-5 w-5 text-yellow-600" />
          Booking Approvals
          <Badge variant="secondary" className="ml-2 bg-[var(--albaraka-secondary)] text-white">
            {pendingBookings.length} pending
          </Badge>
        </CardTitle>
        <CardDescription className="text-[var(--albaraka-muted)]">
          Review and approve or reject booking requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingBookings.map((booking) => (
            <Card key={booking.id} >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{booking.room?.name}</span>
                      <Badge variant="outline">{booking.room?.capacity} seats</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {booking.user?.firstName && booking.user?.lastName
                          ? `${booking.user.firstName} ${booking.user.lastName}`
                          : booking.user?.username
                        }
                      </span>
                      {booking.user?.department && (
                        <Badge variant="secondary" className="text-xs">
                          {booking.user.department}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(booking.startTime).toLocaleDateString()} at{' '}
                        {new Date(booking.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(booking.endTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>

                    {booking.purpose && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Purpose:</strong> {booking.purpose}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Requested on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(booking.id)}
                      disabled={approving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openRejectDialog(booking)}
                      disabled={rejecting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Booking Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this booking request.
              </DialogDescription>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{selectedBooking.room?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.user?.firstName && selectedBooking.user?.lastName
                      ? `${selectedBooking.user.firstName} ${selectedBooking.user.lastName}`
                      : selectedBooking.user?.username
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedBooking.startTime).toLocaleDateString()} at{' '}
                    {new Date(selectedBooking.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection Reason</label>
                  <Textarea
                    placeholder="Please explain why this booking is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setSelectedBooking(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || rejecting}
              >
                {rejecting ? 'Rejecting...' : 'Reject Booking'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
