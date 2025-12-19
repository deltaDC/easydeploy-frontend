"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2,
  ChevronLeft,
  CheckCircle,
  Rocket,
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
import { ConnectedAppSection } from "./ConnectedAppSection";
import PublicRepoUrlInput from "./PublicRepoUrlInput";
import { useRepositoryManagement } from "@/hooks/useRepositoryManagement";
import { mapLanguageToFormValue, mapFrameworkToLanguage } from "@/utils/language.utils";
import { parseGitHubUrl } from "@/utils/github.utils";
import DeployMethodSelector from "./DeployMethodSelector";
import RepositoryInfoCard from "./RepositoryInfoCard";
import AppConfigurationForm from "./AppConfigurationForm";
import AutoDeploySettings from "./AutoDeploySettings";
import { DeploymentStepIndicator } from "@/components/apps/DeploymentStepIndicator";
import { DeploymentBackgroundOrbs } from "@/components/apps/DeploymentBackgroundOrbs";
import { CollapsibleSection } from "@/components/apps/CollapsibleSection";
import { Settings, Key, Database, Link2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  
  // Step management
  const [currentStep, setCurrentStep] = useState<'select' | 'configure'>('select');
  
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
  const [appConnectionMode, setAppConnectionMode] = useState<'none' | 'existing'>('none');
  const [connectedAppId, setConnectedAppId] = useState<string | undefined>(undefined);
  
  const [submitting, setSubmitting] = useState(false);

  // Track previous installations count to detect changes
  const [prevInstallationsCount, setPrevInstallationsCount] = useState<number>(0);
  const [hasProcessedCallback, setHasProcessedCallback] = useState<string | null>(null);
  
  useEffect(() => {
    const setupAction = searchParams.get('setup_action');
    const installationId = searchParams.get('installation_id');
    const success = searchParams.get('success');
    
    const callbackKey = `${setupAction || ''}_${installationId || ''}_${success || ''}`;
    
    if ((setupAction === 'install' || installationId || success === 'true') && hasProcessedCallback !== callbackKey) {
      console.log('Component: Detected GitHub callback, processing immediately...', { setupAction, installationId, success });
      setHasProcessedCallback(callbackKey);
      
      if (typeof window !== 'undefined' && user?.id) {
        const cacheKey = `repos_${user.id}`;
        sessionStorage.removeItem(cacheKey);
      }
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      setSuccessMessage('Đang tải danh sách repositories...');
      
      const loadDataWithRetry = async (retryCount = 0) => {
        try {
          if (retryCount === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          console.log(`Component: Loading data (attempt ${retryCount + 1})...`);
          await loadData(false);
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log('Component: Data load completed');
          setSuccessMessage('GitHub installation completed! Repositories loaded successfully.');
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error: any) {
          console.error(`Component: Error loading data (attempt ${retryCount + 1}):`, error);
          
          if (retryCount < 3) {
            const delay = (retryCount + 1) * 200;
            setTimeout(() => loadDataWithRetry(retryCount + 1), delay);
          } else {
            console.log('Component: Max retries reached, syncing repositories...');
            try {
              await GithubService.syncRepositories();
              await loadData(false);
              setSuccessMessage('GitHub installation completed! Repositories loaded.');
              setTimeout(() => setSuccessMessage(null), 3000);
            } catch (syncError) {
              console.error('Component: Sync error:', syncError);
              setSuccessMessage('GitHub installation completed! Please refresh if repositories are not shown.');
              setTimeout(() => setSuccessMessage(null), 5000);
            }
          }
        }
      };
      
      loadDataWithRetry();
    }
  }, [searchParams, loadData, user?.id, hasProcessedCallback]);
  
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
    let focusTimeout: NodeJS.Timeout;
    
    const handleFocus = () => {
      if (window.location.pathname === '/apps/new') {
        if (typeof window !== 'undefined' && user?.id) {
          const cacheKey = `repos_${user.id}`;
          sessionStorage.removeItem(cacheKey);
        }
        if (focusTimeout) clearTimeout(focusTimeout);
        focusTimeout = setTimeout(() => {
          console.log('Window focus: Reloading data...');
          loadData(false);
        }, 500);
      }
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden && window.location.pathname === '/apps/new') {
        if (typeof window !== 'undefined' && user?.id) {
          const cacheKey = `repos_${user.id}`;
          sessionStorage.removeItem(cacheKey);
        }
        if (focusTimeout) clearTimeout(focusTimeout);
        focusTimeout = setTimeout(() => {
          console.log('Tab visible: Reloading data...');
          loadData(false);
        }, 500);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (focusTimeout) clearTimeout(focusTimeout);
    };
  }, [loadData, user?.id]);

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
    console.log('Repository clicked:', repo);
    setSelectedRepo(repo);
    setCurrentStep('configure');
    console.log('Step changed to configure, selectedRepo:', repo);
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
      
      // Move to configure step
      setCurrentStep('configure');
      
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

  const handleBackToSelect = () => {
    setSelectedRepo(null);
    setPublicRepoUrl("");
    setError(null);
    setRepoDetails(null);
    setCurrentStep('select');
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
    <div className="relative min-h-screen bg-misty-grey/20 noise-texture">
      <DeploymentBackgroundOrbs />
      
      <div className="max-w-7xl mx-auto space-y-6 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-4xl font-bold text-charcoal mb-2">Tạo ứng dụng mới</h1>
            <p className="text-charcoal/70">
              Chọn repository và cấu hình triển khai
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <DeploymentStepIndicator currentStep={currentStep} />
        </div>

      {/* Step 1: Select Repository */}
      {currentStep === 'select' && (
        <div className="space-y-6">
          {/* Toggle between Provider and Public URL */}
          <DeployMethodSelector
            usePublicUrl={usePublicUrl}
            onToggle={setUsePublicUrl}
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {usePublicUrl ? (
              /* Chế độ nhập URL Repository công khai */
              <div className="lg:col-span-5">
                <PublicRepoUrlInput
                  onFetchRepo={async (url) => {
                    setPublicRepoUrl(url);
                    await handleFetchPublicRepo(url);
                  }}
                  error={error}
                  loading={loadingPublicRepo}
                  autoFocus={true}
                />
              </div>
            ) : (
              /* Provider Mode - Repository Selection */
              <>
                {/* Left Column - Repository Selection */}
                <div className="lg:col-span-3">
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
              <div className="lg:col-span-2">
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
      )}

      {/* Step 2: Configure & Deploy */}
      {currentStep === 'configure' && (
        <div className="space-y-6 w-full">

            {/* Configuration Form - Full Width */}
            {selectedRepo ? (
              <div className="space-y-6 w-full relative z-30">
                {/* Repository Info */}
                <RepositoryInfoCard
                  repo={{
                    fullName: selectedRepo.fullName,
                    defaultBranch: selectedRepo.defaultBranch,
                    language: selectedRepo.language,
                  }}
                  onDeselect={handleBackToSelect}
                />

                {/* Build Configuration Section */}
                <CollapsibleSection
                  title="Cấu hình Build & Runtime"
                  description="Thiết lập tên ứng dụng, nhánh và lệnh build/start"
                  icon={Settings}
                  iconColor="text-misty-sage"
                  iconBgColor="bg-misty-sage/10"
                  defaultOpen={true}
                >
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
                </CollapsibleSection>

                {/* Environment Variables Section */}
                <CollapsibleSection
                  title="Biến môi trường"
                  description="Thêm biến môi trường cho ứng dụng"
                  icon={Key}
                  iconColor="text-amber-600"
                  iconBgColor="bg-amber-100/50"
                  defaultOpen={true}
                  badge={envVars.length > 0 ? (
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-0">
                      {envVars.filter(ev => ev.key).length} biến
                    </Badge>
                  ) : undefined}
                >
                  <EnvironmentVariablesSection
                    envVars={envVars}
                    onEnvVarsChange={setEnvVars}
                    onError={setError}
                    showExternalDbWarning={databaseSource === 'external'}
                    embedded={true}
                  />
                </CollapsibleSection>

                {/* Database Configuration Section */}
                <CollapsibleSection
                  title="Cơ sở dữ liệu"
                  description="Cấu hình kết nối database"
                  icon={Database}
                  iconColor="text-soft-blue"
                  iconBgColor="bg-soft-blue/10"
                  defaultOpen={false}
                  badge={databaseSource !== 'none' ? (
                    <Badge variant="secondary" className="text-xs bg-soft-blue/20 text-soft-blue border-0">
                      {databaseSource === 'managed' ? 'Mới' : databaseSource === 'existing' ? 'Đã có' : 'Ngoài'}
                    </Badge>
                  ) : undefined}
                >
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
                    embedded={true}
                  />
                </CollapsibleSection>

                {/* Connected Apps Section */}
                <CollapsibleSection
                  title="Liên kết ứng dụng"
                  description="Kết nối với ứng dụng đã có sẵn"
                  icon={Link2}
                  iconColor="text-violet-500"
                  iconBgColor="bg-violet-100/50"
                  defaultOpen={false}
                  badge={appConnectionMode !== 'none' ? (
                    <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700 border-0">
                      Đã kết nối
                    </Badge>
                  ) : undefined}
                >
                  <ConnectedAppSection
                    connectionMode={appConnectionMode}
                    onConnectionModeChange={setAppConnectionMode}
                    selectedAppId={connectedAppId}
                    onSelectedAppIdChange={setConnectedAppId}
                    envVars={envVars}
                    onEnvVarsChange={setEnvVars}
                    embedded={true}
                  />
                </CollapsibleSection>

                {/* Auto Deploy Settings Section */}
                <CollapsibleSection
                  title="Tự động triển khai"
                  description="Cấu hình auto-deploy khi có thay đổi"
                  icon={Zap}
                  iconColor="text-emerald-600"
                  iconBgColor="bg-emerald-100/50"
                  defaultOpen={true}
                  badge={autoRedeploy && !usePublicUrl ? (
                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-0">
                      Bật
                    </Badge>
                  ) : undefined}
                >
                  <AutoDeploySettings
                    autoRedeploy={autoRedeploy}
                    onAutoRedeployChange={setAutoRedeploy}
                    usePublicUrl={usePublicUrl}
                    embedded={true}
                  />
                </CollapsibleSection>
              </div>
            ) : (
              <div className="text-center py-12 text-charcoal/60">
                <p className="text-lg font-medium mb-2">Đang tải thông tin repository...</p>
                <p className="text-sm">Vui lòng đợi trong giây lát</p>
              </div>
            )}
        </div>
      )}

      {/* Action Buttons */}
      {currentStep === 'configure' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-6 border-t border-white/20"
        >
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-white/40 backdrop-blur-sm border-2 border-charcoal/20 hover:bg-white/60 hover:border-charcoal/30"
          >
            Hủy
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleBackToSelect}
              className="bg-white/40 backdrop-blur-sm border-2 border-charcoal/20 hover:bg-white/60 hover:border-charcoal/30"
            >
              <ChevronLeft className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Quay lại
            </Button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Button
                onClick={handleSubmit}
                disabled={submitting || !appName || !selectedBranch}
                className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-full px-8 h-10 text-base font-semibold shadow-[0_0_30px_rgba(5,150,105,0.5)] relative overflow-hidden group border-2 border-emerald-500/30"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin relative z-10" strokeWidth={1.5} />
                    <span className="relative z-10">Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 mr-2 relative z-10" strokeWidth={1.5} />
                    <span className="relative z-10">Triển khai ứng dụng</span>
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
}

