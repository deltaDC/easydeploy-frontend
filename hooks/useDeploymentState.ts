import { useState, useEffect, useCallback, useRef } from "react";
import { DeploymentStatus, BuildStage, DEFAULT_BUILD_STAGES, isDeployingStatus, isSuccessStatus, isFailedStatus } from "@/components/app-detail/types";
import { useBuildLogWebSocket } from "./useBuildLogWebSocket";
import { BuildLogMessage } from "@/types/build-log.type";

interface UseDeploymentStateOptions {
  appId: string;
  initialStatus: string;
  onStatusChange?: (status: DeploymentStatus) => void;
  onBuildSuccess?: () => void;
  onBuildFailed?: () => void;
  onStatusDetected?: (status: DeploymentStatus) => void;
}

interface UseDeploymentStateReturn {
  status: DeploymentStatus;
  isDeploying: boolean;
  isSuccess: boolean;
  isFailed: boolean;
  stages: BuildStage[];
  logs: BuildLogMessage[];
  isConnected: boolean;
  tabsLocked: boolean;
  showSuccessAnimation: boolean;
  dismissSuccessAnimation: () => void;
}

// Parse stage from log message
function parseStageFromLog(message: string): { stage: string; status: "running" | "success" | "failed" } | null {
  const lowerMessage = message.toLowerCase();
  
  // Clone Repo Stage
  // Start: "Cloning into 'repo_..." or "cloning into"
  if (lowerMessage.includes("cloning into") || lowerMessage.includes("clone repo") || lowerMessage.includes("git clone")) {
    return { stage: "clone", status: "running" };
  }
  // Success: "Dockerfile created/overwritten" (indicates clone completed)
  if (lowerMessage.includes("dockerfile created") || lowerMessage.includes("dockerfile overwritten")) {
    return { stage: "clone", status: "success" };
  }
  
  // Build Image Stage
  // Start: "#0 building with" or "building with"
  if (lowerMessage.includes("#0 building with") || lowerMessage.includes("building with") || lowerMessage.includes("#1 [internal] load build definition")) {
    return { stage: "build", status: "running" };
  }
  // Success: "#14 DONE" (final build step) or "exporting to image" or "exporting layers"
  if (lowerMessage.includes("exporting to image") || lowerMessage.includes("exporting layers") || lowerMessage.includes("exporting manifest")) {
    return { stage: "build", status: "success" };
  }
  // Also check for final build step completion
  if (lowerMessage.includes("#14 done") || (lowerMessage.includes("#") && lowerMessage.includes("done") && lowerMessage.includes("exporting"))) {
    return { stage: "build", status: "success" };
  }
  
  // Push Registry Stage
  // Start: "naming to docker.io/library/..." or "naming to"
  if (lowerMessage.includes("naming to docker.io") || lowerMessage.includes("naming to")) {
    return { stage: "push", status: "running" };
  }
  // Success: "naming to ... done" or implicit (happens during build export)
  if (lowerMessage.includes("naming to") && lowerMessage.includes("done")) {
    return { stage: "push", status: "success" };
  }
  
  // Deploy Stage
  // Start: "Network ... already exists" or "Error response from daemon: No such container" (cleanup phase)
  if (lowerMessage.includes("network") && lowerMessage.includes("already exists")) {
    return { stage: "deploy", status: "running" };
  }
  if (lowerMessage.includes("error response from daemon") && lowerMessage.includes("no such container")) {
    return { stage: "deploy", status: "running" };
  }
  // Success: "SUCCESS: Container ... is running" or "Container ... is running" or "Pipeline finished" or "Finished: SUCCESS"
  if (lowerMessage.includes("success: container") && lowerMessage.includes("is running")) {
    return { stage: "deploy", status: "success" };
  }
  if (lowerMessage.includes("container") && lowerMessage.includes("is running") && !lowerMessage.includes("error")) {
    return { stage: "deploy", status: "success" };
  }
  if (lowerMessage.includes("pipeline finished")) {
    return { stage: "deploy", status: "success" };
  }
  if (lowerMessage.includes("finished: success")) {
    return { stage: "deploy", status: "success" };
  }
  
  // Error detection
  if (lowerMessage.includes("error") || lowerMessage.includes("failed") || lowerMessage.includes("failure")) {
    // Determine which stage failed based on context
    if (lowerMessage.includes("clone") || lowerMessage.includes("git")) {
      return { stage: "clone", status: "failed" };
    }
    if (lowerMessage.includes("build") || lowerMessage.includes("docker build") || lowerMessage.includes("#")) {
      return { stage: "build", status: "failed" };
    }
    if (lowerMessage.includes("push") || lowerMessage.includes("registry") || lowerMessage.includes("naming")) {
      return { stage: "push", status: "failed" };
    }
    if (lowerMessage.includes("deploy") || lowerMessage.includes("container") || lowerMessage.includes("network")) {
      return { stage: "deploy", status: "failed" };
    }
    // Generic error - mark current stage as failed (will be determined by context)
    if (lowerMessage.includes("finished: failure") || lowerMessage.includes("finished: failed")) {
      return { stage: "deploy", status: "failed" };
    }
  }
  
  return null;
}

