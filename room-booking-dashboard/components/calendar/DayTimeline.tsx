'use client';

import React, { useMemo } from 'react';
import { format, parseISO, startOfDay, differenceInMinutes } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Booking, Room } from '@/lib/api';
import { CalendarUtils } from './CalendarUtils';

interface DayTimelineProps {
  date: Date;
  bookings: Booking[];
  rooms: Room[];
  isAdmin?: boolean;
  onBookingClick?: (booking: Booking) => void;
  onApprove?: (booking: Booking) => void;
}

// Compute 0..1440 minutes from start of day
function getMinutesFromDayStart(date: Date, dateTime: string): number {
  const start = startOfDay(date);
  const dt = parseISO(dateTime);
  return Math.max(0, Math.min(1440, differenceInMinutes(dt, start)));
}

export function DayTimeline({ date, bookings, rooms, isAdmin = false, onBookingClick, onApprove }: DayTimelineProps) {
  const roomsById = useMemo(() => {
    const map: Record<number, Room> = {};
    rooms.forEach(r => { map[r.id] = r; });
    return map;
  }, [rooms]);

  // Group bookings by room for this date
  const bookingsByRoom = useMemo(() => {
    const grouped: Record<number, Booking[]> = {};
    bookings.forEach(b => {
      const roomId = b.roomId;
      grouped[roomId] = grouped[roomId] || [];
      grouped[roomId].push(b);
    });
    // Sort each room's bookings by start time
    Object.keys(grouped).forEach(k => {
      grouped[Number(k)].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });
    return grouped;
  }, [bookings]);

  // Prepare lanes per room to visualize overlaps
  function computeLanes(roomBookings: Booking[]): Array<{ booking: Booking; lane: number }> {
    const lanes: Array<{ booking: Booking; lane: number }> = [];
    const laneEnds: number[] = []; // per lane, track end minute to place next non-overlapping
    roomBookings.forEach(booking => {
      const startMin = getMinutesFromDayStart(date, booking.startTime);
      const endMin = getMinutesFromDayStart(date, booking.endTime);
      let placed = false;
      for (let i = 0; i < laneEnds.length; i++) {
        if (startMin >= laneEnds[i]) {
          lanes.push({ booking, lane: i });
          laneEnds[i] = endMin;
          placed = true;
          break;
        }
      }
      if (!placed) {
        laneEnds.push(endMin);
        lanes.push({ booking, lane: laneEnds.length - 1 });
      }
    });
    return lanes;
  }

  const hourMarks = Array.from({ length: 25 }, (_, i) => i); // 0..24
  const TRACK_HEIGHT = 480; // ~1/2 screen on many displays; large for readability

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Frise chronologique — {format(date, 'EEEE dd MMMM yyyy')}</div>
          <div className="text-sm text-muted-foreground">Conflits visualisés par salle, en temps réel</div>
        </div>

        {/* Time axis and tracks (wide and scrollable) */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[1600px]">
            <div className="h-8 relative border-b border-border">
              {hourMarks.map((h) => (
                <div
                  key={h}
                  className="absolute top-0 -translate-x-1/2 text-[11px] text-muted-foreground"
                  style={{ left: `${(h / 24) * 100}%` }}
                >
                  {h}:00
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-10">
            {Object.keys(bookingsByRoom).length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">Aucune réservation pour cette date</div>
            )}

            {Object.entries(bookingsByRoom).map(([roomIdStr, roomBookings]) => {
              const roomId = Number(roomIdStr);
              const room = roomsById[roomId];
              const lanes = computeLanes(roomBookings);
              const laneCount = Math.max(1, ...lanes.map(l => l.lane + 1));
              return (
                <div key={roomId}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="text-base font-semibold">{room?.name || `Salle ${roomId}`}</div>
                    {room?.capacity ? (
                      <Badge variant="outline" className="text-xs">{room.capacity} places</Badge>
                    ) : null}
                  </div>
                  <div className="relative w-full border border-border rounded bg-background"
                       style={{ height: `${TRACK_HEIGHT}px` }}>
                    {/* hour grid lines */}
                    {hourMarks.map((h) => (
                      <div
                        key={h}
                        className="absolute top-0 bottom-0 border-l border-dashed border-border/60"
                        style={{ left: `${(h / 24) * 100}%` }}
                      />
                    ))}
                    {/* bookings */}
                    {lanes.map(({ booking, lane }) => {
                      const startMin = getMinutesFromDayStart(date, booking.startTime);
                      const endMin = getMinutesFromDayStart(date, booking.endTime);
                      const leftPct = (startMin / 1440) * 100;
                      const widthPct = Math.max(1.5, ((endMin - startMin) / 1440) * 100);
                      const laneHeight = TRACK_HEIGHT / Math.max(1, lanes.reduce((m, l) => Math.max(m, l.lane + 1), 1));
                      const topOffset = lane * laneHeight + 6; // inner padding
                      const statusClasses = CalendarUtils.getEventClasses(booking.status);
                      const capacity = roomsById[booking.roomId]?.capacity || 1;
                      const utilizationPct = Math.round(((booking.expectedAttendees || 0) / capacity) * 100);
                      return (
                        <div
                          key={booking.id}
                          className={`absolute rounded px-3 py-2 text-[12px] border ${statusClasses} shadow-sm`}
                          style={{ left: `${leftPct}%`, width: `${widthPct}%`, top: `${topOffset}px`, height: `${Math.max(34, laneHeight - 12)}px` }}
                          onClick={() => onBookingClick?.(booking)}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-semibold whitespace-nowrap">
                              {format(parseISO(booking.startTime), 'HH:mm')} – {format(parseISO(booking.endTime), 'HH:mm')}
                            </div>
                          </div>
                          <div className="mt-0.5 text-[12px] leading-snug">
                            <div className="font-medium">
                              {booking.organizer && typeof booking.organizer === 'object'
                                ? (booking.organizer.firstName && booking.organizer.lastName
                                  ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                                  : booking.organizer.username)
                                : ''}
                            </div>
                            {booking.purpose && (
                              <div className="opacity-80">{booking.purpose}</div>
                            )}
                            <div className="opacity-70 text-[11px]">
                              {booking.expectedAttendees || 0}/{capacity} ({utilizationPct}%)
                              {Array.isArray(booking.internalAttendees) && booking.internalAttendees.length > 0 && (
                                <span className="ml-2">Int: {booking.internalAttendees.length}</span>
                              )}
                              {Array.isArray(booking.externalAttendees) && booking.externalAttendees.length > 0 && (
                                <span className="ml-2">Ext: {booking.externalAttendees.length}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DayTimeline;


