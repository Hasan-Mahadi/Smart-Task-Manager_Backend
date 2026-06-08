export declare enum SortOrder {
    LATEST_CREATED = "latest_created",
    NEAREST_DEADLINE = "nearest_deadline",
    HIGHEST_PRIORITY = "highest_priority",
    RECENTLY_UPDATED = "recently_updated"
}
export declare class PaginationDto {
    page?: number;
    limit?: number;
    search?: string;
    sort?: SortOrder;
}
