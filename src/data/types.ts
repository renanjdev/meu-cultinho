export type GroupIconName = 'baby' | 'book' | 'users';
export type YouthStatus = 'Ativo' | 'Inativo';
export type AttendanceMark = 'Presente' | 'Falta' | 'Pendente';
export type AuxRole = 'admin' | 'auxiliar';

export interface Group { id: string; name: string; short: string; description?: string; aux: string; auxId?: string; icon: GroupIconName; status: YouthStatus; }
export interface Youth { id: string; name: string; birth: string; sex: 'Masculino' | 'Feminino'; groupId: string; father: string; mother: string; phone: string; address: string; notes: string; status: YouthStatus; photoUrl?: string; }
export interface Aux { id: string; name: string; username: string; role: AuxRole; phone: string; birth: string; baptism: string; presented: string; groupIds: string[]; status: YouthStatus; photoUrl?: string; }
