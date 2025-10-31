"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LinkIcon, ExternalLink, Info } from "lucide-react";

interface PublicRepoUrlInputProps {
  onFetchRepo: (url: string) => Promise<void>;
  error: string | null;
  loading: boolean;
}

export default function PublicRepoUrlInput({ onFetchRepo, error, loading }: PublicRepoUrlInputProps) {
  const [repoUrl, setRepoUrl] = useState("");

  const handleFetch = async () => {
    if (!repoUrl.trim()) return;
    await onFetchRepo(repoUrl);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Nhập URL Repository Công Khai
          </CardTitle>
          <CardDescription>
            Nhập URL của một GitHub repository công khai để bắt đầu deploy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">URL GitHub Repository</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/owner/repo hoặc owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && repoUrl.trim()) {
                  handleFetch();
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              Ví dụ: https://github.com/owner/repo hoặc owner/repo
            </p>
          </div>

          <Button
            onClick={handleFetch}
            disabled={loading || !repoUrl.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tải repository...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Tải thông tin Repository
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Deploy repository công khai không cần kết nối GitHub
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Bạn có thể deploy bất kỳ repository công khai nào trên GitHub bằng cách nhập URL. 
                Không cần phải cài đặt GitHub App hoặc cấp quyền truy cập.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning about Auto-Deploy */}
      <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                ⚠️ Lưu ý về Auto-Deploy
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Public repositories không hỗ trợ auto-deploy tự động. Bạn sẽ cần deploy thủ công mỗi khi có thay đổi code.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

