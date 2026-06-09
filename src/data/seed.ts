/**
 * data/seed.ts — fictional seed data for Meu Cultinho, ported from data.jsx.
 * No backend: these are the realistic placeholder records the screens render.
 */

export type GroupIconName = 'baby' | 'book' | 'users';
export type YouthStatus = 'Ativo' | 'Inativo';
export type AttendanceMark = 'Presente' | 'Falta' | 'Pendente';
export type AuxRole = 'Administrador' | 'Auxiliar';

export interface Group {
  id: string;
  name: string;
  short: string;
  aux: string;
  count: number;
  last: string;
  freq: number;
  status: YouthStatus;
  icon: GroupIconName;
}

export interface Youth {
  id: string;
  name: string;
  age: number;
  group: string;
  status: YouthStatus;
  last: AttendanceMark;
  freq: number;
  present: number;
  absent: number;
  birth: string;
  sex: 'Masculino' | 'Feminino';
  father: string;
  mother: string;
  phone: string;
  address: string;
  notes: string;
}

export interface Aux {
  id: string;
  name: string;
  role: AuxRole;
  group: string;
  phone: string;
  status: YouthStatus;
  birth: string;
  baptism: string;
  presented: string;
  user: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  day: string;
  group: string;
  present: number;
  absent: number;
  freq: number;
}

// Friendly, warm avatar palette cycled by name.
export const AVATAR_COLORS = [
  '#3a7bd0', '#2a9387', '#d99a2b', '#9b59b6', '#e07a5f',
  '#5b6ce0', '#3da35d', '#d56a5b', '#e88c2f', '#4a90d9',
];

export const avatarColor = (seed: string): string =>
  AVATAR_COLORS[(seed?.toString().charCodeAt(0) || 0) % AVATAR_COLORS.length];

export const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export const GROUPS: Group[] = [
  { id: 'g1', name: 'Meninos que não sabem ler', short: 'Meninos (não leem)', aux: 'Cledson Oliveira', count: 6, last: 'Dom, 02 jun', freq: 83, status: 'Ativo', icon: 'baby' },
  { id: 'g2', name: 'Meninas que não sabem ler', short: 'Meninas (não leem)', aux: 'Isabela Lima', count: 5, last: 'Dom, 02 jun', freq: 90, status: 'Ativo', icon: 'baby' },
  { id: 'g3', name: 'Meninos até 12 anos', short: 'Meninos até 12', aux: 'Cledson Oliveira', count: 8, last: 'Dom, 02 jun', freq: 76, status: 'Ativo', icon: 'book' },
  { id: 'g4', name: 'Meninas até 12 anos', short: 'Meninas até 12', aux: 'Isabela Lima', count: 7, last: 'Dom, 02 jun', freq: 88, status: 'Ativo', icon: 'book' },
  { id: 'g5', name: 'Moços', short: 'Moços', aux: 'Lucas Souza', count: 12, last: 'Dom, 02 jun', freq: 71, status: 'Ativo', icon: 'users' },
  { id: 'g6', name: 'Moças', short: 'Moças', aux: 'Noemi Fernandes', count: 10, last: 'Dom, 02 jun', freq: 80, status: 'Ativo', icon: 'users' },
];

