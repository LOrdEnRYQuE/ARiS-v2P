import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { VectorDatabase, ContextChunk, RAGError, RAGErrorCode } from './types';

export class SupabaseVectorDB implements VectorDatabase {
  private client: SupabaseClient;
  private tableName: string = 'code_chunks';

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });
  }

  async insert(chunk: ContextChunk): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .insert({
          id: chunk.id,
          content: chunk.content,
          embeddings: chunk.embeddings,
          metadata: chunk.metadata,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new RAGError({
          message: `Failed to insert chunk: ${error.message}`,
          code: RAGErrorCode.VECTOR_DB_ERROR,
          context: { chunkId: chunk.id, error },
          recoverable: true
        });
      }

      console.log(`✅ Inserted chunk: ${chunk.id}`);
    } catch (error) {
      console.error('❌ Vector DB insert error:', error);
      throw error;
    }
  }

  async similaritySearch(embeddings: number[], limit: number = 10): Promise<ContextChunk[]> {
    try {
      const { data, error } = await this.client.rpc('match_code_chunks', {
        query_embedding: embeddings,
        match_threshold: 0.7,
        match_count: limit
      });

      if (error) {
        throw new RAGError({
          message: `Similarity search failed: ${error.message}`,
          code: RAGErrorCode.VECTOR_DB_ERROR,
          context: { embeddings, limit, error },
          recoverable: true
        });
      }

      const chunks: ContextChunk[] = data?.map((row: any) => ({
        id: row.id,
        content: row.content,
        embeddings: row.embeddings,
        metadata: row.metadata,
        similarity: row.similarity
      })) || [];

      console.log(`🔍 Found ${chunks.length} similar chunks`);
      return chunks;
    } catch (error) {
      console.error('❌ Vector DB similarity search error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw new RAGError({
          message: `Failed to delete chunk: ${error.message}`,
          code: RAGErrorCode.VECTOR_DB_ERROR,
          context: { chunkId: id, error },
          recoverable: true
        });
      }

      console.log(`🗑️  Deleted chunk: ${id}`);
    } catch (error) {
      console.error('❌ Vector DB delete error:', error);
      throw error;
    }
  }

  async update(chunk: ContextChunk): Promise<void> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .update({
          content: chunk.content,
          embeddings: chunk.embeddings,
          metadata: chunk.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', chunk.id);

      if (error) {
        throw new RAGError({
          message: `Failed to update chunk: ${error.message}`,
          code: RAGErrorCode.VECTOR_DB_ERROR,
          context: { chunkId: chunk.id, error },
          recoverable: true
        });
      }

      console.log(`🔄 Updated chunk: ${chunk.id}`);
    } catch (error) {
      console.error('❌ Vector DB update error:', error);
      throw error;
    }
  }

  async searchByMetadata(metadata: Partial<any>): Promise<ContextChunk[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .match(metadata);

      if (error) {
        throw new RAGError({
          message: `Metadata search failed: ${error.message}`,
          code: RAGErrorCode.VECTOR_DB_ERROR,
          context: { metadata, error },
          recoverable: true
        });
      }

      const chunks: ContextChunk[] = data?.map((row: any) => ({
        id: row.id,
        content: row.content,
        embeddings: row.embeddings,
        metadata: row.metadata
      })) || [];

      console.log(`🔍 Found ${chunks.length} chunks by metadata`);
      return chunks;
    } catch (error) {
      console.error('❌ Vector DB metadata search error:', error);
      throw error;
    }
  }

  async getStats(): Promise<{ totalChunks: number; totalSize: number }> {
    try {
      // Use the get_code_chunks_stats function we created in the migration
      const { data, error } = await this.client.rpc('get_code_chunks_stats');

      if (error) {
        throw new RAGError({
          message: `Failed to get stats: ${error.message}`,
          code: RAGErrorCode.VECTOR_DB_ERROR,
          context: { error },
          recoverable: true
        });
      }

      const stats = data?.[0] || { total_chunks: 0, total_size: 0 };
      return {
        totalChunks: stats.total_chunks || 0,
        totalSize: stats.total_size || 0
      };
    } catch (error) {
      console.error('❌ Vector DB stats error:', error);
      throw error;
    }
  }

  async createIndex(): Promise<void> {
    try {
      // This would typically be done via SQL migration
      // For now, we'll just log that indexing is ready
      console.log('📊 Vector database indexing ready');
    } catch (error) {
      console.error('❌ Vector DB index creation error:', error);
      throw error;
    }
  }
}

 