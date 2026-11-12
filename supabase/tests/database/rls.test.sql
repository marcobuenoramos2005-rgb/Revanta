-- Pruebas de aislamiento entre usuarios (RLS) y del cálculo de beneficio.
-- Ejecutar con: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(30);

-- -----------------------------------------------------------------------------
-- Datos de prueba: dos usuarios (A y B)
-- -----------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.com');

select is(
  (select count(*)::int from public.profiles
   where id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222')),
  2,
  'Se crea un perfil automáticamente para cada usuario nuevo'
);

-- -----------------------------------------------------------------------------
-- Usuario A crea sus datos
-- -----------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.products (id, title, purchase_price, purchase_date)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'Chaqueta vaquera Levi''s', 10.00, '2026-10-01') $$,
  'A puede crear un producto (user_id se rellena automáticamente)'
);

select is(
  (select user_id from public.products where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'El producto queda asignado a A'
);

select lives_ok(
  $$ insert into public.expenses (product_id, category, amount, expense_date)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'packaging', 1.50, '2026-10-02') $$,
  'A puede registrar un gasto asociado a su producto'
);

select lives_ok(
  $$ insert into public.expenses (category, amount) values ('subscriptions', 4.99) $$,
  'A puede registrar un gasto general'
);

select lives_ok(
  $$ insert into public.sales (product_id, platform, sale_price, platform_fee, shipping_cost, sale_date)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'vinted', 30.00, 2.00, 3.00, '2026-10-11') $$,
  'A puede registrar la venta de su producto'
);

select is(
  (select status::text from public.products where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  'sold',
  'Al registrar la venta el producto pasa a "vendido"'
);

-- Beneficio neto = 30 − 2 − 3 − 10 − 1,50 = 13,50
select is(
  (select net_profit from public.product_profit where product_id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  13.50::numeric(12, 2),
  'El beneficio neto se calcula correctamente (13,50)'
);

select is(
  (select days_to_sell from public.product_profit where product_id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  10,
  'Los días hasta la venta se calculan correctamente'
);

-- Segundo producto de A, sin vender (para probar ventas ajenas más abajo).
insert into public.products (id, title) values ('aaaaaaaa-0000-0000-0000-000000000002', 'Bolso sin vender');

select lives_ok(
  $$ insert into public.ai_generations (product_id, model, title)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'test-model', 'Título de prueba') $$,
  'A puede guardar una generación de IA'
);

select throws_ok(
  $$ delete from public.ai_generations $$,
  '42501',
  null,
  'Nadie puede borrar el historial de IA (protege el límite de uso)'
);

select lives_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('product-photos', '11111111-1111-1111-1111-111111111111/foto.jpg', '11111111-1111-1111-1111-111111111111') $$,
  'A puede subir fotos en su propia carpeta'
);

-- -----------------------------------------------------------------------------
-- Usuario B intenta acceder a los datos de A
-- -----------------------------------------------------------------------------
set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is((select count(*)::int from public.products), 0, 'B no ve productos de A');
select is((select count(*)::int from public.expenses), 0, 'B no ve gastos de A');
select is((select count(*)::int from public.sales), 0, 'B no ve ventas de A');
select is((select count(*)::int from public.product_profit), 0, 'B no ve beneficios de A');
select is((select count(*)::int from public.ai_generations), 0, 'B no ve generaciones de IA de A');
select is((select count(*)::int from public.profiles), 1, 'B solo ve su propio perfil');
select is(
  (select count(*)::int from storage.objects where bucket_id = 'product-photos'),
  0,
  'B no ve fotos de A'
);

-- Modificar o borrar datos ajenos no afecta a ninguna fila.
update public.products set title = 'hackeado' where id = 'aaaaaaaa-0000-0000-0000-000000000001';
delete from public.products where id = 'aaaaaaaa-0000-0000-0000-000000000001';
delete from public.expenses;
update public.profiles set business_name = 'hackeado' where id = '11111111-1111-1111-1111-111111111111';

select throws_ok(
  $$ insert into public.products (user_id, title) values ('11111111-1111-1111-1111-111111111111', 'falso') $$,
  '42501',
  null,
  'B no puede crear productos a nombre de A'
);

select throws_ok(
  $$ insert into public.expenses (product_id, category, amount)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'other', 1) $$,
  '23503',
  null,
  'B no puede asociar un gasto a un producto de A'
);

select throws_ok(
  $$ insert into public.sales (product_id, platform, sale_price)
     values ('aaaaaaaa-0000-0000-0000-000000000002', 'other', 1) $$,
  '23503',
  null,
  'B no puede registrar ventas de productos de A'
);

select throws_ok(
  $$ insert into storage.objects (bucket_id, name, owner_id)
     values ('product-photos', '11111111-1111-1111-1111-111111111111/intruso.jpg', '22222222-2222-2222-2222-222222222222') $$,
  '42501',
  null,
  'B no puede subir fotos en la carpeta de A'
);

-- -----------------------------------------------------------------------------
-- Visitante anónimo
-- -----------------------------------------------------------------------------
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';

select throws_ok($$ select * from public.products $$, '42501', null, 'Un anónimo no puede leer productos');
select throws_ok($$ select * from public.sales $$, '42501', null, 'Un anónimo no puede leer ventas');
select throws_ok($$ select * from public.product_profit $$, '42501', null, 'Un anónimo no puede leer beneficios');
select throws_ok(
  $$ insert into public.products (title) values ('anónimo') $$,
  '42501',
  null,
  'Un anónimo no puede crear productos'
);

-- -----------------------------------------------------------------------------
-- Comprobación final como administrador: los datos de A siguen intactos
-- -----------------------------------------------------------------------------
reset role;

select is(
  (select title from public.products where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  'Chaqueta vaquera Levi''s',
  'Los intentos de B no modificaron ni borraron el producto de A'
);

select is(
  (select count(*)::int from public.expenses where user_id = '11111111-1111-1111-1111-111111111111'),
  2,
  'Los intentos de B no borraron los gastos de A'
);

select is(
  (select business_name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  null,
  'Los intentos de B no modificaron el perfil de A'
);

select * from finish();
rollback;
