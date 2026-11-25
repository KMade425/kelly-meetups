/**
 * /event/:id: one event's full details, viewable by anyone (under (app)/,
 * not (protected)/). Signed-in visitors can RSVP here too.
 * The folder is `event/` (not `events/`) so it doesn't collide with the
 * existing /events page file.
 */

import { useQuery } from 'deepspace'
import { Link, useParams } from 'react-router-dom'
import { Button, buttonVariants } from '@/components/ui'
import HostName from '@/components/HostName'
import { downloadIcs, mapUrl } from '@/lib/calendar'
import RsvpControls from '@/components/RsvpControls'

type MeetupEvent = {
  title: string
  description?: string
  location: string
  startsAt: number
  capacity?: number
}

export default function EventViewPage() {
  // [id] in the file name becomes :id in the URL
  const { id = '' } = useParams()
  const { records, status } = useQuery<MeetupEvent>('events')
  const event = records.find((r) => r.recordId === id)

  if (status === 'loading') {
    return <p className="px-4 py-8 text-muted-foreground">Loading…</p>
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-8">
        <h1 className="text-xl font-semibold text-foreground">Event not found</h1>
        <Link to="/home" className="text-sm font-medium text-primary hover:underline">
          ← Back to events
        </Link>
      </div>
    )
  }

  const e = event.data
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <Link to="/home" className="text-sm font-medium text-primary hover:underline">
        ← Back to events
      </Link>

      <div className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(40,32,120,0.06),0_1px_3px_rgba(40,32,120,0.05)]">
        <h1 className="text-2xl font-semibold text-foreground">{e.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(e.startsAt).toLocaleString()} · {e.location}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadIcs({ id: event.recordId, ...e })}
          >
            Add to calendar
          </Button>
          {/* A real link styled like a button (a <button> inside an <a> is invalid HTML) */}
          <a
            href={mapUrl(e.location)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
          >
            Open in map
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          {e.capacity ? `Capacity: ${e.capacity}` : 'Unlimited spots'}
        </p>
        <p className="text-sm text-muted-foreground">
          <HostName userId={event.createdBy} />
        </p>

        {e.description ? (
          <p className="mt-4 whitespace-pre-wrap text-foreground">{e.description}</p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No description.</p>
        )}

        <RsvpControls eventId={event.recordId} capacity={e.capacity} hostId={event.createdBy} />
      </div>
    </div>
  )
}
