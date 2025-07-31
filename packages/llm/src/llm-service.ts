import OpenAI from 'openai';
import { LLMService, LLMResponse, LLMConfig, LLMError, RateLimitError, TokenLimitError } from './types';
import { Blueprint, File, Task } from '@aris/shared';
import { PromptEngineer } from './prompt-engineer';
import { ResponseParser } from './response-parser';

export class OpenAIService implements LLMService {
  private client: OpenAI;
  private config: LLMConfig;
  private promptEngineer: PromptEngineer;
  private responseParser: ResponseParser;
  private requestCount = 0;
  private lastRequestTime = 0;

  constructor(config: LLMConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout * 1000, // Convert to milliseconds
    });
    this.promptEngineer = new PromptEngineer();
    this.responseParser = new ResponseParser();
  }

  /**
   * Generate a blueprint from natural language requirements
   */
  async generateBlueprint(requirements: string): Promise<Blueprint> {
    try {
      const prompt = this.promptEngineer.createBlueprintPrompt(requirements);
      const response = await this.makeRequest(prompt);
      
      if (!response.success) {
        throw new LLMError(response.error || 'Failed to generate blueprint', 'BLUEPRINT_GENERATION');
      }

      return this.responseParser.parseBlueprint(response.data);
    } catch (error) {
      throw this.handleError(error, 'generateBlueprint');
    }
  }

  /**
   * Generate code based on a blueprint and file specification
   */
  async generateCode(blueprint: Blueprint, file: File): Promise<string> {
    try {
      const prompt = this.promptEngineer.createCodeGenerationPrompt(blueprint, file);
      const response = await this.makeRequest(prompt);
      
      if (!response.success) {
        throw new LLMError(response.error || 'Failed to generate code', 'CODE_GENERATION');
      }

      return this.responseParser.parseCode(response.data);
    } catch (error) {
      throw this.handleError(error, 'generateCode');
    }
  }

  /**
   * Analyze code for structure, quality, and patterns
   */
  async analyzeCode(code: string): Promise<any> {
    try {
      const prompt = this.promptEngineer.createCodeAnalysisPrompt(code);
      const response = await this.makeRequest(prompt);
      
      if (!response.success) {
        throw new LLMError(response.error || 'Failed to analyze code', 'CODE_ANALYSIS');
      }

      return this.responseParser.parseCodeAnalysis(response.data);
    } catch (error) {
      throw this.handleError(error, 'analyzeCode');
    }
  }

  /**
   * Process a task with the appropriate LLM prompt
   */
  async processTask(task: Task): Promise<LLMResponse> {
    try {
      const prompt = this.promptEngineer.createTaskPrompt(task);
      const response = await this.makeRequest(prompt);
      
      return {
        success: response.success,
        data: response.data,
        error: response.error,
        usage: response.usage,
        metadata: response.metadata
      };
    } catch (error) {
      throw this.handleError(error, 'processTask');
    }
  }

  /**
   * Make a request to the OpenAI API with rate limiting and retry logic
   */
  private async makeRequest(prompt: string): Promise<LLMResponse> {
    // Rate limiting check
    this.checkRateLimit();

    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are ARiS, an intelligent software development assistant. Generate high-quality, production-ready code and technical specifications.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      // Update request tracking
      this.requestCount++;
      this.lastRequestTime = Date.now();

      const response: LLMResponse = {
        success: true,
        data: completion.choices[0]?.message?.content,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        metadata: {
          model: this.config.model,
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
          timestamp: new Date(),
          requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      };

      return response;

    } catch (error: any) {
      return this.handleAPIError(error);
    }
  }

  /**
   * Check rate limiting constraints
   */
  private checkRateLimit(): void {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 60000 / this.config.rateLimit.requestsPerMinute; // Convert to milliseconds

    if (timeSinceLastRequest < minInterval) {
      const retryAfter = Math.ceil((minInterval - timeSinceLastRequest) / 1000);
      throw new RateLimitError(
        `Rate limit exceeded. Please wait ${retryAfter} seconds before making another request.`,
        retryAfter
      );
    }
  }

  /**
   * Handle API errors and convert to our error types
   */
  private handleAPIError(error: any): LLMResponse {
    if (error.status === 429) {
      throw new RateLimitError(
        'Rate limit exceeded. Please try again later.',
        error.headers?.['retry-after'] ? parseInt(error.headers['retry-after']) : undefined
      );
    }

    if (error.status === 400 && error.message?.includes('token')) {
      throw new TokenLimitError(
        'Request exceeds token limit. Please reduce the input size.',
        this.config.maxTokens
      );
    }

    return {
      success: false,
      error: error.message || 'Unknown API error',
      metadata: {
        model: this.config.model,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        timestamp: new Date(),
        requestId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };
  }

  /**
   * Handle and wrap errors with context
   */
  private handleError(error: any, operation: string): LLMError {
    if (error instanceof LLMError) {
      return error;
    }

    return new LLMError(
      `LLM operation '${operation}' failed: ${error.message}`,
      'LLM_OPERATION_FAILED',
      undefined,
      error instanceof RateLimitError
    );
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): { requestCount: number; lastRequestTime: number } {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Recreate client if API key changed
    if (newConfig.apiKey) {
      this.client = new OpenAI({
        apiKey: newConfig.apiKey,
        timeout: this.config.timeout * 1000,
      });
    }
  }
} 