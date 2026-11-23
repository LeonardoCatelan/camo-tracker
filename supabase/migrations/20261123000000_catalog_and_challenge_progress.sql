-- =====================================================================
-- MW4 Camo Tracker - Script 1: estrutura do banco
-- =====================================================================

-- ---------- Catálogo (igual para todos os usuários) ----------

create table public.game_modes (
  id                 text primary key,
  name               text not null,
  target_description text,
  sort_order         integer not null default 0
);

create table public.weapon_categories (
  id         text primary key,
  name       text not null,
  sort_order integer not null default 0
);

create table public.weapons (
  id              text primary key,
  name            text not null,
  category_id     text not null references public.weapon_categories (id),
  available_since text,
  sort_order      integer not null default 0
);

create type public.challenge_kind as enum (
  'special',
  'gold',
  'platinum',
  'harmonic_break',
  'mastery',
  'divergence'
);

create table public.challenges (
  id             text primary key,
  kind           public.challenge_kind not null,
  mode_id        text references public.game_modes (id),
  weapon_id      text references public.weapons (id),
  camo_name      text,
  challenge_type text,
  description    text,
  target_amount  integer check (target_amount is null or target_amount > 0),
  note           text,
  sort_order     integer not null default 0,
  -- Camos de arma têm arma; camos de conta (maestria e Divergence) não.
  constraint challenges_weapon_matches_kind
    check ((kind in ('mastery', 'divergence')) = (weapon_id is null)),
  -- Só o Divergence não pertence a um modo.
  constraint challenges_mode_matches_kind
    check ((kind = 'divergence') = (mode_id is null))
);

create index challenges_mode_id_idx on public.challenges (mode_id);
create index challenges_weapon_id_idx on public.challenges (weapon_id);
create index weapons_category_id_idx on public.weapons (category_id);

-- ---------- Progresso (uma linha por usuário + desafio) ----------

create table public.user_challenge_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  challenge_id text not null references public.challenges (id),
  progress     integer not null default 0 check (progress >= 0),
  completed    boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, challenge_id)
);

