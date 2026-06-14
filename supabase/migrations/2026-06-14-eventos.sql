-- ============================================================================
-- Migração: eventos do calendário
-- Rode UMA vez no Supabase → SQL Editor. Idempotente.
-- (Aniversários NÃO entram aqui — são derivados de jovens.birth / auxiliares.birth.)
-- ============================================================================
create table if not exists public.eventos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  data        date not null,                 -- dia do evento (YYYY-MM-DD)
  descricao   text,
  criado_por  uuid references public.auxiliares(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists eventos_data_idx on public.eventos (data);

alter table public.eventos enable row level security;

-- leitura/escrita por qualquer autenticado (cooperador + auxiliar), como presencas
drop policy if exists "read auth" on public.eventos;
create policy "read auth" on public.eventos for select to authenticated using (true);
drop policy if exists "write auth" on public.eventos;
create policy "write auth" on public.eventos for all to authenticated using (true) with check (true);

drop trigger if exists t_evt_upd on public.eventos;
create trigger t_evt_upd before update on public.eventos
  for each row execute function public.touch_updated_at();
