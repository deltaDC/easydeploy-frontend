"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  Cloud,
  Info,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";

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
        return <Github className="h-4 w-4" strokeWidth={1.5} />;
      default:
        return <Github className="h-4 w-4" strokeWidth={1.5} />;
    }
  };

  const getAccountIcon = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case "organization":
        return <Building className="h-3 w-3" strokeWidth={1.5} />;
      case "user":
        return <Users className="h-3 w-3" strokeWidth={1.5} />;
      default:
        return <Users className="h-3 w-3" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-inner-glow-soft overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-charcoal">Quản lý kết nối</h3>
          {installations.length > 0 && (
            <Badge variant="secondary" className="text-xs bg-emerald-200/20 text-emerald-700 border-0">
              {installations.length} đã kết nối
            </Badge>
          )}
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-misty">
          {error && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-700">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-emerald-200 bg-emerald-50/80 backdrop-blur-sm">
              <CheckCircle className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
              <AlertDescription className="text-emerald-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {installations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 px-4"
            >
              {/* Misty Illustration */}
              <div className="relative mb-6">
                <div className="mx-auto w-32 h-32 relative">
                  {/* Misty circles */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-misty-sage/20 blur-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-soft-blue/20 blur-xl"
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      delay: 1,
                    }}
                  />
                  {/* Cloud icon */}
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <Cloud className="h-16 w-16 text-misty-sage/60" strokeWidth={1} />
                  </div>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-charcoal mb-2">
                Khám phá tiềm năng mã nguồn của bạn
              </h4>
              <p className="text-sm text-charcoal/70 mb-6 max-w-sm mx-auto">
                Kết nối tài khoản GitHub để bắt đầu hành trình triển khai ứng dụng của bạn
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onInstallProvider("github")}
                  size="lg"
                  className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-full px-8 shadow-[0_0_30px_rgba(5,150,105,0.5)] relative overflow-hidden group border-2 border-emerald-500/30"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Github className="h-5 w-5 mr-2 relative z-10" strokeWidth={1.5} />
                  <span className="relative z-10 font-semibold">Kết nối GitHub</span>
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-charcoal flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                Tài khoản & Tổ chức đã ủy quyền
              </h4>
              
              <div className="space-y-3">
                {installations.map((installation) => (
                  <motion.div
                    key={installation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30 hover:bg-white/60 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar with Halo */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-10 w-10 ring-2 ring-emerald-400/30 ring-offset-2 ring-offset-white/60">
                            <AvatarFallback className="bg-misty-sage/20 text-charcoal font-semibold">
                              {installation.account.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {/* Halo glow */}
                          <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md -z-10" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <div className="text-charcoal flex-shrink-0">
                              {getProviderIcon(installation.provider)}
                            </div>
                            <p className="font-medium text-sm text-charcoal break-words">
                              {installation.account}
                            </p>
                            <div className="text-charcoal/40 flex-shrink-0">
                              {getAccountIcon(installation.accountType)}
                            </div>
                          </div>
                          <p className="text-xs text-charcoal/60">
                            {installation.accountType} • {installation.repositorySelection}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700">
                          <CheckCircle className="h-3 w-3 mr-1" strokeWidth={1.5} />
                          Hoạt động
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSyncRepositories(true)}
                          disabled={syncing || loading}
                          className="h-8 w-8 p-0 text-misty-sage hover:text-emerald-600 hover:bg-emerald-50"
                          title="Đồng bộ repositories"
                        >
                          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDisconnectProvider(installation.id)}
                          disabled={loading}
                          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Ngắt kết nối"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfigureProvider("github")}
                  className="w-full bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60"
                >
                  <Settings className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Quản lý
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInstallProvider("github")}
                  className="w-full bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60"
                >
                  <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
                  Thêm
                </Button>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSyncRepositories(true)}
                disabled={syncing || loading}
                className="w-full bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                {syncing ? "Đang đồng bộ..." : "Đồng bộ Repositories"}
              </Button>
            </div>
          )}

          {/* Compact Help with Tooltip */}
          <div className="flex items-center justify-center">
            <Tooltip
              content="Kết nối tài khoản GitHub của bạn để truy cập repositories và kích hoạt triển khai tự động."
            >
              <button className="flex items-center gap-1.5 text-xs text-charcoal/50 hover:text-charcoal/70 transition-colors">
                <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Cần trợ giúp?</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
