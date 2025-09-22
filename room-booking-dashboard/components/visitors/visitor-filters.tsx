"use client"

import { useEffect, useState } from "react"

interface FilterState {
  date?: string
  status?: string
  search?: string
  department?: string
  room?: string
}

interface VisitorFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onAddVisitor: () => void
}

export function VisitorFilters({ filters, onFiltersChange, onAddVisitor }: VisitorFiltersProps) {
  const [rooms, setRooms] = useState<string[]>([])
  const [departments, setDepartments] = useState<string[]>([])

  // Fetch filters from backend on component mount
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("http://localhost:3000/visits/filters")
        const data = await res.json()
        setRooms(data.rooms || [])
        setDepartments(data.departments || [])
      } catch (err) {
        console.error("Failed to fetch filters", err)
      }
    }

    fetchFilters()
  }, [])

  return (
    <div className="flex gap-3 items-center mb-7 flex-wrap">
      <input
        type="date"
        value={filters.date || ""}
        onChange={(e) => onFiltersChange({ ...filters, date: e.target.value })}
        className="rounded-lg px-3 py-2 border border-input bg-background text-foreground shadow-sm"
      />
      <select
        value={filters.status || "all"}
        onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
        className="rounded-lg px-3 py-2 border border-input bg-background text-foreground shadow-sm"
      >
        <option value="all">All</option>
        <option value="isActive">Active</option>
        <option value="isCheckedOut">Checked Out</option>
      </select>
      <select
        value={filters.department || ""}
        onChange={(e) => onFiltersChange({ ...filters, department: e.target.value })}
        className="rounded-lg px-3 py-2 border border-input bg-background text-foreground shadow-sm"
      >
        <option value="">All Departments</option>
        {departments.map((dep) => (
          <option key={dep} value={dep}>
            {dep}
          </option>
        ))}
      </select>
      <select
        value={filters.room || ""}
        onChange={(e) => onFiltersChange({ ...filters, room: e.target.value })}
        className="rounded-lg px-3 py-2 border border-input bg-background text-foreground shadow-sm"
      >
        <option value="">All Rooms</option>
        {rooms.map((room) => (
          <option key={room} value={room}>
            {room}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Search by name..."
        value={filters.search || ""}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        className="flex-1 min-w-[200px] rounded-lg px-3 py-2 border border-input bg-background text-foreground shadow-sm"
      />
      <button
        onClick={onAddVisitor}
        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-5 py-2 rounded-lg shadow transition-colors"
      >
        + Add Visitor & Visit
      </button>
    </div>
  )
}
