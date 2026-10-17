import type { PaginationMeta } from "@/types/BaseResponse";

export interface Jadwal {
  id: string;
  date: string;
  time: string;
  activity: string;
  organizer: string;
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type JadwalSortOption =
  | "upcoming"
  | "latest"
  | "activity_asc"
  | "activity_desc";

export interface JadwalQueryParams {
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: JadwalSortOption;
  page?: number;
  limit?: number;
}

export interface JadwalCreateInput {
  date: string;
  time: string;
  activity: string;
  organizer: string;
  location: string;
  description: string;
}

export type JadwalUpdateInput = Partial<JadwalCreateInput>;

export interface JadwalListResponseData {
  items: Jadwal[];
  pagination: PaginationMeta;
  jadwal?: Jadwal[];
}
