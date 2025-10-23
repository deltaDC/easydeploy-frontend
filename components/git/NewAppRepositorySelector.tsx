"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Github,
  GitBranch,
  Rocket,
  Settings
} from "lucide-react";
import GitProviderSelector from "@/components/git/GitProviderSelector";
import RepositoryTable from "@/components/git/RepositoryTable";
import CredentialsCollapsible from "@/components/git/CredentialsCollapsible";
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

export default function NewAppRepositorySelector() {
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string>("github");
  const [selectedRepository, setSelectedRepository] = useState<GithubRepo | null>(null);
  const [currentStep, setCurrentStep] = useState<"provider" | "repository" | "deploy">("provider");

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    setSelectedRepository(null);
  };

  const handleRepositorySelect = (repo: GithubRepo) => {
    setSelectedRepository(repo);
  };

  const handleNext = () => {
    if (currentStep === "provider") {
      setCurrentStep("repository");
    } else if (currentStep === "repository" && selectedRepository) {
      setCurrentStep("deploy");
    }
  };

  const handleBack = () => {
    if (currentStep === "repository") {
      setCurrentStep("provider");
    } else if (currentStep === "deploy") {
      setCurrentStep("repository");
    }
  };

  const handleDeploy = () => {
    // TODO: Implement deployment logic
    console.log("Deploying repository:", selectedRepository);
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Vui lòng đăng nhập để tạo ứng dụng mới.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Deploy New Application</h1>
        <p className="text-muted-foreground">
          Connect your repository and deploy your application in minutes
        </p>
        <div className="text-sm text-muted-foreground">
          Step {currentStep === "provider" ? "1" : currentStep === "repository" ? "2" : "3"} of 3: {
            currentStep === "provider" ? "Select Git Provider" : 
            currentStep === "repository" ? "Choose Repository" : 
            "Configure Deployment"
          }
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => setCurrentStep("provider")}
          className={`flex items-center space-x-2 transition-colors ${
            currentStep === "provider" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            currentStep === "provider" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}>
            <Settings className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Provider</span>
        </button>
        
        <div className={`w-8 h-px ${currentStep === "repository" || currentStep === "deploy" ? "bg-primary" : "bg-muted"}`} />
        
        <button
          onClick={() => setCurrentStep("repository")}
          className={`flex items-center space-x-2 transition-colors ${
            currentStep === "repository" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            currentStep === "repository" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}>
            <Github className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Repository</span>
        </button>
        
        <div className={`w-8 h-px ${currentStep === "deploy" ? "bg-primary" : "bg-muted"}`} />
        
        <button
          onClick={() => setCurrentStep("deploy")}
          disabled={!selectedRepository}
          className={`flex items-center space-x-2 transition-colors ${
            currentStep === "deploy" ? "text-primary" : 
            selectedRepository ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground cursor-not-allowed"
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            currentStep === "deploy" ? "bg-primary text-primary-foreground" : 
            selectedRepository ? "bg-muted hover:bg-muted/80" : "bg-muted"
          }`}>
            <Rocket className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Deploy</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Provider & Repository Selection */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === "provider" && (
            <GitProviderSelector />
          )}
          
          {currentStep === "repository" && (
            <RepositoryTable
              selectedProvider={selectedProvider}
              onRepositorySelect={handleRepositorySelect}
            />
          )}
          
          {currentStep === "deploy" && selectedRepository && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Deploy Configuration
                </CardTitle>
                <CardDescription>
                  Configure your deployment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Repository</h4>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    <span className="font-medium">{selectedRepository.fullName}</span>
                    <Badge variant="outline">{selectedRepository.defaultBranch}</Badge>
                  </div>
                  {selectedRepository.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRepository.description}
                    </p>
                  )}
                </div>
                
                <div className="text-center py-8 text-muted-foreground">
                  <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Deployment Configuration</p>
                  <p className="text-sm">Coming soon - Advanced deployment settings</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Credentials Manager */}
        <div className="lg:col-span-1">
          <CredentialsCollapsible
            selectedProvider={selectedProvider}
            onProviderChange={handleProviderChange}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === "provider"}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          {currentStep === "provider" && (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === "repository" && (
            <Button 
              onClick={handleNext}
              disabled={!selectedRepository}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === "deploy" && (
            <Button onClick={handleDeploy} className="bg-green-600 hover:bg-green-700">
              <Rocket className="h-4 w-4 mr-2" />
              Deploy Application
            </Button>
          )}
        </div>
      </div>

      {/* Selected Repository Summary */}
      {selectedRepository && currentStep !== "deploy" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Repository Selected</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRepository.fullName} • {selectedRepository.defaultBranch}
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600">
                Ready to Deploy
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
