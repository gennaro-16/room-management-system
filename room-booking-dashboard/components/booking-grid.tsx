"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data structure - replace with your actual data source
const mockRooms = [
  { id: 1, name: "Conference Room A", department: "Marketing", capacity: 12 },
  { id: 2, name: "Meeting Room B", department: "Engineering", capacity: 8 },
  { id: 3, name: "Boardroom", department: "Executive", capacity: 20 },
  { id: 4, name: "Training Room", department: "HR", capacity: 25 },
  { id: 5, name: "Creative Studio", department: "Design", capacity: 6 },
  { id: 6, name: "Phone Booth 1", department: "General", capacity: 2 },
  { id: 7, name: "Phone Booth 2", department: "General", capacity: 2 },
  { id: 8, name: "Workshop Room", department: "Engineering", capacity: 15 },
]

const mockBookings = [
  { id: 1, roomId: 1, startTime: "09:00", endTime: "10:30", status: "approved", title: "Marketing Standup" },
  { id: 2, roomId: 1, startTime: "14:00", endTime: "15:30", status: "ongoing", title: "Client Presentation" },
  { id: 3, roomId: 2, startTime: "10:00", endTime: "11:00", status: "approved", title: "Code Review" },
  { id: 4, roomId: 2, startTime: "15:00", endTime: "16:30", status: "approved", title: "Sprint Planning" },
  { id: 5, roomId: 3, startTime: "11:00", endTime: "12:00", status: "ongoing", title: "Board Meeting" },
  { id: 6, roomId: 4, startTime: "09:30", endTime: "12:00", status: "approved", title: "New Employee Training" },
  { id: 7, roomId: 5, startTime: "13:00", endTime: "14:00", status: "approved", title: "Design Review" },
  { id: 8, roomId: 6, startTime: "10:30", endTime: "11:00", status: "ongoing", title: "1:1 Meeting" },
  { id: 9, roomId: 8, startTime: "16:00", endTime: "17:30", status: "approved", title: "Tech Workshop" },
]

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

function getBookingBars(roomId: number, timeSlots: string[]) {
  const roomBookings = mockBookings.filter((b) => b.roomId === roomId)
  const bars: Array<{
    booking: any
    startIndex: number
    width: number
    leftOffset: number
  }> = []

  roomBookings.forEach((booking) => {
    const startMinutes = timeToMinutes(booking.startTime)
    const endMinutes = timeToMinutes(booking.endTime)

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

  const filteredRooms = useMemo(() => {
    if (selectedDepartment === "All") return mockRooms
    return mockRooms.filter((room) => room.department === selectedDepartment)
  }, [selectedDepartment])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 hover:bg-green-600"
      case "ongoing":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-white hover:bg-gray-50 border border-border"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved"
      case "ongoing":
        return "Ongoing"
      default:
        return "Available"
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="department" className="text-sm font-medium">
            Department:
          </label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="date" className="text-sm font-medium">
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

        {/* Legend */}
        <div className="flex items-center gap-4 ml-auto">
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

      {/* Booking Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Room Availability Grid - {selectedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header with time slots */}
              <div className="grid grid-cols-[250px_repeat(21,60px)] gap-1 mb-2">
                <div className="font-semibold text-sm p-2">Room / Department / Time</div>
                {timeSlots.map((time) => (
                  <div key={time} className="text-xs font-medium text-center p-1 text-muted-foreground">
                    {time}
                  </div>
                ))}
              </div>

              {/* Room rows */}
              {filteredRooms.map((room) => {
                const bookingBars = getBookingBars(room.id, timeSlots)

                return (
                  <div key={room.id} className="grid grid-cols-[250px_repeat(21,60px)] gap-1 mb-1">
                    <div className="p-3 bg-muted rounded-md">
                      <div className="font-medium text-sm truncate">{room.name}</div>
                      <Badge
                        variant="secondary"
                        className="text-xs mt-1 mb-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {room.department}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{room.capacity} seats</div>
                    </div>

                    <div className="col-span-21 relative">
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

                      {bookingBars.map((bar, index) => (
                        <div
                          key={`${room.id}-bar-${index}`}
                          className={`absolute top-0 h-16 rounded-md cursor-pointer transition-all duration-200 flex items-center px-2 text-white font-medium text-xs shadow-sm ${
                            bar.booking.status === "approved"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-purple-500 hover:bg-purple-600"
                          }`}
                          style={{
                            left: `${bar.startIndex * 64 + bar.leftOffset * 0.64}px`, // 64px = 60px width + 4px gap
                            width: `${bar.width * 0.64}px`,
                            zIndex: 10,
                          }}
                          title={`${bar.booking.title} (${bar.booking.startTime} - ${bar.booking.endTime}) - ${getStatusText(bar.booking.status)}`}
                        >
                          <div className="truncate">
                            <div className="font-semibold">{bar.booking.title}</div>
                            <div className="text-xs opacity-90">
                              {bar.booking.startTime} - {bar.booking.endTime}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
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
              {mockBookings.filter((b) => b.status === "approved").length}
            </div>
            <div className="text-sm text-muted-foreground">Approved Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {mockBookings.filter((b) => b.status === "ongoing").length}
            </div>
            <div className="text-sm text-muted-foreground">Ongoing Meetings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {Math.round(
                ((filteredRooms.length * timeSlots.length - mockBookings.length) /
                  (filteredRooms.length * timeSlots.length)) *
                  100,
              )}
              %
            </div>
            <div className="text-sm text-muted-foreground">Availability Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
