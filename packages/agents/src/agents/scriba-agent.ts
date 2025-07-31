import { BaseAgent } from './base-agent';
import { AgentType, Task, Result, Blueprint, File } from '@aris/shared';
import { OpenAIService, LLMConfig } from '@aris/llm';

export class ScribaAgent extends BaseAgent {
  private llmService?: OpenAIService;

  constructor() {
    super(
      'scriba_001',
      AgentType.SCRIBA_BACKEND,
      'Scriba',
      'Code Generation Specialist - Generates code based on blueprints',
      [
        'code_generation',
        'file_creation',
        'syntax_validation',
        'template_processing'
      ]
    );
  }

  /**
   * Initialize the LLM service
   */
  public async initializeLLM(config: LLMConfig): Promise<void> {
    this.llmService = new OpenAIService(config);
    console.log('Scriba LLM service initialized');
  }

  /**
   * Process a task - specifically code generation
   */
  public async processTask(task: Task): Promise<Result<any>> {
    try {
      console.log(`Scriba processing task: ${task.type}`);

      // Extract blueprint and file information from task
      const taskData = this.extractTaskData(task);
      
      if (!taskData.blueprint || !taskData.file) {
        return {
          success: false,
          error: 'Scriba requires blueprint and file information'
        };
      }

      // Use LLM service if available, otherwise fall back to simple generation
      if (this.llmService) {
        try {
          const code = await this.llmService.generateCode(taskData.blueprint, taskData.file);
          
          return {
            success: true,
            data: {
              code,
              fileName: taskData.file.name,
              filePath: taskData.filePath,
              blueprintId: taskData.blueprint.id
            },
            metadata: {
              agent: this.name,
              taskId: task.id,
              timestamp: new Date(),
              fileType: taskData.file.extension
            }
          };
        } catch (error) {
          console.log('LLM code generation failed, falling back to simple generation');
          const code = await this.generateSimpleCode(taskData.file);
          
          return {
            success: true,
            data: {
              code,
              fileName: taskData.file.name,
              filePath: taskData.filePath,
              blueprintId: taskData.blueprint.id
            },
            metadata: {
              agent: this.name,
              taskId: task.id,
              timestamp: new Date(),
              fileType: taskData.file.extension
            }
          };
        }
      } else {
        // Use simple generation if LLM service not initialized
        const code = await this.generateSimpleCode(taskData.file);
        
        return {
          success: true,
          data: {
            code,
            fileName: taskData.file.name,
            filePath: taskData.filePath,
            blueprintId: taskData.blueprint.id
          },
          metadata: {
            agent: this.name,
            taskId: task.id,
            timestamp: new Date(),
            fileType: taskData.file.extension
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Scriba failed to process task: ${error}`
      };
    }
  }

  /**
   * Extract blueprint and file data from task
   */
  private extractTaskData(task: Task): { blueprint: Blueprint; file: File; filePath: string } {
    // This would typically come from the task content or be passed as parameters
    // For now, we'll create a simple example
    const blueprint: Blueprint = {
      id: `blueprint_${Date.now()}`,
      projectId: task.id,
      fileStructure: {
        root: {
          name: 'project',
          type: 'directory',
          children: []
        }
      },
      apiContracts: [],
      databaseSchema: { tables: [] },
      technologies: [],
      createdAt: new Date()
    };

    // Extract file information from task description or title
    let fileName = 'index.js';
    let extension = 'js';

    // Try to extract file information from task description
    if (task.description) {
      const fileMatch = task.description.match(/(\w+)\.(\w+)/);
      if (fileMatch) {
        fileName = fileMatch[1] + '.' + fileMatch[2];
        extension = fileMatch[2];
      }
    }

    // Try to extract from title
    if (task.type) {
      const titleMatch = task.type.match(/(\w+)\.(\w+)/);
      if (titleMatch) {
        fileName = titleMatch[1] + '.' + titleMatch[2];
        extension = titleMatch[2];
      }
    }

    const file: File = {
      name: fileName,
      type: 'file',
      extension: extension,
      content: ''
    };

    const filePath = `src/${file.name}`;

    return { blueprint, file, filePath };
  }

  /**
   * Generate simple code based on file type
   */
  private async generateSimpleCode(file: File): Promise<string> {
    const fileName = file.name;
    const extension = file.extension;

    switch (extension) {
      case 'js':
        return this.generateJavaScriptCode(fileName);
      case 'ts':
        return this.generateTypeScriptCode(fileName);
      case 'json':
        return this.generateJSONCode(fileName);
      case 'md':
        return this.generateMarkdownCode(fileName);
      case 'html':
        return this.generateHTMLCode(fileName);
      case 'css':
        return this.generateCSSCode(fileName);
      default:
        return this.generateGenericCode(fileName, extension);
    }
  }

  /**
   * Generate JavaScript code
   */
  private generateJavaScriptCode(fileName: string): string {
    return `// Generated by ARiS - ${fileName}
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from ARiS!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`;
  }

  /**
   * Generate TypeScript code
   */
  private generateTypeScriptCode(fileName: string): string {
    return `// Generated by ARiS - ${fileName}
import express, { Request, Response, NextFunction } from 'express';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from ARiS!' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

export default app;`;
  }

  /**
   * Generate JSON code
   */
  private generateJSONCode(fileName: string): string {
    return `{
  "name": "aris-generated-project",
  "version": "1.0.0",
  "description": "Generated by ARiS - ${fileName}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0",
    "jest": "^29.0.0"
  }
}`;
  }

  /**
   * Generate Markdown code
   */
  private generateMarkdownCode(fileName: string): string {
    return `# Generated by ARiS - ${fileName}

This file was generated by the ARiS system.

## Description

This is a placeholder file generated by ARiS. Replace this content with your actual documentation.

## Usage

1. Update this file with your project documentation
2. Add installation instructions
3. Include API documentation
4. Add examples and usage patterns

## Contributing

Please follow the project's coding standards and testing requirements.

---

*Generated by ARiS - Agentic Reactive Intelligence System*`;
  }

  /**
   * Generate HTML code
   */
  private generateHTMLCode(fileName: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated by ARiS - ${fileName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to ARiS</h1>
        <p>This page was generated by the Agentic Reactive Intelligence System</p>
    </header>
    
    <main>
        <section>
            <h2>Getting Started</h2>
            <p>This is a placeholder HTML file. Replace this content with your actual application.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2025 ARiS - Generated Code</p>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`;
  }

  /**
   * Generate CSS code
   */
  private generateCSSCode(fileName: string): string {
    return `/* Generated by ARiS - ${fileName} */

/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
}

/* Header styles */
header {
    background-color: #007bff;
    color: white;
    padding: 2rem 0;
    text-align: center;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

/* Main content */
main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

section {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
}

h2 {
    color: #007bff;
    margin-bottom: 1rem;
}

/* Footer */
footer {
    text-align: center;
    padding: 2rem;
    background-color: #f8f9fa;
    border-top: 1px solid #dee2e6;
}

/* Responsive design */
@media (max-width: 768px) {
    header h1 {
        font-size: 2rem;
    }
    
    main {
        padding: 1rem;
    }
}`;
  }

  /**
   * Generate generic code for unknown file types
   */
  private generateGenericCode(fileName: string, extension: string): string {
    return `# Generated by ARiS - ${fileName}

This is a ${extension} file generated by the ARiS system.

## TODO: Add your content here

This file was automatically generated. Please replace this content with your actual implementation.

## File Information
- Name: ${fileName}
- Type: ${extension}
- Generated: ${new Date().toISOString()}

---

*Generated by ARiS - Agentic Reactive Intelligence System*`;
  }
} 