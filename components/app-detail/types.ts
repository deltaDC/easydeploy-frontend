// Deployment status types
export type DeploymentStatus =
  | "deploying"
  | "in_progress"
  | "pending"
  | "success"
  | "running"
  | "failed"
  | "error"
  | "idle"
  | "stopped";

// Build stage for Jenkins pipeline
export interface BuildStage {
  name: string;
  displayName: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  startTime?: string;
  endTime?: string;
  duration?: number;
}

// Default build stages based on Jenkins pipeline
export const DEFAULT_BUILD_STAGES: BuildStage[] = [
  { name: "clone", displayName: "Clone Repo", status: "pending" },
  { name: "build", displayName: "Build Image", status: "pending" },
  { name: "push", displayName: "Push Registry", status: "pending" },
  { name: "deploy", displayName: "Deploy", status: "pending" },
];

// Check if app is in deploying state
export function isDeployingStatus(status: string): boolean {
  return ["deploying", "in_progress", "pending"].includes(status.toLowerCase());
}

// Check if app is in success/running state
export function isSuccessStatus(status: string): boolean {
  return ["success", "running"].includes(status.toLowerCase());
}

// Check if app is in failed state
export function isFailedStatus(status: string): boolean {
  return ["failed", "error"].includes(status.toLowerCase());
}

// Parse deployment status from backend
export function parseDeploymentStatus(status: string): DeploymentStatus {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "deploying":
    case "in_progress":
    case "pending":
      return normalized as DeploymentStatus;
    case "success":
    case "running":
      return normalized as DeploymentStatus;
    case "failed":
    case "error":
      return normalized as DeploymentStatus;
    case "idle":
    case "stopped":
      return normalized as DeploymentStatus;
    default:
      return "idle";
  }
}

// Tab configuration
export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  lockedWhenDeploying: boolean;
}

