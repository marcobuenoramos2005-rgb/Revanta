-- =============================================================================
-- REVANTA — Esquema inicial
-- Cada fila pertenece a un usuario (user_id). Row Level Security (RLS) garantiza
-- que un usuario autenticado solo puede leer y modificar sus propias filas.
-- Los usuarios anónimos no tienen acceso a ninguna tabla.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tipos enumerados
-- -----------------------------------------------------------------------------
create type public.product_status as enum ('in_stock', 'listed', 'reserved', 'sold', 'archived');

create type public.product_condition as enum ('new_with_tags', 'new', 'very_good', 'good', 'fair');

create type public.sales_platform as enum (
  'vinted', 'wallapop', 'ebay', 'milanuncios', 'todocoleccion', 'in_person', 'other'
);

create type public.expense_category as enum (
  'shipping', 'packaging', 'transport', 'platform_fees', 'subscriptions', 'supplies', 'other'
);

-- -----------------------------------------------------------------------------
-- Utilidades
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles: datos del negocio de cada usuario (1:1 con auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  business_name text check (char_length(business_name) <= 100),
  currency char(3) not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil automáticamente al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- products: inventario
-- -----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  brand text check (char_length(brand) <= 100),
  category text check (char_length(category) <= 100),
  size text check (char_length(size) <= 50),
  color text check (char_length(color) <= 50),
  condition public.product_condition,
  status public.product_status not null default 'in_stock',
  purchase_price numeric(12, 2) not null default 0 check (purchase_price >= 0),
  purchase_date date,
  purchase_source text check (char_length(purchase_source) <= 200),
  listed_price numeric(12, 2) check (listed_price >= 0),
  sku text check (char_length(sku) <= 64),
  notes text check (char_length(notes) <= 5000),
  photo_paths text[] not null default '{}' check (cardinality(photo_paths) <= 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Permite claves foráneas compuestas (producto + dueño) desde otras tablas,
  -- para que nadie pueda enlazar un gasto o venta a un producto ajeno.
  unique (id, user_id)
);

create index products_user_status_idx on public.products (user_id, status);
create index products_user_created_idx on public.products (user_id, created_at desc);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- expenses: compras de material, envíos y gastos generales
-- -----------------------------------------------------------------------------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id uuid,
  category public.expense_category not null,
  description text check (char_length(description) <= 500),
  amount numeric(12, 2) not null check (amount > 0),
  expense_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (product_id, user_id)
    references public.products (id, user_id)
    on delete set null (product_id)
);

create index expenses_user_date_idx on public.expenses (user_id, expense_date desc);
create index expenses_product_idx on public.expenses (product_id) where product_id is not null;

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- sales: una venta por producto (artículos de segunda mano son únicos)
-- -----------------------------------------------------------------------------
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id uuid not null unique,
  platform public.sales_platform not null,
  sale_price numeric(12, 2) not null check (sale_price >= 0),
  platform_fee numeric(12, 2) not null default 0 check (platform_fee >= 0),
  shipping_cost numeric(12, 2) not null default 0 check (shipping_cost >= 0),
  sale_date date not null default current_date,
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (product_id, user_id)
    references public.products (id, user_id)
    on delete cascade
);

create index sales_user_date_idx on public.sales (user_id, sale_date desc);

create trigger sales_set_updated_at
  before update on public.sales
  for each row execute function public.set_updated_at();

-- Mantiene el estado del producto sincronizado con sus ventas.
-- Se ejecuta con los permisos del usuario (no security definer), así que RLS sigue aplicando.
create or replace function public.sync_product_status_on_sale()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.products set status = 'sold' where id = new.product_id;
  elsif tg_op = 'DELETE' then
    update public.products set status = 'in_stock'
      where id = old.product_id and status = 'sold';
  end if;
  return null;
end;
$$;

create trigger sales_sync_product_status
  after insert or delete on public.sales
  for each row execute function public.sync_product_status_on_sale();

-- -----------------------------------------------------------------------------
-- ai_generations: historial de anuncios generados con IA (control de uso y coste)
-- -----------------------------------------------------------------------------
create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id uuid,
  model text not null check (char_length(model) <= 100),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  title text check (char_length(title) <= 300),
  description text check (char_length(description) <= 10000),
  created_at timestamptz not null default now(),
  foreign key (product_id, user_id)
    references public.products (id, user_id)
    on delete set null (product_id)
);

create index ai_generations_user_created_idx on public.ai_generations (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Vista de beneficio neto por producto
-- security_invoker = true → la vista respeta el RLS de las tablas subyacentes.
-- Beneficio neto = venta − comisión − envío − precio de compra − gastos del producto
-- -----------------------------------------------------------------------------
create view public.product_profit
with (security_invoker = true)
as
select
  p.id as product_id,
  p.user_id,
  p.title,
  p.status,
  p.purchase_price,
  p.purchase_date,
  s.id as sale_id,
  s.platform,
  s.sale_price,
  s.platform_fee,
  s.shipping_cost,
  s.sale_date,
  coalesce(e.total, 0)::numeric(12, 2) as product_expenses,
  case
    when s.id is null then null
    else (s.sale_price - s.platform_fee - s.shipping_cost - p.purchase_price - coalesce(e.total, 0))::numeric(12, 2)
  end as net_profit,
  case
    when s.id is null or p.purchase_date is null then null
    else s.sale_date - p.purchase_date
  end as days_to_sell
from public.products p
left join public.sales s on s.product_id = p.id
left join lateral (
  select sum(x.amount) as total
  from public.expenses x
  where x.product_id = p.id
) e on true;

-- =============================================================================
-- Seguridad: Row Level Security
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.expenses enable row level security;
alter table public.sales enable row level security;
alter table public.ai_generations enable row level security;

-- Los visitantes anónimos no tienen ningún permiso sobre los datos.
revoke all on public.profiles, public.products, public.expenses, public.sales,
  public.ai_generations, public.product_profit from anon;

-- profiles: el perfil se crea automáticamente; el usuario solo puede verlo y editarlo.
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- products
create policy "products_select_own" on public.products
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "products_insert_own" on public.products
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "products_update_own" on public.products
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "products_delete_own" on public.products
  for delete to authenticated using ((select auth.uid()) = user_id);

-- expenses
create policy "expenses_select_own" on public.expenses
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "expenses_insert_own" on public.expenses
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "expenses_update_own" on public.expenses
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "expenses_delete_own" on public.expenses
  for delete to authenticated using ((select auth.uid()) = user_id);

-- sales
create policy "sales_select_own" on public.sales
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "sales_insert_own" on public.sales
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "sales_update_own" on public.sales
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "sales_delete_own" on public.sales
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ai_generations: solo lectura e inserción. Sin update/delete para que el
-- historial (y el límite de uso diario) no pueda manipularse.
create policy "ai_generations_select_own" on public.ai_generations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "ai_generations_insert_own" on public.ai_generations
  for insert to authenticated with check ((select auth.uid()) = user_id);
revoke update, delete on public.ai_generations from authenticated;

-- =============================================================================
-- Almacenamiento de fotos: bucket privado, una carpeta por usuario (<user_id>/...)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-photos', 'product-photos', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
);

create policy "product_photos_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "product_photos_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "product_photos_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'product-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "product_photos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