create index user_challenge_progress_challenge_id_idx
  on public.user_challenge_progress (challenge_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger user_challenge_progress_set_updated_at
  before update on public.user_challenge_progress
  for each row execute function public.set_updated_at();

-- ---------- Segurança (Row Level Security) ----------

alter table public.game_modes enable row level security;
alter table public.weapon_categories enable row level security;
alter table public.weapons enable row level security;
alter table public.challenges enable row level security;
alter table public.user_challenge_progress enable row level security;

-- Catálogo: qualquer um pode ler; ninguém altera pelo app.
create policy "Catálogo é público para leitura" on public.game_modes
  for select to anon, authenticated using (true);
create policy "Catálogo é público para leitura" on public.weapon_categories
  for select to anon, authenticated using (true);
create policy "Catálogo é público para leitura" on public.weapons
  for select to anon, authenticated using (true);
create policy "Catálogo é público para leitura" on public.challenges
  for select to anon, authenticated using (true);

-- Progresso: cada usuário só enxerga e altera o próprio.
create policy "Usuário lê o próprio progresso" on public.user_challenge_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Usuário cria o próprio progresso" on public.user_challenge_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Usuário atualiza o próprio progresso" on public.user_challenge_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Usuário apaga o próprio progresso" on public.user_challenge_progress
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Permissões explícitas (complementam as políticas acima).
revoke all on public.game_modes, public.weapon_categories, public.weapons, public.challenges
  from anon, authenticated;
grant select on public.game_modes, public.weapon_categories, public.weapons, public.challenges
  to anon, authenticated;
revoke all on public.user_challenge_progress from anon, authenticated;
grant select, insert, update, delete on public.user_challenge_progress to authenticated;

-- ---------- Importador do catálogo (fica fora da API pública) ----------

create schema if not exists private;

create function private.upsert_mw4_challenge(
  item jsonb,
  p_kind public.challenge_kind,
  p_mode_id text,
  p_weapon_id text,
  p_sort_order integer
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.challenges as c (
    id, kind, mode_id, weapon_id, camo_name, challenge_type,
    description, target_amount, note, sort_order
  )
  values (
    item ->> 'id', p_kind, p_mode_id, p_weapon_id, item ->> 'camo', item ->> 'tipo',
    item ->> 'descricao', (item ->> 'quantidade')::integer, item ->> 'observacao', p_sort_order
  )
  on conflict (id) do update set
    kind           = excluded.kind,
    mode_id        = excluded.mode_id,
    weapon_id      = excluded.weapon_id,
    camo_name      = excluded.camo_name,
    challenge_type = excluded.challenge_type,
    description    = excluded.description,
    target_amount  = excluded.target_amount,
    note           = excluded.note,
    sort_order     = excluded.sort_order;
end;
$$;

-- Pode ser executado de novo sempre que o JSON for atualizado:
-- insere o que é novo e atualiza o que mudou, sem apagar progresso.
create function private.import_mw4_catalog(catalog jsonb)
returns text
language plpgsql
set search_path = ''
as $$
declare
  mode_key     text;
  mode_data    jsonb;
  category     jsonb;
  category_pos integer;
  weapon       jsonb;
  weapon_pos   integer;
  item         jsonb;
  item_pos     integer;
begin
  for mode_key, mode_data in select key, value from jsonb_each(catalog -> 'modos') loop
    insert into public.game_modes as m (id, name, target_description, sort_order)
    values (
      mode_key,
      mode_data ->> 'nome',
      mode_data ->> 'alvo',
      case mode_key when 'multiplayer' then 1 when 'warzone' then 2 when 'dmz' then 3 else 99 end
    )
    on conflict (id) do update set
      name = excluded.name,
      target_description = excluded.target_description,
      sort_order = excluded.sort_order;

    for category, category_pos in
      select value, ordinality from jsonb_array_elements(mode_data -> 'categorias') with ordinality
    loop
      insert into public.weapon_categories as wc (id, name, sort_order)
      values (category ->> 'id', category ->> 'nome', category_pos)
      on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

      for weapon, weapon_pos in
        select value, ordinality from jsonb_array_elements(category -> 'armas') with ordinality
      loop
        insert into public.weapons as w (id, name, category_id, available_since, sort_order)
        values (
          weapon ->> 'id', weapon ->> 'nome', category ->> 'id',
          weapon ->> 'disponivelDesde', weapon_pos
        )
        on conflict (id) do update set
          name = excluded.name,
          category_id = excluded.category_id,
          available_since = excluded.available_since,
          sort_order = excluded.sort_order;

        for item, item_pos in
          select value, ordinality
          from jsonb_array_elements(weapon -> 'desafiosEspeciais') with ordinality
        loop
          perform private.upsert_mw4_challenge(item, 'special', mode_key, weapon ->> 'id', item_pos::integer);
        end loop;

        perform private.upsert_mw4_challenge(weapon -> 'ouro', 'gold', mode_key, weapon ->> 'id', 4);
        perform private.upsert_mw4_challenge(weapon -> 'platina', 'platinum', mode_key, weapon ->> 'id', 5);
        perform private.upsert_mw4_challenge(weapon -> 'dissonancia', 'harmonic_break', mode_key, weapon ->> 'id', 6);
      end loop;
    end loop;
  end loop;

  for mode_key, mode_data in
    select key, value from jsonb_each(catalog -> 'camosDeConta' -> 'maestria')
  loop
    for item, item_pos in
      select value, ordinality from jsonb_array_elements(mode_data) with ordinality
    loop
      perform private.upsert_mw4_challenge(item, 'mastery', mode_key, null, item_pos::integer);
    end loop;
  end loop;

  perform private.upsert_mw4_challenge(
    catalog -> 'camosDeConta' -> 'divergence', 'divergence', null, null, 1
  );

  return format(
    'Importação concluída: %s modos, %s categorias, %s armas, %s desafios.',
    (select count(*) from public.game_modes),
    (select count(*) from public.weapon_categories),
    (select count(*) from public.weapons),
    (select count(*) from public.challenges)
  );
end;
$$;

revoke all on all functions in schema private from public, anon, authenticated;
