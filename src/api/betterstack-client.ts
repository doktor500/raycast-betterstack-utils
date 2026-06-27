import { getPreferenceValues } from "@raycast/api";
import { match } from "ts-pattern";
import { HttpStatusCodes } from "@/common/utils/http-utils";

export const V2_BASE = "https://uptime.betterstack.com/api/v2";
export const V3_BASE = "https://uptime.betterstack.com/api/v3";

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;

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
