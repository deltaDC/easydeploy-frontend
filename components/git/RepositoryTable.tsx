"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { 
  Github, 
  ExternalLink, 
  Search, 
  RefreshCw,
  Calendar,
  Lock,
  Globe,
  Star,
  GitBranch
} from "lucide-react";
import { GithubService } from "@/services/github.service";
import { useAuth } from "@/hooks/useAuth";

interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  defaultBranch: string;
  updatedAt: string;
  createdAt: string;
  language?: string;
  stargazersCount?: number;
  forksCount?: number;
  isFork?: boolean;
}

interface RepositoryTableProps {
  selectedProvider: string;
  onRepositorySelect: (repo: GithubRepo) => void;
}

export default function RepositoryTable({ selectedProvider, onRepositorySelect }: RepositoryTableProps) {
  const { user } = useAuth();
  const [repositories, setRepositories] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);

  useEffect(() => {
    if (user && selectedProvider === "github") {
      loadRepositories();
    }
  }, [user, selectedProvider]);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const reposData = await GithubService.getAllUserRepositories();
      setRepositories(reposData);
    } catch (err) {
      setError("Không thể tải danh sách repositories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepositoryClick = (repo: GithubRepo) => {
    setSelectedRepo(repo);
    onRepositorySelect(repo);
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Vui lòng đăng nhập để xem repositories.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Repositories
            </CardTitle>
            <CardDescription>
              {repositories.length} repositories available
            </CardDescription>
          </div>
          <Button
            onClick={loadRepositories}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Repository Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading repositories...</p>
                </div>
              </div>
            ) : filteredRepositories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No repositories found</p>
                <p className="text-sm">
                  {searchTerm ? "Try adjusting your search terms" : "Make sure your Git provider is connected"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedRepo?.id === repo.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => handleRepositoryClick(repo)}
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
                      
                      <div className="flex items-center gap-2 ml-4">
                        {selectedRepo?.id === repo.id && (
                          <Badge variant="default" className="text-xs">
                            Selected
                          </Badge>
                        )}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Repository Info */}
        {selectedRepo && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
            <h4 className="font-medium mb-2">Selected Repository</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {selectedRepo.fullName}</p>
              <p><span className="font-medium">Branch:</span> {selectedRepo.defaultBranch}</p>
              <p><span className="font-medium">Visibility:</span> {selectedRepo.isPrivate ? 'Private' : 'Public'}</p>
              {selectedRepo.description && (
                <p><span className="font-medium">Description:</span> {selectedRepo.description}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
