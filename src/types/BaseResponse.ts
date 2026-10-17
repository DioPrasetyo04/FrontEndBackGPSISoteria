export type BaseResponse<T> = {
    message: string;
    status: string;
    data: T;
    meta?: PaginationMeta;
}

export type PaginationMeta = {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export type QueryResult<T> = {
    items: T[];
    meta: PaginationMeta;
    totalItems: number;
}