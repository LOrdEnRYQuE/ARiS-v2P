import { RAGConfig } from './types';

export class RAGConfigLoader {
  private static instance: RAGConfigLoader;
  private config: RAGConfig | null = null;

  private constructor() {}

  static getInstance(): RAGConfigLoader {
    if (!RAGConfigLoader.instance) {
      RAGConfigLoader.instance = new RAGConfigLoader();
    }
    return RAGConfigLoader.instance;
  }

  loadConfig(): RAGConfig {
    if (this.config) {
      return this.config;
    }

    // Load from environment variables
    const config: RAGConfig = {
      supabaseUrl: this.getEnvVar('SUPABASE_URL'),
      supabaseKey: this.getEnvVar('SUPABASE_ANON_KEY'),
      supabaseServiceKey: this.getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
      openaiApiKey: this.getEnvVar('OPENAI_API_KEY'),
      embeddingModel: this.getEnvVar('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small'),
      maxResults: parseInt(this.getEnvVar('RAG_MAX_RESULTS', '10')),
      similarityThreshold: parseFloat(this.getEnvVar('RAG_SIMILARITY_THRESHOLD', '0.7')),
      maxContextLength: parseInt(this.getEnvVar('RAG_MAX_CONTEXT_LENGTH', '4000')),
      chunkSize: parseInt(this.getEnvVar('RAG_CHUNK_SIZE', '1000')),
      chunkOverlap: parseInt(this.getEnvVar('RAG_CHUNK_OVERLAP', '200')),
      batchSize: parseInt(this.getEnvVar('RAG_BATCH_SIZE', '50')),
      concurrency: parseInt(this.getEnvVar('RAG_CONCURRENCY', '5')),
      retryAttempts: parseInt(this.getEnvVar('RAG_RETRY_ATTEMPTS', '3')),
      timeout: parseInt(this.getEnvVar('RAG_TIMEOUT', '30000')),
      tableName: this.getEnvVar('RAG_TABLE_NAME', 'code_chunks'),
      indexName: this.getEnvVar('RAG_INDEX_NAME', 'code_chunks_embeddings_idx'),
      vectorDimension: parseInt(this.getEnvVar('RAG_VECTOR_DIMENSION', '1536')),
      similarityFunction: this.getEnvVar('RAG_SIMILARITY_FUNCTION', 'cosine'),
      maxTokens: parseInt(this.getEnvVar('OPENAI_MAX_TOKENS', '8192')),
      temperature: parseFloat(this.getEnvVar('OPENAI_TEMPERATURE', '0.1'))
    };

    // Validate required configuration
    this.validateConfig(config);
    
    this.config = config;
    return config;
  }

  private getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value || defaultValue!;
  }

  private validateConfig(config: RAGConfig): void {
    const requiredFields = [
      'supabaseUrl',
      'supabaseKey', 
      'openaiApiKey'
    ];

    for (const field of requiredFields) {
      if (!config[field as keyof RAGConfig]) {
        throw new Error(`Required configuration field ${field} is missing`);
      }
    }

    // Validate URL formats
    if (!config.supabaseUrl.startsWith('https://')) {
      throw new Error('SUPABASE_URL must be a valid HTTPS URL');
    }

    // Validate numeric ranges
    if (config.similarityThreshold < 0 || config.similarityThreshold > 1) {
      throw new Error('similarityThreshold must be between 0 and 1');
    }

    if (config.maxResults < 1 || config.maxResults > 100) {
      throw new Error('maxResults must be between 1 and 100');
    }

    if (config.chunkSize < 100 || config.chunkSize > 5000) {
      throw new Error('chunkSize must be between 100 and 5000');
    }

    console.log('✅ RAG configuration validated successfully');
  }

  reloadConfig(): RAGConfig {
    this.config = null;
    return this.loadConfig();
  }

  getConfig(): RAGConfig {
    if (!this.config) {
      return this.loadConfig();
    }
    return this.config;
  }
} 