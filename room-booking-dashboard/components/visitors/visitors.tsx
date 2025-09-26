"use client"

import { useEffect, useState } from "react"
import { visitorsApi, type VisitorItem, type CreateVisitorDto, type UpdateVisitorDtoFront } from "@/lib/api"
import { VisitorFilters } from "@/components/visitors/visitor-filters"
import { VisitorsTable } from "@/components/visitors/visitors-table"
import { AddVisitorModal } from "@/components/visitors/add-visitor"
import { VisitorDetailsModal } from "@/components/visitors/visitor-details"
import { useBookings} from "@/hooks/useApi";

type FilterState = {
  date?: string
  status?: string
  search?: string
  department?: string
  room?: string
}

type AddVisitForm = {
  visitorId?: number   // <--- new field
  firstName: string
  lastName: string
  email: string
  phone: string
  purpose: string
  bookingId?: number
}


type VisitModalMode = "new" | "existing" | null

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<VisitorItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    date: "",
    status: "",
    search: "",
    department: "",
    room: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const visitsPerPage = 8

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0
  })

  // Add Visit Modal State
  const [showVisitModal, setShowVisitModal] = useState<VisitModalMode>(null)
  const [addForm, setAddForm] = useState<AddVisitForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    purpose: "",
    bookingId: undefined,
  })
  const [addVisitorLoading, setAddVisitorLoading] = useState(false)
  const [addVisitorError, setAddVisitorError] = useState<string | null>(null)

  // Booking Popup State  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Statistics
  const [todayCount, setTodayCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [checkedOutCount, setCheckedOutCount] = useState(0)

  // Visitor Details Modal State
  const [showVisitorDetails, setShowVisitorDetails] = useState<VisitorItem | null>(null)

  // Edit Visitor Modal State
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // For which visitor we're adding a visit (existing)
  const [activeVisitorForVisit, setActiveVisitorForVisit] = useState<VisitorItem | null>(null)

  const allVisits = visitors.flatMap((visitor) => visitor.visits.map((visit) => ({ ...visit, visitor })))
  const totalVisits = pagination.total
  const totalPages = pagination.totalPages
  
  const paginatedVisits = allVisits

  const loadVisitors = async () => {
    setLoading(true)
    try {
      const { visitors: data, pagination: paginationData } = await visitorsApi.getAll({
        ...filters,
        page: currentPage,
        limit: visitsPerPage
      })
      
      setVisitors(data)
      
      setPagination(paginationData)
      console.log('Pagination data:', paginationData)
      console.log('Visitors data:', data)      // Stats
      let today = 0, active = 0, checkedOut = 0
      const todayDate = new Date().toDateString()
      data.forEach((v) => {
        v.visits.forEach((visit) => {
          if (new Date(visit.checkedIn).toDateString() === todayDate) today++
          if (!visit.checkedOut) active++
          else checkedOut++
        })
      })
      setTodayCount(today)
      setActiveCount(active)
      setCheckedOutCount(checkedOut)
    } catch {
      setVisitors([])
      setPagination({ total: 0, page: 1, limit: 8, totalPages: 0 })
      setTodayCount(0)
      setActiveCount(0)
      setCheckedOutCount(0)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadVisitors()
  }, [filters, currentPage])

  const handleCheckout = async (visitId: number) => {
    await visitorsApi.checkout(visitId)
    await loadVisitors()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleShowVisitorDetails = async (visitor: VisitorItem) => {
  try {
    const visitorWithVisits = await visitorsApi.getAllVisitsOfVisitor(visitor.id);
    setShowVisitorDetails(visitorWithVisits);
  } catch (err: any) {
    console.error(err);
  }
}

  
  const handleEditVisitor = async (visitor: VisitorItem, editForm: UpdateVisitorDtoFront) => {
  console.log("visitor data",visitor,editForm);
    setEditLoading(true)
    setShowVisitorDetails(null)
    setEditError(null)
    try {
      await visitorsApi.update(visitor.id, editForm)
      setEditLoading(false)
      await loadVisitors()
      // Refresh details popup
      const updated = visitors.find((v) => v.id === visitor.id)
      setShowVisitorDetails( null)
    } catch (err: any) {
      setEditError(err.message || "Error updating visitor.")
      setEditLoading(false)
    }
  }


    const { data: bookings, error, refetch } = useBookings();
    console.log('Bookings data:', bookings);
  
  // Open Add Visit modal for existing visitor
  const handleShowAddVisitForExisting = (visitor: VisitorItem) => {
    setActiveVisitorForVisit(visitor)
   setAddForm({
  visitorId: visitor.id,   // <--- set visitorId
  firstName: visitor.firstName,
  lastName: visitor.lastName,
  email: visitor.email ?? "",
  phone: visitor.phone ?? "",
  purpose: "",
  bookingId: undefined,
})
    setShowVisitModal("existing")
    setShowVisitorDetails(null) // Close visitor details modal
  }

  // Open Add Visitor modal
  const handleShowAddVisitor = () => {
    setAddForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      purpose: "",
      bookingId: undefined,
    })
    setShowVisitModal("new")
  }

  const handleCloseVisitModal = () => {
    setShowVisitModal(null)
    setActiveVisitorForVisit(null)
    setAddVisitorError(null)
  }
  const handleAddVisit = async () => {
  setAddVisitorLoading(true)
  setAddVisitorError(null)
  try {
    const payload = {
      visitorId: addForm.visitorId,  // <-- this will be undefined for new visitor
      firstName: addForm.firstName,
      lastName: addForm.lastName,
      email: addForm.email,
      phone: addForm.phone,
      purpose: addForm.purpose,
      bookingId: addForm.bookingId,
    }

    const result = await visitorsApi.createVisitorWithVisit(payload)
    await loadVisitors()
    handleCloseVisitModal()
  } catch (err: any) {
    setAddVisitorError(err.message || "Error adding visitor/visit")
  } finally {
    setAddVisitorLoading(false)
  }
}


  return (
    <div className="max-w-6xl mx-auto flex flex-col py-9 px-4 min-h-screen">
      {/* <h1 className="text-4xl font-bold text-center mb-10 text-foreground">Visitor & Visit Management</h1>

      {/* Stats cards */}
      {/* <VisitorStats todayCount={todayCount} activeCount={activeCount} checkedOutCount={checkedOutCount} /> */} 
      {/* Filters & Add button */}
      <VisitorFilters filters={filters} onFiltersChange={setFilters} onAddVisitor={handleShowAddVisitor} />

      {/* Visits list */}
      <VisitorsTable
        visits={paginatedVisits}
        loading={loading}
        onVisitorClick={handleShowVisitorDetails}
        onCheckout={handleCheckout}
        currentPage={currentPage}
        totalPages={totalPages}
        totalVisits={totalVisits}
        onPageChange={handlePageChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />

      {/* Add Visitor + Visit Modal OR Add Visit for Existing Visitor Modal */}
      <AddVisitorModal
        isOpen={!!showVisitModal}
        mode={showVisitModal}
        form={addForm}
        loading={addVisitorLoading}
        error={addVisitorError}
        onClose={handleCloseVisitModal}
        onFormChange={setAddForm}
        onSubmit={handleAddVisit}
       
      />

      {/* Booking Dialog Popup */}
     

      {/* Visitor Details Popup */}
      <VisitorDetailsModal
        visitor={showVisitorDetails}
        isOpen={!!showVisitorDetails}
        onClose={() => setShowVisitorDetails(null)}
        onEdit={handleEditVisitor}
        onAddVisit={handleShowAddVisitForExisting}
        editLoading={editLoading}
        editError={editError}
      />
    </div>
  )
}