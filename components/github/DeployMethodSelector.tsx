"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Link as LinkIcon } from "lucide-react";

interface DeployMethodSelectorProps {
  usePublicUrl: boolean;
  onToggle: (usePublic: boolean) => void;
}

export default function DeployMethodSelector({ usePublicUrl, onToggle }: DeployMethodSelectorProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <CardHeader>
        <div className="space-y-4">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-100">Chọn phương thức deploy</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Chọn repository từ GitHub provider hoặc nhập URL public repository
            </CardDescription>
          </div>
          
          {/* Custom Tabs Style */}
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onToggle(false)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${!usePublicUrl 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              <Github className="h-4 w-4" />
              Provider
            </button>
            <button
              onClick={() => onToggle(true)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${usePublicUrl 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              <LinkIcon className="h-4 w-4" />
              Public URL
            </button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