export const YOUTH: Youth[] = [
  { id: 'j1', name: 'João Miguel Soares', age: 6, group: 'g1', status: 'Ativo', last: 'Presente', freq: 88, present: 22, absent: 3, birth: '14/03/2020', sex: 'Masculino', father: 'Marcos Soares', mother: 'Ana Soares', phone: '(11) 98472-1130', address: 'Rua das Acácias, 45 — Jd. Primavera', notes: 'Gosta de chegar cedo. Tímido no início.' },
  { id: 'j2', name: 'Isabela Santos', age: 10, group: 'g4', status: 'Ativo', last: 'Presente', freq: 92, present: 24, absent: 2, birth: '02/09/2015', sex: 'Feminino', father: 'Paulo Santos', mother: 'Rita Santos', phone: '(11) 99135-0042', address: 'Av. Central, 1203 — Centro', notes: 'Ajuda a organizar as cadeiras.' },
  { id: 'j3', name: 'Lucas Almeida', age: 15, group: 'g5', status: 'Ativo', last: 'Falta', freq: 64, present: 16, absent: 9, birth: '21/11/2010', sex: 'Masculino', father: 'José Almeida', mother: 'Sandra Almeida', phone: '(11) 98800-7711', address: 'Rua Bela Vista, 88 — Vila Nova', notes: 'Trabalha aos sábados, às vezes chega atrasado.' },
  { id: 'j4', name: 'Noemi Ferreira', age: 16, group: 'g6', status: 'Ativo', last: 'Presente', freq: 95, present: 26, absent: 1, birth: '05/06/2009', sex: 'Feminino', father: 'Daniel Ferreira', mother: 'Lúcia Ferreira', phone: '(11) 97001-2389', address: 'Rua do Sol, 12 — Jd. das Flores', notes: 'Auxilia no grupo das menores quando precisa.' },
  { id: 'j5', name: 'Pedro Henrique Dias', age: 11, group: 'g3', status: 'Ativo', last: 'Presente', freq: 80, present: 20, absent: 5, birth: '30/01/2015', sex: 'Masculino', father: 'Henrique Dias', mother: 'Carla Dias', phone: '(11) 98245-6677', address: 'Rua das Palmeiras, 301 — Centro', notes: '' },
  { id: 'j6', name: 'Sofia Ribeiro', age: 9, group: 'g4', status: 'Ativo', last: 'Pendente', freq: 78, present: 19, absent: 6, birth: '17/07/2016', sex: 'Feminino', father: 'André Ribeiro', mother: 'Marta Ribeiro', phone: '(11) 99988-1020', address: 'Rua Aurora, 56 — Vila Maria', notes: '' },
  { id: 'j7', name: 'Davi Lucca', age: 5, group: 'g1', status: 'Ativo', last: 'Presente', freq: 85, present: 17, absent: 3, birth: '09/12/2020', sex: 'Masculino', father: 'Rafael Lucca', mother: 'Bianca Lucca', phone: '(11) 98123-4567', address: 'Rua Verde, 9 — Jd. Primavera', notes: '' },
  { id: 'j8', name: 'Beatriz Moraes', age: 7, group: 'g2', status: 'Ativo', last: 'Presente', freq: 91, present: 21, absent: 2, birth: '23/04/2018', sex: 'Feminino', father: 'Tiago Moraes', mother: 'Elaine Moraes', phone: '(11) 99456-7788', address: 'Av. das Nações, 410 — Centro', notes: '' },
  { id: 'j9', name: 'Gabriel Nunes', age: 14, group: 'g5', status: 'Inativo', last: 'Falta', freq: 42, present: 9, absent: 13, birth: '11/08/2011', sex: 'Masculino', father: 'Sérgio Nunes', mother: 'Paula Nunes', phone: '(11) 98700-3322', address: 'Rua Horizonte, 77 — Vila Nova', notes: 'Mudou de bairro. Acompanhar retorno.' },
  { id: 'j10', name: 'Laura Campos', age: 13, group: 'g6', status: 'Ativo', last: 'Presente', freq: 87, present: 23, absent: 3, birth: '28/02/2012', sex: 'Feminino', father: 'Vitor Campos', mother: 'Helena Campos', phone: '(11) 99211-8855', address: 'Rua Primavera, 134 — Jd. das Flores', notes: '' },
];

export const AUX: Aux[] = [
  { id: 'a1', name: 'Renan Januário', role: 'Administrador', group: 'Todos os grupos', phone: '(11) 99876-0011', status: 'Ativo', birth: '12/05/1990', baptism: '20/10/2008', presented: '15/02/2018', user: 'renan.j' },
  { id: 'a2', name: 'Lucas Souza', role: 'Auxiliar', group: 'Moços', phone: '(11) 98765-2233', status: 'Ativo', birth: '03/09/1995', baptism: '11/06/2012', presented: '09/03/2020', user: 'lucas.s' },
  { id: 'a3', name: 'Noemi Fernandes', role: 'Auxiliar', group: 'Moças', phone: '(11) 99654-7788', status: 'Ativo', birth: '27/01/1993', baptism: '04/04/2010', presented: '12/01/2019', user: 'noemi.f' },
  { id: 'a4', name: 'Cledson Oliveira', role: 'Auxiliar', group: 'Meninos até 12 anos', phone: '(11) 98543-1199', status: 'Ativo', birth: '08/11/1988', baptism: '22/09/2006', presented: '03/05/2017', user: 'cledson.o' },
  { id: 'a5', name: 'Isabela Lima', role: 'Auxiliar', group: 'Meninas até 12 anos', phone: '(11) 99432-5566', status: 'Ativo', birth: '19/07/1996', baptism: '30/11/2013', presented: '18/08/2021', user: 'isabela.l' },
];

export const HISTORY: HistoryItem[] = [
  { id: 'h1', date: '02 jun 2025', day: 'Domingo', group: 'Todos os grupos', present: 41, absent: 7, freq: 85 },
  { id: 'h2', date: '26 mai 2025', day: 'Domingo', group: 'Todos os grupos', present: 38, absent: 10, freq: 79 },
  { id: 'h3', date: '19 mai 2025', day: 'Domingo', group: 'Todos os grupos', present: 43, absent: 5, freq: 90 },
  { id: 'h4', date: '12 mai 2025', day: 'Domingo', group: 'Moços', present: 9, absent: 3, freq: 75 },
  { id: 'h5', date: '12 mai 2025', day: 'Domingo', group: 'Moças', present: 8, absent: 2, freq: 80 },
  { id: 'h6', date: '05 mai 2025', day: 'Domingo', group: 'Todos os grupos', present: 40, absent: 8, freq: 83 },
];

export const groupName = (id: string): string =>
  GROUPS.find((g) => g.id === id)?.name ?? '—';

export const groupShort = (id: string): string =>
  GROUPS.find((g) => g.id === id)?.short ?? '—';
