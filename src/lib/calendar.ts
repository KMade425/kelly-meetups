/**
 * "Add to calendar": builds an .ics file (the standard calendar format that
 * Google, Apple and Outlook calendars all import) and downloads it.
 * Runs entirely in the browser, no server or API needed.
 */

type CalendarEvent = {
  id: string
  title: string
  description?: string
  location: string
  startsAt: number
}

// Events don't store an end time yet, so assume two hours.
const DEFAULT_LENGTH_MS = 2 * 60 * 60 * 1000

/** 1796083200000 → "20261130T180000Z" (UTC, the form .ics expects) */
function icsDate(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** .ics treats commas, semicolons and line breaks as syntax, so escape them. */
function icsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

export function downloadIcs(event: CalendarEvent): void {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//kelly-meetups//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@kelly-meetups.app.space`,
    `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(event.startsAt)}`,
    `DTEND:${icsDate(event.startsAt + DEFAULT_LENGTH_MS)}`,
    `SUMMARY:${icsText(event.title)}`,
    `LOCATION:${icsText(event.location)}`,
    ...(event.description ? [`DESCRIPTION:${icsText(event.description)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  // The .ics spec wants CRLF line endings
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.title.replace(/[^\w-]+/g, '-').toLowerCase() || 'event'}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

/** A Google Maps search for the location text. The Maps URL API needs no API key. */
export function mapUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}
