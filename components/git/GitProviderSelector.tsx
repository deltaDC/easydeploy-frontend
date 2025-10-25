"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Github, 
  GitBranch, 
  ChevronDown, 
  Check, 
  ExternalLink,
  Settings,
  Trash2,
  Plus
} from "lucide-react";
import { GithubService } from "@/services/github.service";
import { useAuth } from "@/hooks/useAuth";

interface GitProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface ProviderInstallation {
  id: number;
  account: string;
  accountType: string;
  repositorySelection: string;
  provider: string;
}

const GIT_PROVIDERS: GitProvider[] = [
  {
    id: "github",
    name: "GitHub",
    icon: <Github className="h-4 w-4" />,
    color: "text-gray-900",
    description: "Connect your GitHub repositories"
  },
  {
    id: "gitlab",
    name: "GitLab",
    icon: <GitBranch className="h-4 w-4" />,
    color: "text-orange-600",
    description: "Connect your GitLab repositories"
  }
];

export default function GitProviderSelector() {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string>("github");
  const [installations, setInstallations] = useState<ProviderInstallation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  const loadInstallations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const installationsData = await GithubService.getUserInstallations();
      const githubInstallations = installationsData.map((inst: any) => ({
        ...inst,
        provider: "github"
      }));
      
      setInstallations(githubInstallations);
    } catch (err) {
      setError("Không thể tải danh sách installations");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      await GithubService.deleteInstallation(installationId);
      setInstallations(prev => prev.filter(inst => inst.id !== installationId));
      setError(null);
    } catch (err) {
      setError("Không thể ngắt kết nối");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedProviderInfo = GIT_PROVIDERS.find(p => p.id === selectedProvider);
  const connectedInstallations = installations.filter(inst => inst.provider === selectedProvider);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Git Provider</span>
          <Button
            onClick={loadInstallations}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <Settings className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Select and manage your Git provider connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Provider Selection Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center gap-2">
              {selectedProviderInfo?.icon}
              <span>{selectedProviderInfo?.name}</span>
              {connectedInstallations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {connectedInstallations.length} connected
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 animate-slide-up">
              {GIT_PROVIDERS.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={provider.color}>
                      {provider.icon}
                    </div>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                  {selectedProvider === provider.id && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Provider Status */}
        {connectedInstallations.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-gray-400 mb-2">
              {selectedProviderInfo?.icon}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              No {selectedProviderInfo?.name} accounts connected
            </p>
            <Button
              onClick={() => handleInstallProvider(selectedProvider)}
              disabled={installing}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {installing ? "Connecting..." : `Connect ${selectedProviderInfo?.name}`}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Authorized Accounts & Organizations</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfigureProvider(selectedProvider)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Configure in {selectedProviderInfo?.name}
              </Button>
            </div>
            
            {connectedInstallations.map((installation) => (
              <div
                key={installation.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={selectedProviderInfo?.color}>
                    {selectedProviderInfo?.icon}
                  </div>
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
                  onClick={() => handleDisconnectProvider(installation.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
