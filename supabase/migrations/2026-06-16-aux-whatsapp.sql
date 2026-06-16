-- ============================================================================
-- WhatsApp (telefone) no autocadastro do auxiliar. redeem_aux_invite ganha
-- p_phone (DEFAULT null → cliente antigo de 7 args continua resolvendo, sem
-- janela de quebra) e grava o telefone na PESSOA (jovens) e na CONTA (auxiliares).
-- Rode no Supabase → SQL Editor. Idempotente.
-- ============================================================================

drop function if exists public.redeem_aux_invite(text, text, text, text, text, boolean, text);
create or replace function public.redeem_aux_invite(
  p_code text, p_name text, p_username text,
  p_birth text default null,
  p_batismo text default null,
  p_selado boolean default false,
  p_presented text default null,
  p_phone text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user      text := lower(trim(p_username));
  v_name      text := trim(p_name);
  v_birth     text := nullif(trim(coalesce(p_birth, '')), '');
  v_batismo   text := nullif(trim(coalesce(p_batismo, '')), '');
  v_presented text := nullif(trim(coalesce(p_presented, '')), '');
  v_phone     text := nullif(trim(coalesce(p_phone, '')), '');
  v_selado    boolean := coalesce(p_selado, false);
  v_jovem     uuid;
begin
  if auth.uid() is null then raise exception 'NAO_AUTENTICADO'; end if;
  if p_code is null or p_code <> (select aux_invite_code from public.congregacao where id = 1) then
    raise exception 'CODIGO_INVALIDO';
  end if;
  if v_name = '' or v_user = '' then raise exception 'DADOS_INCOMPLETOS'; end if;
  if v_user !~ '^[a-z0-9][a-z0-9._-]{2,}$' then raise exception 'USUARIO_INVALIDO'; end if;
  if v_birth     is not null and v_birth     !~ '^\d{2}/\d{2}/\d{4}$' then v_birth := null; end if;
  if v_batismo   is not null and v_batismo   !~ '^\d{2}/\d{2}/\d{4}$' then v_batismo := null; end if;
  if v_presented is not null and v_presented !~ '^\d{2}/\d{2}/\d{4}$' then v_presented := null; end if;
  if exists (select 1 from public.auxiliares where username = v_user) then
    raise exception 'USUARIO_EXISTE';
  end if;
  if exists (select 1 from public.auxiliares where id = auth.uid()) then return; end if;
  insert into public.jovens (name, birth, batizado, batismo, selado, phone, status)
  values (v_name, v_birth, v_batismo is not null, v_batismo, v_selado, v_phone, 'Ativo')
  returning id into v_jovem;
  insert into public.auxiliares (id, name, username, role, status, birth, baptism, presented, phone, jovem_id)
  values (auth.uid(), v_name, v_user, 'auxiliar', 'Ativo', v_birth, v_batismo, v_presented, v_phone, v_jovem);
end;
$$;
grant execute on function public.redeem_aux_invite(text, text, text, text, text, boolean, text, text) to authenticated;

notify pgrst, 'reload schema';
