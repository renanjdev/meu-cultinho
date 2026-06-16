-- Dados da comum: campos extras na congregação (singleton id=1).
-- RLS já cobre estas colunas: "read auth" (select) e "admin write" (update)
-- valem para a linha inteira, então não é preciso criar política nova.
alter table public.congregacao
  add column if not exists endereco           text,
  add column if not exists cooperador_oficial text,
  add column if not exists cooperador_jovens  text;

notify pgrst, 'reload schema';
