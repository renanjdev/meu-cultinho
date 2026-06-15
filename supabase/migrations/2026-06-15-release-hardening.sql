-- ============================================================================
-- Hardening de release (auditoria): código de convite gerado no servidor com
-- fonte criptográfica + espelho jovens->auxiliares respeitando a fronteira de
-- conta. Rode no Supabase → SQL Editor. Idempotente.
-- ============================================================================

-- 1) Geração do código de convite NO SERVIDOR (CSPRNG via pgcrypto), só admin.
--    O cliente parou de gerar com Math.random (previsível) e de gravar direto.
create or replace function public.rotate_aux_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if not public.is_admin() then
    raise exception 'SEM_PERMISSAO';
  end if;
  -- 8 chars hex MAIÚSCULOS de bytes aleatórios criptográficos (sem 0/O,1/I ambíguos:
  -- hex não tem as letras O/I/L)
  v_code := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));
  update public.congregacao set aux_invite_code = v_code where id = 1;
  return v_code;
end;
$$;
grant execute on function public.rotate_aux_invite_code() to authenticated;

-- 2) Espelho jovens -> auxiliares: só propaga nome/nascimento quando quem edita é
--    ADMIN ou o DONO da própria conta vinculada. Evita que um auxiliar comum,
--    editando a ficha de jovem de OUTRO auxiliar (RLS "write auth" é ampla),
--    reescreva silenciosamente o nome de login alheio.
create or replace function public.mirror_jovem_to_aux()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.name is distinct from old.name or new.birth is distinct from old.birth)
     and (
       public.is_admin()
       or exists (
         select 1 from public.auxiliares a
         where a.jovem_id = new.id and a.id = auth.uid()
       )
     ) then
    update public.auxiliares
       set name = new.name, birth = new.birth
     where jovem_id = new.id
       and (name is distinct from new.name or birth is distinct from new.birth);
  end if;
  return new;
end; $$;
-- o trigger t_jov_mirror_aux já existe e aponta para esta função (replace basta).

notify pgrst, 'reload schema';
