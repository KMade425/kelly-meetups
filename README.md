# kelly-meetups

A meetup board with real RSVPs: browse upcoming events, RSVP in one click, and join a waitlist when an event is full. When someone drops out, the person who has waited longest moves up automatically, and everyone's screen updates live. Built on the DeepSpace SDK.

Live: https://kelly-meetups.app.space

## What it does

- **Browse without an account.** The home page, the events list and each event's page are public.
- **Create events** (signed in) with a title, description, location, date and time, and either a capacity or unlimited spots. Past dates are rejected.
- **RSVP:** Going, Maybe or Not going.
  - Going on a full event puts you on the **waitlist**.
  - When someone who was going leaves, the **longest-waiting** person is promoted automatically.
- **Live counts.** "3 / 10 going · 2 waitlisted" updates in every open browser without refreshing.
- **Add to calendar** (downloads an `.ics` file for Google, Apple or Outlook) and **Open in map** (OpenStreetMap search) on each event's page.
- **Shows who's hosting** each event to signed-in users.

## How it's built

| Piece | Where | What it does |
|---|---|---|
| `events` collection | `src/schemas/events-schema.ts` | Anyone can read. Signed-in members can create, and edit or delete only their own. |
| `rsvps` collection | `src/schemas/rsvps-schema.ts` | Anyone can read, so the counts are public. Members **cannot write RSVPs directly**. `uniqueOn: [eventId, userId]` allows one RSVP per person per event, and `userBound` makes the server set `userId`, so nobody can RSVP as someone else. |
| `setRsvp` server action | `src/actions/index.ts` | The only way RSVPs are written. It checks sign-in and input, checks capacity, puts people on the waitlist with a timestamp, and promotes the longest-waiting person when a spot opens. |
| Live UI | `src/pages/(app)/`, `src/components/RsvpControls.tsx` | `useQuery` subscriptions re-render on every change. The buttons call the action through `src/lib/api.ts`. |
| Calendar and map | `src/lib/calendar.ts` | Builds the `.ics` file in the browser. The map link needs no API key. |

**Why a server action for RSVPs:** permission rules can say *who* may write *which fields*, but not "only if there's room". Capacity is shared between users, so the check has to run on the server, where the browser can't skip it.

## Known limits

- **Last-spot race:** two people clicking for the last spot at the same moment could both get in, because the capacity check and the save are separate steps.
- **No end time yet:** calendar entries assume a two-hour event.
- **Host names** are only shown to signed-in users. Signed-out visitors see "a member", because DeepSpace sends the user list only to signed-in users.

## Run it

```bash
npm install
npx deepspace login
npx deepspace dev start    # local dev server
npx deepspace deploy       # deploy to <name>.app.space
```

The subdomain is `name` in `wrangler.toml` (and `APP_NAME` in `src/constants.ts`).
