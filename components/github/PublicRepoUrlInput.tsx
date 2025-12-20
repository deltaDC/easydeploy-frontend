"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LinkIcon, Info, Search } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface PublicRepoUrlInputProps {
  onFetchRepo: (url: string) => Promise<void>;
  error: string | null;
  loading: boolean;
  autoFocus?: boolean;
}

export default function PublicRepoUrlInput({ onFetchRepo, error, loading, autoFocus = false }: PublicRepoUrlInputProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount if autoFocus prop is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleFetch = async () => {
    if (!repoUrl.trim()) return;
    await onFetchRepo(repoUrl);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-inner-glow-soft overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-charcoal">URL Công khai</h3>
          </div>
          <p className="text-sm text-charcoal/70 mb-6">
            Nhập URL của một GitHub repository công khai để bắt đầu deploy
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url" className="text-sm font-medium text-charcoal">
                URL GitHub Repository
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40 z-10" strokeWidth={1.5} />
                <Input
                  ref={inputRef}
                  id="repo-url"
                  placeholder="https://github.com/owner/repo hoặc owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && repoUrl.trim()) {
                      handleFetch();
                    }
                  }}
                  className="pl-11 pr-4 h-12 rounded-full border-0 bg-white/60 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/30 focus:bg-white/80 transition-all"
                />
                {/* Focus ring effect */}
                {isFocused && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-misty-sage/30 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  />
                )}
              </div>
              <p className="text-xs text-charcoal/60">
                Ví dụ: https://github.com/owner/repo hoặc owner/repo
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleFetch}
                disabled={loading || !repoUrl.trim()}
                className="w-full h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-emerald-400 disabled:to-emerald-500 disabled:opacity-50 text-white rounded-full font-semibold shadow-[0_0_30px_rgba(5,150,105,0.5)] relative overflow-hidden group border-2 border-emerald-500/30"
              >
                {/* Ripple effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{
                    scale: [1, 1.5, 2],
                    opacity: [0.5, 0.3, 0],
                  }}
                  transition={{ duration: 0.6 }}
                />
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin relative z-10" strokeWidth={1.5} />
                    <span className="relative z-10">Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2 relative z-10" strokeWidth={1.5} />
                    <span className="relative z-10">Kiểm tra mã nguồn</span>
                  </>
                )}
              </Button>
            </motion.div>

            {error && (
              <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-700 rounded-2xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Compact Info Row with Tooltips */}
      <div className="flex items-center gap-3 px-2">
        <Tooltip
          content="Bạn có thể deploy bất kỳ repository công khai nào trên GitHub bằng cách nhập URL. Không cần phải cài đặt GitHub App hoặc cấp quyền truy cập."
        >
          <button className="flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-charcoal transition-colors">
            <Info className="h-4 w-4 text-soft-blue" strokeWidth={1.5} />
            <span>Không cần kết nối GitHub</span>
          </button>
        </Tooltip>

        <span className="text-charcoal/30">•</span>

        <Tooltip
          content="Public repositories không hỗ trợ auto-deploy tự động. Bạn sẽ cần deploy thủ công mỗi khi có thay đổi code."
        >
          <button className="flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-charcoal transition-colors">
            <Info className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
            <span>Không hỗ trợ auto-deploy</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
