/**
 * Counts + RSVP buttons for one event. Used on /events and /event/:id.
 * Reads RSVPs live with useQuery, but never writes them: every click goes to
 * the setRsvp server action, which enforces capacity and runs the waitlist.
 */

import { useState } from 'react'
import { useAuth, useQuery } from 'deepspace'
import { Button } from '@/components/ui'
import { callAction } from '@/lib/api'

type RsvpChoice = 'going' | 'maybe' | 'not-going'
type Rsvp = { eventId: string; userId: string; status: RsvpChoice | 'waitlist'; waitlistedAt?: number }

const CHOICES: { value: RsvpChoice; label: string }[] = [
  { value: 'going', label: 'Going' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'not-going', label: 'Not going' },
]

export default function RsvpControls({
  eventId,
  capacity,
  hostId,
}: {
  eventId: string
  capacity?: number
  /** The event's creator. The host doesn't RSVP to their own event. */
  hostId: string
}) {
  const { isSignedIn, userId } = useAuth()
  const isHost = isSignedIn && userId === hostId
  const { records } = useQuery<Rsvp>('rsvps', { where: { eventId } })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goingCount = records.filter((r) => r.data.status === 'going').length
  const waitlistCount = records.filter((r) => r.data.status === 'waitlist').length
  const myStatus = records.find((r) => r.data.userId === userId)?.data.status

  async function choose(choice: RsvpChoice) {
    setBusy(true)
    setError(null)
    try {
      await callAction('setRsvp', { eventId, choice })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <p className="text-sm text-foreground">
        {capacity ? `${goingCount} / ${capacity} going` : `${goingCount} going`}
        {waitlistCount > 0 && ` · ${waitlistCount} waitlisted`}
      </p>

      {isHost && <p className="text-sm font-medium text-primary">You're hosting this event.</p>}

      {isSignedIn && !isHost && (
        <div className="flex flex-wrap gap-2">
          {CHOICES.map((c) => (
            <Button
              key={c.value}
              size="sm"
              // A waitlisted person asked for Going, so highlight that button
              variant={myStatus === c.value || (myStatus === 'waitlist' && c.value === 'going') ? 'default' : 'outline'}
              disabled={busy}
              onClick={() => choose(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      )}

      {myStatus === 'waitlist' && (
        <p className="text-sm text-muted-foreground">You're on the waitlist. You'll move up automatically if a spot opens.</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
