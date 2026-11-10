-- Pruebas del borrado de cuenta (delete_own_account).
begin;
create extension if not exists pgtap with schema extensions;

select plan(7);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.com');

-- Datos de A y de B
set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
insert into public.products (id, title) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Producto de A');
insert into public.expenses (category, amount) values ('other', 5);

set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';
insert into public.products (title) values ('Producto de B');

-- Un anónimo no puede ejecutar la función
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select throws_ok(
  $$ select public.delete_own_account() $$,
  '42501',
  null,
  'Un anónimo no puede borrar cuentas'
);

-- A borra su cuenta
set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';
select lives_ok($$ select public.delete_own_account() $$, 'A puede borrar su propia cuenta');

reset role;

select is(
  (select count(*)::int from auth.users where id = '11111111-1111-1111-1111-111111111111'),
  0, 'El usuario A ya no existe'
);
select is(
  (select count(*)::int from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  0, 'El perfil de A se ha borrado'
);
select is(
  (select count(*)::int from public.products where user_id = '11111111-1111-1111-1111-111111111111')
  + (select count(*)::int from public.expenses where user_id = '11111111-1111-1111-1111-111111111111'),
  0, 'Los productos y gastos de A se han borrado'
);
select is(
  (select count(*)::int from auth.users where id = '22222222-2222-2222-2222-222222222222'),
  1, 'La cuenta de B sigue existiendo'
);
select is(
  (select count(*)::int from public.products where user_id = '22222222-2222-2222-2222-222222222222'),
  1, 'Los datos de B no se han tocado'
);

select * from finish();
rollback;
