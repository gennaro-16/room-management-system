"use client"

import { useMemo } from "react"
import { format, parseISO, startOfDay, differenceInMinutes } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Booking, Room } from "@/lib/api"
import { CalendarUtils } from "./CalendarUtils"

interface DayTimelineProps {
  date: Date
  bookings: Booking[]
  rooms: Room[]
  isAdmin?: boolean
  onBookingClick?: (booking: Booking) => void
  onApprove?: (booking: Booking) => void
}

// Compute 0..1440 minutes from start of day
function getMinutesFromDayStart(date: Date, dateTime: string): number {
  const start = startOfDay(date)
  const dt = parseISO(dateTime)
  return Math.max(0, Math.min(1440, differenceInMinutes(dt, start)))
}

export function DayTimeline({ date, bookings, rooms, isAdmin = false, onBookingClick, onApprove }: DayTimelineProps) {
  const roomsById = useMemo(() => {
    const map: Record<number, Room> = {}
    rooms.forEach((r) => {
      map[r.id] = r
    })
    return map
  }, [rooms])

  // Group bookings by room for this date
  const bookingsByRoom = useMemo(() => {
    const grouped: Record<number, Booking[]> = {}
    bookings.forEach((b) => {
      const roomId = b.roomId
      grouped[roomId] = grouped[roomId] || []
      grouped[roomId].push(b)
    })
    // Sort each room's bookings by start time
    Object.keys(grouped).forEach((k) => {
      grouped[Number(k)].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    })
    return grouped
  }, [bookings])

  // Prepare lanes per room to visualize overlaps
  function computeLanes(roomBookings: Booking[]): Array<{ booking: Booking; lane: number }> {
    const lanes: Array<{ booking: Booking; lane: number }> = []
    const laneEnds: number[] = [] // per lane, track end minute to place next non-overlapping
    roomBookings.forEach((booking) => {
      const startMin = getMinutesFromDayStart(date, booking.startTime)
      const endMin = getMinutesFromDayStart(date, booking.endTime)
      let placed = false
      for (let i = 0; i < laneEnds.length; i++) {
        if (startMin >= laneEnds[i]) {
          lanes.push({ booking, lane: i })
          laneEnds[i] = endMin
          placed = true
          break
        }
      }
      if (!placed) {
        laneEnds.push(endMin)
        lanes.push({ booking, lane: laneEnds.length - 1 })
      }
    })
    return lanes
  }

  const hourMarks = Array.from({ length: 25 }, (_, i) => i) // 0..24

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xl font-semibold text-balance">Timeline — {format(date, "EEEE dd MMMM yyyy")}</div>
          <div className="text-sm text-muted-foreground">Room conflicts visualized in real-time</div>
        </div>

        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[1400px]">
            <div className="h-10 relative border-b border-border">
              {hourMarks.map((h) => (
                <div
                  key={h}
                  className="absolute top-0 -translate-x-1/2 text-sm text-muted-foreground font-mono font-medium"
                  style={{ left: `${(h / 24) * 100}%` }}
                >
                  {h}:00
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-12">
              {Object.keys(bookingsByRoom).length === 0 && (
                <div className="text-base text-muted-foreground text-center py-12">No bookings for this date</div>
              )}

              {Object.entries(bookingsByRoom).map(([roomIdStr, roomBookings]) => {
                const roomId = Number(roomIdStr)
                const room = roomsById[roomId]
                const lanes = computeLanes(roomBookings)

                const TRACK_HEIGHT = 480

                return (
                  <div key={roomId}>
                    <div className="mb-4 flex items-center gap-4">
                      <div className="text-lg font-semibold">{room?.name || `Room ${roomId}`}</div>
                      {room?.capacity ? (
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          {room.capacity} seats
                        </Badge>
                      ) : null}
                    </div>

                    <div
                      className="relative w-full border border-border rounded-lg bg-card/30"
                      style={{ height: `${TRACK_HEIGHT}px` }}
                    >
                      {hourMarks.map((h) => (
                        <div
                          key={h}
                          className="absolute top-0 bottom-0 border-l border-dashed border-border/40 first:border-l-0"
                          style={{ left: `${(h / 24) * 100}%` }}
                        />
                      ))}

                      {lanes.map(({ booking, lane }) => {
                        const startMin = getMinutesFromDayStart(date, booking.startTime)
                        const endMin = getMinutesFromDayStart(date, booking.endTime)
                        const leftPct = (startMin / 1440) * 100
                        const actualWidthPct = ((endMin - startMin) / 1440) * 100
                        const widthPct = Math.max(8, actualWidthPct) // Increased from 3% to 8% minimum
                        const maxLanes = Math.max(
                          1,
                          lanes.reduce((m, l) => Math.max(m, l.lane + 1), 1),
                        )
                        const laneHeight = (TRACK_HEIGHT - 24) / maxLanes
                        const topOffset = lane * laneHeight + 12
                        const statusClasses = CalendarUtils.getEventClasses(booking.status)
                        const capacity = roomsById[booking.roomId]?.capacity || 1
                        const utilizationPct = Math.round(((booking.expectedAttendees || 0) / capacity) * 100)

                        const isShortMeeting = actualWidthPct < 6
                        const durationMinutes = endMin - startMin

                        return (
                          <div
                            key={booking.id}
                            className={`absolute rounded-lg border ${statusClasses} shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group`}
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              top: `${topOffset}px`,
                              height: `${Math.max(80, laneHeight - 16)}px`, // Increased minimum height from 60 to 80
                            }}
                            onClick={() => onBookingClick?.(booking)}
                          >
                            {isShortMeeting && (
                              <div className="absolute left-1/2 -translate-x-1/2 -top-2 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-lg border text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                                <div className="font-semibold">
                                  {format(parseISO(booking.startTime), "HH:mm")} –{" "}
                                  {format(parseISO(booking.endTime), "HH:mm")} ({durationMinutes}min)
                                </div>
                                <div className="text-xs">
                                  {booking.organizer && typeof booking.organizer === "object"
                                    ? booking.organizer.firstName && booking.organizer.lastName
                                      ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                                      : booking.organizer.username
                                    : ""}
                                </div>
                                {booking.purpose && <div className="text-xs opacity-90">{booking.purpose}</div>}
                              </div>
                            )}

                            <div
                              className={`h-full flex flex-col justify-between p-3 ${isShortMeeting ? "items-center text-center" : ""}`}
                            >
                              <div className="space-y-1.5">
                                <div className={`font-bold leading-tight ${isShortMeeting ? "text-xs" : "text-sm"}`}>
                                  {isShortMeeting ? (
                                    <div>
                                      {format(parseISO(booking.startTime), "HH:mm")}
                                      <br />
                                      <span className="text-xs opacity-80">({durationMinutes}m)</span>
                                    </div>
                                  ) : (
                                    <>
                                      {format(parseISO(booking.startTime), "HH:mm")} –{" "}
                                      {format(parseISO(booking.endTime), "HH:mm")}
                                    </>
                                  )}
                                </div>

                                {!isShortMeeting && (
                                  <>
                                    <div className="font-semibold text-sm leading-tight">
                                      {booking.organizer && typeof booking.organizer === "object"
                                        ? booking.organizer.firstName && booking.organizer.lastName
                                          ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                                          : booking.organizer.username
                                        : ""}
                                    </div>

                                    {booking.purpose && (
                                      <div className="text-sm leading-tight opacity-90 font-medium line-clamp-2">
                                        {booking.purpose}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              {!isShortMeeting && (
                                <div className="text-xs leading-tight opacity-80 font-medium mt-2">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span className="font-mono font-semibold">
                                      {booking.expectedAttendees || 0}/{capacity} ({utilizationPct}%)
                                    </span>
                                    {Array.isArray(booking.internalAttendees) &&
                                      booking.internalAttendees.length > 0 && (
                                        <span>Internal: {booking.internalAttendees.length}</span>
                                      )}
                                    {Array.isArray(booking.externalAttendees) &&
                                      booking.externalAttendees.length > 0 && (
                                        <span>External: {booking.externalAttendees.length}</span>
                                      )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DayTimeline
