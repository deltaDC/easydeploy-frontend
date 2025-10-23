"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { GithubService } from "@/services/github.service";
import { useAuth } from "@/hooks/useAuth";
import { Github, ExternalLink, RefreshCw, Search, Settings } from "lucide-react";

interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  defaultBranch: string;
  updatedAt: string;
}

interface GithubInstallation {
  id: number;
  account: string;
  accountType: string;
  repositorySelection: string;
}

export default function RepositorySelector() {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<GithubRepo[]>([]);
  const [installations, setInstallations] = useState<GithubInstallation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load repositories và installations song song
      const [reposData, installationsData] = await Promise.all([
        GithubService.getAllUserRepositories(),
        GithubService.getUserInstallations()
      ]);
      
      setRepositories(reposData);
      setInstallations(installationsData);
      
    } catch (err) {
      setError("Không thể tải danh sách repositories");
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleConfigureInGitHub = async () => {
    try {
      const data = await GithubService.getAppInstallUrl();
      window.open(data.installUrl, '_blank');
    } catch (err) {
      setError("Không thể mở GitHub configuration");
      console.error(err);
    }
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Vui lòng đăng nhập để xem repositories.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Connect a repository</h2>
          <p className="text-muted-foreground">
            Choose a repository to deploy
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {installations.length > 0 && (
            <Button
              onClick={handleConfigureInGitHub}
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure in GitHub
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repositories List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Repositories
              </CardTitle>
              <CardDescription>
                {repositories.length} repositories available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading repositories...</p>
                </div>
              ) : filteredRepositories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No repositories found</p>
                  <p className="text-sm">
                    Make sure EasyDeploy has been granted permissions through your Git provider, 
                    or troubleshoot your GitHub connection.
                  </p>
                  <Button
                    onClick={handleInstallApp}
                    className="mt-4"
                    disabled={installing}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    {installing ? "Installing..." : "Connect GitHub"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRepositories.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        // TODO: Handle repository selection for deployment
                        console.log("Selected repository:", repo);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Github className="h-5 w-5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{repo.fullName}</h4>
                            {repo.private && (
                              <Badge variant="secondary" className="text-xs">
                                Private
                              </Badge>
                            )}
                          </div>
                          {repo.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {repo.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated {new Date(repo.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(repo.htmlUrl, '_blank');
                        }}
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

        {/* Credentials Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Credentials</CardTitle>
              <CardDescription>
                Connected GitHub accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {installations.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No GitHub accounts connected</p>
                  <Button
                    onClick={handleInstallApp}
                    className="mt-2"
                    size="sm"
                    disabled={installing}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Connect GitHub
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {installations.map((installation) => (
                    <div
                      key={installation.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Github className="h-5 w-5" />
                        <div>
                          <p className="font-medium text-sm">{installation.account}</p>
                          <p className="text-xs text-muted-foreground">
                            {installation.accountType} • {installation.repositorySelection}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleConfigureInGitHub}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
