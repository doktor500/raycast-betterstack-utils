import { request, V2_BASE } from "@/api/betterstack-client";
import { asOptional, Optional } from "@/common/utils/optional-utils";
import { StatusPageSection } from "@/domain/status-page-section";
import { ResourceStatus, StatusHistoryDay, StatusPageResource } from "@/domain/status-page-resource";

export interface StatusPageSectionApiData {
  id: string;
  type: "status_page_section";
  attributes: { name: string; position: number };
}

export interface StatusHistoryDayApiData {
  day: string;
  status?: Optional<string>;
}

export interface StatusPageResourceApiData {
  id: string;
  type: "status_page_resource";
  attributes: {
    status_page_section_id: number;
    public_name: string;
    position: number;
    availability?: Optional<number>;
    status?: Optional<string>;
    status_history?: Optional<StatusHistoryDayApiData[]>;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  pagination?: { next?: string | null };
}

const KNOWN_STATUSES = Object.values(ResourceStatus);

export async function listStatusPageSections(statusPageId: string): Promise<StatusPageSection[]> {
  const params = new URLSearchParams({ per_page: "50" });
  let url: Optional<string> = `${V2_BASE}/status-pages/${statusPageId}/sections?${params}`;
  const allSections: StatusPageSectionApiData[] = [];

  while (url) {
    const page: PaginatedResponse<StatusPageSectionApiData> =
      await request<PaginatedResponse<StatusPageSectionApiData>>(url);
    allSections.push(...page.data);
    url = asOptional(page.pagination?.next);
  }

  return allSections.map(toStatusPageSection);
}

export async function listStatusPageResources(statusPageId: string): Promise<StatusPageResource[]> {
  const params = new URLSearchParams({ per_page: "50" });
  let url: Optional<string> = `${V2_BASE}/status-pages/${statusPageId}/resources?${params}`;
  const allResources: StatusPageResourceApiData[] = [];

  while (url) {
    const page: PaginatedResponse<StatusPageResourceApiData> =
      await request<PaginatedResponse<StatusPageResourceApiData>>(url);
    allResources.push(...page.data);
    url = asOptional(page.pagination?.next);
  }

  return allResources.map(toStatusPageResource);
}

export function toStatusPageSection(data: StatusPageSectionApiData): StatusPageSection {
  return { id: data.id, name: data.attributes.name, position: data.attributes.position };
}

export function toStatusPageResource(data: StatusPageResourceApiData): StatusPageResource {
  const { id, attributes } = data;

  return {
    id,
    sectionId: String(attributes.status_page_section_id),
    position: attributes.position,
    name: attributes.public_name,
    status: toResourceStatus(attributes.status),
    availability: toAvailabilityPercentage(attributes.availability ?? 0),
    history: (attributes.status_history ?? []).map(toStatusHistoryDay),
  };
}

export function toAvailabilityPercentage(value: number): number {
  return value <= 1 ? value * 100 : value;
}

function toStatusHistoryDay(data: StatusHistoryDayApiData): StatusHistoryDay {
  return { day: data.day, status: toResourceStatus(data.status) };
}

function toResourceStatus(status: Optional<string>): ResourceStatus {
  return KNOWN_STATUSES.find((knownStatus) => knownStatus === status) ?? ResourceStatus.OPERATIONAL;
}
