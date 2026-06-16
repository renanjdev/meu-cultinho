/**
 * data/repo.ts — Supabase data hooks (replaces the mock seed/store).
 *
 * Lists refetch on screen focus (useFocusEffect), so a create/delete on one
 * screen shows up when you return to the list. Derived display fields (age,
 * group name, youth count) are computed here so screens stay thin.
 */
import { useCallback, useEffect, useState } from 'react';
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
  /** false quando não há data de nascimento (não mostrar "0 anos"). */
  hasAge: boolean;
  sex: 'Masculino' | 'Feminino' | null;
  batizado: boolean;
  batismo: string;
  selado: boolean;
  status: Status;
  grupoId: string | null;
  grupoShort: string;
  grupoName: string;
  father: string;
  mother: string;
  phone: string;
  address: string;
  notes: string;
  photoUrl: string;
  /** true quando esta ficha de pessoa também é uma conta de auxiliar (login). */
  linkedAux: boolean;
}

export interface Auxiliar {
  id: string;
  name: string;
  username: string;
  role: 'cooperador' | 'auxiliar';
  status: Status;
  phone: string;
  photoUrl: string;
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

/**
 * Opções enxutas para o <SelectField> de Grupo. Busca só id/name — sem o join
 * de auxiliar nem a agregação `jovens(count)` do useGrupos (caros e inúteis
 * aqui). Retorna um array de state ESTÁVEL: não re-aloca a cada tecla digitada
 * no formulário (a identidade só muda quando os grupos mudam, no foco da tela).
 */
export function useGrupoOptions() {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const reload = useCallback(async () => {
    const { data } = await supabase.from('grupos').select('id, name').order('name');
    setOptions((data ?? []).map((g: any) => ({ value: g.id, label: g.name })));
  }, []);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return options;
}

export interface GrupoInput {
  id?: string;
  name: string;
  short?: string;
  description?: string;
  icon?: GroupIcon;
  status?: string;
  auxId?: string | null;
}

/** Cria/atualiza um grupo e devolve o id. */
export async function saveGrupo(input: GrupoInput): Promise<string> {
  const row = {
    name: input.name.trim(),
    short: input.short?.trim() || null,
    description: input.description?.trim() || null,
    icon: input.icon || 'users',
    status: input.status || 'Ativo',
    aux_id: input.auxId || null,
  };
  if (input.id) {
    const { error } = await supabase.from('grupos').update(row).eq('id', input.id);
    if (error) throw error;
    return input.id;
  }
  const { data, error } = await supabase.from('grupos').insert(row).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteGrupo(id: string): Promise<void> {
  const { error } = await supabase.from('grupos').delete().eq('id', id);
  if (error) throw error;
}

export interface GrupoDetail {
  id: string;
  name: string;
  short: string;
  description: string;
  icon: GroupIcon;
  status: Status;
  auxId: string | null;
}
export function useGrupo(id: string | undefined) {
  const [grupo, setGrupo] = useState<GrupoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!id) {
      setGrupo(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('grupos')
      .select('id, name, short, description, icon, status, aux_id')
      .eq('id', id)
      .maybeSingle();
    setGrupo(
      data
        ? {
            id: data.id,
            name: data.name,
            short: data.short ?? '',
            description: data.description ?? '',
            icon: data.icon,
            status: data.status,
            auxId: data.aux_id ?? null,
          }
        : null,
    );
    setLoading(false);
  }, [id]);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { grupo, loading, reload };
}

/** Grupos sob responsabilidade de um auxiliar (grupos.aux_id). */
export function useMyGrupos(auxId: string | undefined) {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!auxId) {
      setGrupos([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('grupos')
      .select('id, name, short, icon, status, jovens(count)')
      .eq('aux_id', auxId)
      .order('name');
    setGrupos(
      (data ?? []).map(
        (g: any): Grupo => ({
          id: g.id,
          name: g.name,
          short: g.short ?? g.name,
          icon: g.icon,
          status: g.status,
          auxName: '',
          count: g.jovens?.[0]?.count ?? 0,
        }),
      ),
    );
    setLoading(false);
  }, [auxId]);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { grupos, loading, reload };
}

/* ------------------------------------------------------------------ Jovens */
const JOVEM_SELECT =
  'id, name, birth, sex, batizado, batismo, selado, status, grupo_id, father, mother, phone, address, notes, photo_url, grupos(name, short)';

function mapJovem(j: any): Jovem {
  return {
    id: j.id,
    name: j.name,
    birth: j.birth ?? '',
    age: j.birth ? ageFrom(j.birth) : 0,
    hasAge: !!j.birth,
    sex: j.sex,
    batizado: j.batizado ?? false,
    batismo: j.batismo ?? '',
    selado: j.selado ?? false,
    status: j.status,
    grupoId: j.grupo_id,
    grupoShort: j.grupos?.short ?? j.grupos?.name ?? '—',
    grupoName: j.grupos?.name ?? '—',
    father: j.father ?? '',
    mother: j.mother ?? '',
    phone: j.phone ?? '',
    address: j.address ?? '',
    notes: j.notes ?? '',
    photoUrl: j.photo_url ?? '',
    linkedAux: false,
  };
}

export function useJovens() {
  const [jovens, setJovens] = useState<Jovem[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    // 2ª busca: quais fichas de jovem são também contas de auxiliar (vínculo),
    // para marcar "Auxiliar" na lista sem inflar/embed frágil de PostgREST.
    const [jres, ares] = await Promise.all([
      supabase.from('jovens').select(JOVEM_SELECT).order('name'),
      supabase.from('auxiliares').select('jovem_id').not('jovem_id', 'is', null),
    ]);
    const auxJovemIds = new Set((ares.data ?? []).map((a: any) => a.jovem_id));
    setJovens(
      (jres.data ?? []).map((j: any) => ({ ...mapJovem(j), linkedAux: auxJovemIds.has(j.id) })),
    );
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
    if (!data) {
      setJovem(null);
      setLoading(false);
      return;
    }
    // esta ficha também é uma conta de auxiliar? (p/ avisar antes de excluir)
    const { count } = await supabase
      .from('auxiliares')
      .select('id', { count: 'exact', head: true })
      .eq('jovem_id', id);
    setJovem({ ...mapJovem(data), linkedAux: (count ?? 0) > 0 });
    setLoading(false);
  }, [id]);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { jovem, loading, reload };
}

