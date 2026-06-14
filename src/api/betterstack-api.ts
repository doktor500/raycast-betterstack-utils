import { getPreferenceValues } from "@raycast/api";
import { match } from "ts-pattern";
import { toList } from "@/common/utils/collection-utils";
import { buildUserFromEmail, User } from "@/domain/user";
import { asOptional } from "@/common/utils/optional-utils";
import { Rota } from "@/domain/rota";
import { Calendar } from "@/domain/calendar";
import { OnCallEvent } from "@/domain/on-call-event";
import { HttpStatusCodes } from "@/common/utils/http-utils";

const BASE_URL = "https://uptime.betterstack.com/api/v2";
const USER_TYPE = "user" as const;

interface IncludedUser {
  id: string;
  type: typeof USER_TYPE;
  attributes: User;
}

interface CalendarApiResponse<T> {
  data: T[];
  included?: IncludedUser[];
  pagination?: {
    next?: string | null;
  };
}

interface Event {
  id: number | string;
  users: string[];
  starts_at: string;
  ends_at: string;
  override: boolean;
}

interface EventsApiResponse {
  events: Event[];
}

export async function getRota(): Promise<Rota> {
  const result = await fetchAllPages<{ id: string; attributes: { name: string | undefined } }>(`${BASE_URL}/on-calls`);
  const calendars: Calendar[] = result.data.map((calendar) => ({ id: calendar.id, name: calendar.attributes.name }));

  const teamMembers = toList(result.included)
    .filter((includedUser): includedUser is IncludedUser => includedUser.type === USER_TYPE)
    .map((includedUser) => [includedUser.attributes.email.toLowerCase(), includedUser.attributes] as const);

  return { calendars, teamMembers: new Map(teamMembers) };
}

export async function getOnCallEvents(calendarId: string, teamMembers: Map<string, User>): Promise<OnCallEvent[]> {
  const { events } = await fetchJson<EventsApiResponse>(`${BASE_URL}/on-calls/${calendarId}/events`);

  return events.flatMap((event) =>
    event.users.map((email) => ({
      startedAt: event.starts_at,
      endedAt: event.ends_at,
      override: event.override,
      user: teamMembers.get(email.toLowerCase()) ?? buildUserFromEmail(email),
    })),
  );
}

async function fetchAllPages<T>(url: string): Promise<CalendarApiResponse<T>> {
  const pages = await collectPages<T>(url);

  return {
    data: pages.flatMap((page) => page.data),
    included: pages.flatMap((page) => page.included ?? []),
  };
}

async function collectPages<T>(currentUrl: string | undefined): Promise<CalendarApiResponse<T>[]> {
  if (!currentUrl) return [];
  const page = await fetchJson<CalendarApiResponse<T>>(currentUrl);
  const pages = await collectPages<T>(asOptional(page.pagination?.next));

  return [page, ...pages];
}

async function fetchJson<T>(url: string): Promise<T> {
  const response: Response = await fetch(url, { headers: getHeaders() });

  return match(response)
    .with({ ok: true }, async (response) => (await response.json()) as T)
    .with({ status: HttpStatusCodes.UNAUTHORIZED }, invalidTokenError())
    .otherwise(apiError());
}

function invalidTokenError() {
  return () => {
    throw new Error("Invalid API token. Check your BetterStack API token in extension preferences.");
  };
}

function apiError() {
  return (response: Response) => {
    throw new Error(`BetterStack API error: ${response.status} ${response.statusText}`);
  };
}

function getHeaders(): Record<string, string> {
  const { apiToken } = getPreferenceValues<Preferences>();

  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };
}
