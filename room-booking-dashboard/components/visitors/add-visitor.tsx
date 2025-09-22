"use client"

import { useEffect, useState } from "react"
import { calendarApi } from "@/lib/api" // adjust path
import type { Booking } from "@/lib/api"

interface AddVisitForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  purpose: string
  bookingId?: number
}

interface AddVisitorModalProps {
  isOpen: boolean
  mode: "new" | "existing" | null
  form: AddVisitForm
  loading: boolean
  error: string | null
  onClose: () => void
  onFormChange: (form: AddVisitForm) => void
  onSubmit: () => void
  onCreateBooking: () => void
}

export function AddVisitorModal({
  isOpen,
  mode,
  form,
  loading,
  error,
  onClose,
  onFormChange,
  onSubmit,
  onCreateBooking,
}: AddVisitorModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    async function fetchTodaysBookings() {
      try {
        const todayISO = new Date().toISOString().split("T")[0] // "YYYY-MM-DD"
        const data = await calendarApi.getBookingsForDay(todayISO)
        setBookings(data || [])
      } catch (err) {
        console.error("Failed to fetch today's bookings", err)
        setBookings([])
      }
    }

    fetchTodaysBookings()
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!form.purpose.trim()) {
      setLocalError("Purpose of visit is required.")
      return
    }
    setLocalError(null)
    onSubmit()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-[450px] p-8 relative">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 px-3 py-1 rounded text-muted-foreground hover:bg-accent transition-colors"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-6 text-foreground">
          {mode === "new" ? "Add Visitor & Visit" : "Add Visit for Visitor"}
        </h2>

        {/* Visitor Info */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="First Name *"
            className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
            value={form.firstName}
            onChange={(e) => onFormChange({ ...form, firstName: e.target.value })}
            disabled={mode === "existing"}
          />
          <input
            type="text"
            placeholder="Last Name *"
            className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
            value={form.lastName}
            onChange={(e) => onFormChange({ ...form, lastName: e.target.value })}
            disabled={mode === "existing"}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
            value={form.email}
            onChange={(e) => onFormChange({ ...form, email: e.target.value })}
            disabled={mode === "existing"}
          />
          <input
            type="tel"
            placeholder="Phone"
            className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
            value={form.phone}
            onChange={(e) => onFormChange({ ...form, phone: e.target.value })}
            disabled={mode === "existing"}
          />

          {/* Visit Purpose */}
          <input
            type="text"
            placeholder="Purpose of Visit *"
            className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
            value={form.purpose}
            onChange={(e) => onFormChange({ ...form, purpose: e.target.value })}
          />

          {/* Booking Dropdown */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Select Today's Booking (optional)
            </label>
            <select
              className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
              value={form.bookingId ?? ""}
              onChange={(e) =>
                onFormChange({ ...form, bookingId: e.target.value ? Number(e.target.value) : undefined })
              }
            >
              <option value="">— No booking —</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.room?.name || "Unknown Room"}
                </option>
              ))}
            </select>
          </div>

          {/* Error Messages */}
          {(localError || error) && (
            <div className="text-sm text-red-500 text-destructive">{localError || error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-bold shadow transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save & Check-in"}
          </button>
        </div>
      </div>
    </div>
  )
}
