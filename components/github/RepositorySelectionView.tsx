"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

interface RepositorySelectionViewProps {
  repositories: GithubRepo[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  displayedRepos: GithubRepo[];
  loadingMore: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onRepositoryClick: (repo: GithubRepo) => void;
  onRefresh: () => void;
}

// Language color mapping
const getLanguageColor = (language?: string) => {
  if (!language) return 'text-charcoal/40';
  const colors: Record<string, string> = {
    'JavaScript': 'text-yellow-500',
    'TypeScript': 'text-blue-500',
    'Python': 'text-blue-400',
    'Java': 'text-orange-500',
    'Go': 'text-cyan-500',
    'Rust': 'text-orange-600',
    'PHP': 'text-indigo-500',
    'Ruby': 'text-red-500',
    'C++': 'text-blue-600',
    'C#': 'text-purple-500',
    'Swift': 'text-orange-400',
    'Kotlin': 'text-purple-400',
    'Dart': 'text-blue-400',
    'HTML': 'text-orange-400',
    'CSS': 'text-blue-400',
    'Vue': 'text-green-500',
    'React': 'text-cyan-400',
  };
  return colors[language] || 'text-misty-sage';
};

export function RepositorySelectionView({
  repositories,
  loading,
  searchTerm,
  onSearchChange,
  displayedRepos,
  loadingMore,
  onScroll,
  onRepositoryClick,
  onRefresh,
}: RepositorySelectionViewProps) {
  const [hoveredRepo, setHoveredRepo] = useState<number | null>(null);
  const [showPagination, setShowPagination] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-inner-glow-soft overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-charcoal flex items-center gap-2 mb-1">
              <Github className="h-5 w-5 text-misty-sage" strokeWidth={1.5} />
              Chọn Repository
            </h3>
            <p className="text-sm text-charcoal/70">
              {repositories.length} repositories có sẵn
            </p>
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onRefresh();
            }}
            variant="outline"
            size="sm"
            disabled={loading}
            className="bg-white/40 backdrop-blur-sm border-white/30 hover:bg-white/60"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            Làm mới
          </Button>
        </div>

        {/* Search Bar - Pill Shape */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal/40 z-10" strokeWidth={1.5} />
          <Input
            placeholder="Tìm kiếm kho lưu trữ..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 pr-4 h-11 rounded-full border-0 bg-white/60 backdrop-blur-sm shadow-inner-sm focus:ring-2 focus:ring-misty-sage/20 focus:bg-white/80 transition-all"
          />
        </div>

        {/* Repository Grid */}
        <div 
          className="max-h-[600px] overflow-y-auto scrollbar-misty space-y-3"
          onScroll={onScroll}
          onMouseEnter={() => setShowPagination(true)}
          onMouseLeave={() => setShowPagination(false)}
        >
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white/40 backdrop-blur-sm rounded-2xl p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : displayedRepos.length === 0 ? (
            <div className="text-center py-12 text-charcoal/60">
              <Github className="h-12 w-12 mx-auto mb-4 opacity-40" strokeWidth={1} />
              <p className="text-lg font-medium text-charcoal mb-1">Không tìm thấy repositories</p>
              <p className="text-sm">
                {searchTerm ? "Thử điều chỉnh từ khóa tìm kiếm" : "Kết nối GitHub để xem repositories"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedRepos.map((repo, index) => {
                const isHovered = hoveredRepo === repo.id;
                const languageColor = getLanguageColor(repo.language);
                
                return (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onMouseEnter={() => setHoveredRepo(repo.id)}
                    onMouseLeave={() => setHoveredRepo(null)}
                    className="group cursor-pointer"
                    onClick={() => onRepositoryClick(repo)}
                  >
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/30 hover:border-misty-sage/30 hover:bg-white/80 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Inner glow on hover */}
                      {isHovered && (
                        <motion.div
                          className="absolute inset-0 bg-misty-sage/5 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}

                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Github className="h-4 w-4 text-charcoal/60 flex-shrink-0" strokeWidth={1.5} />
                            <h4 className="font-semibold text-charcoal truncate">{repo.fullName}</h4>
                            {repo.isPrivate ? (
                              <Lock className="h-3 w-3 text-charcoal/40 flex-shrink-0" strokeWidth={1.5} />
                            ) : (
                              <Globe className="h-3 w-3 text-charcoal/40 flex-shrink-0" strokeWidth={1.5} />
                            )}
                          </div>
                          
                          {repo.description && (
                            <p className="text-sm text-charcoal/70 mb-3 line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 flex-wrap">
                            {/* Language Badge with Glow */}
                            {repo.language && (
                              <motion.div
                                animate={{
                                  scale: isHovered ? 1.05 : 1,
                                }}
                                className="flex items-center gap-1.5"
                              >
                                <div className={`h-2 w-2 rounded-full ${languageColor.replace('text-', 'bg-')} ${isHovered ? 'animate-pulse' : ''}`} />
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs border-0 bg-white/40 backdrop-blur-sm ${isHovered ? languageColor : 'text-charcoal/60'}`}
                                >
                                  {repo.language}
                                </Badge>
                              </motion.div>
                            )}
                            
                            <div className="flex items-center gap-1 text-xs text-charcoal/60">
                              <GitBranch className="h-3 w-3" strokeWidth={1.5} />
                              <span>{repo.defaultBranch}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-charcoal/60">
                              <Calendar className="h-3 w-3" strokeWidth={1.5} />
                              <span>{formatDate(repo.updatedAt)}</span>
                            </div>
                            
                            {repo.stargazersCount !== undefined && repo.stargazersCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-charcoal/60">
                                <Star className="h-3 w-3" strokeWidth={1.5} />
                                <span>{repo.stargazersCount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(repo.htmlUrl, '_blank');
                          }}
                          className="h-8 w-8 p-0 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
              
              {loadingMore && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-misty-sage mx-auto"></div>
                    <p className="mt-2 text-sm text-charcoal/60">Đang tải thêm...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination Arrows - Only visible on hover */}
        {displayedRepos.length > 0 && (
          <div className={`flex items-center justify-center gap-2 mt-4 transition-opacity duration-300 ${showPagination ? 'opacity-100' : 'opacity-0'}`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 text-charcoal/60 hover:text-charcoal transition-all"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 text-charcoal/60 hover:text-charcoal transition-all"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
