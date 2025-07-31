import { RAGSystem } from './rag-system';
import { CacheStore } from './cache-store';
import { 
  RAGConfig, 
  RAGQuery, 
  RAGResult, 
  ContextChunk, 
  EmbeddingMetadata,
  CacheConfig,
  ASTNode,
  FileContext,
  ConversationHistory,
  CacheStats
} from './types';

export interface EnhancedRAGConfig extends RAGConfig {
  cache: CacheConfig;
}

export class EnhancedRAGSystem extends RAGSystem {
  private cacheStore: CacheStore;
  private enhancedConfig: EnhancedRAGConfig;

  constructor(config: EnhancedRAGConfig) {
    super(config);
    this.enhancedConfig = config;
    this.cacheStore = new CacheStore(config.cache);
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Enhanced RAG System with Cache Store...');
      
      // Initialize base RAG system
      await super.initialize();
      
      // Initialize cache store
      await this.cacheStore.initialize();
      
      console.log('✅ Enhanced RAG System initialized successfully');
    } catch (error) {
      console.error('❌ Enhanced RAG System initialization failed:', error);
      throw error;
    }
  }

  // Enhanced context retrieval with cache
  async retrieveContext(query: string, agentType: string, context: any = {}): Promise<ContextChunk[]> {
    try {
      // Check cache first
      const cachedResults = await this.cacheStore.getCachedRAGQuery(query, agentType);
      if (cachedResults) {
        console.log('⚡ Cache hit for query:', query.substring(0, 50));
        return cachedResults;
      }

      // Retrieve from vector store
      const results = await super.retrieveContext(query, agentType, context);
      
      // Cache the results
      await this.cacheStore.cacheRAGQuery(query, agentType, results);
      
      return results;
    } catch (error) {
      console.error('❌ Enhanced context retrieval failed:', error);
      throw error;
    }
  }

  // AST-aware context retrieval
  async getContextWithAST(query: string, agentType: string, filePath?: string): Promise<ContextChunk[]> {
    try {
      let astContext: ContextChunk[] = [];
      
      if (filePath) {
        // Get AST from cache
        const ast = await this.cacheStore.getAST(filePath);
        if (ast) {
          // Create AST-specific context
          astContext = await this.createASTContext(query, agentType, ast, filePath);
        }
      }

      // Get base context
      const baseContext = await this.retrieveContext(query, agentType);
      
      // Combine and rank results
      const combinedContext = [...baseContext, ...astContext];
      return this.rankByRelevance(combinedContext, query);
    } catch (error) {
      console.error('❌ AST-aware context retrieval failed:', error);
      throw error;
    }
  }

  // File context management
  async storeFileContext(filePath: string, content: string, ast: ASTNode): Promise<void> {
    try {
      const fileContext: FileContext = {
        filePath,
        content,
        ast,
        functions: this.extractFunctions(ast),
        classes: this.extractClasses(ast),
        imports: this.extractImports(ast),
        exports: this.extractExports(ast),
        lastModified: new Date(),
        size: content.length,
        language: this.getLanguageFromFile(filePath)
      };

      await this.cacheStore.storeFileContext(filePath, fileContext);
      console.log(`📁 Stored file context for: ${filePath}`);
    } catch (error) {
      console.error('❌ File context storage failed:', error);
      throw error;
    }
  }

  async getFileContext(filePath: string): Promise<FileContext | null> {
    try {
      return await this.cacheStore.getFileContext(filePath);
    } catch (error) {
      console.error('❌ File context retrieval failed:', error);
      return null;
    }
  }

  // Conversation history management
  async storeConversation(sessionId: string, message: any): Promise<void> {
    try {
      await this.cacheStore.appendToConversation(sessionId, message);
    } catch (error) {
      console.error('❌ Conversation storage failed:', error);
      throw error;
    }
  }

  async getConversationHistory(sessionId: string): Promise<ConversationHistory | null> {
    try {
      return await this.cacheStore.getConversationHistory(sessionId);
    } catch (error) {
      console.error('❌ Conversation history retrieval failed:', error);
      return null;
    }
  }

  // Session management
  async storeSessionData(sessionId: string, data: any): Promise<void> {
    try {
      await this.cacheStore.storeSessionData(sessionId, data);
    } catch (error) {
      console.error('❌ Session data storage failed:', error);
      throw error;
    }
  }

  async getSessionData(sessionId: string): Promise<any | null> {
    try {
      return await this.cacheStore.getSessionData(sessionId);
    } catch (error) {
      console.error('❌ Session data retrieval failed:', error);
      return null;
    }
  }

  // Enhanced workspace updates with cache invalidation
  async updateWorkspaceFile(file: any, analysis: any): Promise<void> {
    try {
      // Update vector store
      await super.updateWorkspaceFile(file, analysis);
      
      // Invalidate cache for this file
      await this.cacheStore.invalidateAST(file.path);
      
      // Store new file context if AST is available
      if (analysis.ast) {
        await this.cacheStore.storeAST(file.path, analysis.ast);
      }
      
      console.log(`🔄 Updated workspace and cache for: ${file.path}`);
    } catch (error) {
      console.error('❌ Enhanced workspace update failed:', error);
      throw error;
    }
  }

  // Performance monitoring
  async getEnhancedStats(): Promise<{
    ragStats: any;
    cacheStats: CacheStats;
    combinedStats: {
      totalQueries: number;
      cacheHitRate: number;
      averageQueryTime: number;
      memoryUsage: number;
    };
  }> {
    try {
      const ragStats = await super.getSystemStats();
      const cacheStats = await this.cacheStore.getCacheStats();
      
      // Calculate combined stats
      const combinedStats = {
        totalQueries: ragStats.retrievalStats?.totalQueries || 0,
        cacheHitRate: cacheStats.hitRate,
        averageQueryTime: ragStats.retrievalStats?.averageQueryTime || 0,
        memoryUsage: cacheStats.memoryUsage
      };

      return {
        ragStats,
        cacheStats,
        combinedStats
      };
    } catch (error) {
      console.error('❌ Enhanced stats retrieval failed:', error);
      throw error;
    }
  }

  // Cache management
  async clearCache(): Promise<void> {
    try {
      await this.cacheStore.clearCache();
      console.log('🗑️ Cache cleared successfully');
    } catch (error) {
      console.error('❌ Cache clearing failed:', error);
      throw error;
    }
  }

  // Helper methods
  private async createASTContext(query: string, agentType: string, ast: ASTNode, filePath: string): Promise<ContextChunk[]> {
    // Create context chunks from AST nodes
    const astChunks: ContextChunk[] = [];
    
    const processNode = (node: ASTNode) => {
      if (node.name && this.isRelevantToQuery(node, query, agentType)) {
        astChunks.push({
          id: `ast_${filePath}_${node.name}`,
          content: this.extractNodeContent(node),
          embeddings: [], // Would be generated on demand
          metadata: {
            source: 'workspace',
            filePath,
            functionName: node.name,
            language: this.getLanguageFromFile(filePath),
            tags: ['ast', 'function', 'code'],
            quality: 80,
            createdAt: new Date()
          }
        });
      }
      
      if (node.children) {
        node.children.forEach(processNode);
      }
    };
    
    processNode(ast);
    return astChunks;
  }

  private isRelevantToQuery(node: ASTNode, query: string, agentType: string): boolean {
    if (!node.name) return false;
    
    const queryLower = query.toLowerCase();
    const nodeNameLower = node.name.toLowerCase();
    
    // Simple relevance check - could be enhanced with semantic matching
    return queryLower.includes(nodeNameLower) || 
           nodeNameLower.includes(queryLower) ||
           this.isAgentSpecificRelevant(node, agentType);
  }

  private isAgentSpecificRelevant(node: ASTNode, agentType: string): boolean {
    switch (agentType) {
      case 'scriba':
        return node.type === 'function' || node.type === 'method';
      case 'architectus':
        return node.type === 'class' || node.type === 'interface';
      case 'auditor':
        return node.type === 'function' || node.type === 'method';
      default:
        return true;
    }
  }

  private extractNodeContent(node: ASTNode): string {
    // Extract the actual code content for the node
    // This would need to be implemented based on the AST structure
    return `// ${node.type}: ${node.name || 'anonymous'}`;
  }

  private extractFunctions(ast: ASTNode): any[] {
    const functions: any[] = [];
    
    const findFunctions = (node: ASTNode) => {
      if (node.type === 'function' || node.type === 'method') {
        functions.push({
          name: node.name,
          startLine: node.startLine,
          endLine: node.endLine,
          type: node.type
        });
      }
      
      if (node.children) {
        node.children.forEach(findFunctions);
      }
    };
    
    findFunctions(ast);
    return functions;
  }

  private extractClasses(ast: ASTNode): any[] {
    const classes: any[] = [];
    
    const findClasses = (node: ASTNode) => {
      if (node.type === 'class' || node.type === 'interface') {
        classes.push({
          name: node.name,
          startLine: node.startLine,
          endLine: node.endLine,
          type: node.type
        });
      }
      
      if (node.children) {
        node.children.forEach(findClasses);
      }
    };
    
    findClasses(ast);
    return classes;
  }

  private extractImports(ast: ASTNode): any[] {
    const imports: any[] = [];
    
    const findImports = (node: ASTNode) => {
      if (node.type === 'import') {
        imports.push({
          source: node.name,
          startLine: node.startLine,
          endLine: node.endLine
        });
      }
      
      if (node.children) {
        node.children.forEach(findImports);
      }
    };
    
    findImports(ast);
    return imports;
  }

  private extractExports(ast: ASTNode): any[] {
    const exports: any[] = [];
    
    const findExports = (node: ASTNode) => {
      if (node.type === 'export') {
        exports.push({
          name: node.name,
          startLine: node.startLine,
          endLine: node.endLine
        });
      }
      
      if (node.children) {
        node.children.forEach(findExports);
      }
    };
    
    findExports(ast);
    return exports;
  }

  private rankByRelevance(chunks: ContextChunk[], query: string): ContextChunk[] {
    // Simple ranking - could be enhanced with semantic similarity
    return chunks.sort((a, b) => {
      const aRelevance = this.calculateRelevance(a, query);
      const bRelevance = this.calculateRelevance(b, query);
      return bRelevance - aRelevance;
    });
  }

  private calculateRelevance(chunk: ContextChunk, query: string): number {
    const queryWords = query.toLowerCase().split(' ');
    const contentWords = chunk.content.toLowerCase().split(' ');
    
    let relevance = 0;
    queryWords.forEach(word => {
      if (contentWords.includes(word)) {
        relevance += 1;
      }
    });
    
    return relevance / queryWords.length;
  }

  async close(): Promise<void> {
    try {
      await this.cacheStore.close();
      console.log('🔌 Enhanced RAG System closed');
    } catch (error) {
      console.error('❌ Enhanced RAG System closure failed:', error);
    }
  }
} 