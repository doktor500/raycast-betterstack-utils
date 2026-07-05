import { getPreferenceValues } from "@raycast/api";
import { match } from "ts-pattern";
import { HttpMethods, HttpStatusCodes } from "@/common/utils/http-utils";
import { asOptional, Optional } from "@/common/utils/optional-utils";

export const BASE_URL = "https://uptime.betterstack.com";
export const V2_BASE = `${BASE_URL}/api/v2`;
export const V3_BASE = `${BASE_URL}/api/v3`;

interface RequestOptions {
  method?: typeof HttpMethods.GET | typeof HttpMethods.POST;
  body?: unknown;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination?: { next?: string | null };
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = HttpMethods.GET, body } = options;

  const response: Response = await fetch(url, {
    method,
    headers: getHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return match(response)
    .with({ ok: true }, (okResponse) => parseJson<T>(okResponse))
    .with({ status: HttpStatusCodes.UNAUTHORIZED }, invalidTokenError())
    .otherwise(apiError());
}

export async function fetchAllPages<T>(initialUrl: string): Promise<T[]> {
  let url: Optional<string> = initialUrl;
  const allItems: T[] = [];

  while (url) {
    const page: PaginatedResponse<T> = await request<PaginatedResponse<T>>(url);
    allItems.push(...page.data);
    url = asOptional(page.pagination?.next);
  }

  return allItems;
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
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
