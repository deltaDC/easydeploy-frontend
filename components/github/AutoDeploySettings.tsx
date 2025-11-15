"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface AutoDeploySettingsProps {
  autoRedeploy: boolean;
  onAutoRedeployChange: (value: boolean) => void;
  usePublicUrl: boolean;
}

export default function AutoDeploySettings({ 
  autoRedeploy, 
  onAutoRedeployChange, 
  usePublicUrl 
}: AutoDeploySettingsProps) {
  return (
    <>
      {/* Auto Deploy Toggle - Only show for Provider repos */}
      {!usePublicUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Cài Đặt Deploy</CardTitle>
            <CardDescription>Cấu hình hành vi deploy tự động</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoRedeploy">Auto-Deploy</Label>
                <p className="text-sm text-muted-foreground">
                  Tự động deploy khi code hoặc cấu hình thay đổi
                </p>
              </div>
              <button
                onClick={() => onAutoRedeployChange(!autoRedeploy)}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                  ${autoRedeploy ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}
                `}
                role="switch"
                aria-checked={autoRedeploy}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${autoRedeploy ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning for Public URL */}
      {usePublicUrl && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  ⚠️ Hạn chế với Public Repository
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Auto-deploy không được hỗ trợ cho public repositories. Bạn cần deploy thủ công khi có thay đổi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

