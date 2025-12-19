"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github, X } from "lucide-react";

interface GithubRepo {
  fullName: string;
  defaultBranch: string;
  language?: string;
}

interface RepositoryInfoCardProps {
  repo: GithubRepo;
  onDeselect: () => void;
}

export default function RepositoryInfoCard({ repo, onDeselect }: RepositoryInfoCardProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      className="bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-inner-glow-soft overflow-hidden relative z-30"
      style={{ opacity: 1, willChange: 'opacity' }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-charcoal">Mã nguồn</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDeselect}
            className="h-8 w-8 text-charcoal/60 hover:text-charcoal hover:bg-white/40"
            aria-label="Bỏ chọn repository"
            title="Bỏ chọn repository"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/40">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-charcoal/60" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="font-semibold text-charcoal">{repo.fullName}</p>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-charcoal/60">Nhánh: {repo.defaultBranch}</p>
                {repo.language && (
                  <p className="text-sm text-charcoal/60">
                    Ngôn ngữ Phát hiện: <span className="font-medium text-misty-sage">{repo.language}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
