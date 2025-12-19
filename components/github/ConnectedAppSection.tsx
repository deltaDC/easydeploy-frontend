"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Link2, Info, AlertCircle, Loader2, ExternalLink, Check } from "lucide-react";
import ApplicationService from "@/services/application.service";
import { RunningApplication, EnvironmentVariable } from "@/types/application.type";

const ENV_VAR_TEMPLATES = [
  { key: 'API_URL', label: 'API_URL', description: 'API_URL' },
  { key: 'BACKEND_URL', label: 'BACKEND_URL', description: 'URL backend' },
  { key: 'VITE_API_URL', label: 'VITE_API_URL', description: 'Cho ứng dụng Vite (Vue, React)' },
  { key: 'NEXT_PUBLIC_API_URL', label: 'NEXT_PUBLIC_API_URL', description: 'Cho ứng dụng Next.js' },
  { key: 'REACT_APP_API_URL', label: 'REACT_APP_API_URL', description: 'Cho ứng dụng Create React App' },
];

interface ConnectedAppSectionProps {
  connectionMode: 'none' | 'existing';
  onConnectionModeChange: (mode: 'none' | 'existing') => void;
  selectedAppId?: string;
  onSelectedAppIdChange: (appId: string | undefined) => void;
  envVars?: EnvironmentVariable[];
  onEnvVarsChange?: (envVars: EnvironmentVariable[]) => void;
  embedded?: boolean;
}

export function ConnectedAppSection({
  connectionMode,
  onConnectionModeChange,
  selectedAppId,
  onSelectedAppIdChange,
  envVars = [],
  onEnvVarsChange,
  embedded = false,
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

  const connectionOptions = [
    {
      value: 'none' as const,
      label: 'Không kết nối',
      description: 'Ứng dụng độc lập, không kết nối với ứng dụng khác',
    },
    {
      value: 'existing' as const,
      label: 'Kết nối với ứng dụng hiện có',
      description: 'Kết nối frontend với backend hoặc các ứng dụng khác',
    },
  ];

  const content = (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-charcoal mb-4 block">Tùy chọn kết nối</Label>
          <RadioGroup
            value={connectionMode}
            onValueChange={handleModeChange}
          >
            <div className="grid grid-cols-1 gap-3">
              {connectionOptions.map((option) => {
                const isSelected = connectionMode === option.value;
                return (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <label
                      htmlFor={`conn-${option.value}`}
                      className={`block cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 ${
                        isSelected
                          ? 'bg-emerald-50/50 border-emerald-300 shadow-emerald-md'
                          : 'bg-white/70 backdrop-blur-sm border-white/40 hover:border-misty-sage/30 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0 mt-0.5">
                          <RadioGroupItem
                            value={option.value}
                            id={`conn-${option.value}`}
                            className="sr-only"
                          />
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-charcoal/30 bg-white/80'
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          )}
                        </div>
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md -z-10"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 0.6 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold text-sm ${
                            isSelected ? 'text-emerald-700' : 'text-charcoal'
                          }`}>
                            {option.label}
                          </span>
                        </div>
                        <p className={`text-xs ${
                          isSelected ? 'text-emerald-600' : 'text-charcoal/60'
                        }`}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </label>
                </motion.div>
              );
            })}
            </div>
          </RadioGroup>
          </div>

          {connectionMode === 'existing' && (
          <div className="space-y-4 pt-4 border-t border-white/20">
            <div className="space-y-2">
              <Label htmlFor="existing-app" className="text-sm font-medium text-charcoal">Chọn ứng dụng *</Label>
              {loadingApps ? (
                <div className="flex items-center space-x-2 text-sm text-charcoal/60">
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  <span>Đang tải ứng dụng...</span>
                </div>
              ) : applications.length === 0 ? (
                <Alert className="bg-amber-50/80 backdrop-blur-sm border-amber-200 rounded-2xl">
                  <AlertCircle className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
                  <AlertDescription className="text-amber-800 text-sm">
                    Không tìm thấy ứng dụng đang chạy. Hãy triển khai một ứng dụng trước để kết nối với nó.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select
                  value={selectedAppId || ''}
                  onValueChange={handleAppSelect}
                >
                  <SelectTrigger id="existing-app" aria-label="Chọn ứng dụng đã tồn tại" className="h-11 rounded-misty-sm border-0 bg-white/60 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20">
                    <SelectValue placeholder="Chọn một ứng dụng" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-white/50">
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{app.name}</span>
                          <span className="text-xs text-charcoal/60 ml-2">
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
                <Alert className="bg-blue-50/80 backdrop-blur-sm border-blue-200 rounded-2xl">
                  <Info className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Ứng dụng đã chọn:</strong> {selectedApp.name}
                    <br />
                    <div className="flex items-center gap-1 mt-1">
                      <strong>URL:</strong>
                      <a 
                        href={selectedApp.publicUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {selectedApp.publicUrl}
                        <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                      </a>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-charcoal">Chọn biến môi trường để chèn</Label>
                  <p className="text-xs text-charcoal/60">
                    Chọn biến môi trường nào sẽ được tạo với URL của ứng dụng đã chọn
                  </p>
                  <div className="space-y-2 rounded-2xl border-2 border-white/40 bg-white/70 backdrop-blur-sm p-4">
                    {ENV_VAR_TEMPLATES.map((template) => (
                      <div key={template.key} className="flex items-start space-x-3">
                        <Checkbox
                          id={`env-${template.key}`}
                          checked={selectedEnvKeys.has(template.key)}
                          onCheckedChange={(checked) => handleEnvKeyToggle(template.key, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="grid gap-1 leading-none flex-1">
                          <label
                            htmlFor={`env-${template.key}`}
                            className="text-sm font-medium cursor-pointer text-charcoal"
                          >
                            {template.label}
                          </label>
                          <p className="text-xs text-charcoal/60">
                            {template.description}
                          </p>
                          {selectedEnvKeys.has(template.key) && (
                            <code className="text-xs bg-charcoal/5 px-2 py-1 rounded mt-1 block font-mono">
                              {template.key}={selectedApp.publicUrl}
                            </code>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="bg-emerald-50/80 backdrop-blur-sm border-emerald-200 rounded-2xl">
                  <Info className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                  <AlertDescription className="text-emerald-800 text-sm">
                    <strong>Lưu ý:</strong> Các biến môi trường đã chọn sẽ được tự động thêm vào phần Biến môi trường ở trên. Bạn có thể xem và chỉnh sửa chúng ở đó trước khi triển khai.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
        )}
      </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-inner-glow-soft overflow-hidden relative z-30">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-charcoal">Liên kết hệ sinh thái</h3>
        </div>
        <p className="text-sm text-charcoal/70 mb-6">
          Kết nối ứng dụng này với một ứng dụng đã triển khai khác (ví dụ: kết nối frontend với backend)
        </p>
        {content}
      </div>
    </div>
  );
}
