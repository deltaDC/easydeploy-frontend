"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Github,
  CheckCircle,
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  Users,
  Building,
} from "lucide-react";

interface ProviderInstallation {
  id: number;
  account: string;
  accountType: string;
  repositorySelection: string;
  provider: string;
}

interface CredentialsSectionProps {
  installations: ProviderInstallation[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  syncing: boolean;
  onInstallProvider: (providerId: string) => void;
  onDisconnectProvider: (installationId: number) => void;
  onConfigureProvider: (providerId: string) => void;
  onSyncRepositories: (showMessage: boolean) => void;
}

export function CredentialsSection({
  installations,
  loading,
  error,
  successMessage,
  syncing,
  onInstallProvider,
  onDisconnectProvider,
  onConfigureProvider,
  onSyncRepositories,
}: CredentialsSectionProps) {
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "github":
        return <Github className="h-4 w-4" />;
      default:
        return <Github className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "github":
        return "text-gray-900";
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

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Credentials</CardTitle>
          {installations.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {installations.length} connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Quản lý kết nối Git provider của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
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
                {installations.filter(inst => inst.provider === "github").length} đã kết nối
              </p>
            </div>

            {/* Connected Installations */}
            {installations.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-gray-400 mb-3">
                  <Github className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Chưa có tài khoản GitHub nào được kết nối
                </p>
                <Button
                  onClick={() => onInstallProvider("github")}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Kết nối GitHub
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Tài khoản & Tổ chức đã ủy quyền
                </h4>
                
                <div className="space-y-2">
                  {installations.map((installation) => (
                    <div
                      key={installation.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
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
                          Hoạt động
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDisconnectProvider(installation.id)}
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
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConfigureProvider("github")}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Quản lý
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInstallProvider("github")}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSyncRepositories(true)}
                  disabled={syncing || loading}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? "Đang đồng bộ..." : "Đồng bộ Repositories"}
                </Button>
              </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <p className="font-medium mb-1">Cần trợ giúp?</p>
              <p>Kết nối tài khoản GitHub của bạn để truy cập repositories và kích hoạt triển khai tự động.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

