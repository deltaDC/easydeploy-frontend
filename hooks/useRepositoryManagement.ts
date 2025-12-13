import { useState, useEffect, useCallback } from "react";
import { GithubService } from "@/services/github.service";

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

interface UseRepositoryManagementProps {
  userId?: string;
  onError: (error: string) => void;
}

export function useRepositoryManagement({ userId, onError }: UseRepositoryManagementProps) {
  const [repositories, setRepositories] = useState<GithubRepo[]>([]);
  const [installations, setInstallations] = useState<ProviderInstallation[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [displayedRepos, setDisplayedRepos] = useState<GithubRepo[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 10;

  // Export setState for search term
  const updateSearchTerm = (term: string) => setSearchTerm(term);

  const loadData = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
          
      const cacheKey = `repos_${userId}`;
      if (useCache && typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setRepositories(data.repos || []);
            setInstallations(data.installations || []);
            setDisplayedRepos(data.repos?.slice(0, ITEMS_PER_PAGE) || []);
            setLoading(false);
            return;
          }
        }
      }
      
      const [reposData, installationsData] = await Promise.all([
        GithubService.getAllUserRepositories(),
        GithubService.getUserInstallations()
      ]);
      
      let reposArray: any[] = [];
      if (Array.isArray(reposData)) {
        reposArray = reposData;
      } else if (reposData && typeof reposData === 'object') {
        if (reposData.data && Array.isArray(reposData.data)) {
          reposArray = reposData.data;
        } else if (reposData.repositories && Array.isArray(reposData.repositories)) {
          reposArray = reposData.repositories;
        }
      }
      
      let installationsArray: any[] = [];
      if (Array.isArray(installationsData)) {
        installationsArray = installationsData;
      } else if (installationsData && typeof installationsData === 'object') {
        if (installationsData.data && Array.isArray(installationsData.data)) {
          installationsArray = installationsData.data;
        } else if (installationsData.installations && Array.isArray(installationsData.installations)) {
          installationsArray = installationsData.installations;
        }
      }
      
      const githubRepos = reposArray.map((repo: any) => ({
        ...repo,
        provider: "github"
      }));
      
      const githubInstallations = installationsArray.map((inst: any) => ({
        ...inst,
        provider: "github"
      }));
      
      setRepositories(githubRepos);
      setInstallations(githubInstallations);
      setDisplayedRepos(githubRepos.slice(0, ITEMS_PER_PAGE));
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: { repos: githubRepos, installations: githubInstallations },
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      onError("Không thể tải danh sách repositories");
      console.error(err);
      setRepositories([]);
      setInstallations([]);
      setDisplayedRepos([]);
    } finally {
      setLoading(false);
    }
  }, [userId, onError]);

  const getFilteredRepositories = useCallback(() => {
    return repositories.filter(repo =>
      repo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [repositories, searchTerm]);

  const loadMoreRepos = useCallback(() => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    
    const filtered = getFilteredRepositories();
    
    setTimeout(() => {
      const nextBatch = filtered.slice(displayedRepos.length, displayedRepos.length + ITEMS_PER_PAGE);
      setDisplayedRepos(prev => [...prev, ...nextBatch]);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, getFilteredRepositories, displayedRepos.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPercentage = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    
    const filtered = getFilteredRepositories();
    
    if (scrollPercentage > 70 && !loadingMore && displayedRepos.length < filtered.length) {
      loadMoreRepos();
    }
  };

  const handleSyncRepositories = async (showMessage: boolean = true) => {
    try {
      setSyncing(true);
      
      await GithubService.syncRepositories();
      
      await loadData(false);
    } catch (err: any) {
      console.error("Sync repositories error:", err);
      if (showMessage) {
        onError(err.response?.data?.message || "Không thể đồng bộ repositories");
      }
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (userId && !hasInitialized) {
      loadData();
      setHasInitialized(true);
    }
  }, [userId, hasInitialized, loadData]);

  useEffect(() => {
    const filtered = repositories.filter(repo =>
      repo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filtered.length > 0) {
      setDisplayedRepos(filtered.slice(0, ITEMS_PER_PAGE));
    }
  }, [searchTerm, repositories]);

  return {
    repositories,
    installations,
    loading,
    syncing,
    displayedRepos,
    loadingMore,
    searchTerm,
    setSearchTerm: updateSearchTerm,
    handleScroll,
    loadData,
    handleSyncRepositories,
  };
}