import api from "./api";

export const DeployService = {
	listApps: () => api.get("/apps"),
	getApp: (id: string) => api.get(`/apps/${id}`),
	createApp: (payload: any) => api.post("/apps", payload),
	deleteApp: (id: string) => api.delete(`/apps/${id}`),
	redeploy: (id: string) => api.post(`/apps/${id}/redeploy`),
	logs: (id: string) => api.get(`/apps/${id}/logs`),
};

export default DeployService;