/** Presença agregada de UM jovem (para a ficha): presentes, faltas, frequência. */
export interface JovemStats {
  present: number;
  absent: number;
  freq: number;
  hasData: boolean;
}
export function useJovemStats(id: string | undefined) {
  const [stats, setStats] = useState<JovemStats>({ present: 0, absent: 0, freq: 0, hasData: false });
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!id) {
      setStats({ present: 0, absent: 0, freq: 0, hasData: false });
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('presencas').select('status').eq('jovem_id', id);
    const rows = (data ?? []) as { status: string }[];
    const present = rows.filter((r) => r.status === 'present').length;
    const absent = rows.filter((r) => r.status === 'absent').length;
    setStats({ present, absent, freq: pct(present, absent), hasData: rows.length > 0 });
    setLoading(false);
  }, [id]);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { stats, loading, reload };
}

export interface JovemInput {
  id?: string;
  name: string;
  birth?: string;
  sex?: string;
  batizado?: boolean;
  batismo?: string;
  /** "selado com o Espírito Santo" — só é gravado quando explicitamente passado
   *  (telas que não conhecem o campo não o apagam). */
  selado?: boolean;
  grupo_id?: string | null;
  father?: string;
  mother?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: string;
}

/** Cria/atualiza e devolve o id do jovem (necessário p/ subir a foto depois). */
export async function saveJovem(input: JovemInput): Promise<string> {
  const batizado = input.batizado ?? false;
  const row: Record<string, unknown> = {
    name: input.name,
    birth: input.birth || null,
    sex: input.sex || null,
    batizado,
    // a data só faz sentido quando batizado; senão fica limpa
    batismo: batizado ? input.batismo || null : null,
    grupo_id: input.grupo_id || null,
    father: input.father || null,
    mother: input.mother || null,
    phone: input.phone || null,
    address: input.address || null,
    notes: input.notes || null,
    status: input.status || 'Ativo',
  };
  // só toca em `selado` quando o chamador passou (evita zerar ao salvar pelo YouthForm)
  if (input.selado !== undefined) row.selado = input.selado;
  if (input.id) {
    const { error } = await supabase.from('jovens').update(row).eq('id', input.id);
    if (error) throw error;
    return input.id;
  }
  const { data, error } = await supabase.from('jovens').insert(row).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteJovem(id: string): Promise<void> {
  const { error } = await supabase.from('jovens').delete().eq('id', id);
  if (error) {
    // FK restrict: a ficha é o login de um auxiliar — a conta precisa sair antes
    if (error.code === '23503' || /foreign key|auxiliares/i.test(error.message)) {
      throw new Error('JOVEM_E_AUXILIAR');
    }
    throw error;
  }
}

/** Grava a URL pública da foto numa linha de jovens/auxiliares. */
export async function updatePhotoUrl(
  table: 'jovens' | 'auxiliares',
  id: string,
  url: string,
): Promise<void> {
  const { error } = await supabase.from(table).update({ photo_url: url }).eq('id', id);
  if (error) throw error;
}

/* -------------------------------------------------------------- Auxiliares */
export function useAuxiliares() {
  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('auxiliares')
      .select('id, name, username, role, status, phone, photo_url')
      .order('name');
    setAuxiliares(
      (data ?? []).map(
        (a: any): Auxiliar => ({
          id: a.id,
          name: a.name,
          username: a.username,
          role: a.role,
          status: a.status,
          phone: a.phone ?? '',
          photoUrl: a.photo_url ?? '',
        }),
      ),
    );
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { auxiliares, loading, reload };
}

export interface AuxiliarDetail {
  id: string;
  name: string;
  username: string;
  role: 'cooperador' | 'auxiliar';
  status: Status;
  phone: string;
  birth: string;
  baptism: string;
  presented: string;
  photoUrl: string;
  jovemId: string | null;
}
export function useAuxiliar(id: string | undefined) {
  const [aux, setAux] = useState<AuxiliarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!id) {
      setAux(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('auxiliares')
      .select('id, name, username, role, status, phone, birth, baptism, presented, photo_url, jovem_id')
      .eq('id', id)
      .maybeSingle();
    setAux(
      data
        ? {
            id: data.id,
            name: data.name,
            username: data.username,
            role: data.role,
            status: data.status,
            phone: data.phone ?? '',
            birth: data.birth ?? '',
            baptism: data.baptism ?? '',
            presented: data.presented ?? '',
            photoUrl: data.photo_url ?? '',
            jovemId: data.jovem_id ?? null,
          }
        : null,
    );
    setLoading(false);
  }, [id]);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { aux, loading, reload };
}

