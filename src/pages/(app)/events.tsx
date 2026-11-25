/**
 * /events: everyone can browse; signed-in members can create events.
 * Lives under (app)/ (data access) but NOT (protected)/, so visitors who
 * aren't signed in can still see the list. The '*' rule in events-schema
 * lets them read; it doesn't let them write.
 */

import { useState } from 'react'
import { useAuth, useMutations, useQuery } from 'deepspace'
import { Button, Input, Label, Textarea } from '@/components/ui'
import HostName from '@/components/HostName'
import RsvpControls from '@/components/RsvpControls'

type MeetupEvent = {
  title: string
  description?: string
  location: string
  startsAt: number
  capacity?: number
}

export default function EventsPage() {
  const { isSignedIn } = useAuth()
  const { records, status } = useQuery<MeetupEvent>('events', { orderBy: 'startsAt' })

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">Events</h1>

      {isSignedIn ? (
        <CreateEventForm />
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to create an event.</p>
      )}

      {status === 'loading' ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : records.length === 0 ? (
        <p className="text-muted-foreground">No events yet.</p>
      ) : (
        <ul className="space-y-3">
          {records.map((r) => (
            <li key={r.recordId} className="rounded-lg border border-border bg-card p-4">
              <h2 className="font-semibold text-foreground">{r.data.title}</h2>
              <p className="text-sm text-muted-foreground">
                {new Date(r.data.startsAt).toLocaleString()} · {r.data.location}
              </p>
              <p className="text-sm text-muted-foreground">
                {r.data.capacity ? `Capacity: ${r.data.capacity}` : 'Unlimited spots'}
              </p>
              <p className="text-sm text-muted-foreground">
                <HostName userId={r.createdBy} />
              </p>
              {r.data.description && <p className="mt-2 text-sm text-foreground">{r.data.description}</p>}
              <RsvpControls eventId={r.recordId} capacity={r.data.capacity} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CreateEventForm() {
  const { ready, createConfirmed } = useMutations<MeetupEvent>('events')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [capacity, setCapacity] = useState('')
  const [unlimited, setUnlimited] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Events must be in the future
    if (new Date(startsAt).getTime() < Date.now()) {
      setError('Pick a date and time in the future.')
      return
    }

    const cap = Number(capacity)
    if (!unlimited && (!Number.isInteger(cap) || cap < 1)) {
      setError('Capacity must be a whole number of 1 or more, or tick Unlimited.')
      return
    }

    const event: MeetupEvent = {
      title: title.trim(),
      location: location.trim(),
      startsAt: new Date(startsAt).getTime(),
    }
    if (description.trim()) event.description = description.trim()
    if (!unlimited) event.capacity = cap // leave it out entirely for unlimited

    try {
      await createConfirmed(event)
      setTitle('')
      setDescription('')
      setLocation('')
      setStartsAt('')
      setCapacity('')
      setUnlimited(false)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-5">
      <h2 className="font-semibold text-foreground">Create an event</h2>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" required value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startsAt">Date and time</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="capacity">Capacity</Label>
        <div className="flex items-center gap-4">
          <Input
            id="capacity"
            type="number"
            min={1}
            className="w-32"
            disabled={unlimited}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
            Unlimited
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!ready}>
        Create event
      </Button>
    </form>
  )
}
