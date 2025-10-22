import { SortDirection } from "../enum/sort-direction.enum";

export interface BasePageableRequest {
    page: number;
    size: number;
    sortBy: string;
    sortDirection: SortDirection;
  }