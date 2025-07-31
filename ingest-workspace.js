#!/usr/bin/env node

/**
 * ARiS Workspace Ingestion Script
 * Processes and embeds the entire codebase into the RAG system
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { EnhancedRAGSystem, WorkspaceIngestion } = require('./packages/rag/dist');

async function ingestWorkspace() {
  console.log('🚀 Starting ARiS Workspace Ingestion...\n');

  try {
    // Initialize RAG system
    console.log('🔧 Initializing RAG System...');
    const ragSystem = new EnhancedRAGSystem();
    await ragSystem.initialize();
    console.log('✅ RAG System initialized');

    // Initialize workspace ingestion
    console.log('\n📚 Initializing Workspace Ingestion...');
    const ingestion = new WorkspaceIngestion();
    await ingestion.initialize();
    console.log('✅ Workspace Ingestion initialized');

    // Define file patterns to process
    const filePatterns = [
      '**/*.js',
      '**/*.ts',
      '**/*.tsx',
      '**/*.jsx',
      '**/*.py',
      '**/*.java',
      '**/*.go',
      '**/*.rs',
      '**/*.cpp',
      '**/*.c',
      '**/*.md',
      '**/*.json',
      '**/*.yaml',
      '**/*.yml'
    ];

    // Define exclude patterns
    const excludePatterns = [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.git/**',
      'coverage/**',
      '*.log',
      'package-lock.json',
      'yarn.lock'
    ];

    console.log('\n🔍 Scanning workspace for files...');
    
    // Process packages directory
    console.log('\n📦 Processing packages...');
    const packagesDir = path.join(__dirname, 'packages');
    await processDirectory(packagesDir, ragSystem, filePatterns, excludePatterns);

    // Process apps directory
    console.log('\n📱 Processing apps...');
    const appsDir = path.join(__dirname, 'apps');
    await processDirectory(appsDir, ragSystem, filePatterns, excludePatterns);

    // Process root files
    console.log('\n📄 Processing root files...');
    await processRootFiles(ragSystem);

    // Get final statistics
    console.log('\n📊 Getting final statistics...');
    const stats = await ragSystem.getSystemStats();
    const ingestionStats = await ingestion.getIngestionStats();

    console.log('\n🎉 Workspace Ingestion Completed!');
    console.log('\n📈 Final Statistics:');
    console.log(`   Total chunks: ${stats.totalChunks}`);
    console.log(`   Total size: ${stats.totalSize} bytes`);
    console.log(`   Processed files: ${ingestionStats.processedFiles}`);
    console.log(`   Model: ${stats.modelInfo.model} (${stats.modelInfo.dimensions} dimensions)`);

    console.log('\n🚀 Your codebase is now embedded in the RAG system!');
    console.log('\nNext steps:');
    console.log('1. Test semantic search with your agents');
    console.log('2. Use agent-specific context retrieval');
    console.log('3. Generate code with context-aware suggestions');

  } catch (error) {
    console.error('❌ Workspace ingestion failed:', error);
    process.exit(1);
  }
}

async function processDirectory(dirPath, ragSystem, filePatterns, excludePatterns) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      // Skip excluded patterns
      if (shouldExclude(fullPath, excludePatterns)) {
        continue;
      }

      if (entry.isDirectory()) {
        await processDirectory(fullPath, ragSystem, filePatterns, excludePatterns);
      } else if (entry.isFile() && shouldInclude(fullPath, filePatterns)) {
        await processFile(fullPath, ragSystem);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Warning: Could not process directory ${dirPath}:`, error.message);
  }
}

async function processRootFiles(ragSystem) {
  const rootFiles = [
    'package.json',
    'README.md',
    'turbo.json',
    'config/rag-config.json',
    'config/deployment-config.json',
    'config/production-config.json',
    'config/scaling-config.json',
    'config/security-config.json'
  ];

  for (const file of rootFiles) {
    const filePath = path.join(__dirname, file);
    try {
      await fs.access(filePath);
      await processFile(filePath, ragSystem);
    } catch (error) {
      // File doesn't exist, skip
    }
  }
}

async function processFile(filePath, ragSystem) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(__dirname, filePath);
    
    const file = {
      name: path.basename(filePath),
      path: relativePath,
      content: content
    };

    console.log(`📝 Processing: ${relativePath}`);
    await ragSystem.processFileWithAST(file);
    console.log(`✅ Processed: ${relativePath}`);

  } catch (error) {
    console.warn(`⚠️  Warning: Could not process file ${filePath}:`, error.message);
  }
}

function shouldExclude(filePath, excludePatterns) {
  return excludePatterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filePath);
  });
}

function shouldInclude(filePath, includePatterns) {
  return includePatterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filePath);
  });
}

// Run the ingestion
if (require.main === module) {
  ingestWorkspace();
}

module.exports = { ingestWorkspace }; 