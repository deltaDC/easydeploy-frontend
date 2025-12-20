import { DatabaseType, DatabaseStatus } from "@/types/database.type";

// Database type color mapping
export const DB_TYPE_COLORS: Record<DatabaseType, {
  primary: string;
  glow: string;
  bg: string;
  border: string;
  text: string;
}> = {
  [DatabaseType.POSTGRESQL]: {
    primary: "#3B82F6", // Blue
    glow: "rgba(59, 130, 246, 0.4)",
    bg: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.3)",
    text: "#2563EB",
  },
  [DatabaseType.MONGODB]: {
    primary: "#10B981", // Green
    glow: "rgba(16, 185, 129, 0.4)",
    bg: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.3)",
    text: "#059669",
  },
  [DatabaseType.MYSQL]: {
    primary: "#F59E0B", // Orange
    glow: "rgba(245, 158, 11, 0.4)",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
    text: "#D97706",
  },
  [DatabaseType.REDIS]: {
    primary: "#EF4444", // Red
    glow: "rgba(239, 68, 68, 0.4)",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
    text: "#DC2626",
  },
};

// Status color mapping
export const DB_STATUS_STYLES: Record<DatabaseStatus, {
  color: string;
  bg: string;
  glow: string;
  label: string;
  labelVi: string;
}> = {
  [DatabaseStatus.RUNNING]: {
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.15)",
    glow: "0 0 20px rgba(16, 185, 129, 0.4)",
    label: "Healthy",
    labelVi: "Hoạt động",
  },
  [DatabaseStatus.PENDING]: {
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.15)",
    glow: "0 0 15px rgba(245, 158, 11, 0.3)",
    label: "Pending",
    labelVi: "Đang chờ",
  },
  [DatabaseStatus.DEPLOYING]: {
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.15)",
    glow: "0 0 20px rgba(59, 130, 246, 0.4)",
    label: "Syncing",
    labelVi: "Đang triển khai",
  },
  [DatabaseStatus.FAILED]: {
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.15)",
    glow: "0 0 15px rgba(239, 68, 68, 0.3)",
    label: "Failed",
    labelVi: "Lỗi",
  },
  [DatabaseStatus.STOPPED]: {
    color: "#6B7280",
    bg: "rgba(107, 114, 128, 0.15)",
    glow: "none",
    label: "Stopped",
    labelVi: "Đã dừng",
  },
  [DatabaseStatus.DELETING]: {
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.15)",
    glow: "0 0 15px rgba(245, 158, 11, 0.3)",
    label: "Deleting",
    labelVi: "Đang xóa",
  },
};

// Creation journey steps
export interface CreationStep {
  id: string;
  message: string;
  duration: number;
}

export const CREATION_STEPS: CreationStep[] = [
  { id: "init", message: "Đang khởi tạo đĩa cứng...", duration: 1500 },
  { id: "security", message: "Đang thiết lập bảo mật...", duration: 1200 },
  { id: "network", message: "Đang cấu hình network...", duration: 1000 },
  { id: "container", message: "Đang tạo container...", duration: 2000 },
  { id: "final", message: "Hoàn tất! Đang chuyển hướng...", duration: 800 },
];

// Database detail tab types
export type DatabaseTab = "overview" | "query" | "metrics" | "logs" | "connections";

export interface DatabaseTabConfig {
  id: DatabaseTab;
  label: string;
  icon: string;
}

export const DATABASE_TABS: DatabaseTabConfig[] = [
  { id: "overview", label: "Tổng quan", icon: "Database" },
  { id: "query", label: "Query", icon: "Code" },
  { id: "metrics", label: "Metrics", icon: "Activity" },
  { id: "logs", label: "Nhật ký", icon: "Terminal" },
  { id: "connections", label: "Kết nối", icon: "Link" },
];

