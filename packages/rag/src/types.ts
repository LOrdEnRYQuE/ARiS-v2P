import { File } from '@aris/shared';

// RAG System Types
export interface RAGConfig {
  supabaseUrl: string;
  supabaseKey: string;
  supabaseServiceKey: string;
  openaiApiKey: string;
  embeddingModel: string;
  maxResults: number;
  similarityThreshold: number;
  maxContextLength: number;
  chunkSize: number;
  chunkOverlap: number;
  batchSize: number;
  concurrency: number;
  retryAttempts: number;
  timeout: number;
  tableName: string;
  indexName: string;
  vectorDimension: number;
  similarityFunction: string;
  maxTokens: number;
  temperature: number;
}

export interface EnhancedRAGConfig extends RAGConfig {
  cache: CacheConfig;
}

export interface EmbeddingResult {
  embeddings: number[];
  metadata: EmbeddingMetadata;
}

export interface EmbeddingMetadata {
  source: 'workspace' | 'documentation' | 'best-practices';
  filePath?: string;
  functionName?: string;
  className?: string;
  language: string;
  tags: string[];
  quality: number;
  createdAt: Date;
  // Additional properties for enhanced metadata
  functions?: number;
  classes?: number;
  complexity?: number;
  isAsync?: boolean;
  isExported?: boolean;
  parameters?: number;
  methods?: number;
  properties?: number;
  maintainability?: number;
  imports?: number;
  exports?: number;
  variables?: number;
}

export interface ContextChunk {
  id: string;
  content: string;
  embeddings: number[];
  metadata: EmbeddingMetadata;
  similarity?: number;
}

export interface RAGQuery {
  query: string;
  agentType: string;
  context: any;
  maxResults: number;
  similarityThreshold: number;
}

export interface RAGResult {
  chunks: ContextChunk[];
  totalResults: number;
  queryTime: number;
  relevanceScore: number;
}

export interface VectorDatabase {
  insert(chunk: ContextChunk): Promise<void>;
  similaritySearch(embeddings: number[], limit: number): Promise<ContextChunk[]>;
  delete(id: string): Promise<void>;
  update(chunk: ContextChunk): Promise<void>;
  getStats(): Promise<{ totalChunks: number; totalSize: number }>;
  createIndex(): Promise<void>;
}

export interface EmbeddingEngine {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  getModelInfo(): Promise<{ model: string; dimensions: number }>;
  validateEmbeddings(embeddings: number[]): Promise<boolean>;
}

export interface RetrievalEngine {
  retrieve(query: RAGQuery): Promise<RAGResult>;
  filterByRelevance(chunks: ContextChunk[], agentType: string): Promise<ContextChunk[]>;
  rankByRelevance(chunks: ContextChunk[], query: string): Promise<ContextChunk[]>;
  getRetrievalStats(): Promise<{
    totalQueries: number;
    averageQueryTime: number;
    cacheHitRate: number;
    averageRelevanceScore: number;
  }>;
}

// Data Source Types
export interface DataSource {
  type: 'workspace' | 'documentation' | 'best-practices';
  name: string;
  description: string;
  enabled: boolean;
}

export interface WorkspaceSource extends DataSource {
  type: 'workspace';
  rootPath: string;
  includePatterns: string[];
  excludePatterns: string[];
  maxFileSize: number;
}

export interface DocumentationSource extends DataSource {
  type: 'documentation';
  framework: string;
  version: string;
  url: string;
  localPath?: string;
}

export interface BestPracticesSource extends DataSource {
  type: 'best-practices';
  category: string;
  examples: CodeExample[];
}

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  quality: number;
}

// Processing Types
export interface ProcessingPipeline {
  extract(file: File): Promise<ContextChunk[]>;
  process(chunks: ContextChunk[]): Promise<ContextChunk[]>;
  validate(chunk: ContextChunk): Promise<boolean>;
}

