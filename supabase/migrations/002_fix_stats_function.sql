-- Fix the get_code_chunks_stats function to avoid nested aggregates
DROP FUNCTION IF EXISTS get_code_chunks_stats();

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