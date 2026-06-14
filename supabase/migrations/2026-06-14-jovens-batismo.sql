-- ============================================================================
-- Migração: rastrear batismo dos jovens
-- Rode UMA vez no Supabase → SQL Editor. Idempotente.
--   batizado = é batizado? (sim/não)
--   batismo  = data do batismo em dd/mm/aaaa (só quando batizado)
-- ============================================================================
alter table public.jovens add column if not exists batizado boolean not null default false;
alter table public.jovens add column if not exists batismo  text;
