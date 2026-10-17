import type { PaginationMeta } from "@/types/BaseResponse";

export interface Renungan {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  image: string;
  author: string;
  category: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type RenunganSortOption =
  | "newest"
  | "oldest"
  | "title_asc"
  | "title_desc";

export interface RenunganQueryParams {
  q?: string;
  sort?: RenunganSortOption;
  page?: number;
  limit?: number;
}

export interface RenunganListResponseData {
  items: Renungan[];
  pagination: PaginationMeta;
  renungan?: Renungan[];
}
