/**
 * /home: a read-only list of upcoming events that anyone can view.
 * Under (app)/ for data access but not (protected)/, so signed-out visitors
 * see it too; the events schema's '*' rule allows read. Creating events and
 * RSVPing happen on /events.
 */

import { useQuery } from 'deepspace'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../../constants'
import HostName from '@/components/HostName'

type MeetupEvent = {
  title: string
  description?: string
  location: string
  startsAt: number
  capacity?: number
}

export default function HomePage() {
  const { records, status } = useQuery<MeetupEvent>('events', { orderBy: 'startsAt', orderDir: 'asc' })
  // Past events stay in the database; the home page only shows what's coming up.
  const upcoming = records.filter((r) => r.data.startsAt >= Date.now())

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Welcome to {APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">Upcoming meetups</p>
      </div>

      {status === 'loading' ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : upcoming.length === 0 ? (
        <p className="text-muted-foreground">No upcoming events.</p>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((r) => (
            <li key={r.recordId}>
              {/* The whole card is a link to that event's page */}
              <Link
                to={`/event/${r.recordId}`}
                className="block rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(40,32,120,0.06),0_1px_3px_rgba(40,32,120,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-6px_rgba(91,85,224,0.22)]"
              >
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
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to="/events" className="inline-block text-sm font-medium text-primary hover:underline">
        Create an event or RSVP →
      </Link>
    </div>
  )
}
