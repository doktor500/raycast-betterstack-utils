import { getPreferenceValues } from "@raycast/api";
import { toList } from "@/common/utils/collection-utils";
import { buildUserFromEmail, User } from "@/domain/user";
import { asOptional } from "@/common/utils/optional-utils";

const BASE_URL = "https://uptime.betterstack.com/api/v2";

export interface Calendar {
  id: string;
  attributes: {
    name: string | null;
    default_calendar: boolean;
    team_name?: string;
  };
}

interface IncludedUser {
  id: string;
  type: "user";
  attributes: User;
}

interface ApiResponse<T> {
  data: T[];
  included?: IncludedUser[];
  pagination?: {
    next?: string | null;
  };
}

interface BetterStackEvent {
  id: number | string;
  users: string[];
  starts_at: string;
  ends_at: string;
  override: boolean;
}

interface EventsResponse {
  events: BetterStackEvent[];
}

export interface RawCalendarEvent {
  started_at: string;
  ended_at: string;
  override: boolean;
  user: User;
}

export interface OnCallCalendarsResult {
  calendars: Calendar[];
  usersByEmail: Map<string, User>;
}

export async function getOnCallCalendars(): Promise<OnCallCalendarsResult> {
  const result = await fetchAllPages<Calendar>(`${BASE_URL}/on-calls`);

  const usersByEmail = toList(result.included)
    .filter((included): included is IncludedUser => included.type === "user")
    .map((included) => [included.attributes.email.toLowerCase(), included.attributes] as const);

  return { calendars: result.data, usersByEmail: new Map(usersByEmail) };
}

export async function getCalendarEvents(
  calendarId: string,
  usersByEmail: Map<string, User>,
): Promise<RawCalendarEvent[]> {
  const { events } = await fetchJson<EventsResponse>(`${BASE_URL}/on-calls/${calendarId}/events`);

  return events.flatMap((event) =>
    event.users.map((email) => ({
      started_at: event.starts_at,
      ended_at: event.ends_at,
      override: event.override,
      user: usersByEmail.get(email.toLowerCase()) ?? buildUserFromEmail(email),
    })),
  );
}

async function fetchAllPages<T>(url: string): Promise<ApiResponse<T>> {
  const pages = await collectPages<T>(url);
  return {
    data: pages.flatMap((page) => page.data),
    included: pages.flatMap((page) => page.included ?? []),
  };
}

async function collectPages<T>(currentUrl: string | undefined): Promise<ApiResponse<T>[]> {
  if (!currentUrl) return [];
  const page = await fetchJson<ApiResponse<T>>(currentUrl);
  const pages = await collectPages<T>(asOptional(page.pagination?.next));
  return [page, ...pages];
}

async function fetchJson<T>(url: string): Promise<T> {
  const response: Response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid API token. Check your BetterStack API token in extension preferences.");
    }
    throw new Error(`BetterStack API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

function getHeaders(): Record<string, string> {
  const { apiToken } = getPreferenceValues<Preferences>();
  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };
}
