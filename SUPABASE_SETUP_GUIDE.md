# Supabase Database Setup Guide

## 🚀 Setting up Supabase for ARiS RAG System

### Step 1: Access Your Supabase Project

1. Go to https://supabase.com
2. Sign in to your account
3. Select your ARiS project (wsrrzrgztasruofvgzyqh)
4. Navigate to the SQL Editor

### Step 2: Enable pg_vector Extension

In the SQL Editor, run this command:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

This enables the pg_vector extension which is required for vector similarity search.

### Step 3: Create the Database Schema

Copy and paste the following migration script into the SQL Editor:

```sql
-- Enable the pg_vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the code_chunks table
CREATE TABLE IF NOT EXISTS code_chunks (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    embeddings vector(1536),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS code_chunks_embeddings_idx
ON code_chunks
USING ivfflat (embeddings vector_cosine_ops)
WITH (lists = 100);

-- Create index for metadata queries
CREATE INDEX IF NOT EXISTS code_chunks_metadata_idx
ON code_chunks USING GIN (metadata);

-- Create index for source filtering
CREATE INDEX IF NOT EXISTS code_chunks_source_idx
ON code_chunks ((metadata->>'source'));

-- Create index for language filtering
CREATE INDEX IF NOT EXISTS code_chunks_language_idx
ON code_chunks ((metadata->>'language'));

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_code_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id TEXT,
    content TEXT,
    embeddings vector(1536),
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cc.id,
        cc.content,
        cc.embeddings,
        cc.metadata,
        1 - (cc.embeddings <=> query_embedding) AS similarity
    FROM code_chunks cc
    WHERE 1 - (cc.embeddings <=> query_embedding) > match_threshold
    ORDER BY cc.embeddings <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create function for agent-specific search
CREATE OR REPLACE FUNCTION match_code_chunks_by_agent(
    query_embedding vector(1536),
    agent_type TEXT,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id TEXT,
    content TEXT,
    embeddings vector(1536),
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cc.id,
        cc.content,
        cc.embeddings,
        cc.metadata,
        1 - (cc.embeddings <=> query_embedding) AS similarity
    FROM code_chunks cc
    WHERE 1 - (cc.embeddings <=> query_embedding) > match_threshold
    AND cc.metadata->>'agentType' = agent_type
    ORDER BY cc.embeddings <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create function for metadata-based search
CREATE OR REPLACE FUNCTION search_code_chunks_by_metadata(
    search_metadata JSONB,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id TEXT,
    content TEXT,
    embeddings vector(1536),
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cc.id,
        cc.content,
        cc.embeddings,
        cc.metadata
    FROM code_chunks cc
    WHERE cc.metadata @> search_metadata
    ORDER BY cc.created_at DESC
    LIMIT match_count;
END;
$$;

-- Create function to get system stats
CREATE OR REPLACE FUNCTION get_code_chunks_stats()
RETURNS TABLE (
    total_chunks bigint,
    total_size bigint,
    avg_embedding_quality float,
    source_distribution JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::bigint as total_chunks,
        COALESCE(SUM(LENGTH(content)), 0)::bigint as total_size,
        AVG(1 - (embeddings <=> embeddings)) as avg_embedding_quality,
        jsonb_object_agg(
            COALESCE(metadata->>'source', 'unknown'),
            COUNT(*)
        ) as source_distribution
    FROM code_chunks;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_code_chunks_updated_at
    BEFORE UPDATE ON code_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON code_chunks TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
```

### Step 4: Verify the Setup

After running the migration, you should see:

1. **Tables**: `code_chunks` table created
2. **Indexes**: Multiple indexes for efficient querying
3. **Functions**: Custom functions for similarity search
4. **Triggers**: Automatic timestamp updates

### Step 5: Test the Database Connection

Run this test query in the SQL Editor:

```sql
-- Test the stats function
SELECT * FROM get_code_chunks_stats();
```

You should see a result with:

- `total_chunks`: 0 (initially empty)
- `total_size`: 0
- `avg_embedding_quality`: null
- `source_distribution`: {}

### Step 6: Verify Environment Variables

Make sure your `.env` file has the correct values:

```bash
SUPABASE_URL=https://wsrrzrgztasruofvgzyqh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcnpyZ3p0YXNydW9mdmd6eXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjI2NDksImV4cCI6MjA2OTUzODY0OX0.X2ykrliGKtjP7wj2dfParGBz0ESMUPJKx8gHsxv1ZHA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcnpyZ3p0YXNydW9mdmd6eXFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk2MjY0OSwiZXhwIjoyMDY5NTM4NjQ5fQ.fk3xtXmi7edJ1Lo3c1PfBS_V9QYosj-j75evyDRUwQ4
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 7: Test the RAG System

Once the database is set up, run:

```bash
node test-rag-integration.js
```

## 🔧 Troubleshooting

### Common Issues

1. **"Extension vector does not exist"**
   - Make sure you ran `CREATE EXTENSION IF NOT EXISTS vector;` first

2. **"Permission denied"**
   - Check that your API keys have the correct permissions
   - Verify the service role key for admin operations

3. **"Connection failed"**
   - Verify your Supabase URL is correct
   - Check network connectivity
   - Ensure your project is active

4. **"Function not found"**
   - Make sure you ran the complete migration script
   - Check that all functions were created successfully

### Verification Commands

```sql
-- Check if pg_vector is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if table exists
SELECT * FROM information_schema.tables WHERE table_name = 'code_chunks';

-- Check if functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%code_chunks%';

-- Test vector operations
SELECT '[1,2,3]'::vector;
```

## 📊 Database Schema Overview

### code_chunks Table

- `id`: Unique identifier for each chunk
- `content`: The actual code or text content
- `embeddings`: Vector representation (1536 dimensions)
- `metadata`: JSON object with additional information
- `created_at`: Timestamp when chunk was created
- `updated_at`: Timestamp when chunk was last updated

### Key Functions

- `match_code_chunks()`: Basic similarity search
- `match_code_chunks_by_agent()`: Agent-specific search
- `search_code_chunks_by_metadata()`: Metadata-based search
- `get_code_chunks_stats()`: System statistics

### Indexes

- `code_chunks_embeddings_idx`: Vector similarity search
- `code_chunks_metadata_idx`: JSON metadata queries
- `code_chunks_source_idx`: Source filtering
- `code_chunks_language_idx`: Language filtering

## 🚀 Next Steps

Once the database is set up:

1. **Test the connection**: Run the test script
2. **Ingest your codebase**: Use the workspace ingestion script
3. **Integrate with agents**: Use the RAG system in your agents
4. **Monitor performance**: Check the Supabase dashboard

The RAG system will be ready for production use!
