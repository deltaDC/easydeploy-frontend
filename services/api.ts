import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
export const API_VERSION = "v1";

export type ApiError = {
    status: number;
    message: string;
    details?: unknown;
    raw?: unknown;
};

export function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as any).status === "number" &&
        "message" in error &&
        typeof (error as any).message === "string"
    );
}

const api = axios.create({
	baseURL: `${API_BASE}/${API_VERSION}`,
	withCredentials: true, // Send cookies with requests
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Attach auth token from localStorage - check both possible keys
    if (typeof window !== "undefined") {
        // Try Zustand persist key first
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage);
                if (parsed.state?.token) {
                    config.headers.Authorization = `Bearer ${parsed.state.token}`;
                    console.log("Using token from auth-storage:", parsed.state.token.substring(0, 20) + "...");
                }
            } catch (e) {
                console.warn("Failed to parse auth storage:", e);
            }
        }
        
        // Fallback to direct token key
        if (!config.headers.Authorization) {
            const token = localStorage.getItem("auth_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log("Using token from auth_token:", token.substring(0, 20) + "...");
            }
        }
        
        // Debug: log if no token found
        if (!config.headers.Authorization) {
            console.warn("No auth token found for request:", config.url);
        }
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
        const status = error.response?.status ?? 0; // 0 for network/unknown
        const data = error.response?.data as any;

        // Try to extract a useful message from common API shapes
        const extractedMessage =
            data?.message ||
            data?.error ||
            data?.errorMessage ||
            (Array.isArray(data?.errors) ? data.errors.join(", ") : undefined) ||
            error.message ||
            "Unexpected error";

        let message = extractedMessage as string;
        switch (status) {
            case 400:
                message ||= "Invalid request";
                // Handle specific backend errors
                if (message.includes("Role DEVELOPER không tồn tại")) {
                    message = "Hệ thống chưa được cấu hình đầy đủ. Vui lòng liên hệ admin để khởi tạo dữ liệu hệ thống.";
                } else if (message.includes("Email này đã được đăng ký")) {
                    message = "Email này đã được sử dụng. Vui lòng chọn email khác.";
                } else if (message.includes("Mật khẩu phải có ít nhất")) {
                    message = "Mật khẩu phải có ít nhất 6 ký tự.";
                }
                break;
            case 401: {
                message ||= "Unauthorized";
                if (typeof window !== "undefined") {
                    const isOnAuth = window.location.pathname.startsWith("/login");
                    if (!isOnAuth) {
                        console.error("🚨 401 Unauthorized - Redirecting to login", {
                            url: error.config?.url,
                            method: error.config?.method,
                            currentPath: window.location.pathname,
                            token: localStorage.getItem("auth_token") ? "EXISTS" : "MISSING",
                        });
                        window.location.href = "/login";
                    }
                }
                break;
            }
            case 403:
                message ||= "Forbidden - insufficient permissions";
                break;
            case 404:
                message ||= "Resource not found";
                break;
            case 409:
                message ||= "Conflict - resource state issue";
                break;
            case 422:
                message ||= "Unprocessable entity - validation failed";
                break;
            case 429:
                message ||= "Too many requests - please try again later";
                break;
            case 500:
            case 502:
            case 503:
            case 504:
                message ||= "Server error - please try again later";
                break;
            default:
                if (status === 0) {
                    message ||= "Network error - please check your connection";
                }
                break;
        }

        const normalized: ApiError = {
            status,
            message,
            details: data?.details ?? data?.errors ?? undefined,
            raw: data ?? error.toJSON?.() ?? error,
        };

        if (typeof console !== "undefined") {
            console.error("API Error:", {
                status: normalized.status,
                message: normalized.message,
                url: error.config?.url,
                method: error.config?.method,
                details: normalized.details,
            });
        }

        return Promise.reject(normalized);
    },
);

export default api;