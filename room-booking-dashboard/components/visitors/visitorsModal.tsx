"use client";

import { useState } from "react";
import VisitorList from "./visitorsList";
import AddVisitorModal, { Reservation, VisitorForm } from "./addvisitormodel";

type Props = {
  visitor: any;
  onClose: () => void;
  onCreateReservation: (data: Omit<Reservation, "id">) => Promise<Reservation>;
  reservations: Reservation[];
};

// Mock visit history data
const MOCK_VISIT_HISTORY = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    type: "Invité",
    purpose: "Réunion avec les RH",
    checkIn: "09:30",
    checkOut: "11:00",
    host: "Alice",
    room: "Salle A",
    visitDate: "2023-10-10"
  },
  {
    id: 2,
    firstName: "Jean",
    lastName: "Dupont",
    type: "Invité",
    purpose: "Entretien d'embauche",
    checkIn: "14:00",
    checkOut: "15:30",
    host: "David",
    room: "Salle D",
    visitDate: "2023-09-28"
  },
];

export default function VisitorModal({ visitor, onClose, onCreateReservation, reservations }: Props) {
  const [editing, setEditing] = useState(false);
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: visitor.firstName ?? "",
    lastName: visitor.lastName ?? "",
    email: visitor.email ?? "",
    phone: visitor.phone ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // TODO: connect to API to save visitor info
    console.log("Saving visitor info:", formData);
    setEditing(false);
  };

  const handleSaveVisit = (visitData: VisitorForm) => {
    // TODO: Save the visit data
    console.log("Saving visit:", visitData);
    setShowAddVisitModal(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
        {/* Visitor Info */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Détails du visiteur</h2>
          {!editing ? (
            <div className="flex gap-2">
              <button
                className="rounded px-3 py-1 text-white hover:bg-[#7f4936]"
                style={{ backgroundColor: "rgb(127, 73, 54)" }}
                onClick={() => setShowAddVisitModal(true)}
              >
                Ajouter une visite
              </button>
              <button
                className="rounded px-3 py-1 text-white hover:bg-[#da5334]"
                style={{ backgroundColor: "rgb(218, 83, 52)" }}
                onClick={() => setEditing(true)}
              >
                Modifier
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                className="rounded bg-gray-300 px-3 py-1 hover:bg-gray-400"
                onClick={() => {
                  setEditing(false);
                  setFormData(visitor); // reset changes
                }}
              >
                Annuler
              </button>
              <button
                className="rounded px-3 py-1 text-white hover:bg-[#7f4936]"
                style={{ backgroundColor: "rgb(127, 73, 54)" }}
                onClick={handleSave}
              >
                Enregistrer
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Prénom</label>
            {editing ? (
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 w-full rounded border px-2 py-1"
                placeholder="Entrez le prénom"
              />
            ) : (
              <p className="mt-1">{formData.firstName || "-"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Nom</label>
            {editing ? (
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 w-full rounded border px-2 py-1"
                placeholder="Entrez le nom"
              />
            ) : (
              <p className="mt-1">{formData.lastName || "-"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            {editing ? (
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full rounded border px-2 py-1"
                placeholder="Entrez l'email"
              />
            ) : (
              <p className="mt-1">{formData.email || "-"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Téléphone</label>
            {editing ? (
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded border px-2 py-1"
                placeholder="Entrez le numéro de téléphone"
              />
            ) : (
              <p className="mt-1">{formData.phone || "-"}</p>
            )}
          </div>
        </div>

        {/* Visit History */}
        <div className="mt-6">
          <h3 className="mb-2 font-medium">Historique des visites</h3>
          <div className="rounded-lg border bg-white shadow">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left" style={{ backgroundColor: "rgb(224, 225, 224)" }}>
                  <th className="p-2">Date</th>
                  <th className="p-2">Motif</th>
                  <th className="p-2">Heure d'arrivée</th>
                  <th className="p-2">Heure de départ</th>
                  <th className="p-2">Hôte</th>
                  <th className="p-2">Salle</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_VISIT_HISTORY.map((visit) => {
                  const visitDate = new Date(visit.visitDate);
                  const formattedDate = visitDate.toLocaleDateString('fr-FR');
                  
                  return (
                    <tr key={visit.id} className="border-b" style={{ borderBottomColor: "rgb(224, 225, 224)" }}>
                      <td className="p-2">{formattedDate}</td>
                      <td className="p-2">{visit.purpose}</td>
                      <td className="p-2">{visit.checkIn}</td>
                      <td className="p-2">{visit.checkOut}</td>
                      <td className="p-2">{visit.host}</td>
                      <td className="p-2">{visit.room}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Close button */}
        <div className="mt-6 flex justify-end">
          <button
            className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Add Visit Modal */}
      {showAddVisitModal && (
        <AddVisitorModal
          reservations={reservations}
          onClose={() => setShowAddVisitModal(false)}
          onSave={handleSaveVisit}
          onCreateReservation={onCreateReservation}
          initialData={{
            firstName: visitor.firstName,
            lastName: visitor.lastName,
            email: visitor.email,
            phone: visitor.phone,
          }}
        />
      )}
    </div>
  );
}