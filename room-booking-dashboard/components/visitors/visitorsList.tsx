
"use client";

import VisitorRow from "./visitorsRow";

type Props = {
  date: Date | null;
  searchTerm: string;
  filter: "active" | "checkedout" | "all";
  onSelectVisitor: (v: any) => void;
};

const MOCK_VISITORS = [
  {
    id: 1,
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@email.com",
    phone: "0123456789",
    type: "Invité",
    purpose: "Réunion avec les RH",
    checkIn: "09:30",
    checkOut: null,
    host: "Alice",
    room: "Salle A",
    visitDate: "2023-10-15"
  },
  {
    id: 2,
    firstName: "Marie",
    lastName: "Martin",
    email: "marie.martin@email.com",
    phone: "0987654321",
    type: "Prestataire",
    purpose: "Maintenance informatique",
    checkIn: "10:00",
    checkOut: "12:00",
    host: "Bob",
    room: "Salle B",
    visitDate: "2023-10-16"
  },
  {
    id: 3,
    firstName: "Pierre",
    lastName: "Durand",
    email: "pierre.durand@email.com",
    phone: "0654321987",
    type: "Client",
    purpose: "Présentation produit",
    checkIn: "14:30",
    checkOut: null,
    host: "Charlie",
    room: "Salle C",
    visitDate: "2023-10-17"
  },
];

export default function VisitorList({ date, searchTerm, filter, onSelectVisitor }: Props) {
  // Format date for comparison
  const formatDateForComparison = (date: Date | null) => {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  };

  const targetDate = formatDateForComparison(date);
  
  // Filter mock visitors
  const filtered = MOCK_VISITORS.filter((v) => {
    const nameMatch = `${v.firstName} ${v.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filter === "all" || 
      (filter === "active" && !v.checkOut) || 
      (filter === "checkedout" && v.checkOut);
    const dateMatch = !targetDate || v.visitDate === targetDate;
    
    return nameMatch && statusMatch && dateMatch;
  });

  return (
    <div className="rounded-lg border bg-white shadow">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left" style={{ backgroundColor: "rgb(224, 225, 224)" }}>
            <th className="p-2">Nom</th>
          
            <th className="p-2">Motif</th>
            <th className="p-2">Date de visite</th>
            <th className="p-2">Heure d'arrivée</th>
            <th className="p-2">Heure de départ</th>
            <th className="p-2">Hôte</th>
            <th className="p-2">Salle</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((v) => (
              <VisitorRow key={v.id} visitor={v} onClick={() => onSelectVisitor(v)} />
            ))
          ) : (
            <tr>
              <td colSpan={8} className="p-4 text-center">
                Aucun visiteur trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}