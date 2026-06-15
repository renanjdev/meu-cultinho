-- ============================================================================
-- Meu Cultinho — esquema Supabase (Postgres)
-- Rode isto no Supabase → SQL Editor (uma vez). Idempotente o suficiente para
-- recriar em dev. Modelo derivado de src/data/types.ts + src/data/seed.ts.
-- ============================================================================

-- gen_random_uuid() já vem no Postgres do Supabase (extensão pgcrypto ativa).

-- ---------- updated_at automático -------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ============================================================================
-- Tabelas
-- ============================================================================

-- Congregação (linha única de configuração)
create table if not exists public.congregacao (
  id          int primary key default 1,
  name        text not null default 'Central',
  updated_at  timestamptz not null default now(),
  constraint congregacao_singleton check (id = 1)
);

-- Auxiliares = perfis (1:1 com auth.users)
create table if not exists public.auxiliares (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  username    text not null unique,
  role        text not null default 'auxiliar' check (role in ('cooperador','auxiliar')),
  phone       text,
  birth       text,                 -- dd/mm/aaaa (igual ao front-end)
  baptism     text,
  presented   text,
  status      text not null default 'Ativo' check (status in ('Ativo','Inativo')),
  photo_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Grupos
create table if not exists public.grupos (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  short       text,
  description text,
  icon        text not null default 'users' check (icon in ('baby','book','users')),
  status      text not null default 'Ativo' check (status in ('Ativo','Inativo')),
  aux_id      uuid references public.auxiliares(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auxiliar ⇄ Grupos (N:N — um auxiliar pode cuidar de vários grupos)
create table if not exists public.auxiliar_grupos (
  auxiliar_id uuid references public.auxiliares(id) on delete cascade,
  grupo_id    uuid references public.grupos(id) on delete cascade,
  primary key (auxiliar_id, grupo_id)
);

-- Jovens
create table if not exists public.jovens (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  birth       text,                 -- dd/mm/aaaa
  sex         text check (sex in ('Masculino','Feminino')),
  batizado    boolean not null default false,
  batismo     text,                 -- dd/mm/aaaa (preenchido só quando batizado)
  grupo_id    uuid references public.grupos(id) on delete set null,
  father      text,
  mother      text,
  phone       text,
  address     text,
  notes       text,
  status      text not null default 'Ativo' check (status in ('Ativo','Inativo')),
  photo_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Migração idempotente (bancos já criados antes das colunas de batismo)
alter table public.jovens add column if not exists batizado boolean not null default false;
alter table public.jovens add column if not exists batismo  text;
-- "selado com o Espírito Santo" (distinto do batismo em água)
alter table public.jovens add column if not exists selado boolean not null default false;

-- Vínculo auxiliar(conta) -> jovem(pessoa): o auxiliar é um jovem com login.
-- 1:1 (um jovem mapeia no máximo uma conta). Definido aqui porque referencia
-- `jovens`, criada acima. Ver supabase/migrations/2026-06-15-aux-jovem-link.sql.
-- ON DELETE RESTRICT: não dá pra apagar a ficha de jovem enquanto ela for o
-- login de um auxiliar (a conta tem que ser removida antes).
alter table public.auxiliares
  add column if not exists jovem_id uuid references public.jovens(id) on delete restrict;
create unique index if not exists auxiliares_jovem_id_key
  on public.auxiliares(jovem_id) where jovem_id is not null;

-- Presenças (uma marcação por jovem por data)
create table if not exists public.presencas (
  id          uuid primary key default gen_random_uuid(),
  data        date not null,
  grupo_id    uuid references public.grupos(id) on delete set null,
  jovem_id    uuid not null references public.jovens(id) on delete cascade,
  status      text not null check (status in ('present','absent')),
  marcado_por uuid references public.auxiliares(id) on delete set null,
  marcado_em  timestamptz not null default now(),
  unique (data, jovem_id)
);

-- triggers updated_at
drop trigger if exists t_aux_upd on public.auxiliares;
create trigger t_aux_upd before update on public.auxiliares
  for each row execute function public.touch_updated_at();
drop trigger if exists t_grp_upd on public.grupos;
create trigger t_grp_upd before update on public.grupos
  for each row execute function public.touch_updated_at();
drop trigger if exists t_jov_upd on public.jovens;
create trigger t_jov_upd before update on public.jovens
  for each row execute function public.touch_updated_at();

-- ---------- Helper: o usuário logado é admin? (após `auxiliares` existir) -----
-- SECURITY DEFINER para a policy ler `auxiliares` sem recursão de RLS.
-- "master" = Cooperador (líder do culto de jovens/menores). Mantido o nome
-- is_admin() por ser usado nas policies; o papel master é 'cooperador'.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.auxiliares a where a.id = auth.uid() and a.role = 'cooperador');
$$;

-- Trava de escalada de privilégio: só admin muda role/status (o WITH CHECK do
-- RLS não restringe colunas, então o próprio usuário poderia se promover sem
-- este trigger).
create or replace function public.guard_aux_privileged()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin()
     and (new.role is distinct from old.role
          or new.status is distinct from old.status
          or new.jovem_id is distinct from old.jovem_id) then
    raise exception 'SEM_PERMISSAO';
  end if;
  return new;
end; $$;
drop trigger if exists t_aux_guard on public.auxiliares;
create trigger t_aux_guard before update on public.auxiliares
  for each row execute function public.guard_aux_privileged();

-- Espelho jovens -> auxiliares: jovens é a fonte da verdade de nome/nascimento
-- da pessoa; ao editar a ficha de jovem vinculada, propaga p/ a conta (nome de
-- login, calendário do cooperador). Só nome/nascimento → passa pelo guard, sem
-- recursão. Definido após `jovens` existir (ver migração 2026-06-15).
create or replace function public.mirror_jovem_to_aux()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.name is distinct from old.name or new.birth is distinct from old.birth then
    update public.auxiliares
       set name = new.name, birth = new.birth
     where jovem_id = new.id
       and (name is distinct from new.name or birth is distinct from new.birth);
  end if;
  return new;
end; $$;
drop trigger if exists t_jov_mirror_aux on public.jovens;
create trigger t_jov_mirror_aux after update on public.jovens
  for each row execute function public.mirror_jovem_to_aux();

-- ============================================================================
-- RLS — app interno (somente staff autenticado). Leitura total p/ autenticados;
-- jovens/grupos/presenças geridos por admin E auxiliar (conforme a spec);
-- perfis de auxiliar: só o próprio ou admin editam.
-- ============================================================================
alter table public.congregacao     enable row level security;
alter table public.auxiliares       enable row level security;
alter table public.grupos           enable row level security;
alter table public.auxiliar_grupos  enable row level security;
alter table public.jovens           enable row level security;
alter table public.presencas        enable row level security;

-- leitura para qualquer autenticado
create policy "read auth" on public.congregacao    for select to authenticated using (true);
create policy "read auth" on public.auxiliares      for select to authenticated using (true);
create policy "read auth" on public.grupos          for select to authenticated using (true);
create policy "read auth" on public.auxiliar_grupos for select to authenticated using (true);
create policy "read auth" on public.jovens          for select to authenticated using (true);
create policy "read auth" on public.presencas       for select to authenticated using (true);

-- jovens / grupos / presenças: escrita por qualquer autenticado (admin + auxiliar)
create policy "write auth" on public.jovens    for all to authenticated using (true) with check (true);
create policy "write auth" on public.grupos    for all to authenticated using (true) with check (true);
create policy "write auth" on public.presencas for all to authenticated using (true) with check (true);

-- congregação: só admin edita
create policy "admin write" on public.congregacao for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- perfis: o próprio atualiza o seu; admin gere todos
create policy "self or admin update" on public.auxiliares for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "admin insert" on public.auxiliares for insert to authenticated with check (public.is_admin());
create policy "admin delete" on public.auxiliares for delete to authenticated using (public.is_admin());

-- vínculos auxiliar⇄grupo: admin gere
create policy "admin manage" on public.auxiliar_grupos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- Seed (dados fictícios) — grupos + jovens. Auxiliares/admin precisam de conta
-- de auth (ver instruções no app/README), então não entram aqui.
-- ============================================================================
insert into public.congregacao (id, name) values (1, 'Central')
  on conflict (id) do nothing;

insert into public.grupos (name, short, description, icon, status) values
  ('Meninos que não sabem ler', 'Meninos (não leem)', null, 'baby',  'Ativo'),
  ('Meninas que não sabem ler', 'Meninas (não leem)', null, 'baby',  'Ativo'),
  ('Meninos até 12 anos',       'Meninos até 12',     null, 'book',  'Ativo'),
  ('Meninas até 12 anos',       'Meninas até 12',     null, 'book',  'Ativo'),
  ('Moços',                     'Moços',              null, 'users', 'Ativo'),
  ('Moças',                     'Moças',              null, 'users', 'Ativo')
on conflict do nothing;

insert into public.jovens (name, birth, sex, grupo_id, father, mother, phone, address, notes, status)
select v.name, v.birth, v.sex,
       (select id from public.grupos g where g.name = v.gname limit 1),
       v.father, v.mother, v.phone, v.address, v.notes, 'Ativo'
from (values
  ('João Miguel Soares','14/03/2020','Masculino','Meninos que não sabem ler','Marcos Soares','Ana Soares','(11) 98472-1130','Rua das Acácias, 45 — Jd. Primavera','Gosta de chegar cedo. Tímido no início.'),
  ('Isabela Santos','02/09/2015','Feminino','Meninas até 12 anos','Paulo Santos','Rita Santos','(11) 99135-0042','Av. Central, 1203 — Centro','Ajuda a organizar as cadeiras.'),
  ('Lucas Almeida','21/11/2010','Masculino','Moços','José Almeida','Sandra Almeida','(11) 98800-7711','Rua Bela Vista, 88 — Vila Nova','Trabalha aos sábados, às vezes chega atrasado.'),
  ('Noemi Ferreira','05/06/2009','Feminino','Moças','Daniel Ferreira','Lúcia Ferreira','(11) 97001-2389','Rua do Sol, 12 — Jd. das Flores','Auxilia no grupo das menores quando precisa.'),
  ('Pedro Henrique Dias','30/01/2015','Masculino','Meninos até 12 anos','Henrique Dias','Carla Dias','(11) 98245-6677','Rua das Palmeiras, 301 — Centro','')
) as v(name, birth, sex, gname, father, mother, phone, address, notes)
where not exists (select 1 from public.jovens j where j.name = v.name);

-- ============================================================================
-- Eventos do calendário (aniversários são derivados de jovens/auxiliares.birth)
-- ============================================================================
create table if not exists public.eventos (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  data        date not null,
  descricao   text,
  criado_por  uuid references public.auxiliares(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists eventos_data_idx on public.eventos (data);

alter table public.eventos enable row level security;
drop policy if exists "read auth" on public.eventos;
create policy "read auth" on public.eventos for select to authenticated using (true);
drop policy if exists "write auth" on public.eventos;
create policy "write auth" on public.eventos for all to authenticated using (true) with check (true);

drop trigger if exists t_evt_upd on public.eventos;
create trigger t_evt_upd before update on public.eventos
  for each row execute function public.touch_updated_at();
