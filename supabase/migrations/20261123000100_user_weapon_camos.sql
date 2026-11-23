-- =====================================================================
-- MW4 Camo Tracker - camuflagens concluídas por arma
--
-- Militares, especiais, Ouro, Platina e Dissonância precisam ser obtidas uma
-- única vez por arma, em qualquer modo. Por isso a conclusão é registrada por
-- arma (e não por desafio de cada modo): existir a linha = camuflagem concluída.
-- O marco atual e a Divergência são calculados a partir destes dados, sem
-- armazenamento redundante.
-- =====================================================================

create type public.weapon_camo_slot as enum (
  'military_1',
  'military_2',
  'military_3',
  'military_4',
  'military_5',
  'military_6',
  'military_7',
  'military_8',
  'special_1',
  'special_2',
  'special_3',
  'gold',
  'platinum',
  'harmonic_break'
);

create table public.user_weapon_camos (
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  weapon_id    text not null references public.weapons (id),
  slot         public.weapon_camo_slot not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, weapon_id, slot)
);

create index user_weapon_camos_weapon_id_idx on public.user_weapon_camos (weapon_id);

alter table public.user_weapon_camos enable row level security;

create policy "Usuário lê as próprias camuflagens" on public.user_weapon_camos
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Usuário registra as próprias camuflagens" on public.user_weapon_camos
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Usuário remove as próprias camuflagens" on public.user_weapon_camos
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Marcar = inserir, desmarcar = apagar. Não há atualização de linhas.
revoke all on public.user_weapon_camos from anon, authenticated;
grant select, insert, delete on public.user_weapon_camos to authenticated;
