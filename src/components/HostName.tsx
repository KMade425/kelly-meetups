/**
 * Shows who created an event. Every record carries `createdBy` (the creator's
 * user id); useUserLookup turns that id into a display name from the app's
 * users collection.
 */

import { useUserLookup } from 'deepspace'

export default function HostName({ userId }: { userId: string }) {
  const { getName, usersLoaded } = useUserLookup()
  if (!usersLoaded) return null
  return <>Hosted by {getName(userId) ?? 'a member'}</>
}
