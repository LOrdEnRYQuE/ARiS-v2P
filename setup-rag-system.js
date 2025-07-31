#!/usr/bin/env node

/**
 * ARiS RAG System Setup Script
 * Helps configure the RAG system with Supabase and environment variables
 */

const fs = require('fs');
const path = require('path');

function setupRAGSystem() {
  console.log('🚀 ARiS RAG System Setup\n');

  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);

  if (!envExists) {
    console.log('📝 Creating .env file...');
    const envTemplate = `# ARiS RAG System Configuration

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_MAX_TOKENS=8192
OPENAI_TEMPERATURE=0.1

# RAG System Configuration
RAG_MAX_RESULTS=10
RAG_SIMILARITY_THRESHOLD=0.7
RAG_MAX_CONTEXT_LENGTH=4000
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200
RAG_BATCH_SIZE=50
RAG_CONCURRENCY=5
RAG_RETRY_ATTEMPTS=3
RAG_TIMEOUT=30000

# Database Configuration
RAG_TABLE_NAME=code_chunks
RAG_INDEX_NAME=code_chunks_embeddings_idx
RAG_VECTOR_DIMENSION=1536
RAG_SIMILARITY_FUNCTION=cosine
`;

    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env file');
  } else {
    console.log('✅ .env file already exists');
  }

  // Create Supabase setup instructions
  console.log('\n📋 Supabase Setup Instructions:');
  console.log('\n1. Create a new Supabase project at https://supabase.com');
  console.log('2. Enable the pg_vector extension in your database:');
  console.log('   - Go to SQL Editor in Supabase Dashboard');
  console.log('   - Run: CREATE EXTENSION IF NOT EXISTS vector;');
  console.log('\n3. Run the migration script:');
  console.log('   - Copy the contents of supabase/migrations/001_create_code_chunks_table.sql');
  console.log('   - Paste and execute in Supabase SQL Editor');
  console.log('\n4. Get your Supabase credentials:');
  console.log('   - Go to Settings > API in Supabase Dashboard');
  console.log('   - Copy Project URL and anon/public key');
  console.log('   - Update your .env file with these values');

  // Create environment variable setup instructions
  console.log('\n🔧 Environment Variable Setup:');
  console.log('\n1. Update your .env file with the following values:');
  console.log('   - SUPABASE_URL: Your Supabase project URL');
  console.log('   - SUPABASE_ANON_KEY: Your Supabase anon/public key');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key');
  console.log('   - OPENAI_API_KEY: Your OpenAI API key');
  console.log('\n2. Get your OpenAI API key:');
  console.log('   - Go to https://platform.openai.com/api-keys');
  console.log('   - Create a new API key');
  console.log('   - Add it to your .env file');

  // Create test instructions
  console.log('\n🧪 Testing the RAG System:');
  console.log('\n1. Install dependencies:');
  console.log('   npm install');
  console.log('\n2. Build the packages:');
  console.log('   npm run build');
  console.log('\n3. Run the RAG integration test:');
  console.log('   node test-rag-integration.js');

  // Create production setup instructions
  console.log('\n🚀 Production Setup:');
  console.log('\n1. Set up environment variables in your production environment');
  console.log('2. Ensure Supabase is properly configured with pg_vector');
  console.log('3. Run the workspace ingestion:');
  console.log('   const { WorkspaceIngestion } = require("@aris/rag");');
  console.log('   const ingestion = new WorkspaceIngestion();');
  console.log('   await ingestion.initialize();');
  console.log('   await ingestion.ingestWorkspace();');

  // Create agent integration instructions
  console.log('\n🤖 Agent Integration:');
  console.log('\n1. Import the Enhanced RAG System in your agents:');
  console.log('   const { EnhancedRAGSystem } = require("@aris/rag");');
  console.log('   const ragSystem = new EnhancedRAGSystem();');
  console.log('   await ragSystem.initialize();');
  console.log('\n2. Use context retrieval in agent workflows:');
  console.log('   const context = await ragSystem.getContextWithAST(query, agentType, file);');
  console.log('   const similarCode = await ragSystem.getSimilarCodeWithAST(code, language);');
  console.log('   const suggestions = await ragSystem.getQualityImprovementSuggestions(code, analysis);');

  console.log('\n✅ RAG System setup instructions completed!');
  console.log('\n📚 Next Steps:');
  console.log('1. Configure your Supabase project');
  console.log('2. Set up environment variables');
  console.log('3. Test the integration');
  console.log('4. Ingest your codebase');
  console.log('5. Integrate with agents');
}

// Run the setup
if (require.main === module) {
  setupRAGSystem();
}

module.exports = { setupRAGSystem }; 