import api from "./api";
import { ApplicationListRequest, PaginatedResponse, Application, ApplicationDetail, CreateApplicationRequest } from "@/types/application.type";

export const ApplicationService = {
    getApplications: async (request: ApplicationListRequest): Promise<PaginatedResponse<Application>> => {
        const response = await api.get("/applications/list", { params: request });
        return response.data;
    },

    getApplication: async (id: string): Promise<ApplicationDetail> => {
        const response = await api.get(`/applications/${id}`);
        return response.data;
    },

    createApplication: async (request: CreateApplicationRequest): Promise<ApplicationDetail> => {
        const response = await api.post("/applications", request);
        return response.data;
    },
}

export default ApplicationService;