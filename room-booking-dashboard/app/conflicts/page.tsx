import { Suspense } from 'react'
import { ConflictsSection } from '@/components/conflicts/ConflictsSection'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function ConflictsPage() {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<LoadingSpinner />}>
        <ConflictsSection />
      </Suspense>
    </div>
  )
}
