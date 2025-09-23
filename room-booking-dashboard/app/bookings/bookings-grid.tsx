"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRooms, useBookings } from "@/hooks/useApi"
import { Room, Booking, BookingStatus } from "@/lib/api"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ErrorAlert } from "@/components/ErrorAlert"

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
]

const departments = ["All", "Marketing", "Engineering", "Executive", "HR", "Design", "General"]

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function getBookingStyle(booking: any, slotTime: string): { isBooked: boolean; status: string; title: string } {
  const slotMinutes = timeToMinutes(slotTime)
  const startMinutes = timeToMinutes(booking.startTime)
  const endMinutes = timeToMinutes(booking.endTime)

  if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
    return { isBooked: true, status: booking.status, title: booking.title }
  }

  return { isBooked: false, status: "", title: "" }
}

function getBookingBars(roomId: number, timeSlots: string[], bookings: Booking[]) {
  const roomBookings = bookings.filter((b) => b.roomId === roomId)
  const bars: Array<{
    booking: Booking
    startIndex: number
    width: number
    leftOffset: number
  }> = []

  roomBookings.forEach((booking) => {
    // Convert booking times to HH:MM format
    const startTime = new Date(booking.startTime).toTimeString().slice(0, 5)
    const endTime = new Date(booking.endTime).toTimeString().slice(0, 5)
    
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)

    // Find start and end slot indices
    let startIndex = -1
    let endIndex = -1

    timeSlots.forEach((slot, index) => {
      const slotMinutes = timeToMinutes(slot)
      if (startIndex === -1 && slotMinutes >= startMinutes) {
        startIndex = index
      }
      if (slotMinutes < endMinutes) {
        endIndex = index
      }
    })

    if (startIndex !== -1 && endIndex !== -1) {
      // Calculate precise positioning
      const firstSlotMinutes = timeToMinutes(timeSlots[startIndex])
      const lastSlotMinutes = timeToMinutes(timeSlots[endIndex])

      // Calculate left offset within the first slot (as percentage)
      const leftOffsetPercent = startIndex === 0 ? 0 : ((startMinutes - firstSlotMinutes) / 30) * 100

      // Calculate width spanning multiple slots
      const totalSlots = endIndex - startIndex + 1
      const endOffsetPercent = ((endMinutes - lastSlotMinutes) / 30) * 100
      const widthPercent = (totalSlots - 1) * 100 + endOffsetPercent - leftOffsetPercent

      bars.push({
        booking,
        startIndex,
        width: Math.max(widthPercent, 25), // Minimum width for visibility
        leftOffset: leftOffsetPercent,
      })
    }
  })

  return bars
}

