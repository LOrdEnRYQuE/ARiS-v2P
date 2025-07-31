import { Task, Blueprint, File } from '@aris/shared';
import { PromptTemplate, PromptContext, UserPreferences } from './types';

export class PromptEngineer {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Create a prompt for blueprint generation
   */
  createBlueprintPrompt(requirements: string): string {
    const template = this.templates.get('blueprint_generation_enhanced');
    if (!template) {
      // Fall back to basic template
      const basicTemplate = this.templates.get('blueprint_generation');
      if (!basicTemplate) {
        throw new Error('Blueprint generation template not found');
      }
      return this.renderTemplate(basicTemplate, {
        requirements: this.sanitizeInput(requirements),
        timestamp: new Date().toISOString(),
        context: 'Create a comprehensive technical blueprint for a software project'
      });
    }

    return this.renderTemplate(template, {
      requirements: this.sanitizeInput(requirements),
      timestamp: new Date().toISOString(),
      context: 'Create a comprehensive technical blueprint for a software project'
    });
  }

  /**
   * Create a prompt for code generation
   */
  createCodeGenerationPrompt(blueprint: Blueprint, file: File): string {
    const template = this.templates.get('code_generation');
    if (!template) {
      throw new Error('Code generation template not found');
    }

    return this.renderTemplate(template, {
      blueprint: JSON.stringify(blueprint, null, 2),
      fileName: file.name,
      fileExtension: file.extension,
      filePath: this.getFilePath(file),
      context: 'Generate production-ready code based on the blueprint'
    });
  }

  /**
   * Create a prompt for code analysis
   */
  createCodeAnalysisPrompt(code: string): string {
    const template = this.templates.get('code_analysis');
    if (!template) {
      throw new Error('Code analysis template not found');
    }

    return this.renderTemplate(template, {
      code: this.sanitizeInput(code),
      context: 'Analyze the code for structure, quality, and improvement opportunities'
    });
  }

  /**
   * Create a prompt for task processing
   */
  createTaskPrompt(task: Task): string {
    const template = this.templates.get('task_processing');
    if (!template) {
      throw new Error('Task processing template not found');
    }

    return this.renderTemplate(template, {
      taskTitle: task.type,
      taskDescription: task.description,
      taskPriority: task.priority,
      agentType: task.agentType,
      context: `Process this task as a ${task.agentType} agent`
    });
  }

