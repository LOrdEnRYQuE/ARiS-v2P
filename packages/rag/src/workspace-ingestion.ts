import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { RAGSystem } from './rag-system';
import { RAGConfigLoader } from './config-loader';
import { EmbeddingMetadata } from './types';

export class WorkspaceIngestion {
  private ragSystem: RAGSystem;
  private config: any;
  private processedFiles: Set<string> = new Set();

  constructor() {
    const configLoader = RAGConfigLoader.getInstance();
    this.config = configLoader.getConfig();
    this.ragSystem = new RAGSystem(this.config);
  }

  async initialize(): Promise<void> {
    await this.ragSystem.initialize();
    console.log('🚀 Workspace ingestion system initialized');
  }

  async ingestWorkspace(workspacePath: string = process.cwd()): Promise<void> {
    console.log(`📚 Starting workspace ingestion from: ${workspacePath}`);

    try {
      // Get all relevant files
      const files = await this.getRelevantFiles(workspacePath);
      console.log(`📁 Found ${files.length} files to process`);

      // Process files in batches
      const batchSize = this.config.batchSize || 50;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        await this.processBatch(batch, workspacePath);

        console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)}`);
      }

      console.log(`🎉 Workspace ingestion completed! Processed ${this.processedFiles.size} files`);
    } catch (error) {
      console.error('❌ Workspace ingestion failed:', error);
      throw error;
    }
  }

  private async getRelevantFiles(workspacePath: string): Promise<string[]> {
    const fileTypes = this.config.sources?.workspace?.fileTypes || ['.js', '.ts', '.py', '.java', '.go', '.rs', '.cpp', '.c'];
    const excludePatterns = this.config.sources?.workspace?.excludePatterns || ['node_modules', 'dist', 'build', '.git'];
    const maxFileSize = this.config.sources?.workspace?.maxFileSize || 1000000;

    const patterns = fileTypes.map((ext: string) => `**/*${ext}`);
    const excludePatternsGlob = excludePatterns.map((pattern: string) => `**/${pattern}/**`);

    const files: string[] = [];

    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: workspacePath,
        ignore: excludePatternsGlob,
        absolute: true
      });

      for (const file of matches) {
        try {
          const stats = fs.statSync(file);
          if (stats.size <= maxFileSize) {
            files.push(file);
          }
        } catch (error) {
          console.warn(`⚠️  Could not access file: ${file}`);
        }
      }
    }

    return files;
  }

  private async processBatch(files: string[], workspacePath: string): Promise<void> {
    const promises = files.map(file => this.processFile(file, workspacePath));
    await Promise.allSettled(promises);
  }

  private async processFile(filePath: string, workspacePath: string): Promise<void> {
    try {
      const relativePath = path.relative(workspacePath, filePath);

      // Skip if already processed
      if (this.processedFiles.has(relativePath)) {
        return;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const language = this.getLanguageFromFile(filePath);

      // Create metadata
      const metadata: Partial<EmbeddingMetadata> = {
        source: 'workspace',
        filePath: relativePath,
        language,
        tags: ['code', 'implementation', language],
        quality: 80, // Default quality score
        createdAt: new Date()
      };

      // Extract functions and classes if possible
      const analysis = await this.analyzeFile(content, language);

      // Update metadata with analysis results
      if (analysis.functions) {
        metadata.functions = analysis.functions.length;
      }
      if (analysis.classes) {
        metadata.classes = analysis.classes.length;
      }
      if (analysis.quality) {
        metadata.quality = analysis.quality.score;
      }

      // Update the RAG system
      await this.ragSystem.updateKnowledgeBase(content, metadata);

      this.processedFiles.add(relativePath);
      console.log(`✅ Processed: ${relativePath}`);
    } catch (error) {
      console.error(`❌ Failed to process file ${filePath}:`, error);
    }
  }

  private async analyzeFile(content: string, language: string): Promise<any> {
    // Simple analysis - in practice, you'd use the AST analyzer
    const lines = content.split('\n');
    const functions: any[] = [];
    const classes: any[] = [];

    // Simple function detection (basic regex)
    const functionRegex = /(?:function\s+(\w+)|(\w+)\s*[:=]\s*function|(\w+)\s*[:=]\s*\([^)]*\)\s*=>)/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1] || match[2] || match[3];
      if (functionName) {
        functions.push({
          name: functionName,
          startLine: this.getLineNumber(content, match.index),
          endLine: this.getLineNumber(content, match.index + match[0].length)
        });
      }
    }

    // Simple class detection
    const classRegex = /class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      classes.push({
        name: match[1],
        startLine: this.getLineNumber(content, match.index),
        endLine: this.getLineNumber(content, match.index + match[0].length)
      });
    }

    // Calculate quality score
    const quality = this.calculateQuality(content, functions, classes);

    return {
      functions,
      classes,
      quality
    };
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private calculateQuality(content: string, functions: any[], classes: any[]): { score: number; issues: string[] } {
    let score = 100;
    const issues: string[] = [];

    // Check for basic quality indicators
    const lines = content.split('\n');

    // Check for empty lines
    const emptyLines = lines.filter(line => line.trim() === '').length;
    if (emptyLines > lines.length * 0.3) {
      score -= 10;
      issues.push('Too many empty lines');
    }

    // Check for long lines
    const longLines = lines.filter(line => line.length > 120).length;
    if (longLines > 0) {
      score -= Math.min(20, longLines * 5);
      issues.push('Long lines detected');
    }

    // Check for functions
    if (functions.length === 0 && content.length > 100) {
      score -= 15;
      issues.push('No functions detected in large file');
    }

    // Check for comments
    const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*')).length;
    if (commentLines < lines.length * 0.1) {
      score -= 5;
      issues.push('Low comment ratio');
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }

  private getLanguageFromFile(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.php': 'php',
      '.rb': 'ruby',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.scala': 'scala'
    };

    return languageMap[ext] || 'unknown';
  }

  async ingestDocumentation(workspacePath: string = process.cwd()): Promise<void> {
    console.log('📖 Starting documentation ingestion...');

    const docPatterns = this.config.sources?.documentation?.sources || ['README.md', 'docs/**/*.md', '*.md'];
    const maxFileSize = this.config.sources?.documentation?.maxFileSize || 500000;

    for (const pattern of docPatterns) {
      try {
        const files = await glob(pattern, {
          cwd: workspacePath,
          absolute: true
        });

        for (const file of files) {
          try {
            const stats = fs.statSync(file);
            if (stats.size <= maxFileSize) {
              const content = fs.readFileSync(file, 'utf-8');
              const relativePath = path.relative(workspacePath, file);

              const metadata: Partial<EmbeddingMetadata> = {
                source: 'documentation',
                filePath: relativePath,
                language: 'markdown',
                tags: ['documentation', 'markdown', 'guide'],
                quality: 90,
                createdAt: new Date()
              };

              await this.ragSystem.updateKnowledgeBase(content, metadata);
              console.log(`✅ Processed documentation: ${relativePath}`);
            }
          } catch (error) {
            console.error(`❌ Failed to process documentation file ${file}:`, error);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to process documentation pattern ${pattern}:`, error);
      }
    }
  }

  async getIngestionStats(): Promise<{
    processedFiles: number;
    totalSize: number;
    languages: Record<string, number>;
    sources: Record<string, number>;
  }> {
    const stats = await this.ragSystem.getSystemStats();

    return {
      processedFiles: this.processedFiles.size,
      totalSize: stats.totalSize,
      languages: {}, // Would need to track this
      sources: {} // Would need to track this
    };
  }
} 