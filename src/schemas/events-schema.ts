import type { CollectionSchema } from 'deepspace/schema'

export const eventsSchema: CollectionSchema = {
  name: 'events',
  columns: [
    { name: 'title', storage: 'text', interpretation: 'plain', required: true },
    { name: 'description', storage: 'text', interpretation: 'plain' },
    { name: 'location', storage: 'text', interpretation: 'plain', required: true },
    { name: 'startsAt', storage: 'number', interpretation: 'plain', required: true },
    // Empty capacity means unlimited.
    { name: 'capacity', storage: 'number', interpretation: 'plain' },
  ],
  permissions: {
    '*': { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: 'own', delete: 'own' },
    admin: { read: true, create: true, update: true, delete: true },
  },
}
