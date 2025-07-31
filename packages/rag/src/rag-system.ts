import { RAGConfig, RAGQuery, RAGResult, ContextChunk, EmbeddingMetadata, RAGError, RAGErrorCode, VectorDatabase, EmbeddingEngine, RetrievalEngine } from './types';
import { SupabaseVectorDB } from './vector-database';
import { OpenAIEmbeddingEngine } from './embedding-engine';
import { IntelligentRetrievalEngine } from './retrieval-engine';

export class RAGSystem {
  private config: RAGConfig;
  private vectorDB: VectorDatabase;
  private embeddingEngine: EmbeddingEngine;
  private retrievalEngine: RetrievalEngine;
  private isInitialized: boolean = false;

  constructor(config: RAGConfig) {
    this.config = config;
    this.vectorDB = new SupabaseVectorDB(config.supabaseUrl, config.supabaseKey);
    this.embeddingEngine = new OpenAIEmbeddingEngine(config.openaiApiKey, config.embeddingModel);
    this.retrievalEngine = new IntelligentRetrievalEngine(this.vectorDB, this.embeddingEngine);
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing RAG System...');
      
      // Test vector database connection
      await this.vectorDB.getStats();
      console.log('✅ Vector database connection established');
      
      // Test embedding engine
      const modelInfo = await this.embeddingEngine.getModelInfo();
      console.log(`✅ Embedding engine ready: ${modelInfo.model} (${modelInfo.dimensions} dimensions)`);
      
      // Create database index if needed
      await this.vectorDB.createIndex();
      
      this.isInitialized = true;
      console.log('✅ RAG System initialized successfully');
    } catch (error) {
      console.error('❌ RAG System initialization failed:', error);
      throw new RAGError({
        message: `RAG System initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: RAGErrorCode.VECTOR_DB_ERROR,
        context: { error },
        recoverable: false
      });
    }
  }

  async retrieveContext(query: string, agentType: string, context: any = {}): Promise<ContextChunk[]> {
    if (!this.isInitialized) {
      throw new RAGError({
        message: 'RAG System not initialized',
        code: RAGErrorCode.VECTOR_DB_ERROR,
        context: {},
        recoverable: false
      });
    }

    try {
      const ragQuery: RAGQuery = {
        query,
        agentType,
        context,
        maxResults: this.config.maxResults,
        similarityThreshold: this.config.similarityThreshold
      };

      const result = await this.retrievalEngine.retrieve(ragQuery);
      return result.chunks;
    } catch (error) {
      console.error('❌ Context retrieval failed:', error);
      throw error;
    }
  }

  async updateKnowledgeBase(code: string, metadata: Partial<EmbeddingMetadata>): Promise<void> {
    if (!this.isInitialized) {
      throw new RAGError({
        message: 'RAG System not initialized',
        code: RAGErrorCode.VECTOR_DB_ERROR,
        context: {},
        recoverable: false
      });
    }

    try {
      // Generate embeddings
      const embeddings = await this.embeddingEngine.embed(code);
      
      // Validate embeddings
      const isValid = await this.embeddingEngine.validateEmbeddings(embeddings);
      if (!isValid) {
        throw new RAGError({
          message: 'Generated embeddings are invalid',
          code: RAGErrorCode.EMBEDDING_FAILED,
          context: { code: code.substring(0, 100) },
          recoverable: true
        });
      }

      // Create context chunk
      const chunk: ContextChunk = {
        id: this.generateChunkId(),
        content: code,
        embeddings,
        metadata: {
          source: metadata.source || 'workspace',
          filePath: metadata.filePath,
          functionName: metadata.functionName,
          className: metadata.className,
          language: metadata.language || 'javascript',
          tags: metadata.tags || [],
          quality: metadata.quality || 70,
          createdAt: new Date()
        }
      };

      // Insert into vector database
      await this.vectorDB.insert(chunk);
      
      console.log(`📚 Updated knowledge base with chunk: ${chunk.id}`);
    } catch (error) {
      console.error('❌ Knowledge base update failed:', error);
      throw error;
    }
  }

  async updateWorkspaceFile(file: any, analysis: any): Promise<void> {
    try {
      // Extract functions and classes from analysis
      const chunks: ContextChunk[] = [];
      
      // Add functions
      if (analysis.functions) {
        for (const func of analysis.functions) {
          const functionCode = this.extractFunctionCode(file.content, func);
          if (functionCode) {
            chunks.push({
              id: this.generateChunkId(),
              content: functionCode,
              embeddings: await this.embeddingEngine.embed(functionCode),
              metadata: {
                source: 'workspace',
                filePath: file.path,
                functionName: func.name,
                language: this.getLanguageFromFile(file.name),
                tags: ['function', 'code', 'implementation'],
                quality: analysis.quality?.score || 70,
                createdAt: new Date()
              }
            });
          }
        }
      }

      // Add classes
      if (analysis.classes) {
        for (const cls of analysis.classes) {
          const classCode = this.extractClassCode(file.content, cls);
          if (classCode) {
            chunks.push({
              id: this.generateChunkId(),
              content: classCode,
              embeddings: await this.embeddingEngine.embed(classCode),
              metadata: {
                source: 'workspace',
                filePath: file.path,
                className: cls.name,
                language: this.getLanguageFromFile(file.name),
                tags: ['class', 'code', 'implementation'],
                quality: analysis.quality?.score || 70,
                createdAt: new Date()
              }
            });
          }
        }
      }

      // Insert all chunks
      for (const chunk of chunks) {
        await this.vectorDB.insert(chunk);
      }

      console.log(`📚 Updated workspace with ${chunks.length} chunks from ${file.name}`);
    } catch (error) {
      console.error('❌ Workspace update failed:', error);
      throw error;
    }
  }

  async getRelevantExamples(query: string, agentType: string): Promise<ContextChunk[]> {
    try {
      const examples = await this.retrieveContext(query, agentType);
      
      // Filter for best practices and documentation
      const relevantExamples = examples.filter(chunk => 
        chunk.metadata.source === 'best-practices' || 
        chunk.metadata.source === 'documentation'
      );

      return relevantExamples.slice(0, 5); // Return top 5 examples
    } catch (error) {
      console.error('❌ Example retrieval failed:', error);
      return [];
    }
  }

  async getSimilarCode(code: string, language: string): Promise<ContextChunk[]> {
    try {
      const query = `similar code in ${language}: ${code.substring(0, 200)}`;
      const similarCode = await this.retrieveContext(query, 'scriba');
      
      // Filter by language
      const languageSpecificCode = similarCode.filter(chunk => 
        chunk.metadata.language === language
      );

      return languageSpecificCode.slice(0, 3); // Return top 3 similar code snippets
    } catch (error) {
      console.error('❌ Similar code retrieval failed:', error);
      return [];
    }
  }

  async getSystemStats(): Promise<{
    totalChunks: number;
    totalSize: number;
    modelInfo: { model: string; dimensions: number };
    retrievalStats: any;
  }> {
    try {
      const stats = await this.vectorDB.getStats();
      const modelInfo = await this.embeddingEngine.getModelInfo();
      const retrievalStats = await this.retrievalEngine.getRetrievalStats();

      return {
        totalChunks: stats.totalChunks,
        totalSize: stats.totalSize,
        modelInfo,
        retrievalStats
      };
    } catch (error) {
      console.error('❌ Stats retrieval failed:', error);
      throw error;
    }
  }

  // Helper methods
  private generateChunkId(): string {
    return `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractFunctionCode(content: string, func: any): string | null {
    // Simple extraction - in practice, you'd use AST analysis
    const lines = content.split('\n');
    const startLine = func.startLine - 1;
    const endLine = func.endLine;
    
    if (startLine >= 0 && endLine <= lines.length) {
      return lines.slice(startLine, endLine).join('\n');
    }
    
    return null;
  }

  private extractClassCode(content: string, cls: any): string | null {
    // Simple extraction - in practice, you'd use AST analysis
    const lines = content.split('\n');
    const startLine = cls.startLine - 1;
    const endLine = cls.endLine;
    
    if (startLine >= 0 && endLine <= lines.length) {
      return lines.slice(startLine, endLine).join('\n');
    }
    
    return null;
  }

  private getLanguageFromFile(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'cpp': 'cpp',
      'c': 'c'
    };
    
    return languageMap[ext || ''] || 'javascript';
  }

  // Agent-specific methods
  async getArchitectusContext(requirements: string): Promise<ContextChunk[]> {
    return this.retrieveContext(
      `architecture patterns and design principles for: ${requirements}`,
      'architectus'
    );
  }

  async getScribaContext(task: string, language: string): Promise<ContextChunk[]> {
    return this.retrieveContext(
      `code implementation examples in ${language} for: ${task}`,
      'scriba'
    );
  }

  async getAuditorContext(code: string): Promise<ContextChunk[]> {
    return this.retrieveContext(
      `code quality and best practices for: ${code.substring(0, 200)}`,
      'auditor'
    );
  }

  async getGenesisContext(requirements: string): Promise<ContextChunk[]> {
    return this.retrieveContext(
      `frontend and UI patterns for: ${requirements}`,
      'genesis'
    );
  }

  async getExecutorContext(task: string): Promise<ContextChunk[]> {
    return this.retrieveContext(
      `deployment and automation for: ${task}`,
      'executor'
    );
  }

  async getPrometheusContext(workflow: string): Promise<ContextChunk[]> {
    return this.retrieveContext(
      `project management and coordination for: ${workflow}`,
      'prometheus'
    );
  }
}

 