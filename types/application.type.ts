import { BasePageableRequest } from "./base/pageable-request.base";
import { DeploymentStatus } from "./enum/deployment-status.enum";
import { SortDirection } from "./enum/sort-direction.enum";
import { User } from "./user.type";


export type Application = {
	id: string;
	name: string;
	status: string;
  publicUrl?: string;
	createdAt: string;
};

export type DeployConfig = {
	id: string;
	appId: string;
	buildCommand: string;
	startCommand: string;
	environmentVars: string;
	autoRedeploy: boolean;
	exposedPort: number;
	createdAt: string;
	updatedAt: string;
};

export type ApplicationDetail = {
	id: string;
	userId: string;
	name: string;
	repoId: string;
	publicUrl: string;
	status: string;
	containerId: string;
	createdAt: string;
	updatedAt: string;
	deployConfigId: string;
	user: User;
	deployConfig: DeployConfig;
};

// Application list request interface
export interface ApplicationListRequest extends BasePageableRequest {
  name?: string;
  status?: DeploymentStatus;
}

// Default values for pagination
export const DEFAULT_PAGEABLE_REQUEST: BasePageableRequest = {
  page: 0,
  size: 20,
  sortBy: "id",
  sortDirection: SortDirection.ASC
};

// Allowed sort fields for applications
export const ALLOWED_APPLICATION_SORT_FIELDS = [
  "id",
  "name",
  "status",
  "createdAt",
  "updatedAt"
] as const;

export type ApplicationSortField = typeof ALLOWED_APPLICATION_SORT_FIELDS[number];

// Pagination response types
export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: PageInfo;
}