  /**
   * Initialize prompt templates
   */
  private initializeTemplates(): void {
    // Enhanced Blueprint Generation Template
    this.templates.set('blueprint_generation_enhanced', {
      name: 'blueprint_generation_enhanced',
      version: '2.0.0',
      template: `You are ARiS, an expert software architect with deep knowledge of modern software development practices. Create a comprehensive technical blueprint based on the following requirements:

REQUIREMENTS:
{{requirements}}

INSTRUCTIONS:
1. **Analyze Requirements Thoroughly**: Understand the business needs, user stories, and technical constraints
2. **Design Scalable Architecture**: Choose appropriate patterns (MVC, Microservices, Event-Driven, etc.)
3. **Select Technology Stack**: Consider performance, scalability, maintainability, and team expertise
4. **Define File Structure**: Organize code logically with clear separation of concerns
5. **Specify API Contracts**: Design RESTful or GraphQL APIs with proper documentation
6. **Design Database Schema**: Choose appropriate database (SQL/NoSQL) and design schema
7. **Consider Security**: Implement authentication, authorization, and data protection
8. **Plan for Testing**: Include unit tests, integration tests, and E2E testing strategy
9. **Documentation**: Include README, API docs, and deployment instructions
10. **DevOps Integration**: Consider CI/CD, monitoring, and deployment strategies

ARCHITECTURE PATTERNS TO CONSIDER:
- **REST API**: For web services and mobile apps
- **GraphQL**: For flexible data fetching
- **Microservices**: For large, distributed systems
- **Event-Driven**: For real-time applications
- **Serverless**: For cost-effective scaling
- **SPA**: For modern web applications

TECHNOLOGY STACK RECOMMENDATIONS:
- **Backend**: Node.js/Express, Python/Django, Java/Spring, Go/Gin
- **Frontend**: React, Vue.js, Angular, Svelte
- **Database**: PostgreSQL, MongoDB, Redis, MySQL
- **Authentication**: JWT, OAuth2, Auth0, Firebase Auth
- **Testing**: Jest, Mocha, Cypress, Playwright
- **Deployment**: Docker, Kubernetes, Vercel, AWS, Heroku

OUTPUT FORMAT:
Return a valid JSON object with the following structure:
{
  "id": "blueprint_<timestamp>",
  "projectId": "<project_id>",
  "fileStructure": {
    "root": {
      "name": "project",
      "type": "directory",
      "children": [
        {
          "name": "src",
          "type": "directory",
          "children": [
            {
              "name": "controllers",
              "type": "directory",
              "children": []
            },
            {
              "name": "models",
              "type": "directory",
              "children": []
            },
            {
              "name": "routes",
              "type": "directory",
              "children": []
            },
            {
              "name": "middleware",
              "type": "directory",
              "children": []
            },
            {
              "name": "utils",
              "type": "directory",
              "children": []
            },
            {
              "name": "tests",
              "type": "directory",
              "children": []
            }
          ]
        },
        {
          "name": "docs",
          "type": "directory",
          "children": []
        },
        {
          "name": "config",
          "type": "directory",
          "children": []
        }
      ]
    }
  },
  "apiContracts": [
    {
      "id": "api_001",
      "name": "User Management",
      "method": "POST",
      "path": "/api/users",
      "requestBody": {
        "email": "string",
        "password": "string",
        "name": "string"
      },
      "responseBody": {
        "id": "string",
        "email": "string",
        "name": "string",
        "createdAt": "date"
      },
      "parameters": [
        {
          "name": "email",
          "type": "string",
          "required": true,
          "description": "User email address"
        }
      ]
    }
  ],
  "databaseSchema": {
    "tables": [
      {
        "name": "users",
        "columns": [
          {
            "name": "id",
            "type": "uuid",
            "nullable": false,
            "primaryKey": true
          },
          {
            "name": "email",
            "type": "varchar(255)",
            "nullable": false,
            "unique": true
          },
          {
            "name": "password_hash",
            "type": "varchar(255)",
            "nullable": false
          },
          {
            "name": "created_at",
            "type": "timestamp",
            "nullable": false
          }
        ],
        "indexes": [
          {
            "name": "idx_users_email",
            "columns": ["email"],
            "unique": true
          }
        ]
      }
    ]
  },
  "technologies": [
    {
      "name": "Node.js",
      "version": "18.0.0",
      "category": "backend"
    },
    {
      "name": "Express",
      "version": "4.18.0",
      "category": "backend"
    },
    {
      "name": "PostgreSQL",
      "version": "15.0",
      "category": "database"
    },
    {
      "name": "Jest",
      "version": "29.0.0",
      "category": "testing"
    }
  ],
  "createdAt": "<timestamp>",
  "architecture": {
    "pattern": "REST API",
    "description": "RESTful API with MVC pattern",
    "scalability": "Horizontal scaling with load balancers",
    "security": "JWT authentication, input validation, rate limiting"
  }
}

Ensure the response is valid JSON and follows the exact structure specified. Consider the requirements carefully and provide a realistic, implementable blueprint.`,
      variables: ['requirements', 'timestamp', 'context']
    });

    // Basic Blueprint Generation Template (fallback)
    this.templates.set('blueprint_generation', {
      name: 'blueprint_generation',
      version: '1.0.0',
      template: `You are ARiS, an expert software architect. Create a comprehensive technical blueprint based on the following requirements:

REQUIREMENTS:
{{requirements}}

INSTRUCTIONS:
1. Analyze the requirements thoroughly
2. Design a scalable and maintainable architecture
3. Select appropriate technologies and frameworks
4. Define the file structure and organization
5. Specify API contracts and database schema
6. Consider security, performance, and scalability

OUTPUT FORMAT:
Return a valid JSON object with the following structure:
{
  "id": "blueprint_<timestamp>",
  "projectId": "<project_id>",
  "fileStructure": {
    "root": {
      "name": "project",
      "type": "directory",
      "children": [...]
    }
  },
  "apiContracts": [...],
  "databaseSchema": {
    "tables": [...]
  },
  "technologies": [...],
  "createdAt": "<timestamp>"
}

Ensure the response is valid JSON and follows the exact structure specified.`,
      variables: ['requirements', 'timestamp', 'context']
    });

    // Code Generation Template
    this.templates.set('code_generation', {
      name: 'code_generation',
      version: '1.0.0',
      template: `You are ARiS, an expert software developer. Generate production-ready code based on the following blueprint and file specification:

BLUEPRINT:
{{blueprint}}

FILE SPECIFICATION:
- Name: {{fileName}}
- Extension: {{fileExtension}}
- Path: {{filePath}}

INSTRUCTIONS:
1. Generate clean, well-documented code
2. Follow best practices and coding standards
3. Include proper error handling
4. Add meaningful comments
5. Ensure the code is production-ready
6. Follow the blueprint specifications exactly

OUTPUT FORMAT:
Return only the code content, no explanations or markdown formatting. The code should be ready to use immediately.`,
      variables: ['blueprint', 'fileName', 'fileExtension', 'filePath', 'context']
    });

    // Code Analysis Template
    this.templates.set('code_analysis', {
      name: 'code_analysis',
      version: '1.0.0',
      template: `You are ARiS, an expert code reviewer. Analyze the following code for structure, quality, and improvement opportunities:

CODE:
\`\`\`
{{code}}
\`\`\`

INSTRUCTIONS:
1. Analyze the code structure and organization
2. Identify potential issues and improvements
3. Assess code quality and maintainability
4. Detect design patterns and anti-patterns
5. Provide specific recommendations

OUTPUT FORMAT:
Return a valid JSON object with the following structure:
{
  "structure": {
    "functions": [...],
    "classes": [...],
    "imports": [...],
    "exports": [...],
    "variables": [...]
  },
  "quality": {
    "score": <0-100>,
    "issues": [...],
    "metrics": {...}
  },
  "patterns": [...],
  "suggestions": [...]
}

Ensure the response is valid JSON and follows the exact structure specified.`,
      variables: ['code', 'context']
    });

    // Task Processing Template
    this.templates.set('task_processing', {
      name: 'task_processing',
      version: '1.0.0',
      template: `You are ARiS, an intelligent software development assistant. Process the following task as a {{agentType}} agent:

TASK:
- Title: {{taskTitle}}
- Description: {{taskDescription}}
- Priority: {{taskPriority}}
- Agent Type: {{agentType}}

INSTRUCTIONS:
1. Understand the task requirements
2. Apply your specialized knowledge as a {{agentType}} agent
3. Generate appropriate output based on your capabilities
4. Ensure high quality and accuracy
5. Follow best practices and standards

OUTPUT FORMAT:
Return a valid JSON object with the following structure:
{
  "success": true,
  "data": <task_specific_output>,
  "metadata": {
    "agentType": "{{agentType}}",
    "taskId": "<task_id>",
    "timestamp": "<timestamp>"
  }
}

Ensure the response is valid JSON and follows the exact structure specified.`,
      variables: ['taskTitle', 'taskDescription', 'taskPriority', 'agentType', 'context']
    });
  }

  /**
   * Render a template with variables
   */
  private renderTemplate(template: PromptTemplate, variables: Record<string, any>): string {
    let result = template.template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return result;
  }

  /**
   * Sanitize input to prevent prompt injection
   */
  private sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove potential JavaScript
      .replace(/on\w+=/gi, '') // Remove potential event handlers
      .trim();
  }

  /**
   * Get file path for code generation
   */
  private getFilePath(file: File): string {
    // This would be more sophisticated in a real implementation
    return `src/${file.name}`;
  }

  /**
   * Add a custom template
   */
  addTemplate(template: PromptTemplate): void {
    this.templates.set(template.name, template);
  }

  /**
   * Get a template by name
   */
  getTemplate(name: string): PromptTemplate | undefined {
    return this.templates.get(name);
  }

  /**
   * List all available templates
   */
  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
} 