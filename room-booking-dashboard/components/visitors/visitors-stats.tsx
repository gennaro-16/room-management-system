interface VisitorStatsProps {
  todayCount: number
  activeCount: number
  checkedOutCount: number
}

export function VisitorStats({ todayCount, activeCount, checkedOutCount }: VisitorStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-primary text-primary-foreground rounded-xl shadow-lg p-6 flex flex-col items-center gap-2">
        <span className="font-medium text-lg">Today's Visitors</span>
        <span className="text-4xl font-bold">{todayCount}</span>
      </div>
      <div className="bg-secondary text-secondary-foreground rounded-xl shadow-lg p-6 flex flex-col items-center gap-2">
        <span className="font-medium text-lg">Active Visitors</span>
        <span className="text-4xl font-bold">{activeCount}</span>
      </div>
      <div className="bg-accent text-accent-foreground rounded-xl shadow-lg p-6 flex flex-col items-center gap-2">
        <span className="font-medium text-lg">Checked Out</span>
        <span className="text-4xl font-bold">{checkedOutCount}</span>
      </div>
    </div>
  )
}