export interface ChunkingStrategy {
  name: string;
  chunkText(text: string, metadata: any): Promise<string[]>;
  shouldChunk(file: File): boolean;
}

// Agent Integration Types
export interface AgentRAGIntegration {
  agentType: string;
  contextRetrieval(query: string, context: any): Promise<ContextChunk[]>;
  knowledgeUpdate(code: string, metadata: any): Promise<void>;
  getRelevantContext(task: any): Promise<ContextChunk[]>;
}

// Real-time Updates
export interface RealTimeUpdate {
  type: 'insert' | 'update' | 'delete';
  chunk: ContextChunk;
  timestamp: Date;
}

export interface UpdateListener {
  onUpdate(update: RealTimeUpdate): Promise<void>;
}

// Performance Metrics
export interface RAGMetrics {
  retrievalTime: number;
  embeddingTime: number;
  similarityScore: number;
  relevanceScore: number;
  cacheHitRate: number;
  totalQueries: number;
  successfulQueries: number;
}

// Error Types
export class RAGError extends Error {
  code: string;
  context?: any;
  recoverable: boolean;

  constructor({ message, code, context, recoverable }: {
    message: string;
    code: string;
    context?: any;
    recoverable: boolean;
  }) {
    super(message);
    this.name = 'RAGError';
    this.code = code;
    this.context = context;
    this.recoverable = recoverable;
  }
}

export enum RAGErrorCode {
  EMBEDDING_FAILED = 'EMBEDDING_FAILED',
  VECTOR_DB_ERROR = 'VECTOR_DB_ERROR',
  INVALID_QUERY = 'INVALID_QUERY',
  NO_RESULTS = 'NO_RESULTS',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  CACHE_ERROR = 'CACHE_ERROR'
}

// Cache Store Types (Layer 3: Key-Value Store)
export interface ASTNode {
  type: string;
  name?: string;
  startLine: number;
  endLine: number;
  children?: ASTNode[];
  metadata?: any;
}

export interface FileContext {
  filePath: string;
  content: string;
  ast: ASTNode;
  functions: any[];
  classes: any[];
  imports: any[];
  exports: any[];
  lastModified: Date;
  size: number;
  language: string;
}

export interface ConversationHistory {
  messages: any[];
  lastUpdated: Date;
  messageCount: number;
  sessionId: string;
}

export interface CacheStats {
  totalKeys: number;
  memoryUsage: number;
  maxMemory: number;
  hitRate: number;
  lastUpdated: Date;
}

export interface CacheConfig {
  redisUrl: string;
  redisPassword?: string;
  redisDb?: number;
  ttl: number;
  maxMemory: number;
}

// Graph Database Types (Layer 2: Structural & Relational Memory)
export interface GraphConfig {
  uri: string;
  username: string;
  password: string;
  database?: string;
  maxConnectionPoolSize?: number;
  connectionTimeout?: number;
}

export interface CodeNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'variable' | 'import' | 'export' | 'api_endpoint' | 'database_table';
  name: string;
  path?: string;
  language: string;
  metadata: any;
}

export interface CodeRelationship {
  type: 'IMPORTS' | 'CALLS' | 'INHERITS_FROM' | 'IMPLEMENTS' | 'REFERENCES_TABLE' | 'DEPENDS_ON' | 'USES' | 'EXTENDS';
  sourceId: string;
  targetId: string;
  properties: any;
}

export interface ImpactAnalysis {
  sourceNodeId: string;
  changeType: 'modify' | 'delete' | 'add';
  affectedNodes: Array<{
    id: string;
    type: string;
    name: string;
    path?: string;
    impactLevel: 'low' | 'medium' | 'high' | 'critical';
  }>;
  totalAffected: number;
  impactScore: number;
  recommendations: string[];
}

export interface GraphStats {
  totalNodes: number;
  totalRelationships: number;
  totalFiles: number;
  lastUpdated: Date;
} 