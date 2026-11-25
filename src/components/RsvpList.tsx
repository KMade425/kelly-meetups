/**
 * "Who's coming" on /event/:id: tabs for Going, Maybe, Not going and
 * Waitlist, each listing the people with that RSVP. Live via useQuery, so the
 * lists update as people change their answers.
 *
 * Names come from useUserLookup, which DeepSpace only fills for signed-in
 * users; signed-out visitors see the counts but not the names.
 */

import { useAuth, useQuery, useUserLookup } from 'deepspace'
import { Avatar, AvatarFallback, AvatarImage, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'

type RsvpStatus = 'going' | 'maybe' | 'not-going' | 'waitlist'
type Rsvp = { eventId: string; userId: string; status: RsvpStatus; waitlistedAt?: number }

const TABS: { value: RsvpStatus; label: string; empty: string }[] = [
  { value: 'going', label: 'Going', empty: 'Nobody is going yet.' },
  { value: 'maybe', label: 'Maybe', empty: 'Nobody has said maybe.' },
  { value: 'not-going', label: 'Not going', empty: "Nobody has said they can't make it." },
  { value: 'waitlist', label: 'Waitlist', empty: 'The waitlist is empty.' },
]

export default function RsvpList({ eventId }: { eventId: string }) {
  const { isSignedIn } = useAuth()
  const { records } = useQuery<Rsvp>('rsvps', { where: { eventId } })
  const { getUser, usersLoaded } = useUserLookup()

  function peopleWith(status: RsvpStatus) {
    const rows = records.filter((r) => r.data.status === status)
    // The waitlist is shown in line order; the others in the order people answered.
    return status === 'waitlist'
      ? rows.sort((a, b) => (a.data.waitlistedAt ?? 0) - (b.data.waitlistedAt ?? 0))
      : rows.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
  }

  return (
    <section className="mt-5 border-t border-border pt-4">
      <h2 className="mb-3 text-base font-semibold text-foreground">Who's coming</h2>
      <Tabs defaultValue="going">
        <TabsList className="h-auto w-full flex-wrap sm:w-fit">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="rounded-full bg-accent px-1.5 text-xs text-accent-foreground">
                {peopleWith(t.value).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => {
          const people = peopleWith(t.value)
          return (
            <TabsContent key={t.value} value={t.value} className="pt-2">
              {people.length === 0 ? (
                <p className="py-3 text-sm text-muted-foreground">{t.empty}</p>
              ) : !isSignedIn ? (
                <p className="py-3 text-sm text-muted-foreground">Sign in to see who has answered.</p>
              ) : !usersLoaded ? (
                <p className="py-3 text-sm text-muted-foreground">Loading…</p>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {people.map((r, i) => {
                    const user = getUser(r.data.userId)
                    const name = user?.name || 'A member'
                    return (
                      <li key={r.recordId} className="flex items-center gap-3 px-3 py-2">
                        {t.value === 'waitlist' && (
                          <span className="w-5 text-right text-xs font-medium text-muted-foreground">{i + 1}.</span>
                        )}
                        <Avatar className="h-7 w-7 ring-1 ring-inset ring-border">
                          <AvatarImage src={user?.imageUrl ?? undefined} referrerPolicy="no-referrer" />
                          <AvatarFallback className="text-[11px]">{name[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="truncate text-sm text-foreground">{name}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </section>
  )
}
