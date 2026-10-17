import type { PaginationMeta } from "@/types/BaseResponse";

export interface Warta {
  id: string;
  title: string;
  slug: string;
  description: string;
  fileUrl: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type WartaSortOption =
  | "newest"
  | "oldest"
  | "title_asc"
  | "title_desc";

export interface WartaQueryParams {
  q?: string;
  sort?: WartaSortOption;
  page?: number;
  limit?: number;
}

export interface WartaListResponseData {
  items: Warta[];
  pagination: PaginationMeta;
  warta?: Warta[];
}
