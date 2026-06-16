-- ============================================================================
-- Excluir auxiliar (remover TUDO): a conta de login (auth.users), a linha em
-- auxiliares (cascata) e a ficha de jovem da pessoa (+ presenças, cascata).
-- SECURITY DEFINER (roda como dono da função, que tem acesso ao schema auth) e
-- só admin; não deixa o usuário excluir a própria conta.
-- Rode no Supabase → SQL Editor. Idempotente.
-- ============================================================================
create or replace function public.delete_auxiliar(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_jovem uuid;
begin
  if not public.is_admin() then raise exception 'SEM_PERMISSAO'; end if;
  if p_id = auth.uid() then raise exception 'NAO_PODE_EXCLUIR_SI'; end if;
  select jovem_id into v_jovem from public.auxiliares where id = p_id;
  -- apagar a conta de auth remove, por cascata, a linha em public.auxiliares
  -- (auxiliares.id references auth.users on delete cascade)
  delete from auth.users where id = p_id;
  -- apagar a pessoa (jovem) remove, por cascata, as presenças dela
  if v_jovem is not null then
    delete from public.jovens where id = v_jovem;
  end if;
end;
$$;
grant execute on function public.delete_auxiliar(uuid) to authenticated;

notify pgrst, 'reload schema';
