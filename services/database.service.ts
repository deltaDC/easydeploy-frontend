import api from "./api";
import {
  Database,
  CreateDatabaseDto,
  ConnectionTestResult,
  ConnectionInfoResponse,
  DatabaseStatusResponse,
} from "@/types/database.type";

export const DatabaseService = {
  createDatabase: async (data: CreateDatabaseDto): Promise<Database> => {
    const response = await api.post<Database>("/databases", data);
    return response.data;
  },

  getDatabases: async (): Promise<Database[]> => {
    const response = await api.get<Database[]>("/databases");
    return response.data;
  },

  getDatabase: async (id: string): Promise<Database> => {
    const response = await api.get<Database>(`/databases/${id}`);
    return response.data;
  },

  deleteDatabase: async (id: string): Promise<void> => {
    await api.delete(`/databases/${id}`);
  },

  testConnection: async (id: string): Promise<ConnectionTestResult> => {
    const response = await api.post<ConnectionTestResult>(
      `/databases/${id}/test-connection`
    );
    return response.data;
  },

  getStatus: async (id: string): Promise<DatabaseStatusResponse> => {
    const response = await api.get<DatabaseStatusResponse>(
      `/databases/${id}/status`
    );
    return response.data;
  },

  getLogs: async (id: string, limit: number = 100): Promise<string[]> => {
    const response = await api.get<string[]>(
      `/databases/${id}/logs?limit=${limit}`
    );
    return response.data;
  },

  getConnectionInfo: async (id: string): Promise<ConnectionInfoResponse> => {
    const response = await api.get<ConnectionInfoResponse>(
      `/databases/${id}/connection-info`
    );
    return response.data;
  },

  startDatabase: async (id: string): Promise<void> => {
    await api.post(`/databases/${id}/start`);
  },

  stopDatabase: async (id: string): Promise<void> => {
    await api.post(`/databases/${id}/stop`);
  },

  restartDatabase: async (id: string): Promise<void> => {
    await api.post(`/databases/${id}/restart`);
  },
};

export default DatabaseService;



