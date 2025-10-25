"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GithubService } from "@/services/github.service";
import { useAuth } from "@/hooks/useAuth";
import { Github, ExternalLink, Trash2, RefreshCw } from "lucide-react";

interface GithubInstallation {
  id: number;
  account: string;
  accountType: string;
  accountId: number;
  repositorySelection: string;
  appId: string;
  appSlug: string;
  targetId: string;
  targetType: string;
  permissions: string;
  events: string;
  accessTokenUrl: string;
  repositoriesUrl: string;
  htmlUrl: string;
}

interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  updatedAt: string;
}

export default function GitHubAppIntegration() {
  const { user } = useAuth();
  const [installations, setInstallations] = useState<GithubInstallation[]>([]);
  const [repositories, setRepositories] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (user) {
      loadInstallations();
      loadAllRepositories();
    }
  }, [user]);

  const loadInstallations = async () => {
    try {
      setLoading(true);
      const data = await GithubService.getUserInstallations();
      setInstallations(data);
    } catch (err) {
      setError("Không thể tải danh sách installations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllRepositories = async () => {
    try {
      const data = await GithubService.getAllUserRepositories();
      setRepositories(data);
    } catch (err) {
      setError("Không thể tải danh sách repositories");
      console.error(err);
    }
  };

  const handleInstallApp = async () => {
    try {
      setInstalling(true);
      const data = await GithubService.getAppInstallUrl();
      window.open(data.installUrl, '_blank');
    } catch (err) {
      setError("Không thể tạo install URL");
      console.error(err);
    } finally {
      setInstalling(false);
    }
  };

  const handleDeleteInstallation = async (installationId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa installation này?")) {
      return;
    }

    try {
      await GithubService.deleteInstallation(installationId);
      await loadInstallations();
      await loadAllRepositories();
    } catch (err) {
      setError("Không thể xóa installation");
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    await loadInstallations();
    await loadAllRepositories();
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Vui lòng đăng nhập để sử dụng tính năng GitHub App Integration.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GitHub App Integration</h2>
          <p className="text-muted-foreground">
            Kết nối với GitHub App để truy cập repositories từ cả personal account và organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleInstallApp}
            disabled={installing}
          >
            <Github className="h-4 w-4 mr-2" />
            {installing ? "Installing..." : "Install GitHub App"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Installations */}
      <Card>
        <CardHeader>
          <CardTitle>GitHub App Installations</CardTitle>
          <CardDescription>
            Danh sách các GitHub App installations của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : installations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có GitHub App installation nào</p>
              <p className="text-sm">Nhấn &quot;Install GitHub App&quot; để bắt đầu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {installations.map((installation) => (
                <div
                  key={installation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Github className="h-8 w-8" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{installation.account}</h3>
                        <Badge variant="secondary">
                          {installation.accountType}
                        </Badge>
                        <Badge variant="outline">
                          {installation.repositorySelection}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Installation ID: {installation.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(installation.htmlUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteInstallation(installation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repositories */}
      <Card>
        <CardHeader>
          <CardTitle>Repositories</CardTitle>
          <CardDescription>
            Danh sách repositories từ tất cả installations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {repositories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Chưa có repository nào</p>
              <p className="text-sm">Install GitHub App để xem repositories</p>
            </div>
          ) : (
            <div className="space-y-2">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <Github className="h-5 w-5" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{repo.fullName}</h4>
                        {repo.private && (
                          <Badge variant="secondary" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-muted-foreground">
                          {repo.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Updated: {new Date(repo.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(repo.htmlUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
