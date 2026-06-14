/**
 * data/repo.ts — Supabase data hooks (replaces the mock seed/store).
 *
 * Lists refetch on screen focus (useFocusEffect), so a create/delete on one
 * screen shows up when you return to the list. Derived display fields (age,
 * group name, youth count) are computed here so screens stay thin.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { ageFrom } from './age';

export type GroupIcon = 'baby' | 'book' | 'users';
export type Status = 'Ativo' | 'Inativo';

export interface Grupo {
  id: string;
  name: string;
  short: string;
  icon: GroupIcon;
  status: Status;
  auxName: string;
  count: number;
}

export interface Jovem {
  id: string;
  name: string;
  birth: string;
  age: number;
  sex: 'Masculino' | 'Feminino' | null;
  status: Status;
  grupoId: string | null;
  grupoShort: string;
  grupoName: string;
  father: string;
  mother: string;
  phone: string;
  address: string;
  notes: string;
}

export interface Auxiliar {
  id: string;
  name: string;
  username: string;
  role: 'cooperador' | 'auxiliar';
  status: Status;
  phone: string;
}

/* ----------------------------------------------------------------- Grupos */
export function useGrupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('grupos')
      // disambiguate: the group's responsible aux is grupos.aux_id (not the
      // auxiliar_grupos N:N relationship, which also links the two tables).
      .select('id, name, short, icon, status, auxiliares!grupos_aux_id_fkey(name), jovens(count)')
      .order('name');
    setGrupos(
      (data ?? []).map(
        (g: any): Grupo => ({
          id: g.id,
          name: g.name,
          short: g.short ?? g.name,
          icon: g.icon,
          status: g.status,
          auxName: g.auxiliares?.name ?? '—',
          count: g.jovens?.[0]?.count ?? 0,
        }),
      ),
    );
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { grupos, loading, reload };
}

/** Plain options for the Grupo <SelectField>. */
export function useGrupoOptions() {
  const { grupos } = useGrupos();
  return grupos.map((g) => ({ value: g.id, label: g.name }));
}

/* ------------------------------------------------------------------ Jovens */
const JOVEM_SELECT =
  'id, name, birth, sex, status, grupo_id, father, mother, phone, address, notes, grupos(name, short)';

function mapJovem(j: any): Jovem {
  return {
    id: j.id,
    name: j.name,
    birth: j.birth ?? '',
    age: j.birth ? ageFrom(j.birth) : 0,
    sex: j.sex,
    status: j.status,
    grupoId: j.grupo_id,
    grupoShort: j.grupos?.short ?? j.grupos?.name ?? '—',
    grupoName: j.grupos?.name ?? '—',
    father: j.father ?? '',
    mother: j.mother ?? '',
    phone: j.phone ?? '',
    address: j.address ?? '',
    notes: j.notes ?? '',
  };
}

export function useJovens() {
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    const { data } = await supabase.from('jovens').select(JOVEM_SELECT).order('name');
    setJovens((data ?? []).map(mapJovem));
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { jovens, loading, reload };
}

export function useJovem(id: string | undefined) {
  const [jovem, setJovem] = useState<Jovem | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!id) {
      setJovem(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('jovens').select(JOVEM_SELECT).eq('id', id).maybeSingle();
    setJovem(data ? mapJovem(data) : null);
    setLoading(false);
  }, [id]);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { jovem, loading, reload };
}

export interface JovemInput {
  id?: string;
  name: string;
  birth?: string;
  sex?: string;
  grupo_id?: string | null;
  father?: string;
  mother?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: string;
}

export async function saveJovem(input: JovemInput): Promise<void> {
  const row = {
    name: input.name,
    birth: input.birth || null,
    sex: input.sex || null,
    grupo_id: input.grupo_id || null,
    father: input.father || null,
    mother: input.mother || null,
    phone: input.phone || null,
    address: input.address || null,
    notes: input.notes || null,
    status: input.status || 'Ativo',
  };
  const { error } = input.id
    ? await supabase.from('jovens').update(row).eq('id', input.id)
    : await supabase.from('jovens').insert(row);
  if (error) throw error;
}

export async function deleteJovem(id: string): Promise<void> {
  const { error } = await supabase.from('jovens').delete().eq('id', id);
  if (error) throw error;
}

/* -------------------------------------------------------------- Auxiliares */
export function useAuxiliares() {
  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('auxiliares')
      .select('id, name, username, role, status, phone')
      .order('name');
    setAuxiliares((data ?? []) as Auxiliar[]);
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { auxiliares, loading, reload };
}
