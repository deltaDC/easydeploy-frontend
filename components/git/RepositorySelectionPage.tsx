"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { 
  Github, 
  GitBranch, 
  ExternalLink, 
  Search, 
  RefreshCw,
  Calendar,
  Lock,
  Globe,
  Star,
  GitBranch as GitBranchIcon,
  Settings,
  Trash2,
  Plus,
  CheckCircle,
  Users,
  Building
} from "lucide-react";
import { GithubService } from "@/services/github.service";
import { useAuth } from "@/hooks/useAuth";

interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  defaultBranch: string;
  updatedAt: string;
  createdAt: string;
  language?: string;
  stargazersCount?: number;
  forksCount?: number;
  isFork?: boolean;
  provider: string;
}

interface ProviderInstallation {
  id: number;
  account: string;
  accountType: string;
  repositorySelection: string;
  provider: string;
}

export default function RepositorySelectionPage() {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<GithubRepo[]>([]);
  const [installations, setInstallations] = useState<ProviderInstallation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
      
      const [reposData, installationsData] = await Promise.all([
        GithubService.getAllUserRepositories(),
        GithubService.getUserInstallations()
      ]);
      
      const githubRepos = reposData.map((repo: any) => ({
        ...repo,
        provider: "github"
      }));
      
      const githubInstallations = installationsData.map((inst: any) => ({
        ...inst,
        provider: "github"
      }));
      
      setRepositories(githubRepos);
      setInstallations(githubInstallations);
      
    } catch (err) {
      setError("Không thể tải danh sách repositories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepositoryClick = (repo: GithubRepo) => {
    setSelectedRepo(repo);
  };

  const handleInstallProvider = async (providerId: string) => {
    try {
      setInstalling(true);
      
      if (providerId === "github") {
        const data = await GithubService.getAppInstallUrl();
        window.open(data.installUrl, '_blank');
      } else if (providerId === "gitlab") {
        // TODO: Implement GitLab integration
        console.log("GitLab integration coming soon");
      }
    } catch (err) {
      setError("Không thể tạo install URL");
      console.error(err);
    } finally {
      setInstalling(false);
    }
  };

  const handleConfigureProvider = async (providerId: string) => {
    try {
      if (providerId === "github") {
        const data = await GithubService.getAppInstallUrl();
        window.open(data.installUrl, '_blank');
      }
    } catch (err) {
      setError("Không thể mở configuration");
      console.error(err);
    }
  };

  const handleDisconnectProvider = async (installationId: number) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      await GithubService.deleteInstallation(installationId);
      setInstallations(prev => prev.filter(inst => inst.id !== installationId));
      setSuccessMessage("Đã ngắt kết nối thành công");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Không thể ngắt kết nối");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = () => {
    if (selectedRepo) {
      // TODO: Implement deployment logic
      console.log("Deploying repository:", selectedRepo);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "github":
        return <Github className="h-4 w-4" />;
      case "gitlab":
        return <GitBranch className="h-4 w-4" />;
      default:
        return <GitBranch className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "github":
        return "text-gray-900";
      case "gitlab":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getAccountIcon = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case "organization":
        return <Building className="h-3 w-3" />;
      case "user":
        return <Users className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Deploy New Application</h1>
        <p className="text-muted-foreground">
          Select a repository from your connected Git providers
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Repository Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranchIcon className="h-5 w-5" />
                    Repositories
                  </CardTitle>
                  <CardDescription>
                    {repositories.length} repositories available
                  </CardDescription>
                </div>
                <Button
                  onClick={loadData}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                </Alert>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Repository Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading repositories...</p>
                      </div>
                    </div>
                  ) : filteredRepositories.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <GitBranchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No repositories found</p>
                      <p className="text-sm">
                        {searchTerm ? "Try adjusting your search terms" : "Connect your Git provider to see repositories"}
                      </p>
                      {!searchTerm && (
                        <Button
                          onClick={() => handleInstallProvider("github")}
                          className="mt-4"
                          disabled={installing}
                        >
                          <Github className="h-4 w-4 mr-2" />
                          {installing ? "Connecting..." : "Connect GitHub"}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredRepositories.map((repo) => (
                        <div
                          key={repo.id}
                          className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                            selectedRepo?.id === repo.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                          }`}
                          onClick={() => handleRepositoryClick(repo)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={getProviderColor(repo.provider)}>
                                  {getProviderIcon(repo.provider)}
                                </div>
                                <h4 className="font-medium text-sm truncate">{repo.fullName}</h4>
                                {repo.isPrivate ? (
                                  <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                )}
                                {repo.language && (
                                  <Badge variant="outline" className="text-xs">
                                    {repo.language}
                                  </Badge>
                                )}
                              </div>
                              
                              {repo.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {repo.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <GitBranchIcon className="h-3 w-3" />
                                  <span>{repo.defaultBranch}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(repo.updatedAt)}</span>
                                </div>
                                {repo.stargazersCount !== undefined && repo.stargazersCount > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    <span>{repo.stargazersCount}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              {selectedRepo?.id === repo.id && (
                                <Badge variant="default" className="text-xs">
                                  Selected
                                </Badge>
                              )}
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Credentials */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Credentials</CardTitle>
                  {installations.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {installations.length} connected
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={loadData}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Manage your Git provider connections
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                <div className="p-6 space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
                    </Alert>
                  )}

                  {/* Provider Status Overview */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Github className="h-4 w-4 text-gray-900" />
                      <span className="text-sm font-medium">GitHub</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {installations.filter(inst => inst.provider === "github").length} connected
                    </p>
                  </div>

                  {/* Connected Installations */}
                  {installations.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                      <div className="text-gray-400 mb-3">
                        <Github className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        No GitHub accounts connected
                      </p>
                      <Button
                        onClick={() => handleInstallProvider("github")}
                        disabled={installing}
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {installing ? "Connecting..." : "Connect GitHub"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Authorized Accounts & Organizations
                      </h4>
                      
                      <div className="space-y-2">
                        {installations.map((installation) => (
                          <div
                            key={installation.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {getAccountIcon(installation.accountType)}
                                <div className={getProviderColor(installation.provider)}>
                                  {getProviderIcon(installation.provider)}
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{installation.account}</p>
                                <p className="text-xs text-muted-foreground">
                                  {installation.accountType} • {installation.repositorySelection}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDisconnectProvider(installation.id)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigureProvider("github")}
                          className="flex-1"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInstallProvider("github")}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Help Text */}
                  <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p className="font-medium mb-1">Need help?</p>
                    <p>Connect your GitHub account to access repositories and enable automated deployments.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedRepo ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedRepo.fullName}</span>
                  <Badge variant="outline" className="text-xs">{selectedRepo.defaultBranch}</Badge>
                  {selectedRepo.isPrivate ? (
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated {formatDate(selectedRepo.updatedAt)}
                  {selectedRepo.language && ` • ${selectedRepo.language}`}
                  {selectedRepo.stargazersCount !== undefined && selectedRepo.stargazersCount > 0 && ` • ${selectedRepo.stargazersCount} stars`}
                </div>
              </div>
            </div>
          ) : (
            "Select a repository to continue"
          )}
        </div>
        
        <Button 
          onClick={handleDeploy}
          disabled={!selectedRepo}
          className="bg-green-600 hover:bg-green-700"
        >
          Deploy Application
        </Button>
      </div>
    </div>
  );
}
