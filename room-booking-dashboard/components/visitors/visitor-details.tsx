"use client"

import { useState } from "react"
import { format } from "date-fns"
import type { VisitorItem, UpdateVisitorDtoFront } from "@/lib/api2"

interface VisitorDetailsModalProps {
  visitor: VisitorItem | null
  isOpen: boolean
  onClose: () => void
  onEdit: (visitor: VisitorItem, form: UpdateVisitorDtoFront) => void
  onAddVisit: (visitor: VisitorItem) => void
  editLoading: boolean
  editError: string | null
}

export function VisitorDetailsModal({
  visitor,
  isOpen,
  onClose,
  onEdit,
  onAddVisit,
  editLoading,
  editError,
}: VisitorDetailsModalProps) {
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<UpdateVisitorDtoFront>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  if (!isOpen || !visitor) return null

  const handleStartEdit = () => {
    setEditForm({
      firstName: visitor.firstName ?? "",
      lastName: visitor.lastName ?? "",
      email: visitor.email ?? "",
      phone: visitor.phone ?? "",
    })
    setEditMode(true)
  }

  const handleSaveEdit = () => {
    onEdit(visitor, editForm)
    setEditMode(false)
  }

  const handleCancelEdit = () => {
    setEditMode(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-[600px] p-7 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 px-3 py-1 rounded text-muted-foreground hover:bg-accent transition-colors"
          onClick={() => {
            onClose()
            setEditMode(false)
          }}
        >
          ✕
        </button>
        <h2 className="font-bold text-xl mb-6 text-foreground">Visitor Details</h2>

        {/* Editable fields */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">First Name</label>
            {editMode ? (
              <input
                type="text"
                value={editForm.firstName || ""}
                className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
                onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            ) : (
              <input
                type="text"
                value={visitor.firstName}
                className="w-full rounded-lg px-3 py-2 border border-input bg-muted text-foreground"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Last Name</label>
            {editMode ? (
              <input
                type="text"
                value={editForm.lastName || ""}
                className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
                onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            ) : (
              <input
                type="text"
                value={visitor.lastName}
                className="w-full rounded-lg px-3 py-2 border border-input bg-muted text-foreground"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Email</label>
            {editMode ? (
              <input
                type="email"
                value={editForm.email || ""}
                className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
            ) : (
              <input
                type="email"
                value={visitor.email ?? ""}
                className="w-full rounded-lg px-3 py-2 border border-input bg-muted text-foreground"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Phone</label>
            {editMode ? (
              <input
                type="tel"
                value={editForm.phone || ""}
                className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              />
            ) : (
              <input
                type="tel"
                value={visitor.phone ?? ""}
                className="w-full rounded-lg px-3 py-2 border border-input bg-muted text-foreground"
                readOnly
              />
            )}
          </div>
        </div>

        {editMode ? (
          <div className="flex gap-3 mb-3">
            <button
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-bold shadow transition-colors disabled:opacity-50"
              onClick={handleSaveEdit}
              disabled={editLoading}
            >
              {editLoading ? "Saving..." : "Save"}
            </button>
            <button
              className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-lg font-medium transition-colors"
              onClick={handleCancelEdit}
              disabled={editLoading}
            >
              Cancel
            </button>
            {editError && <div className="text-sm text-destructive">{editError}</div>}
          </div>
        ) : (
          <div className="flex gap-3 mb-3">
            <button
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-lg font-bold shadow transition-colors"
              onClick={handleStartEdit}
            >
              Edit
            </button>
            <button
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-bold shadow transition-colors"
              onClick={() => onAddVisit(visitor)}
            >
              Add Visit
            </button>
          </div>
        )}

        <h3 className="font-semibold mb-2 text-foreground">Visits History</h3>
        <div className="rounded-xl shadow bg-card border border-border overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Purpose</th>
                <th className="p-2 text-left">Check-in</th>
                <th className="p-2 text-left">Check-out</th>
                <th className="p-2 text-left">Room</th>
                <th className="p-2 text-left">Department</th>
              </tr>
            </thead>
            <tbody>
              {visitor.visits.map((visit) => (
                <tr key={visit.id} className="border-b border-border">
                  <td className="p-2">{format(new Date(visit.checkedIn), "yyyy-MM-dd")}</td>
                  <td className="p-2">{visit.purpose ?? "-"}</td>
                  <td className="p-2">{format(new Date(visit.checkedIn), "HH:mm")}</td>
                  <td className="p-2">
                    {visit.checkedOut ? (
                      format(new Date(visit.checkedOut), "HH:mm")
                    ) : (
                      <span className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 font-bold">Active</span>
                    )}
                  </td>
                  <td className="p-2">{visit.booking?.room?.name ?? visit.booking?.room ?? "-"}</td>
                  <td className="p-2">
                    {visit.booking?.room?.department?.name ?? visit.booking?.room?.department ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => {
              onClose()
              setEditMode(false)
            }}
            className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
