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
	publishDir?: string;
	rootDir?: string;
	healthCheckPath?: string;
	createdAt: string;
	updatedAt: string;
};

export type ApplicationDetail = {
	id: string;
	userId: string;
	name: string;
	repoId: string;
	publicUrl?: string | null;
	status: string;
	containerId?: string | null;
	createdAt: string;
	updatedAt: string;
	deployConfigId?: string | null;
	user?: User;
	deployConfig?: DeployConfig | null;
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

// Create Application Request
export interface CreateApplicationRequest {
  githubRepoId: number; // GitHub repository ID
  appName: string;
  selectedBranch: string;
  language: string;
  buildCommand: string;
  startCommand: string;
  publishDir?: string;
  rootDir?: string;
  healthCheckPath?: string;
  envVars?: EnvironmentVariable[];
  exposedPort?: number;
  autoRedeploy?: boolean;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
}

// Repository Detail Response
export interface RepositoryDetailResponse {
  id: number; // GitHub repo ID
  dbId?: string; // Database UUID for the repository
  provider: string;
  providerId: string;
  name: string;
  nameWithOwner: string;
  languages: string[];
  isPrivate: boolean;
  isFork: boolean;
  url: string;
  shortDescriptionHTML: string;
  defaultBranch: BranchInfo;
  branches: BranchInfo[];
  suggestion: RepoSuggestion;
}

export interface BranchInfo {
  name: string;
}

export interface RepoSuggestion {
  primarySuggestion: DeployConfigSuggestion;
  environmentSuggestions: DeployConfigSuggestion[];
}

export interface DeployConfigSuggestion {
  framework: string;
  buildCommand: string;
  startCommand: string;
  publishPath: string;
  envVars: EnvironmentVariable[];
}

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
