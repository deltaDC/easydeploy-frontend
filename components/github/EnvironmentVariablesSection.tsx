"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import { Trash2, Plus, FileText, Upload, Eye, EyeOff, AlertCircle, Key } from "lucide-react";
import { EnvironmentVariable } from "@/types/application.type";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnvironmentVariablesSectionProps {
  envVars: EnvironmentVariable[];
  onEnvVarsChange: (envVars: EnvironmentVariable[]) => void;
  onError: (error: string) => void;
  showExternalDbWarning?: boolean;
  embedded?: boolean;
}

export function EnvironmentVariablesSection({
  envVars,
  onEnvVarsChange,
  onError,
  showExternalDbWarning = false,
  embedded = false,
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

  const content = (
    <div className="space-y-4">
          {showExternalDbWarning && (
            <Alert className="bg-rose-50/80 backdrop-blur-sm border-rose-200 rounded-2xl">
              <AlertCircle className="h-4 w-4 text-rose-600" strokeWidth={1.5} />
              <AlertDescription className="text-rose-800 text-sm">
                <strong>⚠️ Cấu hình Cơ sở dữ liệu Bên ngoài Bắt buộc</strong>
                <br />
                Bạn đã chọn &quot;Kết nối Cơ sở dữ liệu Bên ngoài&quot; - vui lòng thêm chuỗi kết nối cơ sở dữ liệu của bạn bên dưới (ví dụ: DATABASE_URL)
              </AlertDescription>
            </Alert>
          )}

          {/* Glass Table */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border-2 border-white/40 overflow-hidden">
            {envVars.length === 0 ? (
              <div className="p-8 text-center">
                <div className="space-y-2">
                  <div className="flex gap-2 justify-center">
                    <Input
                      placeholder="TÊN_BIẾN"
                      disabled
                      className="flex-1 max-w-xs bg-transparent border-white/20"
                    />
                    <Input
                      placeholder="Giá trị"
                      disabled
                      className="flex-1 max-w-xs bg-transparent border-white/20"
                    />
                  </div>
                  <p className="text-xs text-charcoal/50">Chưa có biến môi trường nào</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/20 overflow-x-auto">
                {envVars.map((envVar, index) => {
                  const isHidden = hiddenEnvVars.has(index);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 hover:bg-white/20 transition-colors min-w-0"
                    >
                      <div className="flex gap-3 items-center min-w-0">
                        <Input
                          placeholder="TÊN_BIẾN"
                          value={envVar.key}
                          onChange={(e) => handleEnvVarChange(index, 'key', e.target.value)}
                          className="flex-1 h-10 rounded-misty-sm border-0 bg-white/80 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 font-mono text-sm min-w-0"
                        />
                        <div className="relative flex-1 min-w-0">
                          <Input
                            type={isHidden ? "password" : "text"}
                            placeholder="Giá trị"
                            value={isHidden ? maskValue(envVar.value) : envVar.value}
                            onChange={(e) => {
                              if (!isHidden) {
                                handleEnvVarChange(index, 'value', e.target.value);
                              }
                            }}
                            disabled={isHidden}
                            className="h-10 rounded-misty-sm border-0 bg-white/80 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 font-mono text-sm pr-10 break-words overflow-wrap-anywhere"
                            style={{ wordBreak: 'break-all' }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-white/40"
                            onClick={() => toggleEnvVarVisibility(index)}
                            type="button"
                            aria-label={isHidden ? "Hiển thị giá trị" : "Ẩn giá trị"}
                            title={isHidden ? "Hiển thị giá trị" : "Ẩn giá trị"}
                          >
                            {isHidden ? (
                              <Eye className="h-4 w-4 text-charcoal/60" strokeWidth={1.5} />
                            ) : (
                              <EyeOff className="h-4 w-4 text-charcoal/60" strokeWidth={1.5} />
                            )}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveEnvVar(index)}
                          className="h-10 w-10 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          aria-label={`Xóa biến môi trường ${envVar.key || 'này'}`}
                          title={`Xóa biến môi trường ${envVar.key || 'này'}`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleAddEnvVar}
              className="bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/80"
            >
              <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Thêm biến môi trường
            </Button>
            <Dialog open={envModalOpen} onOpenChange={setEnvModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/70 backdrop-blur-sm border-white/40 hover:bg-white/80"
                >
                  <FileText className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Thêm từ tệp .env
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-xl border-white/50 rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-charcoal">Thêm từ tệp .env</DialogTitle>
                  <DialogDescription className="text-charcoal/70">
                    Dán nội dung file .env của bạn để thêm nhiều biến môi trường cùng lúc. Vui lòng xem placeholder bên dưới để biết định dạng đúng.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Textarea
                      placeholder={`PUBLIC_API_KEY=your-api-key-here
DATABASE_URL=postgresql://localhost:5432/db
JWT_SECRET=your-secret-key`}
                      value={envContent}
                      onChange={(e) => setEnvContent(e.target.value)}
                      className="font-mono text-sm min-h-[300px] bg-white/80 backdrop-blur-sm border-white/40 rounded-2xl shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20"
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
                    <label
                      htmlFor="envFileUpload"
                      className="flex items-center text-misty-sage hover:text-misty-sage/80 cursor-pointer text-sm font-medium"
                    >
                      <Upload className="h-4 w-4 mr-2" strokeWidth={1.5} />
                      Chọn file
                    </label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEnvModalOpen(false);
                      setEnvContent("");
                    }}
                    className="bg-white/40 backdrop-blur-sm border-white/30"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleImportEnvContent}
                    variant="success"
                  >
                    Thêm biến
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-inner-glow-soft overflow-hidden relative z-30">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-charcoal">Biến môi trường</h3>
        </div>
        <p className="text-sm text-charcoal/70 mb-6">
          Thiết lập cấu hình và secrets cụ thể cho môi trường (như API keys), sau đó đọc các giá trị này từ code.
        </p>
        {content}
      </div>
    </div>
  );
}
