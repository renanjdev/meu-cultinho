-- ============================================================================
-- Migração: bucket de fotos (perfis + jovens)
-- Rode UMA vez no Supabase → SQL Editor. Idempotente.
-- Bucket PÚBLICO: as fotos são lidas por URL pública (caminho aleatório com
-- UUID + timestamp). As colunas jovens.photo_url / auxiliares.photo_url já
-- existem no schema.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

-- Upload/atualização/remoção no bucket 'fotos' por qualquer autenticado.
-- (Leitura é pública via /object/public — bucket público não precisa policy de select.)
drop policy if exists "fotos insert" on storage.objects;
create policy "fotos insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'fotos');

drop policy if exists "fotos update" on storage.objects;
create policy "fotos update" on storage.objects
  for update to authenticated using (bucket_id = 'fotos') with check (bucket_id = 'fotos');

drop policy if exists "fotos delete" on storage.objects;
create policy "fotos delete" on storage.objects
  for delete to authenticated using (bucket_id = 'fotos');
