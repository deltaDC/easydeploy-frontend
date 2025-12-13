export type TriggerType = 'MANUAL' | 'WEBHOOK' | 'SCHEDULED';

export type DeploymentStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';

export interface DeploymentHistory {
    id: string;
    appId: string;
    status: DeploymentStatus;
    commitSha: string | null;
    commitMessage: string | null;
    commitUrl: string | null;
    branch: string | null;
    triggerType: TriggerType;
    startedAt: string | null;
    completedAt: string | null;
    durationSeconds: number | null;
    createdAt: string;
}

