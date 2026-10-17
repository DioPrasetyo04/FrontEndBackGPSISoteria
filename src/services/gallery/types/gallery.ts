import type { PaginationMeta } from "@/types/BaseResponse";

export interface Gallery {
  id: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  date: string;
  highlight: boolean;
  showInHome: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GallerySortOption =
  | "newest"
  | "oldest"
  | "title_asc"
  | "title_desc";

export interface GalleryQueryParams {
  q?: string;
  category?: string;
  sort?: GallerySortOption;
  page?: number;
  limit?: number;
}

export interface GalleryListResponseData {
  items: Gallery[];
  pagination: PaginationMeta;
  gallery?: Gallery[];
}
