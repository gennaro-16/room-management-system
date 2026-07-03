"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import type { VisitorItem, UpdateVisitorDtoFront } from "@/lib/api"

interface VisitorDetailsModalProps {
  visitor: VisitorItem | null
  isOpen: boolean
  onClose: () => void
  onEdit: (visitor: VisitorItem, form: UpdateVisitorDtoFront) => Promise<void> | void
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
  const [localVisitor, setLocalVisitor] = useState<VisitorItem | null>(visitor)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<UpdateVisitorDtoFront>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    setLocalVisitor(visitor)
  }, [visitor])

  if (!isOpen || !localVisitor) return null

  const handleStartEdit = () => {
    setEditForm({
      firstName: localVisitor.firstName ?? "",
      lastName: localVisitor.lastName ?? "",
      email: localVisitor.email ?? "",
      phone: localVisitor.phone ?? "",
    })
    setEditMode(true)
  }

// Save edit with validation
const handleSaveEdit = async () => {
  // --- Email validation ---
  if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
    alert("Veuillez entrer un email valide.")
    return
  }

  // --- Phone validation (example: at least 8 digits) ---
  if (editForm.phone && !/^\+?[0-9]{8,15}$/.test(editForm.phone)) {
    alert("Veuillez entrer un numéro de téléphone valide.")
    return
  }

  const changed: UpdateVisitorDtoFront = {}

  ;(Object.keys(editForm) as (keyof UpdateVisitorDtoFront)[]).forEach((key) => {
    if (editForm[key] !== localVisitor[key]) {
      if (editForm[key] === "") return
      changed[key] = editForm[key]
    }
  })

  if (Object.keys(changed).length === 0) {
    setEditMode(false)
    return
  }

  await onEdit(localVisitor, changed)

  const updatedVisitor = { ...localVisitor, ...changed }
  setLocalVisitor(updatedVisitor)

  setEditMode(false)
}

  const handleCancelEdit = () => {
    setEditMode(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-[70vw] p-7 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 px-3 py-1 rounded text-muted-foreground hover:bg-accent transition-colors"
          onClick={() => {
            onClose()
            setEditMode(false)
          }}
        >
          ✕
        </button>
        <h2 className="font-bold text-xl mb-6 text-foreground">Détails du visiteur</h2>

        {/* Champs éditables */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Prénom</label>
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
                value={localVisitor.firstName}
                className="w-full rounded-lg px-3 py-2 border border-input bg-muted text-foreground"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Nom</label>
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
                value={localVisitor.lastName}
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
                value={localVisitor.email ?? ""}
                className="w-full rounded-lg px-3 py-2 border border-input bg-muted text-foreground"
                readOnly
              />
            )}
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Téléphone</label>
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
                value={localVisitor.phone ?? ""}
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
              {editLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-lg font-medium transition-colors"
              onClick={handleCancelEdit}
              disabled={editLoading}
            >
              Annuler
            </button>
            {editError && <div className="text-sm text-destructive">{editError}</div>}
          </div>
        ) : (
          <div className="flex gap-3 mb-3">
            <button
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-lg font-bold shadow transition-colors"
              onClick={handleStartEdit}
            >
              Modifier
            </button>
            <button
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-bold shadow transition-colors"
              onClick={() => onAddVisit(localVisitor)}
            >
              Ajouter une visite
            </button>
          </div>
        )}

        <h3 className="font-semibold mb-2 text-foreground">Historique des visites</h3>
        <div className="rounded-xl shadow bg-card border border-border overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Objet</th>
                <th className="p-2 text-center">Entrée</th>
                <th className="p-2 text-center">Sortie</th>
                <th className="p-2 text-center">Salle</th>
                <th className="p-2 text-center">Département</th>
              </tr>
            </thead>
            <tbody>
              {localVisitor.visits.map((visit) => (
                <tr key={visit.id} className="border-b border-border">
                  <td className="p-2 text-center">{format(new Date(visit.checkedIn), "yyyy-MM-dd")}</td>
                  <td className="p-2 text-center">{visit.purpose ?? "-"}</td>
                  <td className="p-2 text-center">{format(new Date(visit.checkedIn), "HH:mm")}</td>
                  <td className="p-2 text-center">
                    {visit.checkedOut ? (
                      format(new Date(visit.checkedOut), "HH:mm")
                    ) : (
                      <span className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 font-bold">
                        En cours
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-center">{visit.booking?.room?.name ?? visit.booking?.room ?? "-"}</td>
                  <td className="p-2 text-center">
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
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
