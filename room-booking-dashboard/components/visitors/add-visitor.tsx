"use client"

import { useEffect, useState } from "react"
import { calendarApi } from "@/lib/api" // ajuster le chemin
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
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({})

  // Charger les réservations du jour
  useEffect(() => {
    if (!isOpen) return
    async function fetchTodaysBookings() {
      try {
        const todayISO = new Date().toISOString().split("T")[0]
        const data = await calendarApi.getBookingsForDay(todayISO)
        setBookings(data || [])
      } catch (err) {
        console.error("Échec du chargement des réservations du jour", err)
        setBookings([])
      }
    }
    fetchTodaysBookings()
  }, [isOpen])

  // Réinitialiser les erreurs à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setLocalErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    const errors: { [key: string]: string } = {}

    if (!form.firstName.trim()) {
      errors.firstName = "Le prénom est requis."
    }
    if (!form.lastName.trim()) {
      errors.lastName = "Le nom est requis."
    }
    if (!form.purpose.trim()) {
      errors.purpose = "Le motif de la visite est requis."
    }

    // Validation email (optionnel mais doit être valide si renseigné)
    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email)) {
        errors.email = "Veuillez saisir une adresse email valide."
      }
    }

    // Validation téléphone (optionnel mais doit être valide si renseigné)
    if (form.phone.trim()) {
      const phoneRegex = /^[0-9+\-()\s]{6,20}$/
      if (!phoneRegex.test(form.phone)) {
        errors.phone = "Veuillez saisir un numéro de téléphone valide."
      }
    }

    setLocalErrors(errors)

    if (Object.keys(errors).length > 0) return
    onSubmit()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-[450px] p-8 relative">
        {/* Bouton de fermeture */}
        <button
          className="absolute top-3 right-3 px-3 py-1 rounded text-muted-foreground hover:bg-accent transition-colors"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-6 text-foreground">
          {mode === "new" ? "Nouveau visiteur" : "Nouvelle visite"}
        </h2>

        <div className="space-y-4">
          {/* Prénom */}
          <div>
            <input
              type="text"
              placeholder="Prénom *"
              className={`w-full rounded-lg px-3 py-2 border ${
                localErrors.firstName ? "border-red-500" : "border-input"
              } bg-background text-foreground`}
              value={form.firstName}
              onChange={(e) => onFormChange({ ...form, firstName: e.target.value })}
              disabled={mode === "existing"}
            />
            {localErrors.firstName && (
              <p className="text-xs text-red-500 mt-1">{localErrors.firstName}</p>
            )}
          </div>

          {/* Nom */}
          <div>
            <input
              type="text"
              placeholder="Nom *"
              className={`w-full rounded-lg px-3 py-2 border ${
                localErrors.lastName ? "border-red-500" : "border-input"
              } bg-background text-foreground`}
              value={form.lastName}
              onChange={(e) => onFormChange({ ...form, lastName: e.target.value })}
              disabled={mode === "existing"}
            />
            {localErrors.lastName && (
              <p className="text-xs text-red-500 mt-1">{localErrors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email (optionnel)"
              className={`w-full rounded-lg px-3 py-2 border ${
                localErrors.email ? "border-red-500" : "border-input"
              } bg-background text-foreground`}
              value={form.email}
              onChange={(e) => onFormChange({ ...form, email: e.target.value })}
              disabled={mode === "existing"}
            />
            {localErrors.email && (
              <p className="text-xs text-red-500 mt-1">{localErrors.email}</p>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <input
              type="tel"
              placeholder="Téléphone (optionnel)"
              className={`w-full rounded-lg px-3 py-2 border ${
                localErrors.phone ? "border-red-500" : "border-input"
              } bg-background text-foreground`}
              value={form.phone}
              onChange={(e) => onFormChange({ ...form, phone: e.target.value })}
              disabled={mode === "existing"}
            />
            {localErrors.phone && (
              <p className="text-xs text-red-500 mt-1">{localErrors.phone}</p>
            )}
          </div>

          {/* Motif */}
          <div>
            <input
              type="text"
              placeholder="Motif de la visite *"
              className={`w-full rounded-lg px-3 py-2 border ${
                localErrors.purpose ? "border-red-500" : "border-input"
              } bg-background text-foreground`}
              value={form.purpose}
              onChange={(e) => onFormChange({ ...form, purpose: e.target.value })}
            />
            {localErrors.purpose && (
              <p className="text-xs text-red-500 mt-1">{localErrors.purpose}</p>
            )}
          </div>

          {/* Sélection réservation */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Sélectionner une réservation d’aujourd’hui (optionnel)
            </label>
            <select
              className="w-full rounded-lg px-3 py-2 border border-input bg-background text-foreground"
              value={form.bookingId ?? ""}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  bookingId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            >
              <option value="">— Aucune réservation —</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.room?.name || "Salle inconnue"}
                </option>
              ))}
            </select>
          </div>

          {/* Erreur API */}
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>

        {/* Pied de page */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-bold shadow transition-colors disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer & Check-in"}
          </button>
        </div>
      </div>
    </div>
  )
}
