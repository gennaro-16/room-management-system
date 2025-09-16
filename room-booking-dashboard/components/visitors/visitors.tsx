
"use client";

import { useState } from "react";
import DatePicker from "./calender";
import VisitorFilters from "./visitorsFilters";
import VisitorList from "./visitorsList";
import VisitorModal from "./visitorsModal";
import AddVisitorModal, {
  Reservation,
  VisitorForm,
} from "./addvisitormodel";

export default function VisitorsPage() {
  // state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"active" | "checkedout" | "all">("all");
  const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);

  const [reservations, setReservations] = useState<Reservation[]>([
    { id: 1, title: "Réunion d'équipe", room: "Salle A" },
    { id: 2, title: "Briefing client", room: "Salle B" },
  ]);
  const [visitors, setVisitors] = useState<VisitorForm[]>([]);

  // When the modal saves a visitor:
  const handleSaveVisitor = (visitor: VisitorForm) => {
    setVisitors((prev) => [...prev, visitor]);
  };

  // Create a new reservation
  const handleCreateReservation = async (data: Omit<Reservation, "id">) => {
    const newRes: Reservation = {
      id: Date.now(),
      title: data.title,
      room: data.room,
    };
    setReservations((prev) => [...prev, newRes]);
    return newRes;
  };

  // Handle date change from DatePicker
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  }

  // UI
  return (
    <div className="p-6 space-y-6">
      {/* Top controls */}
      <div className="flex justify-between items-center gap-4">
        {/* Calendar */}
  <DatePicker onChange={handleDateChange} />

        {/* Filters */}
        <VisitorFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
          
        />

        {/* Add new visitor */}
        <button
          onClick={() => setShowAddVisitorModal(true)}
          className="rounded px-6 py-2 text-white font-medium hover:bg-[#7f4936] whitespace-nowrap"
          style={{ backgroundColor: "rgb(127, 73, 54)", minWidth: '180px' }}
        >
          Ajouter un visiteur
        </button>

        {showAddVisitorModal && (
          <AddVisitorModal
            reservations={reservations}
            onClose={() => setShowAddVisitorModal(false)}
            onSave={handleSaveVisitor}
            onCreateReservation={handleCreateReservation}
          />
        )}
      </div>

      {/* Visitor List */}
      <VisitorList
        date={selectedDate}
        searchTerm={searchTerm}
        filter={filter}
        onSelectVisitor={setSelectedVisitor}
      />

      {/* Visitor Profile Modal */}
      {selectedVisitor && (
        <VisitorModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
          onCreateReservation={handleCreateReservation}
          reservations={reservations}
        />
      )}
    </div>
  );
}