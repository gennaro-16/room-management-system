"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Clock, User, MapPin, Users, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { conflictsApi, type ConflictResolutionResult, type AlternativeSuggestion, type ConflictInfo } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ErrorAlert } from "@/components/ErrorAlert"
import { format, parseISO } from "date-fns"

interface ConflictBooking {
  id: number
  title: string
  room: {
    name: string
    capacity: number
  }
  organizer: {
    firstName: string | null
    lastName: string | null
    username: string
    role: string
  }
  startTime: string
  endTime: string
  status: string
  expectedAttendees: number
  purpose: string | null
  conflictInfo?: ConflictInfo
  alternatives?: AlternativeSuggestion[]
  enhancedAnalysis?: ConflictResolutionResult
}

export function ConflictsSection() {
  const { user } = useAuth()
  const [conflictingBookings, setConflictingBookings] = useState<ConflictBooking[]>([])
  const [rejectedBookings, setRejectedBookings] = useState<ConflictBooking[]>([])
  const [selectedConflict, setSelectedConflict] = useState<ConflictBooking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<ConflictResolutionResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const loadConflicts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await conflictsApi.getConflictingBookings()
      setConflictingBookings(response.conflictingBookings || [])
      setRejectedBookings(response.rejectedBookings || [])
    } catch (err) {
      console.error('❌ Error loading conflicts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load conflicts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadConflicts()
    }
  }, [user])

  const getStatusBadge = (booking: ConflictBooking) => {
    if (booking.enhancedAnalysis) {
      switch (booking.enhancedAnalysis.status) {
        case 'CONFLICT':
          return (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Conflict
            </Badge>
          )
        case 'REJECTED':
          return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
          )
        case 'APPROVED':
          return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Approved
            </Badge>
          )
        default:
          return (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )
      }
    }
    
    if (booking.conflictInfo?.hasConflict) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Conflict
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const getPriorityBadge = (role: string) => {
    switch (role) {
      case 'EMPLOYEE':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Employee</Badge>
      case 'ADMIN':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Admin</Badge>
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Staff
          </Badge>
        )
    }
  }

  const getEnhancedAnalysis = async (bookingId: number) => {
    try {
      setAnalyzing(true)
      const analysis = await conflictsApi.getEnhancedConflictAnalysis(bookingId)
      setEnhancedAnalysis(analysis)
      return analysis
    } catch (err) {
      console.error('❌ Error getting enhanced analysis:', err)
      setError(err instanceof Error ? err.message : 'Failed to get enhanced analysis')
      return null
    } finally {
      setAnalyzing(false)
    }
  }

  const handleResolve = async (conflict: ConflictBooking) => {
    setSelectedConflict(conflict)
    setIsModalOpen(true)
    
    // Get enhanced analysis for this conflict
    const analysis = await getEnhancedAnalysis(conflict.id)
    if (analysis) {
      // Update the conflict with enhanced analysis
      setSelectedConflict({
        ...conflict,
        enhancedAnalysis: analysis,
        conflictInfo: analysis.conflictInfo,
        alternatives: analysis.alternatives
      })
    }
  }

  const handleApproveAlternative = async (bookingId: number, alternative: any) => {
    try {
      await conflictsApi.resolveConflict(bookingId, {
        alternativeRoomId: alternative.roomId,
        alternativeStartTime: alternative.suggestedStartTime,
        alternativeEndTime: alternative.suggestedEndTime,
      })
      await loadConflicts()
      setIsModalOpen(false)
    } catch (err) {
      console.error('❌ Error resolving conflict:', err)
      setError(err instanceof Error ? err.message : 'Failed to resolve conflict')
    }
  }

  const handleRejectBooking = async (bookingId: number) => {
    try {
      // This would need to be implemented in the backend
      // For now, just close the modal
      setIsModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject booking')
    }
  }

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = parseISO(startTime)
    const end = parseISO(endTime)
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM dd, yyyy')
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={loadConflicts} />
  }

  return (
    <div className="w-full space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-balance flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Booking Conflicts Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {conflictingBookings.length} conflicts requiring attention
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConflicts}
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conflicts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conflicts">Conflicting Bookings ({conflictingBookings.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected Requests ({rejectedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="conflicts" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Requested Room</TableHead>
                      <TableHead>Requested Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conflictingBookings.map((conflict) => (
                      <TableRow key={conflict.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-medium">#{conflict.id}</TableCell>
                        <TableCell className="font-medium">{conflict.room.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatDate(conflict.startTime)} {formatTimeRange(conflict.startTime, conflict.endTime)}
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {conflict.organizer.firstName && conflict.organizer.lastName
                            ? `${conflict.organizer.firstName} ${conflict.organizer.lastName}`
                            : conflict.organizer.username}
                        </TableCell>
                        <TableCell>{getStatusBadge(conflict)}</TableCell>
                        <TableCell>{getPriorityBadge(conflict.organizer.role)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolve(conflict)}
                              className="text-xs flex items-center gap-1"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {conflict.enhancedAnalysis ? "Enhanced Resolve" : "Analyze & Resolve"}
                            </Button>
                            {!conflict.enhancedAnalysis && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => getEnhancedAnalysis(conflict.id)}
                                disabled={analyzing}
                                className="text-xs flex items-center gap-1"
                              >
                                <RefreshCw className={`h-3 w-3 ${analyzing ? "animate-spin" : ""}`} />
                                Analyze
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Requested Room</TableHead>
                      <TableHead>Requested Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedBookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-medium">#{booking.id}</TableCell>
                        <TableCell className="font-medium">{booking.room.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatDate(booking.startTime)} {formatTimeRange(booking.startTime, booking.endTime)}
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {booking.organizer.firstName && booking.organizer.lastName
                            ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                            : booking.organizer.username}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {booking.conflictInfo?.conflictReason || "No alternatives found"}
                        </TableCell>
                        <TableCell>{getPriorityBadge(booking.organizer.role)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-y-auto sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] 2xl:max-w-[75vw]">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-lg sm:text-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Enhanced Conflict Resolution - #{selectedConflict?.id}
            </div>
            {analyzing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 px-3 py-1 rounded-full">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {selectedConflict && (
          <div className="space-y-6 p-1">
            {/* Original Request Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Original Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Requester:</span>
                    <span>
                      {selectedConflict.organizer.firstName && selectedConflict.organizer.lastName
                        ? `${selectedConflict.organizer.firstName} ${selectedConflict.organizer.lastName}`
                        : selectedConflict.organizer.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Room:</span>
                    <span>{selectedConflict.room.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Time:</span>
                    <span className="font-mono">
                      {formatDate(selectedConflict.startTime)}{" "}
                      {formatTimeRange(selectedConflict.startTime, selectedConflict.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Attendees:</span>
                    <span>{selectedConflict.expectedAttendees}</span>
                  </div>
                </div>
                {selectedConflict.purpose && (
                  <div>
                    <span className="font-medium">Purpose:</span>
                    <p className="text-sm text-muted-foreground mt-1">{selectedConflict.purpose}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conflict Reason */}
            {selectedConflict.conflictInfo?.conflictReason && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-700">Conflict Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{selectedConflict.conflictInfo.conflictReason}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Conflict Analysis */}
            {selectedConflict.enhancedAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-blue-500" />
                    Enhanced Conflict Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">Status:</span>
                      <Badge
                        className={
                          selectedConflict.enhancedAnalysis.status === "CONFLICT"
                            ? "bg-orange-100 text-orange-800 border-orange-200"
                            : selectedConflict.enhancedAnalysis.status === "REJECTED"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-green-100 text-green-800 border-green-200"
                        }
                      >
                        {selectedConflict.enhancedAnalysis.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Alternatives Found:</span>
                      <span className="font-mono">{selectedConflict.alternatives?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Analysis Time:</span>
                      <span className="text-sm">Real-time</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Suggested Alternatives */}
            {selectedConflict.alternatives && selectedConflict.alternatives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    AI-Powered Alternative Solutions
                    <Badge variant="outline" className="text-xs">
                      {selectedConflict.alternatives.length} suggestions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedConflict.alternatives.map((alt, index) => (
                      <Card
                        key={index}
                        className={`border-l-4 ${
                          alt.priority === "high"
                            ? "border-l-green-500 bg-green-50"
                            : alt.priority === "medium"
                              ? "border-l-yellow-500 bg-yellow-50"
                              : "border-l-gray-500 bg-gray-50"
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <Badge
                                  className={
                                    alt.priority === "high"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : alt.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                        : "bg-gray-100 text-gray-800 border-gray-200"
                                  }
                                >
                                  {alt.priority.toUpperCase()} PRIORITY
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {alt.reason.replace(/_/g, " ").toUpperCase()}
                                </Badge>
                                {alt.available ? (
                                  <div className="flex items-center gap-1 text-green-700">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Available</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-red-700">
                                    <XCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Unavailable</span>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-xl">{alt.roomName}</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{alt.description}</p>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 p-2 bg-white rounded-md border">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-sm">
                                      {formatDate(alt.suggestedStartTime)}{" "}
                                      {formatTimeRange(alt.suggestedStartTime, alt.suggestedEndTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 p-2 bg-white rounded-md border">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Capacity: {alt.capacity} seats</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0 xl:ml-4">
                              <Button
                                size="lg"
                                onClick={() => handleApproveAlternative(selectedConflict.id, alt)}
                                disabled={!alt.available}
                                className={
                                  alt.available
                                    ? "bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 min-w-[160px]"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed px-6 py-3 min-w-[160px]"
                                }
                              >
                                {alt.available ? "✓ Approve Solution" : "✗ Unavailable"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Alternatives Found */}
            {selectedConflict.enhancedAnalysis &&
              (!selectedConflict.alternatives || selectedConflict.alternatives.length === 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      No Alternative Solutions Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 mb-2">
                        {selectedConflict.enhancedAnalysis.rejectionReason ||
                          "No suitable room or time available for this booking request."}
                      </p>
                      <p className="text-sm text-red-600">
                        The system has analyzed all available rooms and time slots but could not find any suitable
                        alternatives that meet the requirements.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => getEnhancedAnalysis(selectedConflict.id)}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-6 py-3"
                >
                  <RefreshCw className={`h-4 w-4 ${analyzing ? "animate-spin" : ""}`} />
                  Refresh Analysis
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  size="lg"
                  onClick={() => handleRejectBooking(selectedConflict.id)}
                  className="px-6 py-3 w-full sm:w-auto"
                >
                  Reject Request
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </div>
  )
}

export default ConflictsSection
