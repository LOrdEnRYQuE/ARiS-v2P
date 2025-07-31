#!/usr/bin/env node

/**
 * ARiS RAG System Production Setup Script
 * Guides you through setting up the RAG system for production use
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupProductionRAG() {
  console.log('🚀 ARiS RAG System Production Setup\n');
  console.log('This script will guide you through setting up the RAG system for production use.\n');

  // Step 1: Supabase Setup
  console.log('📋 Step 1: Supabase Setup');
  console.log('========================');
  console.log('\n1. Go to https://supabase.com and create a new project');
  console.log('2. Once created, go to Settings > API in your Supabase dashboard');
  console.log('3. Copy the following values:');
  console.log('   - Project URL');
  console.log('   - anon/public key');
  console.log('   - service_role key (for admin operations)');
  
  const supabaseUrl = await question('\nEnter your Supabase Project URL: ');
  const supabaseAnonKey = await question('Enter your Supabase anon/public key: ');
  const supabaseServiceKey = await question('Enter your Supabase service_role key: ');

  // Step 2: OpenAI Setup
  console.log('\n📋 Step 2: OpenAI Setup');
  console.log('=======================');
  console.log('\n1. Go to https://platform.openai.com/api-keys');
  console.log('2. Create a new API key');
  console.log('3. Copy the API key');
  
  const openaiApiKey = await question('\nEnter your OpenAI API key: ');

  // Step 3: Update .env file
  console.log('\n📋 Step 3: Updating Environment Variables');
  console.log('==========================================');
  
  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Replace placeholders with actual values
  envContent = envContent.replace('your_supabase_url_here', supabaseUrl);
  envContent = envContent.replace('your_supabase_anon_key_here', supabaseAnonKey);
  envContent = envContent.replace('your_supabase_service_role_key_here', supabaseServiceKey);
  envContent = envContent.replace('your_openai_api_key_here', openaiApiKey);
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment variables updated successfully');

  // Step 4: Supabase Database Setup
  console.log('\n📋 Step 4: Supabase Database Setup');
  console.log('===================================');
  console.log('\n1. Go to your Supabase dashboard > SQL Editor');
  console.log('2. Run the following command to enable pg_vector:');
  console.log('   CREATE EXTENSION IF NOT EXISTS vector;');
  console.log('\n3. Copy the contents of supabase/migrations/001_create_code_chunks_table.sql');
  console.log('4. Paste and execute the migration in Supabase SQL Editor');
  
  const dbSetupComplete = await question('\nHave you completed the database setup? (y/n): ');
  
  if (dbSetupComplete.toLowerCase() !== 'y') {
    console.log('\n⚠️  Please complete the database setup before proceeding.');
    console.log('You can run this script again once the database is ready.');
    rl.close();
    return;
  }

  // Step 5: Test the Integration
  console.log('\n📋 Step 5: Testing the Integration');
  console.log('===================================');
  console.log('\nTesting the RAG system integration...');
  
  try {
    // Load environment variables
    require('dotenv').config();
    
    // Test configuration loading
    const { RAGConfigLoader } = require('./packages/rag/dist');
    const configLoader = RAGConfigLoader.getInstance();
    const config = configLoader.getConfig();
    
    console.log('✅ Configuration loaded successfully');
    console.log(`   Supabase URL: ${config.supabaseUrl.substring(0, 30)}...`);
    console.log(`   OpenAI Model: ${config.embeddingModel}`);
    console.log(`   Vector Dimension: ${config.vectorDimension}`);
    
    // Test basic RAG system initialization
    const { EnhancedRAGSystem } = require('./packages/rag/dist');
    const ragSystem = new EnhancedRAGSystem();
    
    console.log('\n🔄 Initializing RAG system...');
    await ragSystem.initialize();
    console.log('✅ RAG system initialized successfully');
    
    // Test basic functionality
    console.log('\n🧪 Testing basic functionality...');
    const stats = await ragSystem.getSystemStats();
    console.log('✅ System statistics retrieved');
    console.log(`   Total chunks: ${stats.totalChunks}`);
    console.log(`   Model: ${stats.modelInfo.model}`);
    
    console.log('\n🎉 RAG System Integration Test: SUCCESS!');
    
  } catch (error) {
    console.error('\n❌ RAG System Integration Test: FAILED');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your Supabase credentials');
    console.error('2. Verify OpenAI API key is valid');
    console.error('3. Ensure database migration was completed');
    console.error('4. Check network connectivity');
    
    rl.close();
    return;
  }

  // Step 6: Workspace Ingestion
  console.log('\n📋 Step 6: Workspace Ingestion');
  console.log('===============================');
  
  const shouldIngest = await question('\nWould you like to ingest your current workspace? (y/n): ');
  
  if (shouldIngest.toLowerCase() === 'y') {
    try {
      console.log('\n🔄 Starting workspace ingestion...');
      
      const { WorkspaceIngestion } = require('./packages/rag/dist');
      const ingestion = new WorkspaceIngestion();
      await ingestion.initialize();
      
      console.log('📚 Processing workspace files...');
      await ingestion.ingestWorkspace();
      
      console.log('📖 Processing documentation...');
      await ingestion.ingestDocumentation();
      
      const stats = await ingestion.getIngestionStats();
      console.log('\n✅ Workspace ingestion completed!');
      console.log(`   Processed files: ${stats.processedFiles}`);
      console.log(`   Total size: ${stats.totalSize} bytes`);
      
    } catch (error) {
      console.error('\n❌ Workspace ingestion failed:', error.message);
      console.error('You can run ingestion later using the workspace-ingestion.js script');
    }
  }

  // Step 7: Agent Integration Demo
  console.log('\n📋 Step 7: Agent Integration Demo');
  console.log('==================================');
  
  const shouldDemo = await question('\nWould you like to see a demo of agent integration? (y/n): ');
  
  if (shouldDemo.toLowerCase() === 'y') {
    try {
      console.log('\n🤖 Demonstrating agent integration...');
      
      const { EnhancedRAGSystem } = require('./packages/rag/dist');
      const ragSystem = new EnhancedRAGSystem();
      await ragSystem.initialize();
      
      // Demo different agent contexts
      console.log('\n🏗️  Testing Architectus (System Design)...');
      const architectusContext = await ragSystem.getArchitecturePatterns('React component architecture');
      console.log(`   Found ${architectusContext.length} architecture patterns`);
      
      console.log('\n✍️  Testing Scriba (Code Generation)...');
      const scribaContext = await ragSystem.getContextWithAST('function implementation', 'scriba');
      console.log(`   Found ${scribaContext.length} code examples`);
      
      console.log('\n🔍 Testing Auditor (Code Quality)...');
      const auditorContext = await ragSystem.getContextWithAST('code quality review', 'auditor');
      console.log(`   Found ${auditorContext.length} quality guidelines`);
      
      console.log('\n🎨 Testing Genesis (Frontend)...');
      const genesisContext = await ragSystem.getContextWithAST('UI component design', 'genesis');
      console.log(`   Found ${genesisContext.length} UI patterns`);
      
      console.log('\n✅ Agent integration demo completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Agent integration demo failed:', error.message);
    }
  }

  // Step 8: Next Steps
  console.log('\n📋 Step 8: Next Steps');
  console.log('======================');
  console.log('\n🎉 Congratulations! Your RAG system is now ready for production use.');
  console.log('\n📚 Next Steps:');
  console.log('1. Integrate RAG system with your agents');
  console.log('2. Set up monitoring and logging');
  console.log('3. Configure performance optimization');
  console.log('4. Move to Sprint 2 (Fine-Tuning Pipeline)');
  
  console.log('\n🔧 Useful Commands:');
  console.log('- Test integration: node test-rag-integration.js');
  console.log('- Ingest workspace: node workspace-ingestion.js');
  console.log('- View setup guide: cat RAG_SETUP_GUIDE.md');
  
  console.log('\n📞 Support:');
  console.log('- Check logs for detailed error messages');
  console.log('- Review the RAG_SETUP_GUIDE.md for troubleshooting');
  console.log('- Monitor Supabase dashboard for database performance');
  
  rl.close();
}

// Run the setup
if (require.main === module) {
  setupProductionRAG().catch(console.error);
}

module.exports = { setupProductionRAG }; 