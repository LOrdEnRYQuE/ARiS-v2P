import OpenAI from 'openai';
import { EmbeddingEngine, EmbeddingResult, RAGError, RAGErrorCode } from './types';

export class OpenAIEmbeddingEngine implements EmbeddingEngine {
  private client: OpenAI;
  private model: string;
  private dimensions: number;

  constructor(apiKey: string, model: string = 'text-embedding-3-small') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
    this.dimensions = this.getModelDimensions(model);
  }

  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: text,
        encoding_format: 'float'
      });

      const embeddings = response.data[0]?.embedding;
      if (!embeddings) {
        throw new RAGError({
          message: 'No embeddings returned from OpenAI',
          code: RAGErrorCode.EMBEDDING_FAILED,
          context: { text: text.substring(0, 100) },
          recoverable: false
        });
      }

      console.log(`🔢 Generated embeddings for text (${text.length} chars)`);
      return embeddings;
    } catch (error) {
      console.error('❌ Embedding error:', error);
      throw new RAGError({
        message: `Embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: RAGErrorCode.EMBEDDING_FAILED,
        context: { text: text.substring(0, 100), error },
        recoverable: true
      });
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: texts,
        encoding_format: 'float'
      });

      const embeddings = response.data.map(item => item.embedding);
      
      if (embeddings.length !== texts.length) {
        throw new RAGError({
          message: 'Batch embedding count mismatch',
          code: RAGErrorCode.EMBEDDING_FAILED,
          context: { expected: texts.length, actual: embeddings.length },
          recoverable: false
        });
      }

      console.log(`🔢 Generated batch embeddings for ${texts.length} texts`);
      return embeddings;
    } catch (error) {
      console.error('❌ Batch embedding error:', error);
      throw new RAGError({
        message: `Batch embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: RAGErrorCode.EMBEDDING_FAILED,
        context: { textCount: texts.length, error },
        recoverable: true
      });
    }
  }

  async getModelInfo(): Promise<{ model: string; dimensions: number }> {
    return {
      model: this.model,
      dimensions: this.dimensions
    };
  }

  private getModelDimensions(model: string): number {
    const modelDimensions: Record<string, number> = {
      'text-embedding-3-small': 1536,
      'text-embedding-3-large': 3072,
      'text-embedding-ada-002': 1536
    };

    return modelDimensions[model] || 1536;
  }

  async validateEmbeddings(embeddings: number[]): Promise<boolean> {
    if (!embeddings || embeddings.length === 0) {
      return false;
    }

    if (embeddings.length !== this.dimensions) {
      console.warn(`⚠️  Embedding dimensions mismatch: expected ${this.dimensions}, got ${embeddings.length}`);
      return false;
    }

    // Check for NaN or infinite values
    const hasInvalidValues = embeddings.some(value => 
      isNaN(value) || !isFinite(value)
    );

    if (hasInvalidValues) {
      console.warn('⚠️  Embeddings contain invalid values');
      return false;
    }

    return true;
  }

  async normalizeEmbeddings(embeddings: number[]): Promise<number[]> {
    const magnitude = Math.sqrt(embeddings.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitude === 0) {
      return embeddings;
    }

    return embeddings.map(val => val / magnitude);
  }

  async calculateSimilarity(embeddings1: number[], embeddings2: number[]): Promise<number> {
    if (embeddings1.length !== embeddings2.length) {
      throw new RAGError({
        message: 'Embedding dimensions must match for similarity calculation',
        code: RAGErrorCode.EMBEDDING_FAILED,
        context: { dim1: embeddings1.length, dim2: embeddings2.length },
        recoverable: false
      });
    }

    // Cosine similarity
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embeddings1.length; i++) {
      dotProduct += embeddings1[i] * embeddings2[i];
      magnitude1 += embeddings1[i] * embeddings1[i];
      magnitude2 += embeddings2[i] * embeddings2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }
}

 