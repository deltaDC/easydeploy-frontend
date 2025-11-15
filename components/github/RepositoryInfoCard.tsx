"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, X } from "lucide-react";

interface GithubRepo {
  fullName: string;
  defaultBranch: string;
}

interface RepositoryInfoCardProps {
  repo: GithubRepo;
  onDeselect: () => void;
}

export default function RepositoryInfoCard({ repo, onDeselect }: RepositoryInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Code</CardTitle>
        <CardDescription>Thông tin repository đã chọn</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{repo.fullName}</p>
              <p className="text-sm text-muted-foreground">Branch: {repo.defaultBranch}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onDeselect}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