/** Atualiza campos da CONTA de auxiliar. Só inclui `status` quando passado (e o
 *  trigger guard só deixa admin alterar status). name/birth para o cooperador
 *  (sem jovem); nos auxiliares vinculados o espelho de jovens já sincroniza. */
export async function updateAuxiliar(
  id: string,
  fields: { name?: string; birth?: string; phone?: string; baptism?: string; presented?: string; status?: string },
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (fields.name !== undefined) row.name = fields.name;
  if (fields.birth !== undefined) row.birth = fields.birth || null;
  if (fields.phone !== undefined) row.phone = fields.phone || null;
  if (fields.baptism !== undefined) row.baptism = fields.baptism || null;
  if (fields.presented !== undefined) row.presented = fields.presented || null;
  if (fields.status !== undefined) row.status = fields.status;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('auxiliares').update(row).eq('id', id);
  if (error) throw error;
}

/* --------------------------------------------------------------- Presenças */
export type Mark = 'present' | 'absent';

/** Local date as YYYY-MM-DD (the presencas.data column). */
export function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** YYYY-MM-DD -> dd/mm/aaaa for display. */
export function isoToBR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Existing marks for a meeting (date + group), keyed by youth id. */
export function useMarks(date: string, grupoId: string | undefined) {
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!grupoId || !date) {
      setMarks({});
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('presencas')
      .select('jovem_id, status')
      .eq('data', date)
      .eq('grupo_id', grupoId);
    const m: Record<string, Mark> = {};
    (data ?? []).forEach((r: any) => {
      m[r.jovem_id] = r.status;
    });
    setMarks(m);
    setLoading(false);
  }, [date, grupoId]);
  useEffect(() => void reload(), [reload]);
  return { marks, setMarks, loading, reload };
}

