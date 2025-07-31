import { Blueprint, File } from '@aris/shared';
import { CodeAnalysis, LLMResponse } from './types';

export class ResponseParser {
  /**
   * Parse a blueprint from LLM response
   */
  parseBlueprint(response: string): Blueprint {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const blueprintData = JSON.parse(jsonMatch[0]);
      
      // Validate and transform the blueprint
      return this.validateBlueprint(blueprintData);
    } catch (error) {
      throw new Error(`Failed to parse blueprint: ${error}`);
    }
  }

  /**
   * Parse code from LLM response
   */
  parseCode(response: string): string {
    try {
      // Remove any markdown code blocks
      let code = response.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
      
      // Remove any explanations or comments outside code
      const lines = code.split('\n');
      const codeLines: string[] = [];
      let inCodeBlock = false;

      for (const line of lines) {
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
          continue; // Skip comment lines
        }
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          continue;
        }
        if (inCodeBlock || line.trim() !== '') {
          codeLines.push(line);
        }
      }

      return codeLines.join('\n').trim();
    } catch (error) {
      throw new Error(`Failed to parse code: ${error}`);
    }
  }

  /**
   * Parse code analysis from LLM response
   */
  parseCodeAnalysis(response: string): CodeAnalysis {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      // Validate and transform the analysis
      return this.validateCodeAnalysis(analysisData);
    } catch (error) {
      throw new Error(`Failed to parse code analysis: ${error}`);
    }
  }

  /**
   * Parse task response from LLM response
   */
  parseTaskResponse(response: string): any {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // If no JSON found, return the raw response
        return { data: response.trim() };
      }

      const responseData = JSON.parse(jsonMatch[0]);
      return responseData;
    } catch (error) {
      throw new Error(`Failed to parse task response: ${error}`);
    }
  }

  /**
   * Validate and transform blueprint data
   */
  private validateBlueprint(data: any): Blueprint {
    // Ensure required fields exist
    if (!data.id || !data.projectId || !data.fileStructure) {
      throw new Error('Invalid blueprint: missing required fields');
    }

    // Transform and validate the blueprint
    const blueprint: Blueprint = {
      id: data.id,
      projectId: data.projectId,
      fileStructure: this.validateFileStructure(data.fileStructure),
      apiContracts: Array.isArray(data.apiContracts) ? data.apiContracts : [],
      databaseSchema: data.databaseSchema || { tables: [] },
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
    };

    return blueprint;
  }

  /**
   * Validate file structure
   */
  private validateFileStructure(structure: any): any {
    if (!structure.root || !structure.root.name || !structure.root.type) {
      throw new Error('Invalid file structure: missing root directory');
    }

    return {
      root: this.validateDirectory(structure.root)
    };
  }

  /**
   * Validate directory structure
   */
  private validateDirectory(dir: any): any {
    if (!dir.name || !dir.type || dir.type !== 'directory') {
      throw new Error('Invalid directory: missing required fields');
    }

    return {
      name: dir.name,
      type: 'directory',
      children: Array.isArray(dir.children) 
        ? dir.children.map((child: any) => this.validateFileSystemNode(child))
        : []
    };
  }

  /**
   * Validate file system node (file or directory)
   */
  private validateFileSystemNode(node: any): any {
    if (!node.name || !node.type) {
      throw new Error('Invalid file system node: missing required fields');
    }

    if (node.type === 'directory') {
      return this.validateDirectory(node);
    } else if (node.type === 'file') {
      return {
        name: node.name,
        type: 'file',
        extension: node.extension || '',
        content: node.content || ''
      };
    } else {
      throw new Error(`Invalid file system node type: ${node.type}`);
    }
  }

  /**
   * Validate code analysis data
   */
  private validateCodeAnalysis(data: any): CodeAnalysis {
    // Ensure required fields exist
    if (!data.structure || !data.quality) {
      throw new Error('Invalid code analysis: missing required fields');
    }

    // Transform and validate the analysis
    const analysis: CodeAnalysis = {
      structure: {
        functions: Array.isArray(data.structure.functions) ? data.structure.functions : [],
        classes: Array.isArray(data.structure.classes) ? data.structure.classes : [],
        imports: Array.isArray(data.structure.imports) ? data.structure.imports : [],
        exports: Array.isArray(data.structure.exports) ? data.structure.exports : [],
        variables: Array.isArray(data.structure.variables) ? data.structure.variables : []
      },
      quality: {
        score: typeof data.quality.score === 'number' ? data.quality.score : 0,
        issues: Array.isArray(data.quality.issues) ? data.quality.issues : [],
        metrics: data.quality.metrics || {
          cyclomaticComplexity: 0,
          linesOfCode: 0,
          maintainabilityIndex: 0,
          depthOfInheritance: 0,
          couplingBetweenObjects: 0
        }
      },
      patterns: Array.isArray(data.patterns) ? data.patterns : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : []
    };

    return analysis;
  }

  /**
   * Extract JSON from text response
   */
  private extractJSON(text: string): any {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Invalid JSON in response: ${error}`);
    }
  }

  /**
   * Clean and format code response
   */
  private cleanCodeResponse(response: string): string {
    // Remove markdown code blocks
    let code = response.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
    
    // Remove leading/trailing whitespace
    code = code.trim();
    
    // Remove any explanatory text before or after code
    const lines = code.split('\n');
    const codeLines: string[] = [];
    let inCode = false;

    for (const line of lines) {
      if (line.trim().startsWith('//') && !inCode) {
        continue; // Skip comment lines at the beginning
      }
      if (line.trim() !== '') {
        inCode = true;
        codeLines.push(line);
      }
    }

    return codeLines.join('\n');
  }
} 