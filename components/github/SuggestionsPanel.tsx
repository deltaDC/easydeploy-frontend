"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Info } from "lucide-react";
import { RepositoryDetailResponse } from "@/types/application.type";

interface SuggestionsPanelProps {
  repoDetails: RepositoryDetailResponse | null;
  loading: boolean;
  onSelectSuggestion: (suggestion: any) => void;
}

export default function SuggestionsPanel({ repoDetails, loading, onSelectSuggestion }: SuggestionsPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!repoDetails?.suggestion) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Suggestions
        </CardTitle>
        <CardDescription>
          Gợi ý cấu hình dựa trên repository
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {repoDetails.languages && repoDetails.languages.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Detected Languages:</p>
            <div className="flex flex-wrap gap-2">
              {repoDetails.languages.map((lang, idx) => (
                <Badge key={idx} variant="secondary">{lang}</Badge>
              ))}
            </div>
          </div>
        )}

        {repoDetails.suggestion.primarySuggestion && (
          <div className="p-4 border rounded-lg bg-primary/5">
            <p className="text-sm font-medium mb-2">Primary Suggestion</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectSuggestion(repoDetails.suggestion.primarySuggestion)}
              className="w-full"
            >
              Use {repoDetails.suggestion.primarySuggestion.framework}
            </Button>
          </div>
        )}

        {repoDetails.suggestion.environmentSuggestions && repoDetails.suggestion.environmentSuggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Environment Options:</p>
            <div className="space-y-2">
              {repoDetails.suggestion.environmentSuggestions.map((sug: any, idx: number) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectSuggestion(sug)}
                  className="w-full justify-start"
                >
                  {sug.framework}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