/** Upsert one youth's mark (or delete it when status is null). */
export async function setMark(
  date: string,
  grupoId: string,
  jovemId: string,
  status: Mark | null,
  marcadoPor?: string,
): Promise<void> {
  if (status === null) {
    const { error } = await supabase
      .from('presencas')
      .delete()
      .eq('data', date)
      .eq('jovem_id', jovemId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from('presencas').upsert(
    { data: date, grupo_id: grupoId, jovem_id: jovemId, status, marcado_por: marcadoPor ?? null },
    { onConflict: 'data,jovem_id' },
  );
  if (error) throw error;
}

/* ------------------------------------------------ Datas (rótulos PT-BR) */
const WEEKDAYS_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Parse YYYY-MM-DD as a *local* date (evita o off-by-one de meia-noite UTC). */
function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
/** YYYY-MM-DD -> "Domingo". */
export function isoWeekday(iso: string): string {
  return WEEKDAYS_PT[isoToLocalDate(iso).getDay()];
}
/** YYYY-MM-DD -> "02 jun". */
export function isoDayMonth(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS_PT[m - 1]}`;
}

export const MONTHS_FULL_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** dd/mm/aaaa -> YYYY-MM-DD (para colunas date). Retorna '' se inválida. */
export function brToISO(br: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((br ?? '').trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
}

const pct = (p: number, a: number) => (p + a ? Math.round((p / (p + a)) * 100) : 0);

/* ----------------------------------------------------------- Relatórios */
export interface RankItem {
  id: string;
  name: string;
  /** % exibido no card: presença (topPresent) ou falta (topAbsent). */
  pct: number;
  present: number;
  absent: number;
}
export interface GroupFreq {
  id: string;
  name: string;
  freq: number;
}
export interface ReportData {
  avgFreq: number;
  activeYouth: number;
  totalPresent: number;
  totalAbsent: number;
  reunioes: number;
  byGroup: GroupFreq[];
  topPresent: RankItem[];
  topAbsent: RankItem[];
}

/** All report aggregates derived from `presencas` (+ active youth count). */
export function useReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    const [presRes, gruposRes, ativosRes] = await Promise.all([
      supabase.from('presencas').select('data, status, grupo_id, jovem_id, jovens(name)'),
      supabase.from('grupos').select('id, name, short').eq('status', 'Ativo').order('name'),
      supabase.from('jovens').select('id', { count: 'exact', head: true }).eq('status', 'Ativo'),
    ]);
    const pres = (presRes.data ?? []) as any[];
    const grupos = (gruposRes.data ?? []) as any[];

    let totalPresent = 0;
    let totalAbsent = 0;
    const dates = new Set<string>();
    const byGroupAgg = new Map<string, { p: number; a: number }>();
    const byYouth = new Map<string, { name: string; p: number; a: number }>();

    for (const r of pres) {
      const isP = r.status === 'present';
      if (isP) totalPresent++;
      else totalAbsent++;
      dates.add(r.data);
      if (r.grupo_id) {
        const g = byGroupAgg.get(r.grupo_id) ?? { p: 0, a: 0 };
        if (isP) g.p++;
        else g.a++;
        byGroupAgg.set(r.grupo_id, g);
      }
      const name = r.jovens?.name;
      if (r.jovem_id && name) {
        const y = byYouth.get(r.jovem_id) ?? { name, p: 0, a: 0 };
        if (isP) y.p++;
        else y.a++;
        byYouth.set(r.jovem_id, y);
      }
    }

    const byGroup: GroupFreq[] = grupos.map((g) => {
      const agg = byGroupAgg.get(g.id);
      return { id: g.id, name: g.short ?? g.name, freq: agg ? pct(agg.p, agg.a) : 0 };
    });

    const ranked: RankItem[] = Array.from(byYouth.entries()).map(([id, y]) => ({
      id,
      name: y.name,
      pct: pct(y.p, y.a),
      present: y.p,
      absent: y.a,
    }));
    // piso de amostra (>=2 reuniões quando já houver várias) p/ 1 marca não
    // dominar o pódio; desempate por volume de marcações.
    const minN = dates.size >= 2 ? 2 : 1;
    const eligible = ranked.filter((r) => r.present + r.absent >= minN);
    const base = eligible.length ? eligible : ranked;
    const vol = (r: RankItem) => r.present + r.absent;
    const topPresent = base
      .filter((r) => r.present > 0)
      .slice()
      .sort((a, b) => b.pct - a.pct || vol(b) - vol(a))
      .slice(0, 3);
    const chosen = new Set(topPresent.map((r) => r.id));
    // "Mais ausentes": só quem REALMENTE faltou, sem repetir quem já está em
    // "mais frequentes", e o % mostrado é a taxa de FALTA (bate com o título).
    const topAbsent = base
      .filter((r) => r.absent > 0 && !chosen.has(r.id))
      .map((r) => ({ ...r, pct: Math.round((r.absent / (r.present + r.absent)) * 100) }))
      .sort((a, b) => b.pct - a.pct || vol(b) - vol(a))
      .slice(0, 3);

    setData({
      avgFreq: pct(totalPresent, totalAbsent),
      activeYouth: ativosRes.count ?? 0,
      totalPresent,
      totalAbsent,
      reunioes: dates.size,
      byGroup,
      topPresent,
      topAbsent,
    });
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { data, loading, reload };
}

/** Data da reunião mais recente (em presencas), como "02 jun" — ou '' se nenhuma. */
export function useLastMeeting() {
  const [label, setLabel] = useState('');
  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('presencas')
      .select('data')
      .order('data', { ascending: false })
      .limit(1)
      .maybeSingle();
    setLabel(data?.data ? isoDayMonth(data.data) : '');
  }, []);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return label;
}

/* ------------------------------------------------------------- Histórico */
export interface HistoryEntry {
  id: string;
  dateISO: string;
  dayMonth: string; // "02 jun"
  weekday: string; // "Domingo"
  groupLabel: string;
  present: number;
  absent: number;
  freq: number;
}

/**
 * Past meetings, one row per date. `grupoId` 'all' aggregates every group of
 * the date; a specific id narrows to that group. Newest first.
 */
export function useHistory(grupoId: string) {
  const [rows, setRows] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('presencas').select('data, status, grupo_id, grupos(name, short)');
    if (grupoId !== 'all') q = q.eq('grupo_id', grupoId);
    const { data } = await q;
    const pres = (data ?? []) as any[];

    const buckets = new Map<string, { present: number; absent: number; groupLabel: string }>();
    for (const r of pres) {
      const b =
        buckets.get(r.data) ??
        {
          present: 0,
          absent: 0,
          groupLabel:
            grupoId === 'all' ? 'Todos os grupos' : r.grupos?.short ?? r.grupos?.name ?? '—',
        };
      if (r.status === 'present') b.present++;
      else b.absent++;
      buckets.set(r.data, b);
    }

    const out: HistoryEntry[] = Array.from(buckets.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1)) // date desc
      .map(([dateISO, b]) => {
        const total = b.present + b.absent;
        return {
          id: dateISO,
          dateISO,
          dayMonth: isoDayMonth(dateISO),
          weekday: isoWeekday(dateISO),
          groupLabel: b.groupLabel,
          present: b.present,
          absent: b.absent,
          freq: total ? Math.round((b.present / total) * 100) : 0,
        };
      });
    setRows(out);
    setLoading(false);
  }, [grupoId]);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { rows, loading, reload };
}

/* ------------------------------------------------------ Calendário / Aniversários */
export interface Birthday {
  name: string;
  birth: string; // dd/mm/aaaa
  kind: 'jovem' | 'auxiliar';
  photoUrl: string;
}

/** Datas de nascimento de jovens + auxiliares (para marcar aniversários). */
export function useBirthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    // Auxiliares vinculados já são jovens (têm ficha em `jovens`), então só
    // somamos os auxiliares SEM vínculo (ex.: o cooperador) — evita aniversário
    // duplicado. Cada pessoa aparece uma vez.
    const [jr, ar] = await Promise.all([
      supabase.from('jovens').select('name, birth, photo_url'),
      supabase.from('auxiliares').select('name, birth, photo_url').is('jovem_id', null),
    ]);
    const out: Birthday[] = [];
    (jr.data ?? []).forEach((r: any) => {
      if (r.birth) out.push({ name: r.name, birth: r.birth, kind: 'jovem', photoUrl: r.photo_url ?? '' });
    });
    (ar.data ?? []).forEach((r: any) => {
      if (r.birth) out.push({ name: r.name, birth: r.birth, kind: 'auxiliar', photoUrl: r.photo_url ?? '' });
    });
    setBirthdays(out);
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { birthdays, loading, reload };
}

/* -------------------------------------------------------------------- Eventos */
export interface Evento {
  id: string;
  title: string;
  data: string; // YYYY-MM-DD
  descricao: string;
}

const mapEvento = (e: any): Evento => ({
  id: e.id,
  title: e.title,
  data: e.data,
  descricao: e.descricao ?? '',
});

export function useEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    const { data } = await supabase.from('eventos').select('id, title, data, descricao').order('data');
    setEventos((data ?? []).map(mapEvento));
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { eventos, loading, reload };
}

export function useEvento(id: string | undefined) {
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!id) {
      setEvento(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('eventos')
      .select('id, title, data, descricao')
      .eq('id', id)
      .maybeSingle();
    setEvento(data ? mapEvento(data) : null);
    setLoading(false);
  }, [id]);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { evento, loading, reload };
}

export interface EventoInput {
  id?: string;
  title: string;
  data: string; // YYYY-MM-DD
  descricao?: string;
}

export async function saveEvento(input: EventoInput): Promise<void> {
  const row = { title: input.title.trim(), data: input.data, descricao: input.descricao?.trim() || null };
  const { error } = input.id
    ? await supabase.from('eventos').update(row).eq('id', input.id)
    : await supabase.from('eventos').insert(row);
  if (error) throw error;
}

export async function deleteEvento(id: string): Promise<void> {
  const { error } = await supabase.from('eventos').delete().eq('id', id);
  if (error) throw error;
}

/* --------------------------------------------------- Convite de auxiliares */
/** Código de convite atual (lido da config; só o cooperador usa a tela). */
export function useInviteCode() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    // RPC admin-only: a coluna aux_invite_code não é mais legível direto (evita
    // que um auxiliar comum leia e revaze o código).
    const { data } = await supabase.rpc('get_aux_invite_code');
    setCode((data as string | null) ?? '');
    setLoading(false);
  }, []);
  useFocusEffect(useCallback(() => void reload(), [reload]));
  return { code, loading, reload };
}

/**
 * Gera um novo código de convite NO SERVIDOR (RPC admin-only, fonte
 * criptográfica gen_random_bytes) e retorna. O cliente não gera mais o código
 * (Math.random é previsível) nem grava direto na congregacao.
 */
export async function regenerateInviteCode(): Promise<string> {
  const { data, error } = await supabase.rpc('rotate_aux_invite_code');
  if (error) throw error;
  return (data as string | null) ?? '';
}