export function useDeploymentState({
  appId,
  initialStatus,
  onStatusChange,
  onBuildSuccess,
  onBuildFailed,
  onStatusDetected,
}: UseDeploymentStateOptions): UseDeploymentStateReturn {
  const [status, setStatus] = useState<DeploymentStatus>(
    initialStatus.toLowerCase() as DeploymentStatus
  );
  const [stages, setStages] = useState<BuildStage[]>([...DEFAULT_BUILD_STAGES]);
  const [logs, setLogs] = useState<BuildLogMessage[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const previousStatusRef = useRef<DeploymentStatus>(status);
  const hasTriggeredSuccessRef = useRef(false);

  // WebSocket connection for real-time logs
  const { isConnected } = useBuildLogWebSocket({
    buildId: null,
    applicationId: appId,
    enabled: !!appId,
    onMessage: useCallback((logMessage: BuildLogMessage) => {
      setLogs((prev) => [...prev, logMessage]);
      
      const lowerMessage = logMessage.message.toLowerCase();
      
      // Check for "Finished: SUCCESS" or "Finished: FAILURE" messages directly
      if (lowerMessage.includes("finished: success")) {
        setStatus("success");
        onStatusDetected?.("success");
        // Mark deploy stage as success
        setStages((prev) => {
          const newStages = [...prev];
          const deployIndex = newStages.findIndex((s) => s.name === "deploy");
          if (deployIndex !== -1) {
            newStages[deployIndex] = { ...newStages[deployIndex], status: "success" };
          }
          return newStages;
        });
        return;
      }
      
      if (lowerMessage.includes("finished: failure") || lowerMessage.includes("finished: failed")) {
        setStatus("failed");
        onStatusDetected?.("failed");
        // Mark deploy stage as failed
        setStages((prev) => {
          const newStages = [...prev];
          const deployIndex = newStages.findIndex((s) => s.name === "deploy");
          if (deployIndex !== -1) {
            newStages[deployIndex] = { ...newStages[deployIndex], status: "failed" };
          }
          return newStages;
        });
        return;
      }
      
      // Parse stage from log message
      const stageUpdate = parseStageFromLog(logMessage.message);
      if (stageUpdate) {
        setStages((prev) => {
          const stageIndex = prev.findIndex((s) => s.name === stageUpdate.stage);
          if (stageIndex === -1) return prev;
          
          const newStages = [...prev];
          newStages[stageIndex] = {
            ...newStages[stageIndex],
            status: stageUpdate.status,
          };
          
          // If this stage is running, mark previous stages as success if they're still pending
          if (stageUpdate.status === "running") {
            for (let i = 0; i < stageIndex; i++) {
              if (newStages[i].status === "pending" || newStages[i].status === "running") {
                newStages[i] = { ...newStages[i], status: "success" };
              }
            }
          }
          
          return newStages;
        });
        
        // Check for build completion
        if (stageUpdate.stage === "deploy" && stageUpdate.status === "success") {
          setStatus("success");
          onStatusDetected?.("success");
        }
        
        // Check for build failure
        if (stageUpdate.status === "failed") {
          setStatus("failed");
          onStatusDetected?.("failed");
        }
      }
    }, [onStatusDetected]),
    onError: useCallback((error: Event) => {
      console.error("WebSocket error in deployment state:", error);
    }, []),
  });

  // Derived states
  const isDeploying = isDeployingStatus(status);
  const isSuccess = isSuccessStatus(status);
  const isFailed = isFailedStatus(status);
  const tabsLocked = isDeploying;

  // Handle status changes
  useEffect(() => {
    if (previousStatusRef.current !== status) {
      onStatusChange?.(status);
      
      // Trigger success animation when transitioning from deploying to success
      if (
        isDeployingStatus(previousStatusRef.current) &&
        isSuccessStatus(status) &&
        !hasTriggeredSuccessRef.current
      ) {
        setShowSuccessAnimation(true);
        hasTriggeredSuccessRef.current = true;
        onBuildSuccess?.();
      }
      
      // Trigger failed callback
      if (
        isDeployingStatus(previousStatusRef.current) &&
        isFailedStatus(status)
      ) {
        onBuildFailed?.();
      }
      
      previousStatusRef.current = status;
    }
  }, [status, onStatusChange, onBuildSuccess, onBuildFailed]);

  // Update status from prop changes
  useEffect(() => {
    const newStatus = initialStatus.toLowerCase() as DeploymentStatus;
    if (newStatus !== status) {
      setStatus(newStatus);
      
      // Reset stages if starting a new deployment
      if (isDeployingStatus(newStatus)) {
        setStages([...DEFAULT_BUILD_STAGES]);
        hasTriggeredSuccessRef.current = false;
      }
    }
  }, [initialStatus]);

  const dismissSuccessAnimation = useCallback(() => {
    setShowSuccessAnimation(false);
  }, []);

  return {
    status,
    isDeploying,
    isSuccess,
    isFailed,
    stages,
    logs,
    isConnected,
    tabsLocked,
    showSuccessAnimation,
    dismissSuccessAnimation,
  };
}







