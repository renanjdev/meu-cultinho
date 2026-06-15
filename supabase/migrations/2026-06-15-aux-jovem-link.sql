-- ============================================================================
-- Auxiliar = jovem com login (cadastro único vinculado)
-- O auxiliar passa a ter uma ficha em `jovens` (a PESSOA) ligada à CONTA dele,
-- então ele aparece na lista de jovens e no aniversário sem duplicar.
--
-- IMPORTANTE: rode esta migração no Supabase → SQL Editor ANTES de publicar o
-- cliente novo (ela troca a função redeem_aux_invite para a versão com
-- nascimento). Idempotente e aditiva (não apaga dados).
-- ============================================================================

-- 1) Vínculo conta(auxiliar) -> pessoa(jovem). 1:1 e ON DELETE RESTRICT: não dá
--    pra apagar a ficha de jovem enquanto ela for o login de um auxiliar (evita
--    desvincular silencioso + re-duplicação no backfill). O drop/add do FK
--    garante o RESTRICT mesmo se a coluna já existir de uma execução anterior.
alter table public.auxiliares add column if not exists jovem_id uuid;
alter table public.auxiliares drop constraint if exists auxiliares_jovem_id_fkey;
alter table public.auxiliares
  add constraint auxiliares_jovem_id_fkey foreign key (jovem_id)
  references public.jovens(id) on delete restrict;
create unique index if not exists auxiliares_jovem_id_key
  on public.auxiliares(jovem_id) where jovem_id is not null;

-- 2) Backfill: auxiliares que já existem (menos o cooperador) viram também
--    jovens, vinculados. RODA ANTES do guard novo (passo 3) — o guard antigo só
--    barra role/status, então este update de jovem_id passa; depois de reforçado
--    o guard, um update de jovem_id sem ser admin seria bloqueado.
do $$
declare r record; v_jovem uuid;
begin
  for r in
    select id, name, birth from public.auxiliares
    where role = 'auxiliar' and jovem_id is null
  loop
    insert into public.jovens (name, birth, status)
    values (r.name, r.birth, 'Ativo')
    returning id into v_jovem;
    update public.auxiliares set jovem_id = v_jovem where id = r.id;
  end loop;
end $$;

-- 3) Guard de privilégio: além de role/status, agora também trava jovem_id para
--    quem NÃO é admin (senão o auxiliar trocaria o próprio vínculo via RLS
--    "self update" e sumiria/roubaria o aniversário de outra ficha).
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
-- o trigger t_aux_guard já existe e aponta para esta função (replace basta).

-- 4) Espelho: jovens é a fonte da verdade de nome/nascimento da pessoa. Ao
--    editar a ficha de jovem vinculada, propaga p/ a conta de auxiliar (nome de
--    login, calendário do cooperador etc.) — só nome/nascimento, sem recursão
--    (não mexe em role/status/jovem_id, então passa pelo guard).
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

-- 5) Resgate do convite: agora recebe o NASCIMENTO e cria a ficha de jovem + a
--    conta de auxiliar, vinculadas (uma transação só → atômico). Substitui a
--    versão antiga de 3 args.
drop function if exists public.redeem_aux_invite(text, text, text);
create or replace function public.redeem_aux_invite(
  p_code text, p_name text, p_username text, p_birth text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  text := lower(trim(p_username));
  v_name  text := trim(p_name);
  v_birth text := nullif(trim(coalesce(p_birth, '')), '');
  v_jovem uuid;
begin
  if auth.uid() is null then
    raise exception 'NAO_AUTENTICADO';
  end if;
  if p_code is null or p_code <> (select aux_invite_code from public.congregacao where id = 1) then
    raise exception 'CODIGO_INVALIDO';
  end if;
  if v_name = '' or v_user = '' then
    raise exception 'DADOS_INCOMPLETOS';
  end if;
  if v_user !~ '^[a-z0-9][a-z0-9._-]{2,}$' then
    raise exception 'USUARIO_INVALIDO';
  end if;
  if v_birth is not null and v_birth !~ '^\d{2}/\d{2}/\d{4}$' then
    v_birth := null;
  end if;
  if exists (select 1 from public.auxiliares where username = v_user) then
    raise exception 'USUARIO_EXISTE';
  end if;
  -- já tem conta? então não recria (idempotente p/ retries)
  if exists (select 1 from public.auxiliares where id = auth.uid()) then
    return;
  end if;
  -- cria a PESSOA (jovem) e a CONTA (auxiliar), vinculadas
  insert into public.jovens (name, birth, status)
  values (v_name, v_birth, 'Ativo')
  returning id into v_jovem;
  insert into public.auxiliares (id, name, username, role, status, birth, jovem_id)
  values (auth.uid(), v_name, v_user, 'auxiliar', 'Ativo', v_birth, v_jovem);
end;
$$;
grant execute on function public.redeem_aux_invite(text, text, text, text) to authenticated;

-- 6) Vazamento do convite por insider: a policy "read auth" deixava QUALQUER
--    logado ler aux_invite_code direto. Tira a leitura direta da coluna e expõe
--    o código só ao admin via RPC (o app usa get_aux_invite_code).
revoke select on public.congregacao from anon, authenticated;
grant select (id, name, updated_at) on public.congregacao to authenticated;
create or replace function public.get_aux_invite_code()
returns text language sql security definer set search_path = public as $$
  select case when public.is_admin()
    then (select aux_invite_code from public.congregacao where id = 1) end;
$$;
grant execute on function public.get_aux_invite_code() to authenticated;

-- 7) Recarrega o cache de assinaturas do PostgREST imediatamente (evita 404
--    transitório na chamada de 4 args logo após aplicar a migração).
notify pgrst, 'reload schema';
