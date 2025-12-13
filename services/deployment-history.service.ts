import api from "./api";
import { DeploymentHistory } from "@/types/deployment-history.type";

export const DeploymentHistoryService = {
    /**
     * Get deployment history for an application
     */
    getDeploymentHistory: async (appId: string): Promise<DeploymentHistory[]> => {
        const response = await api.get(`/applications/${appId}/deployment-history`);
        return response.data;
    },
}

export default DeploymentHistoryService;

