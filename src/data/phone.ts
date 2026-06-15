/**
 * data/phone.ts — máscara e link de WhatsApp para números brasileiros.
 * A máscara formata enquanto digita (igual à de datas) e o link evita duplicar
 * o código do país (55).
 */

/** Formata um telefone BR enquanto digita: (11) 99999-8888 ou (11) 9999-8888. */
export function maskPhoneBR(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (d.length <= 2) return `(${ddd}`;
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  // até 8 dígitos no número (fixo) = 4-4; 9 dígitos (celular) = 5-4
  if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/**
 * Monta o link do WhatsApp (wa.me) a partir do telefone digitado. Prefixa o
 * código do Brasil (55), mas NÃO duplica quando o número já veio com ele.
 * Retorna null se não houver dígitos (aí a tela não mostra o botão).
 */
export function whatsappLink(phone: string): string | null {
  let d = (phone || '').replace(/\D/g, '');
  if (!d) return null;
  // 12-13 dígitos começando com 55 = já tem código do país (no Brasil o número
  // local tem no máx. 11 dígitos: DDD + 9). Senão, prefixa o 55.
  if (!(d.startsWith('55') && (d.length === 12 || d.length === 13))) {
    d = '55' + d;
  }
  return `https://wa.me/${d}`;
}
