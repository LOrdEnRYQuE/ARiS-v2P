# ARiS RAG System - Next Steps Quick Reference

## 🚀 Immediate Actions Required

### 1. Set up Supabase Project
```bash
# Go to https://supabase.com and create a new project
# Then run the production setup script:
node setup-production-rag.js
```

### 2. Configure Environment Variables
The setup script will guide you through:
- Supabase Project URL
- Supabase anon/public key
- Supabase service_role key
- OpenAI API key

### 3. Run Database Migration
In Supabase SQL Editor:
```sql
-- Enable pg_vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Run the migration (copy from supabase/migrations/001_create_code_chunks_table.sql)
-- This creates the code_chunks table and all necessary functions
```

### 4. Test the Integration
```bash
# Test the complete RAG system
node test-rag-integration.js
```

### 5. Ingest Your Codebase
```bash
# Process your workspace for vectorization
node workspace-ingestion.js
```

## 🔧 Quick Commands

### Test RAG System
```bash
node test-rag-integration.js
```

### Ingest Workspace
```bash
node workspace-ingestion.js
```

### Production Setup
```bash
node setup-production-rag.js
```

### View Setup Guide
```bash
cat RAG_SETUP_GUIDE.md
```

## 🤖 Agent Integration Examples

### Architectus (System Design)
```javascript
const { EnhancedRAGSystem } = require('@aris/rag');
const ragSystem = new EnhancedRAGSystem();
await ragSystem.initialize();

const context = await ragSystem.getArchitecturePatterns('microservices architecture');
```

### Scriba (Code Generation)
```javascript
const context = await ragSystem.getContextWithAST('React component', 'scriba', file);
```

### Auditor (Code Quality)
```javascript
const suggestions = await ragSystem.getQualityImprovementSuggestions(code, analysis);
```

### Genesis (Frontend)
```javascript
const context = await ragSystem.getContextWithAST('UI patterns', 'genesis', file);
```

### Executor (Deployment)
```javascript
const context = await ragSystem.getContextWithAST('deployment automation', 'executor');
```

### Prometheus (Project Management)
```javascript
const context = await ragSystem.getContextWithAST('workflow coordination', 'prometheus');
```

## 📊 System Status Check

### Verify Build Status
```bash
npm run build
```

### Check Environment Variables
```bash
cat .env
```

### Test Configuration Loading
```javascript
const { RAGConfigLoader } = require('@aris/rag');
const config = RAGConfigLoader.getInstance().getConfig();
console.log('Config loaded:', config.supabaseUrl ? 'SUCCESS' : 'FAILED');
```

## 🛠️ Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   ```bash
   # Check if .env file exists and has proper values
   cat .env
   ```

2. **Supabase Connection Failed**
   - Verify project URL and API keys
   - Check if pg_vector extension is enabled
   - Ensure database migration was completed

3. **OpenAI API Error**
   - Verify API key is valid
   - Check API quota and billing
   - Ensure network connectivity

4. **Build Errors**
   ```bash
   # Clean and rebuild
   npm run build
   ```

### Debug Commands

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check package dependencies
npm ls

# Test individual components
node -e "require('./packages/rag/dist').RAGConfigLoader.getInstance().getConfig()"
```

## 📈 Performance Monitoring

### Database Performance
- Monitor Supabase dashboard for query performance
- Check vector index usage
- Monitor embedding generation time

### RAG System Performance
- Context retrieval time: <2 seconds
- Similarity search: <100ms
- File processing: 50 files per batch

### Workspace Ingestion Performance
- Processing time per file
- Memory usage during ingestion
- Error rate and retry attempts

## 🔄 Sprint 2 Preparation

### Fine-Tuning Pipeline Requirements
- [ ] Training data collection infrastructure
- [ ] Model fine-tuning capabilities
- [ ] Advanced context management
- [ ] Real-time learning integration

### Next Development Session
1. **Training Data Collection**
   - High-quality code examples
   - Agent-specific training data
   - Quality assessment and filtering

2. **Model Specialization**
   - Agent-specific fine-tuning
   - Domain-specific training
   - Performance optimization

3. **Advanced Context Management**
   - Multi-layer context processing
   - IDE state integration
   - Real-time context updates

## 📞 Support Resources

### Documentation
- `RAG_SETUP_GUIDE.md` - Comprehensive setup guide
- `SPRINT_1_COMPLETION_SUMMARY.md` - Technical details
- `config/rag-config.json` - Configuration reference

### Test Scripts
- `test-rag-integration.js` - Complete system test
- `setup-production-rag.js` - Interactive setup
- `workspace-ingestion.js` - Codebase processing

### Monitoring
- Supabase dashboard for database metrics
- OpenAI dashboard for API usage
- Application logs for system performance

---

**Status:** ✅ Sprint 1 Complete - Ready for Production  
**Next:** 🚀 Sprint 2 (Fine-Tuning Pipeline) Development 