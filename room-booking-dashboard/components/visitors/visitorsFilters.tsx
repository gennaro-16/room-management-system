
"use client";

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filter: "active" | "checkedout" | "all";
  setFilter: (val: "active" | "checkedout" | "all") => void;
};

export default function VisitorFilters({ searchTerm, setSearchTerm, filter, setFilter }: Props) {
  return (
    <div className="flex items-center gap-2 w-full">
      {/* Search bar (expands) */}
      <input
        type="text"
        placeholder="Rechercher par nom..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 min-w-0 rounded-lg border px-3 py-2"
        style={{ borderColor: "rgb(169, 169, 170)" }}
      />
      {/* Filter dropdown (shrinks) */}
      <label htmlFor="visitor-filter" className="sr-only">
        Filtrer les visiteurs
      </label>
      <select
        id="visitor-filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value as any)}
        className="rounded-lg border px-3 py-2 flex-shrink-0 w-auto"
        style={{ borderColor: "rgb(169, 169, 170)", maxWidth: 180 }}
      >
        <option value="all">Tous</option>
        <option value="active">Visiteurs actifs</option>
        <option value="checkedout">Visiteurs sortis</option>
      </select>
    </div>
  );
}