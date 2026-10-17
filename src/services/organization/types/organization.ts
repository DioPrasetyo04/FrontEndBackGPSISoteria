import type { PaginationMeta } from "@/types/BaseResponse";

export type OrganizationCategory = "PENGURUS_HARIAN" | "KOORDINATOR_SEKTOR";

export interface Organization {
  id: string;
  category: OrganizationCategory;
  position: string;
  name?: string | null;
  phone?: string | null;
  fax?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrganizationSortOption =
  | "default"
  | "order_asc"
  | "order_desc"
  | "name_asc"
  | "name_desc"
  | "newest"
  | "oldest";

export interface OrganizationQueryParams {
  q?: string;
  category?: OrganizationCategory;
  sort?: OrganizationSortOption;
  page?: number;
  limit?: number;
}

export interface OrganizationCreateInput {
  category: OrganizationCategory;
  position: string;
  name?: string | null;
  phone?: string | null;
  fax?: string | null;
  order?: number;
  isActive?: boolean;
}

export type OrganizationUpdateInput = Partial<OrganizationCreateInput>;

export interface OrganizationListResponseData {
  items: Organization[];
  pagination: PaginationMeta;
  organization?: Organization[];
}
