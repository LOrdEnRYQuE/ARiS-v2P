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

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS code_chunks_embeddings_idx;
DROP INDEX IF EXISTS code_chunks_metadata_idx;
DROP INDEX IF EXISTS code_chunks_source_idx;
DROP INDEX IF EXISTS code_chunks_language_idx;

-- Create index for vector similarity search
CREATE INDEX code_chunks_embeddings_idx 
ON code_chunks 
USING ivfflat (embeddings vector_cosine_ops)
WITH (lists = 100);

-- Create index for metadata queries
CREATE INDEX code_chunks_metadata_idx 
ON code_chunks USING GIN (metadata);

-- Create index for source filtering
CREATE INDEX code_chunks_source_idx 
ON code_chunks ((metadata->>'source'));

-- Create index for language filtering
CREATE INDEX code_chunks_language_idx 
ON code_chunks ((metadata->>'language'));

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS match_code_chunks(vector(1536), float, int);
DROP FUNCTION IF EXISTS match_code_chunks_by_agent(vector(1536), text, float, int);
DROP FUNCTION IF EXISTS search_code_chunks_by_metadata(jsonb, int);
DROP FUNCTION IF EXISTS get_code_chunks_stats();

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
    avg_embedding_quality float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::bigint as total_chunks,
        COALESCE(SUM(LENGTH(content)), 0)::bigint as total_size,
        AVG(1 - (embeddings <=> embeddings)) as avg_embedding_quality
    FROM code_chunks;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_code_chunks_updated_at ON code_chunks;

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