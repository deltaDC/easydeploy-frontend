export enum DatabaseType {
  POSTGRESQL = 'POSTGRESQL',
  MYSQL = 'MYSQL',
  MONGODB = 'MONGODB',
  REDIS = 'REDIS'
}

export enum DatabaseStatus {
  PENDING = 'PENDING',
  DEPLOYING = 'DEPLOYING',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
  DELETING = 'DELETING'
}

export interface Database {
  id: string;
  name: string;
  type: DatabaseType;
  status: DatabaseStatus;
  version: string;
  storageGb?: number;
  memoryMb?: number;
  host?: string;
  port?: number;
  databaseName?: string;
  createdAt: string;
  updatedAt: string;
  connectionConfigured: boolean;
  backupCount: number;
}

export interface CreateDatabaseDto {
  name: string;
  type: DatabaseType;
  version: string;
  storageGb?: number;
  memoryMb?: number;
  environmentVariables?: Record<string, string>;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  responseTimeMs?: number;
}

export interface ConnectionInfoResponse {
  connectionString: string;
  completeConnectionString?: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
}

export interface DatabaseStatusResponse {
  status: DatabaseStatus;
  containerStatus: string;
  isHealthy: boolean;
  healthMessage: string;
}