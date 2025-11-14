/**
 * Utility functions for language detection and mapping
 */

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
      return "docker";
  }
};

export const mapFrameworkToLanguage = (framework: string): string => {
  if (!framework) return "docker";
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
  return "docker";
};

