-- ============================================================================
-- Autocadastro de auxiliares por LINK + código de convite (validado no servidor)
-- Rode UMA vez no Supabase → SQL Editor. Idempotente.
--
-- IMPORTANTE: além desta migração, desligue a confirmação de e-mail em
-- Authentication → Sign In / Providers → Email → "Confirm email" (OFF), porque
-- o login é por usuário (e-mail interno fictício, sem caixa de entrada real).
-- ============================================================================

-- Código de convite (uma string secreta na config). Anon NÃO lê congregacao
-- (RLS "read auth" = só autenticado), então o código não vaza pro público.
alter table public.congregacao add column if not exists aux_invite_code text;
-- código default com mais entropia (10 hex ≈ 16^10), inviável de adivinhar por
-- força bruta; o cooperador pode regenerar pela tela depois.
update public.congregacao
   set aux_invite_code = coalesce(aux_invite_code, upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10)))
 where id = 1;

-- Confere o código sem expô-lo (chamável por anon, antes do signup).
create or replace function public.check_aux_invite(p_code text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select p_code is not null
     and p_code = (select aux_invite_code from public.congregacao where id = 1);
$$;
grant execute on function public.check_aux_invite(text) to anon, authenticated;

-- Resgata o convite: revalida o código e cria o PERFIL do auxiliar (role fixo
-- 'auxiliar', id = usuário logado). SECURITY DEFINER insere sem depender da RLS
-- "admin insert" — mas só passa com o código certo, então o autocadastro fica
-- gated pelo convite. Chamado logo após o auth.signUp do próprio auxiliar.
create or replace function public.redeem_aux_invite(p_code text, p_name text, p_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user text := lower(trim(p_username));
  v_name text := trim(p_name);
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
  if exists (select 1 from public.auxiliares where username = v_user) then
    raise exception 'USUARIO_EXISTE';
  end if;
  -- já tem perfil? então não recria (idempotente p/ retries)
  if exists (select 1 from public.auxiliares where id = auth.uid()) then
    return;
  end if;
  insert into public.auxiliares (id, name, username, role, status)
  values (auth.uid(), v_name, v_user, 'auxiliar', 'Ativo');
end;
$$;
grant execute on function public.redeem_aux_invite(text, text, text) to authenticated;

-- ----------------------------------------------------------------------------
-- SEGURANÇA CRÍTICA: a policy "self or admin update" de auxiliares permite o
-- próprio usuário editar a sua linha, mas o WITH CHECK do RLS não restringe
-- COLUNAS — então sem isto um auxiliar poderia se promover a 'cooperador'
-- (admin) com um update no próprio role. Este trigger bloqueia qualquer
-- mudança de role/status feita por quem NÃO é admin. (Foto/nome/telefone do
-- próprio perfil continuam liberados.)
-- ----------------------------------------------------------------------------
create or replace function public.guard_aux_privileged()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin()
     and (new.role is distinct from old.role or new.status is distinct from old.status) then
    raise exception 'SEM_PERMISSAO';
  end if;
  return new;
end;
$$;

drop trigger if exists t_aux_guard on public.auxiliares;
create trigger t_aux_guard before update on public.auxiliares
  for each row execute function public.guard_aux_privileged();
