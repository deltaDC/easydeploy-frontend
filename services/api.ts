import axios from "axios";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
	withCredentials: true,
});

api.interceptors.request.use((config) => {
	// Attach auth token from cookie/localStorage if needed
	return config;
});

api.interceptors.response.use(
	(res) => res,
	(error) => {
		// TODO: show toast via a global feedback system
		return Promise.reject(error);
	},
);

export default api;
