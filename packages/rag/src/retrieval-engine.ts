import { RetrievalEngine, RAGQuery, RAGResult, ContextChunk, RAGError, RAGErrorCode, VectorDatabase, EmbeddingEngine } from './types';

export class IntelligentRetrievalEngine implements RetrievalEngine {
  private vectorDB: VectorDatabase;
  private embeddingEngine: EmbeddingEngine;
  private cache: Map<string, ContextChunk[]> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor(vectorDB: VectorDatabase, embeddingEngine: EmbeddingEngine) {
    this.vectorDB = vectorDB;
    this.embeddingEngine = embeddingEngine;
  }

  async retrieve(query: RAGQuery): Promise<RAGResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Retrieving context for agent: ${query.agentType}`);
      
      // Generate embeddings for the query
      const queryEmbeddings = await this.embeddingEngine.embed(query.query);
      
      // Perform similarity search
      const similarChunks = await this.vectorDB.similaritySearch(
        queryEmbeddings,
        query.maxResults * 2 // Get more results for filtering
      );
      
      // Filter by relevance to agent type
      const relevantChunks = await this.filterByRelevance(similarChunks, query.agentType);
      
      // Rank by relevance to query
      const rankedChunks = await this.rankByRelevance(relevantChunks, query.query);
      
      // Apply similarity threshold
      const filteredChunks = rankedChunks.filter(chunk => 
        (chunk.similarity || 0) >= query.similarityThreshold
      );
      
      // Limit results
      const finalChunks = filteredChunks.slice(0, query.maxResults);
      
      const queryTime = Date.now() - startTime;
      const relevanceScore = this.calculateOverallRelevance(finalChunks);
      
      console.log(`✅ Retrieved ${finalChunks.length} relevant chunks in ${queryTime}ms`);
      
      return {
        chunks: finalChunks,
        totalResults: finalChunks.length,
        queryTime,
        relevanceScore
      };
      
    } catch (error) {
      console.error('❌ Retrieval error:', error);
      throw new RAGError({
        message: `Retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: RAGErrorCode.VECTOR_DB_ERROR,
        context: { query, error },
        recoverable: true
      });
    }
  }

  async filterByRelevance(chunks: ContextChunk[], agentType: string): Promise<ContextChunk[]> {
    const agentTypeFilters = this.getAgentTypeFilters(agentType);
    
    return chunks.filter(chunk => {
      // Check metadata relevance
      const metadata = chunk.metadata;
      
      // Filter by source type
      if (agentTypeFilters.sources && !agentTypeFilters.sources.includes(metadata.source)) {
        return false;
      }
      
      // Filter by language
      if (agentTypeFilters.languages && !agentTypeFilters.languages.includes(metadata.language)) {
        return false;
      }
      
      // Filter by tags
      if (agentTypeFilters.tags && !this.hasMatchingTags(metadata.tags, agentTypeFilters.tags)) {
        return false;
      }
      
      // Filter by quality threshold
      if (metadata.quality < agentTypeFilters.minQuality) {
        return false;
      }
      
      return true;
    });
  }

  async rankByRelevance(chunks: ContextChunk[], query: string): Promise<ContextChunk[]> {
    // Create a copy to avoid mutating the original
    const rankedChunks = [...chunks];
    
    // Sort by multiple factors
    rankedChunks.sort((a, b) => {
      // Primary: similarity score
      const similarityDiff = (b.similarity || 0) - (a.similarity || 0);
      if (Math.abs(similarityDiff) > 0.1) {
        return similarityDiff;
      }
      
      // Secondary: quality score
      const qualityDiff = b.metadata.quality - a.metadata.quality;
      if (Math.abs(qualityDiff) > 10) {
        return qualityDiff;
      }
      
      // Tertiary: recency (newer is better)
      const recencyDiff = new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
      return recencyDiff;
    });
    
    return rankedChunks;
  }

  private getAgentTypeFilters(agentType: string): {
    sources: string[];
    languages: string[];
    tags: string[];
    minQuality: number;
  } {
    const filters: Record<string, any> = {
      'architectus': {
        sources: ['workspace', 'best-practices'],
        languages: ['javascript', 'typescript', 'python', 'java', 'go'],
        tags: ['architecture', 'design-patterns', 'structure', 'blueprint'],
        minQuality: 70
      },
      'scriba': {
        sources: ['workspace', 'documentation', 'best-practices'],
        languages: ['javascript', 'typescript', 'python', 'java', 'go'],
        tags: ['implementation', 'code', 'function', 'class', 'api'],
        minQuality: 60
      },
      'auditor': {
        sources: ['workspace', 'best-practices'],
        languages: ['javascript', 'typescript', 'python', 'java', 'go'],
        tags: ['quality', 'security', 'performance', 'testing', 'review'],
        minQuality: 80
      },
      'genesis': {
        sources: ['workspace', 'documentation'],
        languages: ['javascript', 'typescript', 'python', 'java', 'go'],
        tags: ['requirements', 'analysis', 'planning', 'frontend', 'ui'],
        minQuality: 65
      },
      'executor': {
        sources: ['workspace', 'documentation'],
        languages: ['javascript', 'typescript', 'python', 'java', 'go'],
        tags: ['deployment', 'build', 'test', 'ci-cd', 'automation'],
        minQuality: 70
      },
      'prometheus': {
        sources: ['workspace', 'documentation', 'best-practices'],
        languages: ['javascript', 'typescript', 'python', 'java', 'go'],
        tags: ['management', 'coordination', 'workflow', 'planning'],
        minQuality: 75
      }
    };
    
    return filters[agentType] || {
      sources: ['workspace', 'documentation', 'best-practices'],
      languages: ['javascript', 'typescript', 'python', 'java', 'go'],
      tags: [],
      minQuality: 50
    };
  }

  private hasMatchingTags(chunkTags: string[], filterTags: string[]): boolean {
    if (filterTags.length === 0) return true;
    return filterTags.some(tag => chunkTags.includes(tag));
  }

  private calculateOverallRelevance(chunks: ContextChunk[]): number {
    if (chunks.length === 0) return 0;
    
    const totalSimilarity = chunks.reduce((sum, chunk) => sum + (chunk.similarity || 0), 0);
    const totalQuality = chunks.reduce((sum, chunk) => sum + chunk.metadata.quality, 0);
    
    const avgSimilarity = totalSimilarity / chunks.length;
    const avgQuality = totalQuality / chunks.length;
    
    // Weighted combination of similarity and quality
    return (avgSimilarity * 0.7) + (avgQuality / 100 * 0.3);
  }

  // Cache management
  private getCacheKey(query: string, agentType: string): string {
    return `${agentType}:${query.substring(0, 100)}`;
  }

  private getFromCache(key: string): ContextChunk[] | null {
    const cached = this.cache.get(key);
    if (cached) {
      console.log(`📦 Retrieved ${cached.length} chunks from cache`);
      return cached;
    }
    return null;
  }

  private setCache(key: string, chunks: ContextChunk[]): void {
    this.cache.set(key, chunks);
    
    // Clean up old cache entries
    setTimeout(() => {
      this.cache.delete(key);
    }, this.cacheTimeout);
  }

  // Performance monitoring
  async getRetrievalStats(): Promise<{
    totalQueries: number;
    averageQueryTime: number;
    cacheHitRate: number;
    averageRelevanceScore: number;
  }> {
    // This would typically track metrics over time
    return {
      totalQueries: 0,
      averageQueryTime: 0,
      cacheHitRate: 0,
      averageRelevanceScore: 0
    };
  }
}

 