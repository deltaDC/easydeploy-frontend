"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const ITEMS_PER_PAGE = 10;

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
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Chọn Repository
            </CardTitle>
            <CardDescription>
              {repositories.length} repositories có sẵn
            </CardDescription>
          </div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onRefresh();
            }}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm repositories..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Repository Table */}
        <div className="border rounded-lg overflow-hidden">
          <div 
            className="max-h-96 overflow-y-auto"
            onScroll={onScroll}
          >
            {loading ? (
              <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedRepos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Không tìm thấy repositories</p>
                <p className="text-sm">
                  {searchTerm ? "Thử điều chỉnh từ khóa tìm kiếm" : "Kết nối GitHub để xem repositories"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {displayedRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onRepositoryClick(repo)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Github className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h4 className="font-medium text-sm truncate">{repo.fullName}</h4>
                          {repo.isPrivate ? (
                            <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          )}
                          {repo.language && (
                            <Badge variant="outline" className="text-xs">
                              {repo.language}
                            </Badge>
                          )}
                        </div>
                        
                        {repo.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            <span>{repo.defaultBranch}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(repo.updatedAt)}</span>
                          </div>
                          {repo.stargazersCount !== undefined && repo.stargazersCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              <span>{repo.stargazersCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(repo.htmlUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {loadingMore && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Đang tải thêm...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

