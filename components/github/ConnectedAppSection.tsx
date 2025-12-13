"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Link2, Info, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import ApplicationService from "@/services/application.service";
import { RunningApplication, EnvironmentVariable } from "@/types/application.type";

const ENV_VAR_TEMPLATES = [
  { key: 'API_URL', label: 'API_URL', description: 'API_URL' },
  { key: 'BACKEND_URL', label: 'BACKEND_URL', description: 'URL backend' },
  { key: 'VITE_API_URL', label: 'VITE_API_URL', description: 'Cho ứng dụng Vite (Vue, React)' },
  { key: 'NEXT_PUBLIC_API_URL', label: 'NEXT_PUBLIC_API_URL', description: 'Cho ứng dụng Next.js' },
  { key: 'REACT_APP_API_URL', label: 'REACT_APP_API_URL', description: 'Cho Create React App' },
];

interface ConnectedAppSectionProps {
  connectionMode: 'none' | 'existing';
  onConnectionModeChange: (mode: 'none' | 'existing') => void;
  selectedAppId?: string;
  onSelectedAppIdChange: (appId: string | undefined) => void;
  envVars?: EnvironmentVariable[];
  onEnvVarsChange?: (envVars: EnvironmentVariable[]) => void;
}

export function ConnectedAppSection({
  connectionMode,
  onConnectionModeChange,
  selectedAppId,
  onSelectedAppIdChange,
  envVars = [],
  onEnvVarsChange,
}: ConnectedAppSectionProps) {
  const [applications, setApplications] = useState<RunningApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedApp, setSelectedApp] = useState<RunningApplication | null>(null);
  const [selectedEnvKeys, setSelectedEnvKeys] = useState<Set<string>>(new Set(['API_URL', 'VITE_API_URL']));

  useEffect(() => {
    if (connectionMode === 'existing') {
      fetchRunningApplications();
    }
  }, [connectionMode]);

  useEffect(() => {
    if (selectedAppId && applications.length > 0) {
      const app = applications.find(a => a.id === selectedAppId);
      setSelectedApp(app || null);
    } else {
      setSelectedApp(null);
    }
  }, [selectedAppId, applications]);

  const fetchRunningApplications = async () => {
    try {
      setLoadingApps(true);
      const data = await ApplicationService.getRunningApplications();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch running applications:', error);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleAppSelect = (appId: string) => {
    onSelectedAppIdChange(appId);
    const app = applications.find(a => a.id === appId);
    setSelectedApp(app || null);
    
    if (app && onEnvVarsChange) {
      injectEnvVars(app.publicUrl);
    }
  };

  const handleEnvKeyToggle = (key: string, checked: boolean) => {
    const newSelectedKeys = new Set(selectedEnvKeys);
    if (checked) {
      newSelectedKeys.add(key);
    } else {
      newSelectedKeys.delete(key);
    }
    setSelectedEnvKeys(newSelectedKeys);

    if (selectedApp && onEnvVarsChange) {
      updateEnvVarsWithSelection(selectedApp.publicUrl, newSelectedKeys);
    }
  };

  const injectEnvVars = (publicUrl: string) => {
    if (!onEnvVarsChange) return;

    const filteredEnvVars = envVars.filter(env => 
      !ENV_VAR_TEMPLATES.some(template => template.key === env.key)
    );

    const newEnvVars: EnvironmentVariable[] = [...filteredEnvVars];
    selectedEnvKeys.forEach(key => {
      newEnvVars.push({ key, value: publicUrl });
    });

    onEnvVarsChange(newEnvVars);
  };

  const updateEnvVarsWithSelection = (publicUrl: string, selectedKeys: Set<string>) => {
    if (!onEnvVarsChange) return;

    const filteredEnvVars = envVars.filter(env => 
      !ENV_VAR_TEMPLATES.some(template => template.key === env.key)
    );

    const newEnvVars: EnvironmentVariable[] = [...filteredEnvVars];
    selectedKeys.forEach(key => {
      newEnvVars.push({ key, value: publicUrl });
    });

    onEnvVarsChange(newEnvVars);
  };

  const handleModeChange = (value: string) => {
    const mode = value as 'none' | 'existing';
    onConnectionModeChange(mode);
    
    if (mode === 'none') {
      onSelectedAppIdChange(undefined);
      setSelectedApp(null);
      
      if (onEnvVarsChange) {
        const filteredEnvVars = envVars.filter(env => 
          !ENV_VAR_TEMPLATES.some(template => template.key === env.key)
        );
        onEnvVarsChange(filteredEnvVars);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <CardTitle>Kết nối với ứng dụng hiện có</CardTitle>
        </div>
        <CardDescription>
          Kết nối ứng dụng này với một ứng dụng đã triển khai khác (ví dụ: kết nối frontend với backend)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>Tùy chọn kết nối</Label>
          <RadioGroup value={connectionMode} onValueChange={handleModeChange}>
            <div className="flex items-center space-x-2 py-2">
              <RadioGroupItem value="none" id="conn-none" />
              <Label htmlFor="conn-none" className="font-normal cursor-pointer">
                Không kết nối
              </Label>
            </div>
            <div className="flex items-center space-x-2 py-2">
              <RadioGroupItem value="existing" id="conn-existing" />
              <Label htmlFor="conn-existing" className="font-normal cursor-pointer">
                Kết nối với ứng dụng hiện có
                <span className="text-muted-foreground text-sm ml-2">
                  (Chèn biến môi trường URL API)
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {connectionMode === 'existing' && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="existing-app">Chọn ứng dụng *</Label>
              {loadingApps ? (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tải ứng dụng...</span>
                </div>
              ) : applications.length === 0 ? (
                <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    Không tìm thấy ứng dụng đang chạy. Hãy triển khai một ứng dụng trước để kết nối với nó.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select
                  value={selectedAppId || ''}
                  onValueChange={handleAppSelect}
                >
                  <SelectTrigger id="existing-app">
                    <SelectValue placeholder="Chọn một ứng dụng" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{app.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {app.language || 'Không xác định'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedApp && (
              <>
                {/* Selected App Info */}
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Ứng dụng đã chọn:</strong> {selectedApp.name}
                    <br />
                    <div className="flex items-center gap-1 mt-1">
                      <strong>URL:</strong>
                      <a 
                        href={selectedApp.publicUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {selectedApp.publicUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Environment Variable Templates */}
                <div className="space-y-3">
                  <Label>Chọn biến môi trường để chèn</Label>
                  <p className="text-sm text-muted-foreground">
                    Chọn biến môi trường nào sẽ được tạo với URL của ứng dụng đã chọn
                  </p>
                  <div className="space-y-2 rounded-md border p-4">
                    {ENV_VAR_TEMPLATES.map((template) => (
                      <div key={template.key} className="flex items-start space-x-3">
                        <Checkbox
                          id={`env-${template.key}`}
                          checked={selectedEnvKeys.has(template.key)}
                          onCheckedChange={(checked) => handleEnvKeyToggle(template.key, checked as boolean)}
                        />
                        <div className="grid gap-1 leading-none">
                          <label
                            htmlFor={`env-${template.key}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {template.label}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                          {selectedEnvKeys.has(template.key) && (
                            <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block">
                              {template.key}={selectedApp.publicUrl}
                            </code>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Lưu ý:</strong> Các biến môi trường đã chọn sẽ được tự động thêm vào phần Biến môi trường ở trên. Bạn có thể xem và chỉnh sửa chúng ở đó trước khi triển khai.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



