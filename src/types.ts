export interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: 'deepseek-coder' | 'deepseek-r1' | 'deepseek-chat';
  maxTokens: number;
  temperature: number;
}

export interface CodeAnalysisResult {
  issues: CodeIssue[];
  suggestions: string[];
  summary: string;
  quality_score: number;
}

export interface CodeIssue {
  line: number;
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface CodeGenerationRequest {
  description: string;
  language: string;
  context?: string;
}

export interface CodeGenerationResult {
  code: string;
  explanation: string;
  language: string;
}

export interface ExplanationResult {
  summary: string;
  details: string[];
  complexity: string;
  key_points: string[];
}

export interface RefactorResult {
  original: string;
  refactored: string;
  improvements: string[];
  explanation: string;
}