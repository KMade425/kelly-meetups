import { getAuthToken } from 'deepspace'

/**
 * Calls a server action from src/actions (POST /api/actions/<name>) as the
 * signed-in user. Returns the action's `data`, or throws with its error
 * message so pages can use try/catch.
 */
export async function callAction<T = unknown>(name: string, params: Record<string, unknown>): Promise<T> {
  const token = await getAuthToken()
  if (!token) throw new Error('Please sign in first.')

  const res = await fetch(`/api/actions/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(params),
  })

  // A crash or a 401 may not send JSON, so fall back to an empty object.
  const body = (await res.json().catch(() => ({}))) as { success?: boolean; data?: T; error?: string }
  if (!res.ok || !body.success) {
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return body.data as T
}
