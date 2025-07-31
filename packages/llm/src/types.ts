import { Blueprint, File, Task } from '@aris/shared';

// LLM Service Types
export interface LLMService {
  generateBlueprint(requirements: string): Promise<Blueprint>;
  generateCode(blueprint: Blueprint, file: File): Promise<string>;
  analyzeCode(code: string): Promise<CodeAnalysis>;
  processTask(task: Task): Promise<LLMResponse>;
}

export interface LLMResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: TokenUsage;
  metadata?: LLMMetadata;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

export interface LLMMetadata {
  model: string;
  temperature: number;
  maxTokens: number;
  timestamp: Date;
  requestId: string;
}

// Code Analysis Types
export interface CodeAnalysis {
  structure: CodeStructure;
  quality: CodeQuality;
  patterns: Pattern[];
  suggestions: Suggestion[];
}

export interface CodeStructure {
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  variables: VariableInfo[];
}

export interface FunctionInfo {
  name: string;
  parameters: ParameterInfo[];
  returnType?: string;
  location: Location;
  complexity: number;
}

export interface ClassInfo {
  name: string;
  methods: FunctionInfo[];
  properties: PropertyInfo[];
  extends?: string;
  implements?: string[];
  location: Location;
}

export interface ParameterInfo {
  name: string;
  type?: string;
  required: boolean;
  defaultValue?: string;
}

export interface PropertyInfo {
  name: string;
  type?: string;
  access: 'public' | 'private' | 'protected';
  readonly?: boolean;
}

export interface ImportInfo {
  module: string;
  items: string[];
  isDefault: boolean;
  location: Location;
}

export interface ExportInfo {
  name: string;
  type: 'default' | 'named';
  location: Location;
}

export interface VariableInfo {
  name: string;
  type?: string;
  scope: 'global' | 'function' | 'block';
  location: Location;
}

export interface Location {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

export interface CodeQuality {
  score: number; // 0-100
  issues: QualityIssue[];
  metrics: QualityMetrics;
}

export interface QualityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  location: Location;
  severity: 'low' | 'medium' | 'high';
}

export interface QualityMetrics {
  cyclomaticComplexity: number;
  linesOfCode: number;
  maintainabilityIndex: number;
  depthOfInheritance: number;
  couplingBetweenObjects: number;
}

export interface Pattern {
  name: string;
  type: 'design_pattern' | 'anti_pattern' | 'code_smell';
  confidence: number;
  description: string;
  location: Location;
}

export interface Suggestion {
  type: 'improvement' | 'refactoring' | 'optimization';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  location?: Location;
}

// Prompt Engineering Types
export interface PromptTemplate {
  name: string;
  version: string;
  template: string;
  variables: string[];
  examples?: PromptExample[];
}

export interface PromptExample {
  input: any;
  output: any;
  description?: string;
}

export interface PromptContext {
  task: Task;
  agentType: string;
  previousResponses?: LLMResponse[];
  userPreferences?: UserPreferences;
}

export interface UserPreferences {
  codingStyle: 'functional' | 'object_oriented' | 'procedural';
  framework: string;
  language: string;
  testingFramework?: string;
  documentationStyle?: string;
}

// Configuration Types
export interface LLMConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  retryAttempts: number;
  timeout: number;
  rateLimit: RateLimitConfig;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute: number;
  burstLimit: number;
}

// Error Types
export class LLMError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export class RateLimitError extends LLMError {
  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429, true);
    this.retryAfter = retryAfter;
  }
  
  retryAfter?: number;
}

export class TokenLimitError extends LLMError {
  constructor(message: string, maxTokens: number) {
    super(message, 'TOKEN_LIMIT', 400, false);
    this.maxTokens = maxTokens;
  }
  
  maxTokens: number;
} 