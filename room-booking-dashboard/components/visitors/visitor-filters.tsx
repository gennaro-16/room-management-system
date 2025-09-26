"use client"

import { useEffect, useState } from "react"

interface FilterState {
  startDate?: string
  endDate?: string
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
  const [showFilters, setShowFilters] = useState(false)

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
    <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
      {/* Top Row: Search + Toggle Button + Add Visitor */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="flex-1">
          <input
            id="search"
            type="text"
            placeholder="recherche par nom"
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full rounded-lg px-4 py-2 border border-input bg-background text-foreground shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex gap-3">
          {/* Toggle Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent transition-colors"
          >
            <span>Filters</span>
            <ChevronDownIcon 
              className={`w-4 h-4 transition-transform duration-300 ${
                showFilters ? 'rotate-180' : ''
              }`} 
            />
            
          </button>

          {/* Add Visitor Button */}
          <button
            onClick={onAddVisitor}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 py-2 rounded-lg shadow transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4" />
            nouveau 
          </button>
        </div>
      </div>

      {/* Collapsible Filters Section */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        showFilters ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
          {/* Date From */}
          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-xs font-medium text-muted-foreground mb-1">
              Du
            </label>
            <input
              id="startDate"
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
              className="rounded-lg px-3 py-2 border border-input bg-background text-foreground shadow-sm"
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col">
            <label htmlFor="endDate" className="text-xs font-medium text-muted-foreground mb-1">
              Au
            </label>
            <input
              id="endDate"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
              className="rounded-lg px-3 py-2 border border-input bg-background text-foreground shadow-sm"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label htmlFor="status" className="text-xs font-medium text-muted-foreground mb-1">
              status
            </label>
            <select
              id="status"
              value={filters.status || "all"}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="rounded-lg px-3 py-2 border border-input bg-background text-foreground shadow-sm"
            >
              <option value="all">tous les statuts</option>
              <option value="isActive">Actif</option>
              <option value="isCheckedOut">sorti</option>
            </select>
          </div>

          {/* Department */}
          <div className="flex flex-col">
            <label htmlFor="department" className="text-xs font-medium text-muted-foreground mb-1">
              Departement
            </label>
            <select
              id="department"
              value={filters.department || ""}
              onChange={(e) => onFiltersChange({ ...filters, department: e.target.value })}
              className="rounded-lg px-3 py-2 border border-input bg-background text-foreground shadow-sm"
            >
              <option value="">tous les Departements</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div className="flex flex-col">
            <label htmlFor="room" className="text-xs font-medium text-muted-foreground mb-1">
              Salle
            </label>
            <select
              id="room"
              value={filters.room || ""}
              onChange={(e) => onFiltersChange({ ...filters, room: e.target.value })}
              className="rounded-lg px-3 py-2 border border-input bg-background text-foreground shadow-sm"
            >
              <option value="">toutes les salles </option>
              {rooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>

          {/* Clear All */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => onFiltersChange({})}
              className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded border border-dashed hover:border-solid transition-colors"
            >
              Rénitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}