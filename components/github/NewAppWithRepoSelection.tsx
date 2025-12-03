"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";
import { GithubService } from "@/services/github.service";
import { ApplicationService } from "@/services/application.service";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateApplicationRequest, EnvironmentVariable, RepositoryDetailResponse } from "@/types/application.type";
import { RepositorySelectionView } from "./RepositorySelectionView";
import { CredentialsSection } from "./CredentialsSection";
import { EnvironmentVariablesSection } from "./EnvironmentVariablesSection";

import { DatabaseConfigSection } from "./DatabaseConfigSection";
import PublicRepoUrlInput from "./PublicRepoUrlInput";
import { useRepositoryManagement } from "@/hooks/useRepositoryManagement";
import { mapLanguageToFormValue, mapFrameworkToLanguage } from "@/utils/language.utils";
import { parseGitHubUrl } from "@/utils/github.utils";
import DeployMethodSelector from "./DeployMethodSelector";
import RepositoryInfoCard from "./RepositoryInfoCard";
import AppConfigurationForm from "./AppConfigurationForm";
import SuggestionsPanel from "./SuggestionsPanel";
import AutoDeploySettings from "./AutoDeploySettings";

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
  const searchParams = useSearchParams();
  
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

  
  // Database configuration state
  const [databaseSource, setDatabaseSource] = useState<'none' | 'managed' | 'external' | 'existing'>('none');
  const [dbType, setDbType] = useState<'postgres' | 'mysql' | 'mongodb' | 'redis' | 'other'>('postgres');
  const [dbName, setDbName] = useState('');
  const [dbUsername, setDbUsername] = useState('');
  const [dbPassword, setDbPassword] = useState('');
  const [externalHost, setExternalHost] = useState('');
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | undefined>(undefined);
  
  const [submitting, setSubmitting] = useState(false);

  // Track previous installations count to detect changes
  const [prevInstallationsCount, setPrevInstallationsCount] = useState<number>(0);
  
  useEffect(() => {
    const setupAction = searchParams.get('setup_action');
    const installationId = searchParams.get('installation_id');
    const success = searchParams.get('success');
    
    if (setupAction === 'install' || installationId || success === 'true') {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      const timer = setTimeout(() => {
        loadData(false);
        setSuccessMessage('GitHub installation completed! Repositories are being refreshed...');
        setTimeout(() => setSuccessMessage(null), 5000);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, loadData]);
  
  // Detect installation changes by comparing installations count
  useEffect(() => {
    if (installations.length > prevInstallationsCount && prevInstallationsCount > 0) {
      loadData(false);
      setSuccessMessage('New GitHub installation detected! Repositories are being refreshed...');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
    setPrevInstallationsCount(installations.length);
  }, [installations.length, prevInstallationsCount, loadData]);
  
  // Auto-refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      if (window.location.pathname === '/apps/new') {
        setTimeout(() => {
          loadData(false);
        }, 500);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

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
      setLanguage("docker");
      setBuildCommand("");
      setStartCommand("");
      setPublishDir("");
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (repoDetails) {
      if (repoDetails.languages && repoDetails.languages.length > 0) {
        const primaryLanguage = repoDetails.languages[0];
        const mappedLanguage = mapLanguageToFormValue(primaryLanguage);
        if (language === "docker") {
          setLanguage(mappedLanguage);
        }
      }

      // Apply suggestions if available
      if (repoDetails.suggestion?.primarySuggestion) {
        const suggestion = repoDetails.suggestion.primarySuggestion;
        setBuildCommand(suggestion.buildCommand || "");
        setStartCommand(suggestion.startCommand || "");
        if (suggestion.publishPath && !publishDir) {
          setPublishDir(suggestion.publishPath);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoDetails]);

  const handleRepositoryClick = (repo: GithubRepo) => {
    setSelectedRepo(repo);
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

      // Auto-redeploy is disabled for public URLs
      const isPublicRepo = usePublicUrl;
      
      const normalizedRootDir = rootDir 
        ? rootDir.replace(/^\.\//, '').replace(/^\/+|\/+$/g, '')
        : undefined;
      const normalizedPublishDir = publishDir 
        ? publishDir.replace(/^\.\//, '').replace(/^\/+|\/+$/g, '')
        : undefined;
      
      // Build database configuration
      let databaseConfig;
      if (databaseSource === 'none') {
        databaseConfig = undefined; // No database needed
      } else if (databaseSource === 'existing') {
        if (!selectedDatabaseId) {
          throw new Error('Please select a database');
        }
        databaseConfig = {
          type: dbType,
          databaseId: selectedDatabaseId,
          isExternalDatabase: false
        };
      } else if (databaseSource === 'managed') {
        // Only include fields that have values - don't send empty strings as they become null
        databaseConfig = {
          type: dbType,
          ...(dbName && dbName.trim() !== '' && { databaseName: dbName.trim() }),
          ...(dbUsername && dbUsername.trim() !== '' && { username: dbUsername.trim() }),
          ...(dbPassword && dbPassword.trim() !== '' && { password: dbPassword.trim() }),
          isExternalDatabase: false
        };
      } else if (databaseSource === 'external') {
        // External database - type is not needed, set to 'other' as placeholder
        databaseConfig = {
          type: 'other' as const,
          isExternalDatabase: true
        };
      }
      
      const request: CreateApplicationRequest = {
        githubRepoId,
        appName,
        selectedBranch,
        language,
        buildCommand,
        startCommand,
        publishDir: normalizedPublishDir || undefined,
        rootDir: normalizedRootDir || undefined,
        healthCheckPath: healthCheckPath || undefined,
        envVars: envVars.filter(ev => ev.key && ev.value),
        databaseConfig,
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

      // Debug logging
      console.log('=== CREATE APPLICATION REQUEST ===');
      console.log('Database Source:', databaseSource);
      console.log('Database Config:', JSON.stringify(databaseConfig, null, 2));
      console.log('Full Request:', JSON.stringify(request, null, 2));

      await ApplicationService.createApplication(request);
      
      router.push('/apps');
    } catch (err: any) {
      console.error('=== CREATE APPLICATION ERROR ===');
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      console.error('Response status:', err.response?.status);
      console.error('Response headers:', err.response?.headers);
      console.error('Response data:', err.response?.data);
      console.error('Error config:', err.config);
      
      // Extract detailed validation errors if available
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.details || 
                          err.response?.data || 
                          err.message || 
                          "Không thể tạo ứng dụng";
      
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/apps');
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setBuildCommand(suggestion.buildCommand || "");
    setStartCommand(suggestion.startCommand || "");
    if (suggestion.publishPath) {
      setPublishDir(suggestion.publishPath);
    }
    if (suggestion.framework) {
      const mappedLanguage = mapFrameworkToLanguage(suggestion.framework);
      setLanguage(mappedLanguage);
    }
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
      setSuccessMessage("Đã ngắt kết nối thành công. Đang làm mới danh sách repositories...");
      
      setTimeout(() => {
        loadData(false);
        setSuccessMessage("Đã ngắt kết nối thành công");
        setTimeout(() => setSuccessMessage(null), 3000);
      }, 500);
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
          <DeployMethodSelector
            usePublicUrl={usePublicUrl}
            onToggle={setUsePublicUrl}
          />

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
            <RepositoryInfoCard
              repo={selectedRepo}
              onDeselect={() => setSelectedRepo(null)}
            />

            {/* App Configuration & Build & Deploy Configuration */}
            <AppConfigurationForm
              appName={appName}
              onAppNameChange={setAppName}
              selectedBranch={selectedBranch}
              onBranchChange={setSelectedBranch}
              language={language}
              onLanguageChange={setLanguage}
              buildCommand={buildCommand}
              onBuildCommandChange={setBuildCommand}
              startCommand={startCommand}
              onStartCommandChange={setStartCommand}
              publishDir={publishDir}
              onPublishDirChange={setPublishDir}
              rootDir={rootDir}
              onRootDirChange={setRootDir}
              healthCheckPath={healthCheckPath}
              onHealthCheckPathChange={setHealthCheckPath}
              repoDetails={repoDetails}
            />

            {/* Environment Variables */}
            <EnvironmentVariablesSection
              envVars={envVars}
              onEnvVarsChange={setEnvVars}
              onError={setError}
              showExternalDbWarning={databaseSource === 'external'}
            />

            {/* Database Configuration */}
            <DatabaseConfigSection
              databaseSource={databaseSource}
              envVars={envVars}
              onEnvVarsChange={setEnvVars}
              onDatabaseSourceChange={setDatabaseSource}
              dbType={dbType}
              onDbTypeChange={setDbType}
              dbName={dbName}
              onDbNameChange={setDbName}
              dbUsername={dbUsername}
              onDbUsernameChange={setDbUsername}
              dbPassword={dbPassword}
              onDbPasswordChange={setDbPassword}
              externalHost={externalHost}
              onExternalHostChange={setExternalHost}
              selectedDatabaseId={selectedDatabaseId}
              onSelectedDatabaseIdChange={setSelectedDatabaseId}
            />

            {/* Auto Deploy Settings */}
            <AutoDeploySettings
              autoRedeploy={autoRedeploy}
              onAutoRedeployChange={setAutoRedeploy}
              usePublicUrl={usePublicUrl}
            />
          </div>

          {/* Right Column - Suggestions */}
          <div className="lg:col-span-1">
            <SuggestionsPanel
              repoDetails={repoDetails}
              loading={loadingDetails}
              onSelectSuggestion={handleSelectSuggestion}
            />
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

