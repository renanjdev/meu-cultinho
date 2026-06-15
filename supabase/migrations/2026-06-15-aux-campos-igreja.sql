-- ============================================================================
-- Campos da igreja no autocadastro do auxiliar: batismo (data), selado (sim/não)
-- e apresentação ao cargo (data). Como o auxiliar é um jovem, batismo/selado vão
-- na ficha `jovens` (a pessoa); a apresentação ao cargo vai em `auxiliares`
-- (dado da função). Rode no Supabase → SQL Editor. Idempotente. Aditiva.
-- ============================================================================

-- 1) "Selado com o Espírito Santo" (distinto do batismo em água). Atributo da
--    pessoa → fica em jovens. batizado/batismo já existem em jovens.
alter table public.jovens add column if not exists selado boolean not null default false;

-- 2) redeem_aux_invite ganha batismo/selado/apresentação. Os 3 novos têm DEFAULT,
--    então uma chamada com os 4 args antigos (cliente atual) ainda resolve para
--    esta função — sem ambiguidade (só existe uma) e sem janela de quebra.
drop function if exists public.redeem_aux_invite(text, text, text, text);
create or replace function public.redeem_aux_invite(
  p_code text, p_name text, p_username text,
  p_birth text default null,
  p_batismo text default null,
  p_selado boolean default false,
  p_presented text default null
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
  v_selado    boolean := coalesce(p_selado, false);
  v_jovem     uuid;
begin
  if auth.uid() is null then raise exception 'NAO_AUTENTICADO'; end if;
  if p_code is null or p_code <> (select aux_invite_code from public.congregacao where id = 1) then
    raise exception 'CODIGO_INVALIDO';
  end if;
  if v_name = '' or v_user = '' then raise exception 'DADOS_INCOMPLETOS'; end if;
  if v_user !~ '^[a-z0-9][a-z0-9._-]{2,}$' then raise exception 'USUARIO_INVALIDO'; end if;
  -- datas (se vierem) precisam ser dd/mm/aaaa; senão guarda nulo (não barra)
  if v_birth     is not null and v_birth     !~ '^\d{2}/\d{2}/\d{4}$' then v_birth := null; end if;
  if v_batismo   is not null and v_batismo   !~ '^\d{2}/\d{2}/\d{4}$' then v_batismo := null; end if;
  if v_presented is not null and v_presented !~ '^\d{2}/\d{2}/\d{4}$' then v_presented := null; end if;
  if exists (select 1 from public.auxiliares where username = v_user) then
    raise exception 'USUARIO_EXISTE';
  end if;
  if exists (select 1 from public.auxiliares where id = auth.uid()) then return; end if;
  -- PESSOA (jovem): batizado = tem data de batismo
  insert into public.jovens (name, birth, batizado, batismo, selado, status)
  values (v_name, v_birth, v_batismo is not null, v_batismo, v_selado, 'Ativo')
  returning id into v_jovem;
  -- CONTA (auxiliar): apresentação ao cargo é dado da função
  insert into public.auxiliares (id, name, username, role, status, birth, baptism, presented, jovem_id)
  values (auth.uid(), v_name, v_user, 'auxiliar', 'Ativo', v_birth, v_batismo, v_presented, v_jovem);
end;
$$;
grant execute on function public.redeem_aux_invite(text, text, text, text, text, boolean, text) to authenticated;

-- 3) Recarrega o cache de assinaturas do PostgREST.
notify pgrst, 'reload schema';
