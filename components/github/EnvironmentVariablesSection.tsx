"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, FileText, Upload, Eye, EyeOff, AlertCircle } from "lucide-react";
import { EnvironmentVariable } from "@/types/application.type";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnvironmentVariablesSectionProps {
  envVars: EnvironmentVariable[];
  onEnvVarsChange: (envVars: EnvironmentVariable[]) => void;
  onError: (error: string) => void;
  showExternalDbWarning?: boolean;
}

export function EnvironmentVariablesSection({
  envVars,
  onEnvVarsChange,
  onError,
  showExternalDbWarning = false,
}: EnvironmentVariablesSectionProps) {
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [envContent, setEnvContent] = useState("");
  const [hiddenEnvVars, setHiddenEnvVars] = useState<Set<number>>(new Set());

  const handleAddEnvVar = () => {
    onEnvVarsChange([...envVars, { key: "", value: "" }]);
  };

  const handleRemoveEnvVar = (index: number) => {
    onEnvVarsChange(envVars.filter((_, i) => i !== index));
  };

  const handleEnvVarChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...envVars];
    updated[index] = { ...updated[index], [field]: value };
    onEnvVarsChange(updated);
  };

  const toggleEnvVarVisibility = (index: number) => {
    setHiddenEnvVars(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const maskValue = (value: string) => {
    if (!value) return '';
    return '••••••••••••••••';
  };

  const handleImportEnvContent = () => {
    if (!envContent.trim()) {
      onError("Vui lòng nhập nội dung .env");
      return;
    }

    const lines = envContent.split('\n');
    const newEnvVars: EnvironmentVariable[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;

      const equalsIndex = trimmedLine.indexOf('=');
      if (equalsIndex === -1) return;

      const key = trimmedLine.substring(0, equalsIndex).trim();
      const value = trimmedLine.substring(equalsIndex + 1).trim().replace(/^["']|["']$/g, '');

      if (key) {
        newEnvVars.push({ key, value });
      }
    });

    onEnvVarsChange([...envVars, ...newEnvVars]);
    setEnvContent("");
    setEnvModalOpen(false);
  };

  const handleUploadEnvFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setEnvContent(text);
      event.target.value = '';
    } catch (err) {
      onError("Không thể đọc file");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables</CardTitle>
        <CardDescription>
          Thiết lập cấu hình và secrets cụ thể cho môi trường (như API keys), sau đó đọc các giá trị này từ code. <a href="#" className="text-primary hover:underline">Tìm hiểu thêm</a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showExternalDbWarning && (
          <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>⚠️ External Database Configuration Required</strong>
              <br />
              You selected &ldquo;Connect External Database&rdquo; - please add your database connection string below (e.g., DATABASE_URL)
            </AlertDescription>
          </Alert>
        )}
        
        {envVars.length === 0 ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="NAME_OF_VARIABLE"
                disabled
                className="flex-1"
              />
              <Input
                placeholder="value"
                disabled
                className="flex-1"
              />
            </div>
          </div>
        ) : (
          envVars.map((envVar, index) => {
            const isHidden = hiddenEnvVars.has(index);
            return (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="NAME_OF_VARIABLE"
                  value={envVar.key}
                  onChange={(e) => handleEnvVarChange(index, 'key', e.target.value)}
                  style={{ 
                    width: '350px', 
                    height: '40px',
                    overflow: 'scroll',
                    whiteSpace: 'nowrap'
                  }}
                />
                <div className="relative" style={{ width: '350px', height: '40px' }}>
                  <Textarea
                    placeholder="value"
                    value={isHidden ? maskValue(envVar.value) : envVar.value}
                    onChange={(e) => {
                      if (!isHidden) {
                        handleEnvVarChange(index, 'value', e.target.value);
                      }
                    }}
                    disabled={isHidden}
                    className={`resize-none scrollbar-hide ${isHidden ? 'bg-muted cursor-not-allowed' : ''}`}
                    style={{ 
                      width: '100%',
                      height: '40px',
                      maxHeight: '40px',
                      minHeight: '40px',
                      overflow: 'scroll',
                      whiteSpace: 'nowrap',
                      wordBreak: 'normal',
                      lineHeight: '24px',
                      padding: '8px 12px'
                    }}
                    rows={1}
                    wrap="off"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-muted"
                    onClick={() => toggleEnvVarVisibility(index)}
                    type="button"
                    title={isHidden ? "Show value" : "Hide value"}
                  >
                    {isHidden ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleRemoveEnvVar(index)}
                  className="self-start"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            );
          })
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddEnvVar}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm Environment Variable
          </Button>
          <Dialog open={envModalOpen} onOpenChange={setEnvModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Thêm từ .env
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[66vw] w-full max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Thêm từ .env</DialogTitle>
                <DialogDescription>
                  Dán nội dung file .env của bạn để thêm nhiều biến môi trường cùng lúc. Vui lòng xem placeholder bên dưới để biết định dạng đúng.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <Textarea
                    placeholder={`PUBLIC_API_KEY=your-api-key-here
DATABASE_URL=postgresql://localhost:5432/db
JWT_SECRET=your-secret-key`}
                    value={envContent}
                    onChange={(e) => setEnvContent(e.target.value)}
                    className="font-mono text-sm w-full h-full resize-none overflow-auto"
                    style={{ 
                      minHeight: '400px',
                      maxHeight: '60vh'
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <input
                    type="file"
                    id="envFileUpload"
                    accept=".env"
                    onChange={handleUploadEnvFile}
                    className="hidden"
                  />
                  <label htmlFor="envFileUpload" className="flex items-center text-primary hover:underline cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Chọn file
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setEnvModalOpen(false);
                  setEnvContent("");
                }}>
                  Hủy
                </Button>
                <Button onClick={handleImportEnvContent}>
                  Thêm biến
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

