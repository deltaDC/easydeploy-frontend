/**
 * Utility functions for language detection and mapping
 */

export interface LanguageCommands {
  buildCommand: string;
  startCommand: string;
}

export const mapLanguageToFormValue = (detectedLanguage: string): string => {
  const lang = detectedLanguage.toLowerCase();
  switch (lang) {
    case "javascript":
    case "typescript":
      return "node";
    case "python":
      return "python";
    case "java":
      return "java";
    case "go":
      return "go";
    case "rust":
      return "rust";
    default:
      return "node";
  }
};

export const mapFrameworkToLanguage = (framework: string): string => {
  if (!framework) return "node";
  const fw = framework.toLowerCase();
  if (fw.includes("node") || fw.includes("javascript") || fw.includes("typescript")) {
    return "node";
  }
  if (fw.includes("python")) {
    return "python";
  }
  if (fw.includes("java") || fw.includes("spring")) {
    return "java";
  }
  if (fw.includes("go")) {
    return "go";
  }
  if (fw.includes("rust")) {
    return "rust";
  }
  return "node";
};

/**
 * Get default build and start commands for a language
 */
export const getLanguageCommands = (language: string): LanguageCommands => {
  const lang = language.toLowerCase();
  
  switch (lang) {
    case "node":
    case "javascript":
    case "typescript":
    case "nodejs":
      return {
        buildCommand: "npm install && npm run build",
        startCommand: "npm start"
      };
    
    case "python":
      return {
        buildCommand: "pip install -r requirements.txt",
        startCommand: "python app.py"
      };
    
    case "java":
      return {
        buildCommand: "mvn clean install",
        startCommand: "java -jar target/*.jar"
      };
    
    case "go":
    case "golang":
      return {
        buildCommand: "go mod download && go build -o app",
        startCommand: "./app"
      };
    
    case "rust":
      return {
        buildCommand: "cargo build --release",
        startCommand: "./target/release/app"
      };
    
    case "docker":
      return {
        buildCommand: "docker build -t application .",
        startCommand: "docker run application"
      };
    
    default:
      return {
        buildCommand: "",
        startCommand: ""
      };
  }
};

/**
 * Available languages for selection
 */
export const AVAILABLE_LANGUAGES = [
  { value: "node", label: "Node.js / JavaScript / TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "docker", label: "Docker" },
] as const;

