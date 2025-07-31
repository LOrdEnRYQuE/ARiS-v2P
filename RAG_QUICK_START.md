# ARiS RAG System - Quick Start Guide

## 🚀 Overview

The ARiS RAG (Retrieval-Augmented Generation) system provides your agents with contextual knowledge from your codebase, enabling more intelligent and relevant code generation, analysis, and suggestions.

## ✅ Current Status

- **Supabase Database**: ✅ Operational with vector embeddings
- **RAG System**: ✅ Initialized and connected
- **Agent Integration**: ✅ All 6 agents configured
- **OpenAI Integration**: ⚠️ Requires API credits

## 🎯 Quick Start Steps

### 1. Add OpenAI API Credits
```bash
# Visit OpenAI Platform and add credits
https://platform.openai.com/account/billing
```

### 2. Ingest Your Codebase
```bash
# Process and embed your entire codebase
node ingest-workspace.js
```

### 3. Test Agent Integration
```bash
# See examples of RAG-enhanced agents
node examples/agent-rag-integration.js
```

### 4. Use in Your Agents
```javascript
const { EnhancedRAGSystem } = require('./packages/rag/dist');

// Initialize RAG system
const ragSystem = new EnhancedRAGSystem();
await ragSystem.initialize();

// Get context for specific agent
const context = await ragSystem.getArchitecturePatterns('microservices design');
```

## 🤖 Agent Types & Capabilities

### 🏗️ Architectus (System Design)
- **Purpose**: Architecture patterns and system design
- **Use Case**: Design microservices, APIs, data models
- **Method**: `getArchitecturePatterns(query)`

### ✍️ Scriba (Code Generation)
- **Purpose**: Code examples and implementations
- **Use Case**: Generate components, functions, classes
- **Method**: `getScribaContext(task, language)`

### 🔍 Auditor (Code Quality)
- **Purpose**: Quality guidelines and best practices
- **Use Case**: Code review, security analysis, performance
- **Method**: `getAuditorContext(code)`

### 🎨 Genesis (UI/UX)
- **Purpose**: UI patterns and frontend design
- **Use Case**: Component design, responsive layouts
- **Method**: `getGenesisContext(requirements)`

### ⚡ Executor (Deployment)
- **Purpose**: DevOps and deployment patterns
- **Use Case**: CI/CD, containerization, automation
- **Method**: `getExecutorContext(task)`

### 📊 Prometheus (Coordination)
- **Purpose**: Project management and workflows
- **Use Case**: Agile processes, team coordination
- **Method**: `getPrometheusContext(workflow)`

## 🔍 Advanced Features

### Similar Code Retrieval
```javascript
const similarCode = await ragSystem.getSimilarCodeWithAST(code, 'typescript');
```

### Quality Improvement Suggestions
```javascript
const suggestions = await ragSystem.getQualityImprovementSuggestions(code, analysis);
```

### System Statistics
```javascript
const stats = await ragSystem.getSystemStats();
console.log(`Total chunks: ${stats.totalChunks}`);
```

## 📊 Database Schema

The system uses a `code_chunks` table with:
- **Vector embeddings** (1536 dimensions)
- **Metadata** (source, language, agent type)
- **Content** (code snippets and patterns)
- **Similarity search** functions

## 🔧 Configuration

### Environment Variables
```bash
SUPABASE_URL=https://fqsspmreyoqoaxapitve.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
```

### RAG Configuration
Located in `config/rag-config.json`:
- Agent-specific settings
- Retrieval parameters
- Embedding model configuration

## 🚨 Troubleshooting

### OpenAI Quota Exceeded
- Add credits to your OpenAI account
- The system will work once credits are available

### Connection Issues
- Verify environment variables
- Check Supabase project status
- Test with `node test-supabase-connection.js`

### Empty Results
- Run workspace ingestion first
- Check if files were processed
- Verify agent query specificity

## 📈 Performance Tips

1. **Specific Queries**: Use detailed, specific queries for better results
2. **Agent Specialization**: Use the right agent for your task
3. **Context Length**: Keep queries concise but descriptive
4. **Batch Processing**: Process multiple files together

## 🔮 Next Steps

1. **Add OpenAI Credits**: Enable full functionality
2. **Ingest Codebase**: Populate the knowledge base
3. **Test Agents**: Try the integration examples
4. **Customize**: Adapt queries for your specific needs
5. **Scale**: Add more code patterns and examples

## 📞 Support

- **Database Issues**: Check Supabase dashboard
- **API Issues**: Verify OpenAI account status
- **Integration Issues**: Review agent examples
- **Performance Issues**: Check system statistics

---

**🎉 Your ARiS agents are now enhanced with powerful RAG capabilities!** 