export default function BookingGrid() {
  const [selectedDepartment, setSelectedDepartment] = useState("All")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fetch data from API
  const { data: rooms, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useRooms()
  const { data: bookings, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useBookings()

  // Get unique departments from rooms
  const departments = useMemo(() => {
    if (!rooms) return ["All"]
    const deptSet = new Set(rooms.map(room => room.department?.name).filter(Boolean))
    return ["All", ...Array.from(deptSet)]
  }, [rooms])

  const filteredRooms = useMemo(() => {
    if (!rooms) return []
    if (selectedDepartment === "All") return rooms
    return rooms.filter((room) => room.department?.name === selectedDepartment)
  }, [rooms, selectedDepartment])

  // Filter bookings for selected date - only show approved and ongoing bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return []
    return bookings.filter(booking => {
      // Only show approved and ongoing bookings
      const isApprovedOrOngoing = booking.status === 'APPROVED' || booking.status === 'ONGOING';
      if (!isApprovedOrOngoing) return false;
      
      const bookingDate = new Date(booking.startTime).toISOString().split("T")[0]
      // Show all approved/ongoing bookings if selectedDate is today (default view)
      // Otherwise filter by selected date
      const today = new Date().toISOString().split("T")[0]
      if (selectedDate === today) {
        return true // Show all approved/ongoing bookings when viewing today
      }
      return bookingDate === selectedDate
    })
  }, [bookings, selectedDate])

  // Loading and error states
  const loading = roomsLoading || bookingsLoading
  const error = roomsError || bookingsError

  const handleRetry = () => {
    refetchRooms()
    refetchBookings()
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'APPROVED':
        return "bg-green-500 hover:bg-green-600"
      case 'ONGOING':
        return "bg-purple-500 hover:bg-purple-600"
      case 'COMPLETED':
        return "bg-blue-500 hover:bg-blue-600"
      case 'CANCELLED':
        return "bg-gray-500 hover:bg-gray-600"
      case 'REJECTED':
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-white hover:bg-gray-50 border border-border"
    }
  }

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'APPROVED':
        return "Approved"
      case 'ONGOING':
        return "Ongoing"
      case 'COMPLETED':
        return "Completed"
      case 'CANCELLED':
        return "Cancelled"
      case 'REJECTED':
        return "Rejected"
      default:
        return "Available"
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <ErrorAlert 
          title="Error Loading Data"
          error={error}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <label htmlFor="department" className="text-sm font-medium whitespace-nowrap">
              Department:
            </label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept || 'unknown'} value={dept || 'unknown'}>
                  {dept}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="date" className="text-sm font-medium whitespace-nowrap">
              Date:
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              viewMode === "grid" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              viewMode === "list" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            List
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 sm:gap-4 sm:ml-auto flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-border rounded"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">Ongoing</span>
          </div>
        </div>
      </div>

      {/* Booking Grid/List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Room Availability {viewMode === "grid" ? "Grid" : "List"} - 
            {selectedDate === new Date().toISOString().split("T")[0] ? "Approved & Ongoing Bookings" : selectedDate}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {viewMode === "grid" ? (
            <div className="overflow-x-auto">
              <div className="w-full min-w-0">
                {/* Header with time slots */}
                <div className="grid grid-cols-[200px_1fr] gap-1 mb-2 p-4">
                  <div className="font-semibold text-sm p-2">Room / Department / Time</div>
                  <div className="grid grid-cols-21 gap-1">
                    {timeSlots.map((time) => (
                      <div key={time} className="text-xs font-medium text-center p-1 text-muted-foreground">
                        {time}
                      </div>
                    ))}
                  </div>
                </div>

              {/* Room rows */}
              <div className="space-y-1 p-4 pt-0">
                {filteredRooms.map((room) => {
                  const bookingBars = getBookingBars(room.id, timeSlots, filteredBookings)

                  return (
                    <div key={room.id} className="grid grid-cols-[200px_1fr] gap-1">
                      <div className="p-3 bg-muted rounded-md">
                        <div className="font-medium text-sm truncate">{room.name}</div>
                        <Badge
                          variant="secondary"
                          className="text-xs mt-1 mb-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {room.department?.name || 'General'}
                        </Badge>
                        <div className="text-xs text-muted-foreground">{room.capacity} seats</div>
                      </div>

                      <div className="relative">
                        {/* Background grid */}
                        <div className="grid grid-cols-21 gap-1 h-16">
                          {timeSlots.map((time) => (
                            <div
                              key={`${room.id}-${time}-bg`}
                              className="bg-white border border-border rounded-md hover:bg-gray-50 transition-colors"
                              title={`${room.name} - ${time} (Available)`}
                            />
                          ))}
                        </div>

                        {bookingBars.map((bar, index) => {
                          const startTime = new Date(bar.booking.startTime).toTimeString().slice(0, 5)
                          const endTime = new Date(bar.booking.endTime).toTimeString().slice(0, 5)
                          
                          return (
                            <div
                              key={`${room.id}-bar-${index}`}
                              className={`absolute top-0 h-16 rounded-md cursor-pointer transition-all duration-200 flex items-center px-2 text-white font-medium text-xs shadow-sm ${getStatusColor(bar.booking.status)}`}
                              style={{
                                left: `calc(${bar.startIndex} * (100% / 21) + ${bar.leftOffset} * (100% / 21) / 100)`,
                                width: `calc(${bar.width} * (100% / 21) / 100)`,
                                zIndex: 10,
                              }}
                              title={`${bar.booking.title} (${startTime} - ${endTime}) - ${getStatusText(bar.booking.status)}`}
                            >
                              <div className="truncate">
                                <div className="font-semibold">{bar.booking.title}</div>
                                <div className="text-xs opacity-90">
                                  {startTime} - {endTime}
                                </div>
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
          ) : (
            /* List View */
            <div className="p-4 space-y-4">
              {filteredRooms.map((room) => {
                const roomBookings = filteredBookings.filter((b) => b.roomId === room.id)
                const sortedBookings = roomBookings.sort((a, b) => 
                  new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                )

                return (
                  <div key={room.id} className="border border-border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{room.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {room.department?.name || 'General'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{room.capacity} seats</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
                        {roomBookings.length} booking{roomBookings.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {sortedBookings.length > 0 ? (
                      <div className="space-y-2">
                        {sortedBookings.map((booking) => {
                          const startTime = new Date(booking.startTime).toTimeString().slice(0, 5)
                          const endTime = new Date(booking.endTime).toTimeString().slice(0, 5)
                          
                          return (
                            <div
                              key={booking.id}
                              className={`p-3 rounded-md border ${
                                booking.status === 'APPROVED'
                                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                  : booking.status === 'ONGOING'
                                  ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                                  : "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{booking.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {startTime} - {endTime}
                                  </p>
                                  {booking.purpose && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {booking.purpose}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  className={`mt-2 sm:mt-0 ${getStatusColor(booking.status)}`}
                                >
                                  {getStatusText(booking.status)}
                                </Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>
                          {selectedDate === new Date().toISOString().split("T")[0] 
                            ? "No approved or ongoing bookings for this room" 
                            : `No approved or ongoing bookings for this room on ${selectedDate}`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{filteredRooms.length}</div>
            <div className="text-sm text-muted-foreground">Total Rooms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredBookings.filter((b) => b.status === 'APPROVED').length}
            </div>
            <div className="text-sm text-muted-foreground">Approved Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {filteredBookings.filter((b) => b.status === 'ONGOING').length}
            </div>
            <div className="text-sm text-muted-foreground">Ongoing Meetings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {filteredRooms.length > 0 ? Math.round(
                ((filteredRooms.length * timeSlots.length - filteredBookings.length) /
                  (filteredRooms.length * timeSlots.length)) *
                  100,
              ) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Availability Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
