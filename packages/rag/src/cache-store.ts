import Redis from 'ioredis';
import { ASTNode, FileContext, ConversationHistory, CacheStats } from './types';

export interface CacheConfig {
  redisUrl: string;
  redisPassword?: string;
  redisDb?: number;
  ttl: number; // Time to live in seconds
  maxMemory: number; // Max memory usage in MB
}

export class CacheStore {
  private redis: Redis;
  private config: CacheConfig;
  private isInitialized: boolean = false;

  constructor(config: CacheConfig) {
    this.config = config;
    this.redis = new Redis({
      host: new URL(config.redisUrl).hostname,
      port: parseInt(new URL(config.redisUrl).port) || 6379,
      password: config.redisPassword,
      db: config.redisDb || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Cache Store...');
      
      // Test Redis connection
      await this.redis.ping();
      console.log('✅ Redis connection established');
      
      // Configure Redis for optimal performance
      await this.redis.config('SET', 'maxmemory', `${this.config.maxMemory}mb`);
      await this.redis.config('SET', 'maxmemory-policy', 'allkeys-lru');
      
      this.isInitialized = true;
      console.log('✅ Cache Store initialized successfully');
    } catch (error) {
      console.error('❌ Cache Store initialization failed:', error);
      throw new Error(`Cache Store initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // AST Storage Methods
  async storeAST(filePath: string, ast: ASTNode): Promise<void> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `ast:${filePath}`;
    await this.redis.setex(key, this.config.ttl, JSON.stringify(ast));
  }

  async getAST(filePath: string): Promise<ASTNode | null> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `ast:${filePath}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateAST(filePath: string): Promise<void> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `ast:${filePath}`;
    await this.redis.del(key);
  }

  // File Context Methods
  async storeFileContext(filePath: string, context: FileContext): Promise<void> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `context:${filePath}`;
    await this.redis.setex(key, this.config.ttl, JSON.stringify(context));
  }

  async getFileContext(filePath: string): Promise<FileContext | null> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `context:${filePath}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Conversation History Methods
  async storeConversationHistory(sessionId: string, history: ConversationHistory): Promise<void> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `conversation:${sessionId}`;
    await this.redis.setex(key, this.config.ttl, JSON.stringify(history));
  }

  async getConversationHistory(sessionId: string): Promise<ConversationHistory | null> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `conversation:${sessionId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async appendToConversation(sessionId: string, message: any): Promise<void> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `conversation:${sessionId}`;
    const existing = await this.getConversationHistory(sessionId);
    
    const updatedHistory: ConversationHistory = {
      messages: [...(existing?.messages || []), message],
      lastUpdated: new Date(),
      messageCount: (existing?.messageCount || 0) + 1
    };
    
    await this.storeConversationHistory(sessionId, updatedHistory);
  }

  // RAG Query Cache Methods
  async cacheRAGQuery(query: string, agentType: string, results: any[]): Promise<void> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `rag:${agentType}:${this.hashQuery(query)}`;
    const cacheData = {
      query,
      agentType,
      results,
      timestamp: new Date(),
      ttl: this.config.ttl
    };
    
    await this.redis.setex(key, this.config.ttl, JSON.stringify(cacheData));
  }

  async getCachedRAGQuery(query: string, agentType: string): Promise<any[] | null> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `rag:${agentType}:${this.hashQuery(query)}`;
    const data = await this.redis.get(key);
    
    if (data) {
      const cacheData = JSON.parse(data);
      // Check if cache is still valid
      const age = Date.now() - new Date(cacheData.timestamp).getTime();
      if (age < this.config.ttl * 1000) {
        return cacheData.results;
      }
    }
    
    return null;
  }

  // Session Management
  async storeSessionData(sessionId: string, data: any): Promise<void> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `session:${sessionId}`;
    await this.redis.setex(key, this.config.ttl, JSON.stringify(data));
  }

  async getSessionData(sessionId: string): Promise<any | null> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const key = `session:${sessionId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Performance Monitoring
  async getCacheStats(): Promise<CacheStats> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    const info = await this.redis.info();
    const memory = await this.redis.memory('USAGE');
    
    return {
      totalKeys: await this.redis.dbsize(),
      memoryUsage: parseInt(memory),
      maxMemory: this.config.maxMemory * 1024 * 1024,
      hitRate: 0, // Would need to implement hit tracking
      lastUpdated: new Date()
    };
  }

  // Utility Methods
  private hashQuery(query: string): string {
    // Simple hash function for query caching
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  async clearCache(): Promise<void> {
    if (!this.isInitialized) throw new Error('Cache Store not initialized');
    
    await this.redis.flushdb();
    console.log('🗑️ Cache cleared');
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
} 