
"use client";
import { useState } from "react";

type Props = {
  visitor: any;
  onClick: () => void;
};

export default function VisitorRow({ visitor, onClick }: Props) {
  const [localCheckout, setLocalCheckout] = useState<string | null>(visitor.checkOut);
  const handleCheckout = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLocalCheckout(time);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <tr
      className="cursor-pointer border-b hover:bg-gray-50"
      onClick={onClick}
      style={{ borderBottomColor: "rgb(224, 225, 224)" }}
    >
      <td className="p-2">{visitor.firstName} {visitor.lastName}</td>
    
      <td className="p-2">{visitor.purpose}</td>
      <td className="p-2">{formatDate(visitor.visitDate)}</td>
      <td className="p-2">{visitor.checkIn}</td>
      <td className="p-2">
        {localCheckout ? (
          localCheckout
        ) : (
          <button 
            className="rounded px-2 py-1 text-white hover:bg-[#da5334]"
            style={{ backgroundColor: "rgb(218, 83, 52)" }}
            onClick={handleCheckout}
          >
            Enregistrer sortie
          </button>
        )}
      </td>
      <td className="p-2">{visitor.host}</td>
      <td className="p-2">{visitor.room}</td>
    </tr>
  );
}
