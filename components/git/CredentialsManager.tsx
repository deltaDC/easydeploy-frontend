"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Github, 
  GitBranch, 
  ExternalLink,
  Settings,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Users,
  Building
} from "lucide-react";
import { GithubService } from "@/services/github.service";
import { useAuth } from "@/hooks/useAuth";

interface ProviderInstallation {
  id: number;
  account: string;
  accountType: string;
  repositorySelection: string;
  provider: string;
}

interface CredentialsManagerProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

export default function CredentialsManager({ selectedProvider, onProviderChange }: CredentialsManagerProps) {
  const { user } = useAuth();
  const [installations, setInstallations] = useState<ProviderInstallation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (user) {
      loadInstallations();
    }
  }, [user]);

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

  const connectedInstallations = installations.filter(inst => inst.provider === selectedProvider);
  const totalInstallations = installations.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Credentials
            </CardTitle>
            <CardDescription>
              Manage your Git provider connections
            </CardDescription>
          </div>
          <Button
            onClick={loadInstallations}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <Settings className="h-4 w-4 mr-2" />
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

        {/* Provider Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Github className="h-4 w-4 text-gray-900" />
              <span className="text-sm font-medium">GitHub</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {installations.filter(inst => inst.provider === "github").length} connected
            </p>
          </div>
          <div className="p-3 border rounded-lg opacity-50">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">GitLab</span>
            </div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </div>

        {/* Current Provider Status */}
        {connectedInstallations.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <div className={`text-gray-400 mb-3 ${getProviderColor(selectedProvider)}`}>
              {getProviderIcon(selectedProvider)}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              No {selectedProvider} accounts connected
            </p>
            <Button
              onClick={() => handleInstallProvider(selectedProvider)}
              disabled={installing}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {installing ? "Connecting..." : `Connect ${selectedProvider}`}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Provider Header */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={getProviderColor(selectedProvider)}>
                  {getProviderIcon(selectedProvider)}
                </div>
                <span className="font-medium capitalize">{selectedProvider}</span>
                <Badge variant="secondary" className="text-xs">
                  {connectedInstallations.length} connected
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfigureProvider(selectedProvider)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>

            {/* Authorized Accounts */}
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Authorized Accounts & Organizations
              </h4>
              
              <div className="space-y-2">
                {connectedInstallations.map((installation) => (
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
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfigureProvider(selectedProvider)}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Permissions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInstallProvider(selectedProvider)}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Need help?</p>
          <p>Connect your Git provider to access repositories and enable automated deployments.</p>
        </div>
      </CardContent>
    </Card>
  );
}
