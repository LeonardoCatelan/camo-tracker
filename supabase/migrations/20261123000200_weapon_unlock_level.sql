-- =====================================================================
-- MW4 Camo Tracker - nível de desbloqueio das armas
--
-- Nível de jogador que libera a arma (campo "nivelDesbloqueio" do JSON).
-- Fica nulo nas armas da Temporada 1, enquanto não for divulgado.
-- O app ordena as armas por categoria e, dentro dela, por este nível.
-- =====================================================================

alter table public.weapons
  add column unlock_level integer check (unlock_level is null or unlock_level > 0);

-- Importador atualizado para gravar o nível de desbloqueio.
-- Pode ser executado de novo sempre que o JSON for atualizado:
-- insere o que é novo e atualiza o que mudou, sem apagar progresso.
create or replace function private.import_mw4_catalog(catalog jsonb)
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
        insert into public.weapons as w (
          id, name, category_id, available_since, unlock_level, sort_order
        )
        values (
          weapon ->> 'id', weapon ->> 'nome', category ->> 'id',
          weapon ->> 'disponivelDesde', (weapon ->> 'nivelDesbloqueio')::integer, weapon_pos
        )
        on conflict (id) do update set
          name = excluded.name,
          category_id = excluded.category_id,
          available_since = excluded.available_since,
          unlock_level = excluded.unlock_level,
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

revoke all on function private.import_mw4_catalog(jsonb) from public, anon, authenticated;
