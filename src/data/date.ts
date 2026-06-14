/**
 * data/date.ts — máscara e validação de datas no formato brasileiro (dd/mm/aaaa).
 * Usado nos campos de data (ex.: batismo) para funcionar no teclado numérico do
 * celular (insere as barras sozinho) e barrar datas inválidas ou no futuro.
 */

/** Formata dígitos em dd/mm/aaaa enquanto o usuário digita (máx. 8 dígitos). */
export function maskDateBR(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += '/' + d.slice(2, 4);
  if (d.length > 4) out += '/' + d.slice(4, 8);
  return out;
}

/**
 * Valida uma data dd/mm/aaaa. Retorna a mensagem de erro (PT-BR) ou '' se válida.
 * Por padrão recusa datas no futuro (allowFuture: false).
 */
export function validateDateBR(
  value: string,
  opts: { allowFuture?: boolean; now?: Date } = {},
): string {
  const v = value.trim();
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return 'Use o formato dd/mm/aaaa';

  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);

  if (month < 1 || month > 12) return 'Mês inválido';
  if (year < 1900 || year > 2100) return 'Ano inválido';

  // dia 0 do mês seguinte = último dia do mês atual (cobre fev e bissextos)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return 'Dia inválido';

  if (!opts.allowFuture) {
    const now = opts.now ?? new Date();
    const date = new Date(year, month - 1, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (date.getTime() > today.getTime()) return 'A data não pode ser no futuro';
  }
  return '';
}
