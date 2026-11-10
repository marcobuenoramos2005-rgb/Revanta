-- Permite a un usuario autenticado borrar su propia cuenta (derecho de supresión, RGPD).
-- Al borrar auth.users, el borrado en cascada elimina perfil, productos, gastos,
-- ventas e historial de IA. Las fotos del almacenamiento se borran desde la app
-- (API de Storage) antes de llamar a esta función.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No autenticado' using errcode = '42501';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
