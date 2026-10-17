export interface UserInterface{
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    createdAt: string;
    updateAt: string;
}

export interface UserPublicInterface {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updateAt: string;
}

export const USER_SORT_OPTIONS = [
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
  "email_asc",
  "email_desc",
] as const;

export type UserSortOption = (typeof USER_SORT_OPTIONS)[number];

export interface UserQueryOptions {
  q?: string;
  sort?: UserSortOption;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserQueryResult {
  items: UserInterface[];
  totalItems: number;
}

export interface PaginatedUserResult {
  items: UserPublicInterface[];
  pagination: PaginationMeta;
  users: UserPublicInterface[];
}


