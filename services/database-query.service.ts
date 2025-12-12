import api from "./api";

export interface ExecuteQueryRequest {
  databaseId: string;
  query: string;
  limit?: number;
  offset?: number;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  queryType: string;
  affectedRows?: number;
  message: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue?: string;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
  rowCount: number;
}

class DatabaseQueryService {
  /**
   * Execute SQL query
   */
  async executeQuery(request: ExecuteQueryRequest): Promise<QueryResult> {
    const response = await api.post<QueryResult>("/databases/query", request);
    return response.data;
  }

  /**
   * Get list of tables in database
   */
  async getTables(databaseId: string): Promise<string[]> {
    const response = await api.get<string[]>(`/databases/${databaseId}/tables`);
    return response.data;
  }

  /**
   * Get table schema
   */
  async getTableSchema(databaseId: string, tableName: string): Promise<TableSchema> {
    const response = await api.get<TableSchema>(`/databases/${databaseId}/tables/${tableName}/schema`);
    return response.data;
  }

  /**
   * Browse table data with pagination
   */
  async browseTableData(
    databaseId: string,
    tableName: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<QueryResult> {
    const response = await api.get<QueryResult>(
      `/databases/${databaseId}/tables/${tableName}/data`,
      {
        params: { limit, offset }
      }
    );
    return response.data;
  }
}

export default new DatabaseQueryService();
