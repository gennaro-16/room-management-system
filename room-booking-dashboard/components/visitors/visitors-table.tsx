"use client"

import { format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { VisitorItem } from "@/lib/api2"

interface VisitorsTableProps {
  visits: Array<{
    id: number
    checkedIn: string
    checkedOut?: string
    purpose?: string
    bookingId?: number
    booking?: any
    visitor: VisitorItem
  }>
  loading: boolean
  onVisitorClick: (visitor: VisitorItem) => void
  onCheckout: (visitId: number) => void
  currentPage: number
  totalPages: number
  totalVisits: number
  onPageChange: (page: number) => void
  onPreviousPage: () => void
  onNextPage: () => void
}

export function VisitorsTable({
  visits,
  loading,
  onVisitorClick,
  onCheckout,
  currentPage,
  totalPages,
  totalVisits,
  onPageChange,
  onPreviousPage,
  onNextPage,
}: VisitorsTableProps) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="rounded-xl shadow-lg bg-card border border-border overflow-hidden">
      <div className="overflow-x-auto max-h-[60vh]">
        <table className="w-full border-collapse text-base">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="p-4 font-semibold text-left">Visitor</th>
              <th className="p-4 font-semibold text-left">Date</th>
                            <th className="p-4 font-semibold text-left">Check-in</th>

              <th className="p-4 font-semibold text-left">Purpose</th>
              <th className="p-4 font-semibold text-left">Room</th>
              <th className="p-4 font-semibold text-left">Department</th>
                            <th className="p-4 font-semibold text-left">Check-out</th>

            </tr>
          </thead>
          <tbody>
            {!loading && visits.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  No visitors found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  Loading...
                </td>
              </tr>
            )}
            {visits.map((visit) => (
              <tr
                key={visit.id}
                className="hover:bg-accent/50 cursor-pointer transition-colors border-b border-border"
                onClick={() => onVisitorClick(visit.visitor)}
              >
                <td className="px-4 py-3">
                  {visit.visitor.firstName} {visit.visitor.lastName}
                </td>
                <td className="px-4 py-3">{format(new Date(visit.checkedIn), "yyyy-MM-dd")}</td>
                                <td className="px-4 py-3">{format(new Date(visit.checkedIn), "HH:mm")}</td>

                <td className="px-4 py-3">{visit.purpose ?? "-"}</td>

                <td className="px-4 py-3">{visit.booking?.room?.name ?? visit.booking?.room ?? "-"}</td>
                <td className="px-4 py-3">
                  {visit.booking?.room?.department?.name ?? visit.booking?.room?.department ?? "-"}
                </td>
                                <td className="px-4 py-3">
                  {visit.checkedOut ? (
                    format(new Date(visit.checkedOut), "HH:mm")
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCheckout(visit.id)
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-3 py-1 rounded-lg font-semibold transition-colors"
                    >
                      Checkout
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * 8 + 1, totalVisits)} to {Math.min(currentPage * 8, totalVisits)} of{" "}
            {totalVisits} visits
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    page === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
