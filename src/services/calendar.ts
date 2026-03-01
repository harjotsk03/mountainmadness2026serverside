import { google } from "googleapis";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

function getCalendarClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN in .env");
  }
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, "urn:ietf:wg:oauth:2.0:oob");
  oauth2.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: oauth2 });
}

export type CalendarEvent = {
  id: string;
  summary: string | null;
  description: string | null;
  start: string | { dateTime?: string; date?: string };
  end: string | { dateTime?: string; date?: string };
  created: string;
  updated: string;
  status: string;
};

/**
 * Fetches events from Google Calendar in the given time range.
 * Use this for polling: call periodically and do XYZ with the returned events.
 */
export async function fetchCalendarEvents(options?: {
  timeMin?: Date;
  timeMax?: Date;
  maxResults?: number;
  singleEvents?: boolean;
}): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient();
  const { data } = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: options?.timeMin?.toISOString(),
    timeMax: options?.timeMax?.toISOString(),
    maxResults: options?.maxResults ?? 250,
    singleEvents: options?.singleEvents ?? true,
    orderBy: "startTime",
  });
  const items = (data.items ?? []) as CalendarEvent[];
  return items.filter((e) => e.status !== "cancelled");
}

/**
 * Run a full sync: fetch events and do XYZ. Call from route or from a timer.
 */
export async function runSync(): Promise<{ count: number; events: CalendarEvent[] }> {
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 7);
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 30);
  const events = await fetchCalendarEvents({ timeMin, timeMax, singleEvents: true });
  for (const event of events) {
    // TODO: do XYZ (e.g. upsert to DB)
    console.log("[Calendar sync]", event.id, event.summary, event.start);
  }
  return { count: events.length, events };
}
