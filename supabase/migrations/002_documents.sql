create extension if not exists vector with schema extensions;

create table if not exists documents (
  id         bigint primary key generated always as identity,
  content    text not null,
  metadata   jsonb default '{}',
  embedding  vector(1536)
);

alter table documents enable row level security;

create policy "public read" on documents for select using (true);

create index on documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function match_documents(
  query_embedding vector(1536),
  match_count     int default 5,
  filter          jsonb default '{}'
)
returns table (
  id       bigint,
  content  text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
