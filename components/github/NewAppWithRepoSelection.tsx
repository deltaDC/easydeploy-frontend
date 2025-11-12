"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Github, 
  GitBranch,
  Loader2,
  ChevronLeft,
  X,
  Info,
  CheckCircle,
  Link as LinkIcon,
} from "lucide-react";
import { GithubService } from "@/services/github.service";
import { ApplicationService } from "@/services/application.service";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { CreateApplicationRequest, EnvironmentVariable, RepositoryDetailResponse, SecretFile } from "@/types/application.type";
import { RepositorySelectionView } from "./RepositorySelectionView";
import { CredentialsSection } from "./CredentialsSection";
import { EnvironmentVariablesSection } from "./EnvironmentVariablesSection";
import { SecretFilesSection } from "./SecretFilesSection";
import PublicRepoUrlInput from "./PublicRepoUrlInput";
import { useRepositoryManagement } from "@/hooks/useRepositoryManagement";

interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  htmlUrl: string;
  defaultBranch: string;
  updatedAt: string;
  language?: string;
  stargazersCount?: number;
  provider: string;
}

interface ProviderInstallation {
  id: number;
  account: string;
  accountType: string;
  repositorySelection: string;
  provider: string;
}

export default function NewAppWithRepoSelection() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Use custom hook for repository management
  const {
    repositories,
    installations,
    loading,
    syncing,
    displayedRepos,
    loadingMore,
    searchTerm,
    setSearchTerm,
    handleScroll,
    loadData,
    handleSyncRepositories,
  } = useRepositoryManagement({
    userId: user?.id?.toString(),
    onError: (error) => setError(error),
  });

  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [repoDetails, setRepoDetails] = useState<RepositoryDetailResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [repositoryUuid, setRepositoryUuid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  
  // Toggle between provider and public URL
  const [usePublicUrl, setUsePublicUrl] = useState(false);
  const [publicRepoUrl, setPublicRepoUrl] = useState("");
  const [loadingPublicRepo, setLoadingPublicRepo] = useState(false);

  // Form state
  const [appName, setAppName] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [language, setLanguage] = useState("docker");
  const [buildCommand, setBuildCommand] = useState("");
  const [startCommand, setStartCommand] = useState("");
  const [publishDir, setPublishDir] = useState("");
  const [rootDir, setRootDir] = useState("");
  const [healthCheckPath, setHealthCheckPath] = useState("");
  const [exposedPort, setExposedPort] = useState<number | undefined>(undefined);
  const [autoRedeploy, setAutoRedeploy] = useState(true);
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [secretFiles, setSecretFiles] = useState<SecretFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadRepositoryDetails = useCallback(async () => {
    if (!selectedRepo) return;
    
    try {
      setLoadingDetails(true);
      const [owner, repo] = selectedRepo.fullName.split('/');
      
      if (usePublicUrl) {
        setLoadingDetails(false);
        return;
      }
      
      const detailsData = await GithubService.getRepositoryDetails(owner, repo);
      
      let details: any = null;
      if (detailsData && typeof detailsData === 'object') {
        if (detailsData.data) {
          details = detailsData.data;
        } else {
          details = detailsData;
        }
      }
      
      setRepoDetails(details);
      const repoIdFromApi = details?.id?.toString() || selectedRepo.id.toString();
      setRepositoryUuid(repoIdFromApi);
    } catch (err) {
      console.error("Error loading repository details:", err);
      setError("Không thể tải thông tin chi tiết repository");
    } finally {
      setLoadingDetails(false);
    }
  }, [selectedRepo, usePublicUrl]);

  useEffect(() => {
    if (selectedRepo) {
      loadRepositoryDetails();
    }
  }, [selectedRepo, loadRepositoryDetails]);

  useEffect(() => {
    if (selectedRepo) {
      const name = selectedRepo.fullName.split('/')[1];
      setAppName(name);
      setSelectedBranch(selectedRepo.defaultBranch);
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (repoDetails?.suggestion?.primarySuggestion) {
      const suggestion = repoDetails.suggestion.primarySuggestion;
      setBuildCommand(suggestion.buildCommand);
      setStartCommand(suggestion.startCommand);
    }
  }, [repoDetails]);

  const handleRepositoryClick = (repo: GithubRepo) => {
    setSelectedRepo(repo);
  };

  // Parse GitHub URL to extract owner and repo
  const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
    try {
      // Support multiple GitHub URL formats:
      // https://github.com/owner/repo
      // https://github.com/owner/repo.git
      // github.com/owner/repo
      // owner/repo
      
      let cleanUrl = url.trim();
      
      // Remove .git suffix if present
      cleanUrl = cleanUrl.replace(/\.git$/, '');
      
      // Extract owner/repo from URL
      const githubPattern = /(?:github\.com\/|https?:\/\/github\.com\/|git@github\.com:)([^\/]+)\/([^\/\s]+)/;
      const match = cleanUrl.match(githubPattern);
      
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', ''),
        };
      }
      
      // Try direct owner/repo format
      const parts = cleanUrl.split('/');
      if (parts.length === 2) {
        return {
          owner: parts[0],
          repo: parts[1],
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error parsing GitHub URL:", error);
      return null;
    }
  };

  // Fetch public repository details
  const handleFetchPublicRepo = async (urlOverride?: string) => {
    const url = (urlOverride || publicRepoUrl).trim();
    if (!url) {
      setError("Vui lòng nhập URL của GitHub repository");
      return;
    }

    try {
      setLoadingPublicRepo(true);
      setError(null);
      
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        setError("URL không hợp lệ. Vui lòng nhập URL đúng định dạng: https://github.com/owner/repo hoặc owner/repo");
        return;
      }

      const { owner, repo } = parsed;
      
      // Fetch repository details from public API
      const detailsData = await GithubService.getPublicRepositoryDetails(owner, repo);
      
      let details: any = null;
      if (detailsData && typeof detailsData === 'object') {
        if (detailsData.data) {
          details = detailsData.data;
        } else {
          details = detailsData;
        }
      }
      
      if (!details) {
        throw new Error("Không thể lấy thông tin repository. Vui lòng kiểm tra lại URL.");
      }

      // Create a mock GithubRepo object for compatibility
      const mockRepo: GithubRepo = {
        id: details.id,
        name: details.name,
        fullName: details.nameWithOwner,
        description: details.shortDescriptionHTML || "",
        isPrivate: false,
        htmlUrl: details.url,
        defaultBranch: details.defaultBranch?.name || "main",
        updatedAt: new Date().toISOString(),
        language: details.languages?.[0] || "",
        provider: "GITHUB",
      };

      setSelectedRepo(mockRepo);
      setRepoDetails(details);
      setRepositoryUuid(details.id?.toString());
      
      // Set default app name
      setAppName(repo);
      setSelectedBranch(details.defaultBranch?.name || "main");
      
    } catch (err: any) {
      console.error("Lỗi khi tải thông tin repository:", err);
      const errorMessage = err.message || err.response?.data?.message || "Không thể tải repository. Hãy kiểm tra URL và đảm bảo repository là công khai.";
      setError(errorMessage);
    } finally {
      setLoadingPublicRepo(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRepo || !repoDetails) return;
    
    // Validate required fields
    if (!buildCommand || buildCommand.trim() === '') {
      setError("Build Command is required");
      return;
    }
    if (!startCommand || startCommand.trim() === '') {
      setError("Start Command is required");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);

      const githubRepoId = repoDetails.id;

      // Auto-redeploy is disabled for public URLs as they don't have webhook support
      const isPublicRepo = usePublicUrl;
      
      const request: CreateApplicationRequest = {
        githubRepoId,
        appName,
        selectedBranch,
        language,
        buildCommand,
        startCommand,
        publishDir: publishDir || undefined,
        rootDir: rootDir || undefined,
        healthCheckPath: healthCheckPath || undefined,
        envVars: envVars.filter(ev => ev.key && ev.value),
        secretFiles: secretFiles.filter(sf => sf.filename && sf.content),
        exposedPort,
        autoRedeploy: isPublicRepo ? false : autoRedeploy,
        
        // Add repository details for public URLs
        ...(isPublicRepo && selectedRepo ? {
          repoOwner: selectedRepo.fullName.split('/')[0],
          repoName: selectedRepo.name,
          repoFullName: selectedRepo.fullName,
          repoDescription: selectedRepo.description || "",
          repoHtmlUrl: selectedRepo.htmlUrl,
          repoCloneUrl: `https://github.com/${selectedRepo.fullName}.git`,
          repoSshUrl: `git@github.com:${selectedRepo.fullName}.git`,
          repoDefaultBranch: selectedRepo.defaultBranch
        } : {})
      };

      await ApplicationService.createApplication(request);
      
      router.push('/apps');
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tạo ứng dụng");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/apps');
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setBuildCommand(suggestion.buildCommand);
    setStartCommand(suggestion.startCommand);
  };

  const handleInstallProvider = async (providerId: string) => {
    try {
      setInstalling(true);
      
      if (providerId === "github") {
        const data = await GithubService.getAppInstallUrl();
        
        if (data && data.data && data.data.installUrl) {
          window.open(data.data.installUrl, '_blank');
        } else if (data && data.installUrl) {
          window.open(data.installUrl, '_blank');
        } else {
          const fallbackUrl = "https://github.com/apps/easydeploy-app/installations/new";
          window.open(fallbackUrl, '_blank');
          setError("Sử dụng URL dự phòng để cài đặt GitHub App");
        }
      }
    } catch (err) {
      setError("Không thể tạo install URL");
    } finally {
      setInstalling(false);
    }
  };

  const handleConfigureProvider = async (providerId: string) => {
    try {
      if (providerId === "github") {
        window.open("https://github.com/settings/installations", '_blank');
      }
    } catch (err) {
      setError("Không thể mở configuration");
    }
  };

  const handleDisconnectProvider = async (installationId: number) => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      await GithubService.deleteInstallation(installationId);
      setSuccessMessage("Đã ngắt kết nối thành công");
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Không thể ngắt kết nối");
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Vui lòng đăng nhập để tạo ứng dụng mới.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tạo ứng dụng mới</h1>
          <p className="text-muted-foreground mt-1">
            Chọn repository và cấu hình triển khai
          </p>
        </div>
        {selectedRepo && (
          <Button variant="outline" onClick={() => {
            setSelectedRepo(null);
            setPublicRepoUrl("");
            setError(null);
            setRepoDetails(null);
          }}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Chọn repository khác
          </Button>
        )}
      </div>

      {!selectedRepo ? (
        /* Repository Selection View */
        <div className="space-y-6">
          {/* Toggle between Provider and Public URL */}
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-slate-900 dark:text-slate-100">Chọn phương thức deploy</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Chọn repository từ GitHub provider hoặc nhập URL public repository
                  </CardDescription>
                </div>
                
                {/* Custom Tabs Style */}
                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setUsePublicUrl(false)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${!usePublicUrl 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }
                    `}
                  >
                    <Github className="h-4 w-4" />
                    Provider
                  </button>
                  <button
                    onClick={() => setUsePublicUrl(true)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${usePublicUrl 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }
                    `}
                  >
                    <LinkIcon className="h-4 w-4" />
                    Public URL
                  </button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {usePublicUrl ? (
              /* Chế độ nhập URL Repository công khai */
              <div className="lg:col-span-3">
                <PublicRepoUrlInput
                  onFetchRepo={async (url) => {
                    setPublicRepoUrl(url);
                    await handleFetchPublicRepo(url);
                  }}
                  error={error}
                  loading={loadingPublicRepo}
                />
              </div>
            ) : (
              /* Provider Mode - Repository Selection */
              <>
                {/* Left Column - Repository Selection */}
                <div className="lg:col-span-2">
                  <RepositorySelectionView
                    repositories={repositories}
                    loading={loading}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    displayedRepos={displayedRepos}
                    loadingMore={loadingMore}
                    onScroll={handleScroll}
                    onRepositoryClick={handleRepositoryClick}
                    onRefresh={() => loadData(false)}
                  />
                </div>
              </>
            )}

            {/* Right Column - Credentials (only show in provider mode) */}
            {!usePublicUrl && (
              <div className="lg:col-span-1">
                <CredentialsSection
                  installations={installations}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                  syncing={syncing}
                  onInstallProvider={handleInstallProvider}
                  onDisconnectProvider={handleDisconnectProvider}
                  onConfigureProvider={handleConfigureProvider}
                  onSyncRepositories={handleSyncRepositories}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Configuration View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Repository Info */}
            <Card>
              <CardHeader>
                <CardTitle>Source Code</CardTitle>
                <CardDescription>Thông tin repository đã chọn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedRepo.fullName}</p>
                      <p className="text-sm text-muted-foreground">Branch: {selectedRepo.defaultBranch}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRepo(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                    onChange={(e) => setAppName(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Tên duy nhất cho ứng dụng của bạn
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
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
                  <Select value={language} onValueChange={setLanguage}>
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
                    onChange={(e) => setBuildCommand(e.target.value)}
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
                    onChange={(e) => setStartCommand(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Command để start ứng dụng
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exposedPort">Exposed Port (Optional)</Label>
                  <Input
                    id="exposedPort"
                    type="number"
                    placeholder="3000"
                    value={exposedPort || ''}
                    onChange={(e) => setExposedPort(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Port mà ứng dụng sẽ lắng nghe
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publishDir">Publish Directory (Optional)</Label>
                  <Input
                    id="publishDir"
                    placeholder="./build or ./dist"
                    value={publishDir}
                    onChange={(e) => setPublishDir(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    The relative path of the directory containing built assets
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rootDir">Root Directory - Optional</Label>
                  <Input
                    id="rootDir"
                    placeholder="./frontend or ./api"
                    value={rootDir}
                    onChange={(e) => setRootDir(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    If set, EasyDeploy runs commands from this directory instead of the repository root
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="healthCheckPath">Health Check Path - Optional</Label>
                  <Input
                    id="healthCheckPath"
                    placeholder="/health"
                    value={healthCheckPath}
                    onChange={(e) => setHealthCheckPath(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Provide an HTTP endpoint path that EasyDeploy monitors
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <EnvironmentVariablesSection
              envVars={envVars}
              onEnvVarsChange={setEnvVars}
              onError={setError}
            />

            {/* Secret Files */}
            <SecretFilesSection
              secretFiles={secretFiles}
              onSecretFilesChange={setSecretFiles}
              onError={setError}
            />

            {/* Auto Deploy Toggle - Only show for Provider repos */}
            {!usePublicUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Cài Đặt Deploy</CardTitle>
                  <CardDescription>Cấu hình hành vi deploy tự động</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoRedeploy">Auto-Deploy</Label>
                      <p className="text-sm text-muted-foreground">
                        Tự động deploy khi code hoặc cấu hình thay đổi
                      </p>
                    </div>
                    <button
                      onClick={() => setAutoRedeploy(!autoRedeploy)}
                      className={`
                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                        ${autoRedeploy ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}
                      `}
                      role="switch"
                      aria-checked={autoRedeploy}
                    >
                      <span
                        className={`
                          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                          ${autoRedeploy ? 'translate-x-5' : 'translate-x-0'}
                        `}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warning for Public URL */}
            {usePublicUrl && (
              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        ⚠️ Hạn chế với Public Repository
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Auto-deploy không được hỗ trợ cho public repositories. Bạn cần deploy thủ công khi có thay đổi.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Suggestions */}
          <div className="lg:col-span-1">
            {loadingDetails ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ) : repoDetails?.suggestion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Suggestions
                  </CardTitle>
                  <CardDescription>
                    Gợi ý cấu hình dựa trên repository
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {repoDetails.languages && repoDetails.languages.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Detected Languages:</p>
                      <div className="flex flex-wrap gap-2">
                        {repoDetails.languages.map((lang, idx) => (
                          <Badge key={idx} variant="secondary">{lang}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {repoDetails.suggestion.primarySuggestion && (
                    <div className="p-4 border rounded-lg bg-primary/5">
                      <p className="text-sm font-medium mb-2">Primary Suggestion</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectSuggestion(repoDetails.suggestion.primarySuggestion)}
                        className="w-full"
                      >
                        Use {repoDetails.suggestion.primarySuggestion.framework}
                      </Button>
                    </div>
                  )}

                  {repoDetails.suggestion.environmentSuggestions && repoDetails.suggestion.environmentSuggestions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Environment Options:</p>
                      <div className="space-y-2">
                        {repoDetails.suggestion.environmentSuggestions.map((sug: any, idx: number) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectSuggestion(sug)}
                            className="w-full justify-start"
                          >
                            {sug.framework}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedRepo && (
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedRepo(null)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !appName || !selectedBranch}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Deploy App
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

