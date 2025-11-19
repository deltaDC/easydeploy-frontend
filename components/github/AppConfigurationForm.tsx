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
import { Info } from "lucide-react";
import { RepositoryDetailResponse } from "@/types/application.type";

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
    <>
      {/* App Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>App Configuration</CardTitle>
          <CardDescription>Cấu hình cơ bản cho ứng dụng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Tên ứng dụng</Label>
            <Input
              id="appName"
              placeholder="Tên ứng dụng của bạn"
              value={appName}
              onChange={(e) => onAppNameChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Tên duy nhất cho ứng dụng của bạn
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Select value={selectedBranch} onValueChange={onBranchChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn branch" />
              </SelectTrigger>
              <SelectContent>
                {repoDetails?.branches.map((branch) => (
                  <SelectItem key={branch.name} value={branch.name}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Branch sẽ được build và deploy
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="docker">Docker</SelectItem>
                <SelectItem value="node">Node.js</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="static">Static Site</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Chọn language/framework cho ứng dụng
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Build & Deploy Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Build & Deploy Configuration</CardTitle>
          <CardDescription>Cấu hình build và deploy cho ứng dụng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buildCommand">Build Command <span className="text-red-500">*</span></Label>
            <Input
              id="buildCommand"
              placeholder="npm install && npm run build"
              value={buildCommand}
              onChange={(e) => onBuildCommandChange(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Command để build ứng dụng
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startCommand">Start Command <span className="text-red-500">*</span></Label>
            <Input
              id="startCommand"
              placeholder="npm start"
              value={startCommand}
              onChange={(e) => onStartCommandChange(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Command để start ứng dụng
            </p>
          </div>


          <div className="space-y-2">
            <Label htmlFor="publishDir">
              Publish Directory <span className="text-muted-foreground">(Optional - Recommended for static sites)</span>
            </Label>
            <Input
              id="publishDir"
              placeholder="build or dist"
              value={publishDir}
              onChange={(e) => onPublishDirChange(e.target.value)}
            />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Thư mục chứa files sau khi build (ví dụ: <code className="text-xs bg-muted px-1 py-0.5 rounded">build</code> cho React, <code className="text-xs bg-muted px-1 py-0.5 rounded">dist</code> cho Vue)
              </p>
              {(language.toLowerCase() === 'node' || language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') && (
                !publishDir && (
                  <Alert className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Khuyến nghị:</strong> Nhập <code className="text-xs bg-muted px-1 py-0.5 rounded">build</code> hoặc <code className="text-xs bg-muted px-1 py-0.5 rounded">dist</code> để serve static files. Nếu để trống, app sẽ chạy dev server.
                    </AlertDescription>
                  </Alert>
                )
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rootDir">
              Root Directory <span className="text-muted-foreground">(Optional - For mono repos)</span>
            </Label>
            <Input
              id="rootDir"
              placeholder="frontend or api"
              value={rootDir}
              onChange={(e) => onRootDirChange(e.target.value)}
            />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Thư mục gốc của app trong repo (chỉ cần nếu là mono repo)
              </p>
              {rootDir && (
                <Alert className="mt-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Lưu ý:</strong> Tên thư mục phải <strong>chính xác</strong> (case-sensitive). 
                    Kiểm tra trên GitHub để đảm bảo tên đúng. Ví dụ: <code className="text-xs bg-muted px-1 py-0.5 rounded">frontend</code> ≠ <code className="text-xs bg-muted px-1 py-0.5 rounded">Frontend</code> ≠ <code className="text-xs bg-muted px-1 py-0.5 rounded">front-end</code>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthCheckPath">Health Check Path - Optional</Label>
            <Input
              id="healthCheckPath"
              placeholder="/health"
              value={healthCheckPath}
              onChange={(e) => onHealthCheckPathChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Provide an HTTP endpoint path that EasyDeploy monitors
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

