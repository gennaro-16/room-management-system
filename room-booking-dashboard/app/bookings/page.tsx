import BookingGrid from "./bookings-grid"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-full mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Room Booking System</h1>
          <p className="text-muted-foreground">Visual overview of all room bookings across departments</p>
        </div>
        <BookingGrid />
      </div>
    </main>
  )
}
