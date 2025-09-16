"use client";


import React, { useState } from "react";
import { getAlBarakaColorClasses } from "../../lib/colors";

// Types
export type Reservation = {
  id: number;
  title: string;
  room: string;
};

export type VisitorForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  purpose: string;
  reservationId: string | number;
};

type AddVisitorModalProps = {
  reservations: Reservation[];
  onClose: () => void;
  onSave: (data: VisitorForm) => void;
  onCreateReservation: (data: Omit<Reservation, "id">) => Promise<Reservation>;
  initialData?: Partial<VisitorForm>;
};

export default function AddVisitorModal({
  reservations,
  onClose,
  onSave,
  onCreateReservation,
  initialData = {},
}: AddVisitorModalProps) {
  const [formData, setFormData] = useState<VisitorForm>({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    purpose: initialData.purpose || "",
    reservationId: initialData.reservationId || "",
  });
  const isReadOnly = !!(initialData.firstName || initialData.lastName || initialData.email || initialData.phone);

  const [newReservation, setNewReservation] = useState({ title: "", room: "" });
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveVisitor = () => {
    onSave(formData);
    onClose();
  };

  const handleCreateReservation = async () => {
    try {
      setLoading(true);
      const created = await onCreateReservation(newReservation);

      // reset mini form
      setNewReservation({ title: "", room: "" });
      setShowReservationModal(false);

      // auto-select new reservation
      setFormData((prev) => ({
        ...prev,
        reservationId: created.id,
      }));
    } catch (err) {
      console.error("Error creating reservation:", err);
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.firstName && formData.lastName;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
  <h2 className="mb-4 text-xl font-semibold text-slate-700">Ajouter un visiteur</h2>

        {/* Visitor Info */}
  <h3 className="mb-2 font-medium text-slate-700">Informations du visiteur</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name *"
            value={formData.firstName}
            onChange={handleChange}
            className="rounded border px-2 py-1 border-slate-300"
            required
            readOnly={isReadOnly}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name *"
            value={formData.lastName}
            onChange={handleChange}
            className="rounded border px-2 py-1 border-slate-300"
            required
            readOnly={isReadOnly}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="rounded border px-2 py-1 border-slate-300"
            readOnly={isReadOnly}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="rounded border px-2 py-1 border-slate-300"
            readOnly={isReadOnly}
          />
        </div>

        {/* Purpose */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Motif de la visite</label>
          <input
            type="text"
            name="purpose"
            placeholder="Motif de la visite"
            value={formData.purpose}
            onChange={handleChange}
            className="mt-1 w-full rounded border px-2 py-1 border-slate-300"
          />
        </div>

        {/* Section Réservation */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Réservation</label>
          <div className="flex items-center gap-2">
            <select
              name="reservationId"
              value={formData.reservationId}
              onChange={handleChange}
              className="mt-1 flex-1 rounded border px-2 py-1 border-slate-300"
              aria-label="Sélectionner une réservation"
            >
              <option value="">-- Pas de réservation --</option>
              {reservations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.room})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded px-3 py-2 text-white bg-[#da5334] hover:bg-[#7f4936]"
              onClick={() => setShowReservationModal(true)}
            >
              + Nouvelle
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 text-slate-700"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            disabled={!isValid}
            className={`rounded px-4 py-2 text-white ${
              !isValid
                ? 'bg-slate-300'
                : 'bg-[#7f4936] hover:bg-[#da5334]'
            }`}
            onClick={handleSaveVisitor}
          >
            Enregistrer le visiteur
          </button>
        </div>
      </div>

      {/* Modal Création Réservation */}
      {showReservationModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-slate-700">Nouvelle réservation</h3>
            <input
              type="text"
              placeholder="Titre"
              value={newReservation.title}
              onChange={(e) =>
                setNewReservation((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="mb-2 w-full rounded border px-2 py-1 border-slate-300"
            />
            <input
              type="text"
              placeholder="Salle"
              value={newReservation.room}
              onChange={(e) =>
                setNewReservation((prev) => ({
                  ...prev,
                  room: e.target.value,
                }))
              }
              className="mb-4 w-full rounded border px-2 py-1 border-slate-300"
            />
            <div className="flex justify-end gap-2">
              <button
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400 text-slate-700"
                onClick={() => setShowReservationModal(false)}
              >
                Annuler
              </button>
              <button
                disabled={loading || !newReservation.title || !newReservation.room}
                className={`rounded px-4 py-2 text-white ${
                  !newReservation.title || !newReservation.room
                    ? 'bg-red-200'
                    : 'bg-[#da5334] hover:bg-[#7f4936]'
                }`}
                onClick={handleCreateReservation}
              >
                {loading ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
