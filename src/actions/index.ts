import { isAnonymousUserId, type ActionHandler } from 'deepspace/worker'
import type { Env } from '../../worker'

type ChoiceList =  'going' | 'maybe' | 'not-going'
type RsvpStatus = ChoiceList | 'waitlist'
type Rsvp = { eventId: string; userId: string; status: RsvpStatus; waitlistedAt?: number }

export const actions: Record<string, ActionHandler<Env>> = {
  /**
   * The only way RSVPs get written: members have no create/update rights on
   * `rsvps`, so the capacity check and waitlist below can't be bypassed.
   * Params: { eventId: string, choice: 'going' | 'maybe' | 'not-going' }
   */
  setRsvp: async ({ userId, params, tools }) => {
    // 1. Reject callers who aren't signed in
    if (!userId || isAnonymousUserId(userId)) {
      return { success: false, error: 'You must be signed in to RSVP to an event.' }
    }

    // 2. Check what the browser sent
    if (typeof params.eventId !== 'string' || !params.eventId) {
      return { success: false, error: 'Error encountered reading event. Please try again.' }
    }
    if (!['going', 'maybe', 'not-going'].includes(params.choice as string)) {
      return { success: false, error: 'Error encountered reading your RSVP choice. Please try again.' }
    }

    
    const eventId = params.eventId as string
    const choice = params.choice as ChoiceList

    // 3. Load the event; no capacity means unlimited
    const eventResult = await tools.get<{ capacity?: number }>('events', eventId)
    if (!eventResult.success) {
      return { success: false, error: 'Event not found.' }
    }
    const capacity = eventResult.data.record.data.capacity

    // The host runs the event; they don't RSVP to it.
    if (eventResult.data.record.createdBy === userId) {
      return { success: false, error: "You're hosting this event, so you don't need to RSVP." }
    }

    // 4. The caller's existing RSVP for this event, if any (uniqueOn allows one)
    const mineResult = await tools.query<Rsvp>('rsvps', { where: { eventId, userId }, limit: 1 })
    if (!mineResult.success) return { success: false, error: mineResult.error }
    const mine = mineResult.data.records[0]
    const oldStatus = mine?.data.status

    // 5. Decide the new status
    // Already going, or already waiting, and clicking Going again: no change
    // (a waitlisted person keeps their place in line).
    if (choice === 'going' && (oldStatus === 'going' || oldStatus === 'waitlist')) {
      return { success: true, data: { status: oldStatus } }
    }
    if (choice === oldStatus) {
      return { success: true, data: { status: oldStatus } }
    }

    let newStatus: RsvpStatus = choice
    let waitlistedAt: number | undefined
    if (choice === 'going' && capacity !== undefined) {
      // Only need to know whether `capacity` people are already going,
      // so ask for at most that many (the default limit is 50).
      const goingResult = await tools.query<Rsvp>('rsvps', {
        where: { eventId, status: 'going' },
        limit: capacity,
      })
      if (!goingResult.success) return { success: false, error: goingResult.error }
      if (goingResult.data.count >= capacity) {
        newStatus = 'waitlist'
        waitlistedAt = Date.now()
      }
    }

    // 6. Save it: create the first time, update after that
    const data: Partial<Rsvp> = { status: newStatus }
    if (waitlistedAt !== undefined) data.waitlistedAt = waitlistedAt
    const saveResult = mine
      ? await tools.update<Rsvp>('rsvps', mine.recordId, data)
      : await tools.create<Partial<Rsvp>>('rsvps', { eventId, ...data }) // userId is filled in by the server (userBound)
    if (!saveResult.success) return { success: false, error: saveResult.error }

    // 7. A spot opened up: move the longest-waiting person to going
    if (oldStatus === 'going' && capacity !== undefined) {
      const nextResult = await tools.query<Rsvp>('rsvps', {
        where: { eventId, status: 'waitlist' },
        orderBy: 'waitlistedAt',
        orderDir: 'asc',
        limit: 1,
      })
      const next = nextResult.success ? nextResult.data.records[0] : undefined
      if (next) {
        await tools.update<Rsvp>('rsvps', next.recordId, { status: 'going' })
      }
    }

    // 8. Tell the browser where they ended up
    return { success: true, data: { status: newStatus } }
  },
}
