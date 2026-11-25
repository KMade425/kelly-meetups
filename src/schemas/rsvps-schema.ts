import type { CollectionSchema } from 'deepspace/schema'

export const rsvpsSchema: CollectionSchema = {
  name: 'rsvps',
  columns: [
    { name: 'eventId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'userId', storage: 'text', interpretation: 'plain', required: true, userBound: true, immutable: true },
    // 'going' | 'waitlist' | 'maybe' | 'not-going'. Only the setRsvp action writes this.
    { name: 'status', storage: 'text', interpretation: 'plain', required: true },
    // When they joined the waitlist; the action sorts by this to pick who moves up
    { name: 'waitlistedAt', storage: 'number', interpretation: 'plain' }
  ],
  permissions: {
    '*': { read: true, create: false, update: false, delete: false },
    member: { read: true, create: false, update: false, delete: false},
    admin: { read: true, create: true, update: true, delete: true },
  },
  uniqueOn: ['eventId', 'userId'],
}
