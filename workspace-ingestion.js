#!/usr/bin/env node

/**
 * ARiS Workspace Ingestion Script
 * Processes your codebase for RAG system vectorization
 */

const { WorkspaceIngestion } = require('./packages/rag/dist');

async function ingestWorkspace() {
  console.log('🚀 ARiS Workspace Ingestion\n');
  
  try {
    // Load environment variables
    require('dotenv').config();
    
    console.log('📋 Initializing workspace ingestion...');
    const ingestion = new WorkspaceIngestion();
    await ingestion.initialize();
    console.log('✅ Workspace ingestion system initialized');
    
    console.log('\n📚 Processing workspace files...');
    console.log('This will analyze and vectorize your codebase for RAG retrieval.');
    console.log('Supported file types: .js, .ts, .py, .java, .go, .rs, .cpp, .c, .cs, .php, .rb, .swift, .kt, .scala');
    console.log('Excluded patterns: node_modules, dist, build, .git\n');
    
    const startTime = Date.now();
    await ingestion.ingestWorkspace();
    const workspaceTime = Date.now() - startTime;
    
    console.log('\n📖 Processing documentation...');
    const docStartTime = Date.now();
    await ingestion.ingestDocumentation();
    const docTime = Date.now() - docStartTime;
    
    console.log('\n📊 Getting ingestion statistics...');
    const stats = await ingestion.getIngestionStats();
    
    console.log('\n🎉 Workspace Ingestion Completed Successfully!');
    console.log('\n📈 Performance Metrics:');
    console.log(`   Workspace processing time: ${workspaceTime}ms`);
    console.log(`   Documentation processing time: ${docTime}ms`);
    console.log(`   Total processing time: ${workspaceTime + docTime}ms`);
    
    console.log('\n📊 Ingestion Statistics:');
    console.log(`   Processed files: ${stats.processedFiles}`);
    console.log(`   Total size: ${stats.totalSize} bytes`);
    console.log(`   Languages processed: ${Object.keys(stats.languages || {}).length}`);
    console.log(`   Sources processed: ${Object.keys(stats.sources || {}).length}`);
    
    console.log('\n✅ Your codebase has been successfully vectorized for RAG retrieval!');
    console.log('\n🤖 Next Steps:');
    console.log('1. Test agent integration with the RAG system');
    console.log('2. Monitor retrieval performance');
    console.log('3. Fine-tune chunking and embedding parameters if needed');
    console.log('4. Set up continuous ingestion for new files');
    
  } catch (error) {
    console.error('\n❌ Workspace ingestion failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check environment variables are properly set');
    console.error('2. Verify Supabase connection is working');
    console.error('3. Ensure OpenAI API key is valid');
    console.error('4. Check file permissions and network connectivity');
    console.error('\n📞 For detailed error information, check the logs above.');
    
    process.exit(1);
  }
}

// Run the ingestion
if (require.main === module) {
  ingestWorkspace();
}

module.exports = { ingestWorkspace }; 