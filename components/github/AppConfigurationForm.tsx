"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Code, Play, FolderOpen, Folder, Heart, Globe } from "lucide-react";
import { RepositoryDetailResponse } from "@/types/application.type";
import { AVAILABLE_LANGUAGES } from "@/utils/language.utils";

interface AppConfigurationFormProps {
  appName: string;
  onAppNameChange: (value: string) => void;
  selectedBranch: string;
  onBranchChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  buildCommand: string;
  onBuildCommandChange: (value: string) => void;
  startCommand: string;
  onStartCommandChange: (value: string) => void;
  publishDir: string;
  onPublishDirChange: (value: string) => void;
  rootDir: string;
  onRootDirChange: (value: string) => void;
  healthCheckPath: string;
  onHealthCheckPathChange: (value: string) => void;
  repoDetails: RepositoryDetailResponse | null;
}

export default function AppConfigurationForm({
  appName,
  onAppNameChange,
  selectedBranch,
  onBranchChange,
  language,
  onLanguageChange,
  buildCommand,
  onBuildCommandChange,
  startCommand,
  onStartCommandChange,
  publishDir,
  onPublishDirChange,
  rootDir,
  onRootDirChange,
  healthCheckPath,
  onHealthCheckPathChange,
  repoDetails,
}: AppConfigurationFormProps) {
  return (
    <div className="space-y-6">
      {/* Thông tin dự án */}
      <Card className="bg-white/95 backdrop-blur-xl border-2 border-white/50 rounded-3xl shadow-inner-glow-soft relative z-30">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-charcoal">Thông tin dự án</CardTitle>
          <CardDescription className="text-charcoal/70">
            Cấu hình cơ bản cho ứng dụng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName" className="text-sm font-medium text-charcoal">
              Tên ứng dụng hiển thị
            </Label>
            <Input
              id="appName"
              placeholder="Tên ứng dụng của bạn"
              value={appName}
              onChange={(e) => onAppNameChange(e.target.value)}
              className="h-11 rounded-misty-sm border-0 bg-white/90 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 text-charcoal"
            />
            <p className="text-xs text-charcoal/60">
              Tên duy nhất cho ứng dụng của bạn
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch" className="text-sm font-medium text-charcoal">
              Nhánh triển khai
            </Label>
            <Select value={selectedBranch} onValueChange={onBranchChange}>
              <SelectTrigger id="branch" aria-label="Chọn nhánh triển khai" className="h-11 rounded-misty-sm border-0 bg-white/80 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 text-charcoal">
                <SelectValue placeholder="Chọn branch" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/50">
                {repoDetails?.branches.map((branch) => (
                  <SelectItem key={branch.name} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-charcoal/60">
              Branch sẽ được build và deploy
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium text-charcoal flex items-center gap-2">
              <Globe className="h-4 w-4 text-misty-sage" strokeWidth={1.5} />
              Ngôn ngữ / Framework
              <span className="text-rose-500">*</span>
            </Label>
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger id="language" aria-label="Chọn ngôn ngữ" className="h-11 rounded-misty-sm border-0 bg-white/80 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 text-charcoal">
                <SelectValue placeholder="Chọn ngôn ngữ" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/50">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-charcoal/60">
              Chọn ngôn ngữ để tự động điền lệnh build và start
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cấu hình Xây dựng & Triển khai */}
      <Card className="bg-white/95 backdrop-blur-xl border-2 border-white/50 rounded-3xl shadow-inner-glow-soft relative z-30">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-charcoal flex items-center gap-2">
            <Code className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
            Cấu hình Xây dựng & Triển khai
          </CardTitle>
          <CardDescription className="text-charcoal/70">
            Cấu hình build và deploy cho ứng dụng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="buildCommand" className="text-sm font-medium text-charcoal flex items-center gap-2">
              <Code className="h-4 w-4 text-misty-sage" strokeWidth={1.5} />
              Lệnh cài đặt & Build
              <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="buildCommand"
              placeholder="npm install && npm run build"
              value={buildCommand}
              onChange={(e) => onBuildCommandChange(e.target.value)}
              required
              className="h-11 rounded-misty-sm border-0 bg-charcoal/5 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 font-mono text-sm"
            />
            <p className="text-xs text-charcoal/60">
              Command để build ứng dụng
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startCommand" className="text-sm font-medium text-charcoal flex items-center gap-2">
              <Play className="h-4 w-4 text-misty-sage" strokeWidth={1.5} />
              Lệnh khởi chạy
              <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="startCommand"
              placeholder="npm start"
              value={startCommand}
              onChange={(e) => onStartCommandChange(e.target.value)}
              required
              className="h-11 rounded-misty-sm border-0 bg-charcoal/5 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 font-mono text-sm"
            />
            <p className="text-xs text-charcoal/60">
              Command để start ứng dụng
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishDir" className="text-sm font-medium text-charcoal flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-misty-sage" strokeWidth={1.5} />
              Thư mục xuất bản
            </Label>
            <Input
              id="publishDir"
              placeholder="build hoặc dist"
              value={publishDir}
              onChange={(e) => onPublishDirChange(e.target.value)}
              className="h-11 rounded-misty-sm border-0 bg-white/80 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 font-mono text-sm"
            />
            <div className="space-y-2">
              <p className="text-xs text-charcoal/60">
                Thư mục chứa tệp sau khi build (vd: <code className="text-xs bg-charcoal/5 px-1.5 py-0.5 rounded font-mono">build</code> hoặc <code className="text-xs bg-charcoal/5 px-1.5 py-0.5 rounded font-mono">dist</code>)
              </p>
              {(language.toLowerCase() === 'node' || language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') && (
                !publishDir && (
                  <Alert className="bg-amber-50/80 backdrop-blur-sm border-amber-200 rounded-2xl">
                    <Info className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
                    <AlertDescription className="text-xs text-amber-800">
                      <strong>Khuyến nghị:</strong> Nhập <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded font-mono">build</code> hoặc <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded font-mono">dist</code> để serve static files. Nếu để trống, app sẽ chạy dev server.
                    </AlertDescription>
                  </Alert>
                )
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rootDir" className="text-sm font-medium text-charcoal flex items-center gap-2">
              <Folder className="h-4 w-4 text-misty-sage" strokeWidth={1.5} />
              Thư mục gốc
            </Label>
            <Input
              id="rootDir"
              placeholder="frontend hoặc api"
              value={rootDir}
              onChange={(e) => onRootDirChange(e.target.value)}
              className="h-11 rounded-misty-sm border-0 bg-white/80 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 font-mono text-sm"
            />
            <div className="space-y-2">
              <p className="text-xs text-charcoal/60">
                Để trống nếu mã nguồn nằm ở thư mục chính
              </p>
              {rootDir && (
                <Alert className="bg-blue-50/80 backdrop-blur-sm border-blue-200 rounded-2xl">
                  <Info className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
                  <AlertDescription className="text-xs text-blue-800">
                    <strong>Lưu ý:</strong> Tên thư mục phải <strong>chính xác</strong> (case-sensitive). 
                    Kiểm tra trên GitHub để đảm bảo tên đúng. Ví dụ: <code className="text-xs bg-blue-100 px-1.5 py-0.5 rounded font-mono">frontend</code> ≠ <code className="text-xs bg-blue-100 px-1.5 py-0.5 rounded font-mono">Frontend</code>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthCheckPath" className="text-sm font-medium text-charcoal flex items-center gap-2">
              <Heart className="h-4 w-4 text-misty-sage" strokeWidth={1.5} />
              Đường dẫn kiểm tra ứng dụng
            </Label>
            <Input
              id="healthCheckPath"
              placeholder="/health"
              value={healthCheckPath}
              onChange={(e) => onHealthCheckPathChange(e.target.value)}
              className="h-11 rounded-misty-sm border-0 bg-white/90 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 text-charcoal"
            />
            <p className="text-xs text-charcoal/60">
              Đường dẫn HTTP endpoint mà EasyDeploy sẽ giám sát để kiểm tra trạng thái ứng dụng
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
